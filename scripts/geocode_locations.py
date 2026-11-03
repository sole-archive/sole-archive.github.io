#!/usr/bin/env python3
"""
Suggest coordinates for venues / affiliations that are missing from the map.

Run this LOCALLY (not in CI) after adding new papers:

  1. python scripts/geocode_locations.py
       Looks up every missing name on OpenStreetMap (Nominatim) and writes suggestions to
       src/content/locations.json → "pending". Pending entries are NOT shown on the map.

  2. Review "pending" in locations.json. For each entry check "osm_match":
       - right place?              leave it (or fix "coords" by hand)
       - wrong / "NOT FOUND"?      fix "coords" by hand ([lat, lon], e.g. from Google Maps),
                                   or delete the entry and instead add a line to
                                   affiliationNormalization / venueNormalization if it is just
                                   a spelling variant of a name that is already on the map,
                                   or normalize it to "" to hide it (funding bodies etc.)

  3. python scripts/geocode_locations.py --accept
       Moves every pending entry that has coords into venueCoords / affiliationCoords.

Options:
  --accept      move reviewed pending entries into the live tables (no network)
  --list        just list missing names (no network, no writes)

Uses only the Python standard library. Nominatim policy: max 1 request/second, a real
User-Agent; fine for the handful of new names per year.
"""
from __future__ import annotations

import json
import re
import sys
import time
import urllib.parse
import urllib.request

import locations_lib as L

NOMINATIM = "https://nominatim.openstreetmap.org/search"
USER_AGENT = "sole-archive-geocoder/1.0 (https://github.com/sole-archive/sole-archive.github.io)"


ACADEMIC_TYPES = {"university", "college", "research_institute", "school"}


def nominatim(query: str):
    """Best hit for `query`. Prefers results tagged as universities/colleges (avoids e.g.
    'Via Alicante' in San Diego), and among those the most 'important' one (main campus
    rather than e.g. a satellite campus abroad)."""
    url = NOMINATIM + "?" + urllib.parse.urlencode({"q": query, "format": "jsonv2", "limit": 10})
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT, "Accept-Language": "en"})
    with urllib.request.urlopen(req, timeout=20) as r:
        res = json.load(r)
    time.sleep(1.1)  # respect Nominatim's 1 req/s limit
    if not res:
        return None
    academic = [h for h in res if h.get("type") in ACADEMIC_TYPES]
    pool = academic or res
    return max(pool, key=lambda h: float(h.get("importance") or 0))


def candidate_queries(name: str) -> list[str]:
    """Full name first, then simplified variants for messy affiliation strings."""
    clean = re.sub(r"[¹²³⁴⁵⁶⁷⁸⁹⁰*†]", "", name).strip()
    out = [clean]
    # strip parenthesised acronyms: "Foo University (FU)" -> "Foo University"
    no_paren = re.sub(r"\s*\([^)]*\)", "", clean).strip()
    out.append(no_paren)
    # comma / slash / " and " separated parts that look like an institution
    for part in re.split(r",|/| and | & ", no_paren):
        part = part.strip(" -")
        if re.search(r"univ|institut|college|school|academ|centre|center|ecole|école|hochschule", part, re.I):
            out.append(part)
    seen, uniq = set(), []
    for q in out:
        if q and q not in seen:
            seen.add(q)
            uniq.append(q)
    return uniq


def geocode(name: str) -> dict:
    for q in candidate_queries(name):
        try:
            hit = nominatim(q)
        except Exception as e:  # network error etc.
            return {"coords": None, "osm_match": f"ERROR: {e}"}
        if hit:
            return {
                "coords": [round(float(hit["lat"]), 4), round(float(hit["lon"]), 4)],
                "osm_match": hit.get("display_name", ""),
                "query": q,
            }
    return {"coords": None, "osm_match": "NOT FOUND - add coords by hand or normalize the name"}


def cmd_list(papers, loc) -> None:
    mv, ma = L.find_missing(papers, loc)
    for n in sorted(mv):
        print(f"venue:       {n}")
    for n in sorted(ma):
        print(f"affiliation: {n}")
    if not (mv or ma):
        print("Nothing missing.")


def cmd_accept(loc) -> None:
    moved = 0
    for kind, table in (("venues", "venueCoords"), ("affiliations", "affiliationCoords")):
        pending = loc["pending"][kind]
        for name in list(pending):
            coords = pending[name].get("coords")
            if isinstance(coords, list) and len(coords) == 2:
                loc[table][name] = [float(coords[0]), float(coords[1])]
                del pending[name]
                moved += 1
                print(f"accepted {kind[:-1]}: {name} {coords}")
            else:
                print(f"skipped (no coords yet): {name}")
    L.save_locations(loc)
    print(f"\n{moved} entr{'y' if moved == 1 else 'ies'} moved to the map.")


def cmd_geocode(papers, loc) -> None:
    mv, ma = L.find_missing(papers, loc)
    todo = [("venues", n) for n in sorted(mv) if n not in loc["pending"]["venues"]]
    todo += [("affiliations", n) for n in sorted(ma) if n not in loc["pending"]["affiliations"]]
    if not todo:
        print("Nothing new to geocode." + (" (Review/accept existing pending entries.)"
                                           if loc["pending"]["venues"] or loc["pending"]["affiliations"] else ""))
        return
    print(f"Geocoding {len(todo)} name(s) via OpenStreetMap…\n")
    for kind, name in todo:
        r = geocode(name)
        loc["pending"][kind][name] = r
        L.save_locations(loc)  # save as we go
        print(f"{kind[:-1]:12} {name}\n             → {r['coords']}  {r['osm_match']}\n")
    print("Done. Review \"pending\" in src/content/locations.json, then run:\n"
          "  python scripts/geocode_locations.py --accept")


def main() -> None:
    papers, loc = L.load_papers(), L.load_locations()
    if "--list" in sys.argv:
        cmd_list(papers, loc)
    elif "--accept" in sys.argv:
        cmd_accept(loc)
    else:
        cmd_geocode(papers, loc)


if __name__ == "__main__":
    main()
