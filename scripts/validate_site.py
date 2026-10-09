#!/usr/bin/env python3
"""Check local HTML links, asset references, and same-site anchors."""
from __future__ import annotations

from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
IGNORED_SCHEMES = {"http", "https", "mailto", "tel", "data", "javascript", "sms"}


class PageParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.ids: set[str] = set()
        self.references: list[tuple[str, str]] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = dict(attrs)
        if values.get("id"):
            self.ids.add(values["id"] or "")
        for attribute in ("href", "src", "data-fallback"):
            value = values.get(attribute)
            if value:
                self.references.append((attribute, value))


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
            if path_part.endswith("/"):
                target = target / "index.html"
            if not target.exists() or not target.is_file():
                errors.append(f"{page.relative_to(ROOT)}: missing {attribute} target {raw!r}")
                continue
            checked += 1
            if url.fragment and target.suffix.lower() == ".html":
                target_parser = parsers.get(target.resolve())
                if target_parser and unquote(url.fragment) not in target_parser.ids:
                    errors.append(
                        f"{page.relative_to(ROOT)}: missing anchor #{url.fragment} "
                        f"in {target.relative_to(ROOT)}"
                    )

    if errors:
        print("Site validation failed:")
        for error in errors:
            print(f" - {error}")
        return 1
    print(f"Site validation passed: {len(pages)} HTML pages and {checked} local references checked.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
