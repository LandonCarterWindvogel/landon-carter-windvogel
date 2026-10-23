#!/usr/bin/env python3
"""Capture real project screenshots and swap them into the site.

One-time setup (on your own machine, which can reach the live sites):

    pip install playwright pillow
    playwright install chromium

Then:

    python3 scripts/capture_screenshots.py
    python3 scripts/capture_screenshots.py --url jm-cab-services=https://example.co.za

For each project it saves assets/img/work/<slug>.webp (1600x1000, top of the
page) and rewrites the <img src> in index.html and the case study page to use
it. The existing SVG artwork stays as the automatic fallback via data-fallback.
"""
from __future__ import annotations

import argparse
import io
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SITES = {
    "paivepo": "https://landoncarterwindvogel.github.io/paivepo-art/",
    "bln-electrical": "https://bl-n-site.netlify.app/",
    "postnet": "https://postnet-production.netlify.app/",
    # Add these when you have the live URLs, or pass --url slug=https://...
    # "jm-cab-services": "",
    # "shalom-designs": "",
}
# image slug -> case study page that uses <slug>-preview.svg
PAGES = {
    "paivepo": "projects/paivepo.html",
    "bln-electrical": "projects/bln-electrical.html",
    "jm-cab-services": "projects/jm-cab-services.html",
    "postnet": "projects/postnet-production.html",
    "shalom-designs": "projects/shalom-designs.html",
}
SVG_NAME = {"bln-electrical": "bln-electrical", "postnet": "postnet", "paivepo": "paivepo",
            "jm-cab-services": "jm-cab-services", "shalom-designs": "shalom-designs"}


def swap_src(path: Path, slug: str) -> bool:
    text = path.read_text(encoding="utf-8")
    # only the src attribute (leading space), never data-fallback
    pattern = re.compile(r'(\ssrc=")((?:\.\./)?)assets/img/' + re.escape(slug) + r'-preview\.svg(")')
    updated = pattern.sub(lambda m: f"{m.group(1)}{m.group(2)}assets/img/work/{slug}.webp{m.group(3)}", text)
    if updated != text:
        path.write_text(updated, encoding="utf-8")
        return True
    return False


def main() -> int:
    from playwright.sync_api import sync_playwright
    from PIL import Image

    parser = argparse.ArgumentParser()
    parser.add_argument("--url", action="append", default=[], metavar="slug=URL")
    args = parser.parse_args()
    sites = dict(SITES)
    for item in args.url:
        slug, _, url = item.partition("=")
        sites[slug] = url

    out = ROOT / "assets" / "img" / "work"
    out.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 1600, "height": 1000}, device_scale_factor=1)
        for slug, url in sites.items():
            if not url:
                continue
            try:
                page.goto(url, wait_until="networkidle", timeout=45000)
                page.wait_for_timeout(1500)
                shot = page.screenshot(type="png")
            except Exception as exc:  # noqa: BLE001
                print(f"skip {slug}: {exc}")
                continue
            Image.open(io.BytesIO(shot)).convert("RGB").save(out / f"{slug}.webp", "WEBP", quality=82, method=6)
            targets = [ROOT / "index.html", ROOT / PAGES[slug]]
            swapped = sum(swap_src(t, slug) for t in targets)
            print(f"ok   {slug}: saved {slug}.webp, updated {swapped} page(s)")
        browser.close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
