#!/usr/bin/env python3
"""Validate the static site before you ship it.

Checks: local links / assets / anchors, one <h1> per page, title + description
+ canonical + og:image on indexable pages, the inline-script CSP hash, and that
sitemap.xml only lists pages that exist.
"""
from __future__ import annotations

import base64
import hashlib
import re
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
IGNORED_SCHEMES = {"http", "https", "mailto", "tel", "data", "javascript", "sms"}
INLINE_JS = 'document.documentElement.classList.add("js")'


class PageParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.ids: set[str] = set()
        self.references: list[tuple[str, str]] = []
        self.h1 = 0
        self.title = False
        self.meta: dict[str, str] = {}
        self.canonical = ""
        self.inline_scripts: list[str] = []
        self._in_script = False
        self._script_buf = ""

    def handle_starttag(self, tag, attrs):
        v = dict(attrs)
        if v.get("id"):
            self.ids.add(v["id"] or "")
        for attribute in ("href", "src", "data-fallback"):
            if v.get(attribute):
                self.references.append((attribute, v[attribute]))
        if tag == "h1":
            self.h1 += 1
        if tag == "title":
            self.title = True
        if tag == "meta":
            key = v.get("name") or v.get("property")
            if key:
                self.meta[key] = v.get("content") or ""
        if tag == "link" and v.get("rel") == "canonical":
            self.canonical = v.get("href") or ""
        if tag == "script" and not v.get("src") and v.get("type") != "application/ld+json":
            self._in_script, self._script_buf = True, ""

    def handle_data(self, data):
        if self._in_script:
            self._script_buf += data

    def handle_endtag(self, tag):
        if tag == "script" and self._in_script:
            self.inline_scripts.append(self._script_buf)
            self._in_script = False


def main() -> int:
    pages = sorted(ROOT.rglob("*.html"))
    parsers: dict[Path, PageParser] = {}
    for page in pages:
        parser = PageParser()
        parser.feed(page.read_text(encoding="utf-8"))
        parsers[page.resolve()] = parser

    errors: list[str] = []
    checked = 0

    for page, parser in parsers.items():
        rel = page.relative_to(ROOT)
        for attribute, raw in parser.references:
            url = urlsplit(raw.strip())
            if url.scheme.lower() in IGNORED_SCHEMES or url.netloc or raw.startswith("//"):
                continue
            path_part = unquote(url.path)
            if path_part.startswith("/"):
                target = (ROOT / path_part.lstrip("/")).resolve()
            elif path_part:
                target = (page.parent / path_part).resolve()
            else:
                target = page
            if path_part.endswith("/") or target == ROOT:
                target = target / "index.html"
            if not target.exists() or not target.is_file():
                errors.append(f"{rel}: missing {attribute} target {raw!r}")
                continue
            checked += 1
            if url.fragment and target.suffix.lower() == ".html":
                target_parser = parsers.get(target.resolve())
                if target_parser and unquote(url.fragment) not in target_parser.ids:
                    errors.append(f"{rel}: missing anchor #{url.fragment} in {target.relative_to(ROOT)}")

        if parser.h1 != 1:
            errors.append(f"{rel}: expected exactly one <h1>, found {parser.h1}")
        if not parser.title:
            errors.append(f"{rel}: missing <title>")
        if not parser.meta.get("description"):
            errors.append(f"{rel}: missing meta description")
        if rel.name != "404.html":
            if not parser.canonical.startswith("https://"):
                errors.append(f"{rel}: missing absolute canonical URL")
            if not parser.meta.get("og:image", "").startswith("https://"):
                errors.append(f"{rel}: missing absolute og:image")
        for script in parser.inline_scripts:
            if script.strip() != INLINE_JS:
                errors.append(f"{rel}: unexpected inline script (it will be blocked by the CSP hash)")

    # CSP hash must match the one inline script
    digest = base64.b64encode(hashlib.sha256(INLINE_JS.encode()).digest()).decode()
    toml = (ROOT / "netlify.toml").read_text(encoding="utf-8")
    if f"sha256-{digest}" not in toml:
        errors.append("netlify.toml: CSP hash does not match the inline script")

    # sitemap -> files
    sitemap = (ROOT / "sitemap.xml").read_text(encoding="utf-8")
    for loc in re.findall(r"<loc>(.*?)</loc>", sitemap):
        path = urlsplit(loc).path.lstrip("/") or "index.html"
        if not (ROOT / path).is_file():
            errors.append(f"sitemap.xml: {loc} has no matching file")

    if errors:
        print("Site validation failed:")
        for error in errors:
            print(f" - {error}")
        return 1
    print(f"Site validation passed: {len(pages)} HTML pages, {checked} local references, CSP hash and sitemap OK.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
