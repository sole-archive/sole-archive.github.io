#!/usr/bin/env python3
"""
Map coverage check (runs in `npm run prebuild`).

Lists every venue / affiliation in papers.json that would be counted on /analytics
but has no coordinates in src/content/locations.json, i.e. would be silently left off
the map. Writes the full report to report.txt and prints a summary to the console.

Usage:
  python scripts/affiliation_checker.py            # warn only (default)
  python scripts/affiliation_checker.py --strict   # exit 1 if anything is missing
  SOLE_STRICT_LOCATIONS=1 npm run prebuild         # same, via env var

To fix what it reports: python scripts/geocode_locations.py  (see README, "Yearly update").
"""
from __future__ import annotations

import os
import sys
from datetime import datetime
from zoneinfo import ZoneInfo

import locations_lib as L

REPORT_TXT = L.ROOT / "report.txt"

YELLOW, RED, GREEN, RESET = "\033[33m", "\033[31m", "\033[32m", "\033[0m"


def fmt(name: str, slugs: set[str]) -> str:
    s = sorted(slugs)
    return f"- {name}  | examples: {', '.join(s[:8])}{' …' if len(s) > 8 else ''}"


def main() -> int:
    strict = "--strict" in sys.argv or os.environ.get("SOLE_STRICT_LOCATIONS") == "1"

    papers = L.load_papers()
    loc = L.load_locations()
    missing_v, missing_a = L.find_missing(papers, loc)
    pending_v, pending_a = loc["pending"]["venues"], loc["pending"]["affiliations"]

    empty_aff = sorted(
        str(p.get("slug", "")).strip() or "(no-slug)"
        for p in papers
        if (affs := L.paper_affiliations(p)) and all(not str(a or "").strip() for a in affs)
    )

    lines = [
        "SOLE Archive coordinate coverage report",
        f"Run at: {datetime.now(ZoneInfo('Europe/Rome')).strftime('%Y-%m-%d %H:%M:%S %Z')}",
        "",
        f"papers.json:    {L.PAPERS_JSON.relative_to(L.ROOT)}",
        f"locations.json: {L.LOCATIONS_JSON.relative_to(L.ROOT)}",
        "",
        "=== Summary ===",
        f"Total papers: {len(papers)}",
        f"Missing venue coords (unique canonical names): {len(missing_v)}",
        f"Missing affiliation coords (unique canonical names): {len(missing_a)}",
        f"Pending geocoder suggestions awaiting review: {len(pending_v) + len(pending_a)}",
        f"Papers with affiliation present but empty (e.g. ['']): {len(empty_aff)}",
        "",
        "=== Missing venues (after normalization) ===",
        *([fmt(n, missing_v[n]) for n in sorted(missing_v)] or ["(none)"]),
        "",
        "=== Missing affiliations (after normalization) ===",
        *([fmt(n, missing_a[n]) for n in sorted(missing_a)] or ["(none)"]),
        "",
        "=== Papers with empty affiliation field ===",
        *([f"- {s}" for s in empty_aff[:50]] or ["(none)"]),
    ]
    if len(empty_aff) > 50:
        lines.append(f"... ({len(empty_aff) - 50} more)")
    REPORT_TXT.write_text("\n".join(lines) + "\n", encoding="utf-8")

    # ---- console summary ----
    n_missing = len(missing_v) + len(missing_a)
    if n_missing == 0:
        print(f"{GREEN}[map] All venues and affiliations have coordinates.{RESET}")
    else:
        colour = RED if strict else YELLOW
        print(f"{colour}[map] {n_missing} name(s) have NO coordinates and will NOT appear on the map:{RESET}")
        for n in sorted(missing_v):
            print(f"{colour}  venue:       {n}{RESET}")
        for n in sorted(missing_a):
            print(f"{colour}  affiliation: {n}{RESET}")
        print(f"{colour}[map] Fix: run `python scripts/geocode_locations.py` (or edit src/content/locations.json).{RESET}")
    if pending_v or pending_a:
        print(f"{YELLOW}[map] {len(pending_v) + len(pending_a)} geocoder suggestion(s) in locations.json → "
              f"\"pending\" await review; accept with `python scripts/geocode_locations.py --accept`.{RESET}")
    print(f"[map] Full report: {REPORT_TXT.name}")

    return 1 if (strict and n_missing) else 0


if __name__ == "__main__":
    sys.exit(main())
