"""
Shared helpers for src/content/locations.json.

locations.json is the single source of truth for the map on /analytics:

  venueNormalization        raw console_venue  -> canonical venue name
  venueCoords               canonical venue    -> [lat, lon]
  affiliationNormalization  raw affiliation    -> canonical name ("" = ignore)
  affiliationCoords         canonical name     -> [lat, lon]
  pending                   geocoder suggestions awaiting review (NOT shown on the map)

The normalization functions below MUST mirror src/pages/analytics.astro:
  venue:       canonical = venueNormalization[trim(raw || 'Unknown')] ?? that
  affiliation: canonical = affiliationNormalization[trim(raw)] ?? trim(raw)
"""
from __future__ import annotations

import json
import re
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PAPERS_JSON = ROOT / "src" / "content" / "papers.json"
LOCATIONS_JSON = ROOT / "src" / "content" / "locations.json"

SECTIONS = ("venueNormalization", "venueCoords", "affiliationNormalization", "affiliationCoords")


def load_papers() -> list[dict]:
    data = json.loads(PAPERS_JSON.read_text(encoding="utf-8"))
    return [data] if isinstance(data, dict) else data


def load_locations() -> dict:
    loc = json.loads(LOCATIONS_JSON.read_text(encoding="utf-8"))
    for key in SECTIONS:
        loc.setdefault(key, {})
    loc.setdefault("pending", {})
    loc["pending"].setdefault("venues", {})
    loc["pending"].setdefault("affiliations", {})
    return loc


def save_locations(loc: dict) -> None:
    text = json.dumps(loc, ensure_ascii=False, indent=2)
    # Keep [lat, lon] pairs on one line for readability.
    text = re.sub(
        r"\[\s*(-?[\d.]+(?:[eE]-?\d+)?),\s*(-?[\d.]+(?:[eE]-?\d+)?)\s*\]",
        r"[\1, \2]",
        text,
    )
    LOCATIONS_JSON.write_text(text + "\n", encoding="utf-8")


def normalize_venue(raw, loc: dict) -> str:
    n = str(raw or "Unknown").strip()
    return loc["venueNormalization"].get(n, n)


def normalize_affiliation(raw, loc: dict) -> str:
    t = str(raw or "").strip()
    return loc["affiliationNormalization"].get(t, t)


def paper_affiliations(p: dict) -> list[str]:
    a = p.get("affiliation", [])
    if isinstance(a, list):
        return a
    return [str(a)] if a else []


def find_missing(papers: list[dict], loc: dict):
    """Return (missing_venues, missing_affs): canonical name -> set of slugs.
    A name is 'missing' when it would be counted on the page but has no coordinates,
    i.e. it is silently left off the map."""
    missing_v: dict[str, set[str]] = defaultdict(set)
    missing_a: dict[str, set[str]] = defaultdict(set)
    for p in papers:
        slug = str(p.get("slug", "")).strip() or "(no-slug)"
        v = normalize_venue(p.get("console_venue"), loc)
        if v not in loc["venueCoords"]:
            missing_v[v].add(slug)
        for raw in paper_affiliations(p):
            if not str(raw or "").strip():
                continue
            a = normalize_affiliation(raw, loc)
            if not a:  # normalized to "" on purpose -> ignored by the page too
                continue
            if a not in loc["affiliationCoords"]:
                missing_a[a].add(slug)
    return missing_v, missing_a
