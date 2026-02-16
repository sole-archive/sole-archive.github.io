#!/usr/bin/env python3
from __future__ import annotations

import json
import re
from pathlib import Path
from datetime import datetime
from zoneinfo import ZoneInfo
from collections import defaultdict

# -------------------------
# Config (adjust if needed)
# -------------------------
PAPERS_JSON = Path("public/papers.json")          # prebuild copies here
ANALYTICS_ASTRO = Path("src/pages/Analytics.astro")
REPORT_TXT = Path("report.txt")
TZ = ZoneInfo("Europe/Rome")


# -------------------------
# Helpers to parse Analytics.astro
# -------------------------
def extract_object_literal_block(source: str, const_name: str) -> str:
    """
    Extracts the `{ ... }` object literal assigned to:
      const <const_name>: ... = { ... };
    Returns the inside text of the braces.
    """
    pattern = re.compile(
        rf"const\s+{re.escape(const_name)}\s*:\s*Record<[^>]*>\s*=\s*\{{(.*?)\}}\s*;",
        re.DOTALL,
    )
    m = pattern.search(source)
    if not m:
        raise ValueError(f"Could not find object literal for '{const_name}' in {ANALYTICS_ASTRO}")
    return m.group(1)


def extract_mapping_block(source: str, const_name: str) -> dict[str, str]:
    """
    Extracts Record<string,string> style object:
      const affiliationNormalization: Record<string, string> = { 'a': 'b', ... };
    Returns dict mapping raw->canonical.
    """
    block = extract_object_literal_block(source, const_name)
    # matches: 'key': 'value' or "key": "value"
    pair_re = re.compile(r"""(?m)^\s*(['"])(.*?)\1\s*:\s*(['"])(.*?)\3\s*,?\s*(?://.*)?$""")
    out: dict[str, str] = {}
    for m in pair_re.finditer(block):
        k = m.group(2).strip()
        v = m.group(4).strip()
        if k:
            out[k] = v
    return out


def extract_coords_keys(source: str, const_name: str) -> set[str]:
    """
    Extract keys from coords object literal:
      const knownAffiliationCoords ... = { 'X': [..], ... };
    """
    block = extract_object_literal_block(source, const_name)
    key_re = re.compile(r"""(?m)^\s*(['"])(.+?)\1\s*:""")
    return {m.group(2).strip() for m in key_re.finditer(block)}


# -------------------------
# Normalization logic
# -------------------------
def normalize_venue(raw: str) -> str:
    """
    Must match your inline normalizeVenue() used to build venueCounts in Analytics.astro.
    """
    n = str(raw or "Unknown").strip()
    if n in ("Université Leipzig", "Universität Leipzig", "University of Leipzig"):
        return "Leipzig University"
    if n == "Paris":
        return "Université Paris"
    return n


def normalize_affiliation(raw: str, aff_norm: dict[str, str]) -> str:
    """
    Must match Analytics.astro behavior:
      canonical = affiliationNormalization[trimmed] || trimmed
    """
    trimmed = str(raw or "").strip()
    return aff_norm.get(trimmed, trimmed)


