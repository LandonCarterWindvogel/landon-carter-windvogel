#!/usr/bin/env python3
"""Point every canonical / Open Graph / JSON-LD / sitemap URL at your real domain.

    python3 scripts/set_domain.py https://your-domain.example

Run it once when the final domain is known. It rewrites the current domain
(read from index.html's canonical link) everywhere and regenerates sitemap.xml.
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def main() -> int:
    if len(sys.argv) != 2 or not sys.argv[1].startswith("https://"):
        print(__doc__)
        return 2
    new = sys.argv[1].rstrip("/")
    index = (ROOT / "index.html").read_text(encoding="utf-8")
    match = re.search(r'<link rel="canonical" href="(https://[^"/]+)/?"', index)
    if not match:
        print("Could not find the current canonical domain in index.html")
        return 1
    old = match.group(1)
    changed = 0
    for path in list(ROOT.rglob("*.html")) + [ROOT / "robots.txt", ROOT / "sitemap.xml"]:
        text = path.read_text(encoding="utf-8")
        updated = text.replace(old, new)
        if updated != text:
            path.write_text(updated, encoding="utf-8")
            changed += 1
    print(f"Replaced {old} -> {new} in {changed} files.")
    print("Reminder: the email address in the page and form fallback is separate: edit it by hand if it changes.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