# -------------------------
# Main
# -------------------------
def main() -> None:
    if not PAPERS_JSON.exists():
        raise FileNotFoundError(
            f"Missing {PAPERS_JSON}. Your prebuild must copy papers.json to public/ BEFORE running this script, "
            f"or change PAPERS_JSON to src/content/papers.json."
        )
    if not ANALYTICS_ASTRO.exists():
        raise FileNotFoundError(f"Missing {ANALYTICS_ASTRO}. Update ANALYTICS_ASTRO in the script.")

    analytics_src = ANALYTICS_ASTRO.read_text(encoding="utf-8")

    # Pull canonical coordinate keys
    known_venues = extract_coords_keys(analytics_src, "knownVenueCoords")
    known_affs = extract_coords_keys(analytics_src, "knownAffiliationCoords")

    # Pull normalization dicts (so your checker matches runtime logic)
    venue_norm = extract_mapping_block(analytics_src, "venueNormalization")
    aff_norm = extract_mapping_block(analytics_src, "affiliationNormalization")

    # Load papers
    data = json.loads(PAPERS_JSON.read_text(encoding="utf-8"))
    papers = [data] if isinstance(data, dict) else data

    missing_venues: dict[str, set[str]] = defaultdict(set)        # canonical -> {slug}
    missing_affs: dict[str, set[str]] = defaultdict(set)          # canonical -> {slug}
    empty_affiliation_slugs: set[str] = set()

    for p in papers:
        slug = str(p.get("slug", "")).strip() or "(no-slug)"

        # ---- venue ----
        raw_v = p.get("console_venue", "")
        v_trim = str(raw_v or "").strip()
        if v_trim:
            # apply same normalization you use for counts:
            canonical_v = normalize_venue(v_trim)
            # ALSO apply explicit venueNormalization map if present (keeps you future-proof)
            canonical_v = venue_norm.get(canonical_v, canonical_v)

            if canonical_v not in known_venues:
                missing_venues[canonical_v].add(slug)

        # ---- affiliations ----
        aff_val = p.get("affiliation", [])
        if isinstance(aff_val, list):
            aff_list = aff_val
        elif aff_val:
            aff_list = [str(aff_val)]
        else:
            aff_list = []

        # Track truly empty affiliation entries (your sample has [""])
        # These aren’t "missing coords"; they’re missing data.
        if aff_list and all(not str(a or "").strip() for a in aff_list):
            empty_affiliation_slugs.add(slug)

        for raw_a in aff_list:
            a_trim = str(raw_a or "").strip()
            if not a_trim:
                continue  # ignore empty strings
            canonical_a = normalize_affiliation(a_trim, aff_norm)
            if canonical_a not in known_affs:
                missing_affs[canonical_a].add(slug)

    # Write report
    now = datetime.now(TZ).strftime("%Y-%m-%d %H:%M:%S %Z")

    lines: list[str] = []
    lines.append("SOLE Archive coordinate coverage report")
    lines.append(f"Run at: {now}")
    lines.append("")
    lines.append(f"papers.json: {PAPERS_JSON}")
    lines.append(f"Analytics.astro: {ANALYTICS_ASTRO}")
    lines.append("")
    lines.append("=== Summary ===")
    lines.append(f"Total papers: {len(papers)}")
    lines.append(f"Missing venue coords (unique canonical names): {len(missing_venues)}")
    lines.append(f"Missing affiliation coords (unique canonical names): {len(missing_affs)}")
    lines.append(f"Papers with affiliation present but empty (e.g. ['']): {len(empty_affiliation_slugs)}")
    lines.append("")

    lines.append("=== Missing venues (after normalization) ===")
    if not missing_venues:
        lines.append("(none)")
    else:
        for name in sorted(missing_venues.keys()):
            slugs = sorted(missing_venues[name])
            lines.append(f"- {name}  | examples: {', '.join(slugs[:8])}{' …' if len(slugs) > 8 else ''}")
    lines.append("")

    lines.append("=== Missing affiliations (after normalization) ===")
    if not missing_affs:
        lines.append("(none)")
    else:
        for name in sorted(missing_affs.keys()):
            slugs = sorted(missing_affs[name])
            lines.append(f"- {name}  | examples: {', '.join(slugs[:8])}{' …' if len(slugs) > 8 else ''}")
    lines.append("")

    lines.append("=== Papers with empty affiliation field ===")
    if not empty_affiliation_slugs:
        lines.append("(none)")
    else:
        for slug in sorted(empty_affiliation_slugs)[:50]:
            lines.append(f"- {slug}")
        if len(empty_affiliation_slugs) > 50:
            lines.append(f"... ({len(empty_affiliation_slugs) - 50} more)")

    REPORT_TXT.write_text("\n".join(lines), encoding="utf-8")
    print(f"✅ Done! Report written to {REPORT_TXT.resolve()}")


if __name__ == "__main__":
    main()
