#!/usr/bin/env python3
"""Aggregate philatelic news from public RSS/Atom feeds.

The script is intentionally dependency-free so it can run in GitHub Actions
without installing anything.  It writes ``docs/news.json`` which is rendered
by ``docs/philatelic-news.html``.

Usage:
    python scripts/fetch_philatelic_news.py
"""

from __future__ import annotations

import gzip
import html
import json
import os
import re
import shutil
import ssl
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from pathlib import Path
from typing import Iterable
from urllib.request import Request, urlopen
from xml.etree import ElementTree as ET

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "docs" / "news.json"

MAX_ITEMS = 120
MAX_PER_SOURCE = 12
TIMEOUT = 30

USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
)

# Keep this list in sync with the sources shown on the news page.
SOURCES = [
    {"name": "Canadian Stamp News", "home": "https://canadianstampnews.com/", "url": "https://canadianstampnews.com/feed/"},
    {"name": "Commonwealth Stamps", "home": "http://commonwealthstampsopinion.blogspot.com/", "url": "http://commonwealthstampsopinion.blogspot.com/feeds/posts/default?alt=rss"},
    {"name": "MB's Stamps of India", "home": "https://mbstamps.blogspot.com/", "url": "https://mbstamps.blogspot.com/feeds/posts/default?alt=rss"},
    {"name": "Stamp Digest", "home": "https://stampdigest.in/", "url": "https://stampdigest.in/feed/"},
    {"name": "Rainbow Stamp Club", "home": "https://rainbowstampclub.blogspot.com/", "url": "https://rainbowstampclub.blogspot.com/feeds/posts/default?alt=rss"},
    {"name": "Philaquely Moi", "home": "http://philaquelymoi.blogspot.com/", "url": "http://philaquelymoi.blogspot.com/feeds/posts/default?alt=rss"},
    {"name": "Europa Stamps", "home": "https://europa-stamps.blogspot.com/", "url": "https://europa-stamps.blogspot.com/feeds/posts/default?alt=rss"},
    {"name": "Wayne Youngblood's Substack", "home": "https://wayneyoungblood.substack.com/", "url": "https://wayneyoungblood.substack.com/feed"},
    {"name": "Gulfmann Stamps Collection", "home": "https://gulfmanncollection.blogspot.com/", "url": "https://gulfmanncollection.blogspot.com/feeds/posts/default?alt=rss"},
    {"name": "Classic Latin America", "home": "https://classiclatinamerica.com/", "url": "https://classiclatinamerica.com/feed/"},
    {"name": "The Philatelist", "home": "https://the-philatelist.com/", "url": "https://the-philatelist.com/feed/"},
    {"name": "Barbados Stamps", "home": "https://www.barbadosstamps.co.uk/", "url": "https://www.barbadosstamps.co.uk/feed/"},
    {"name": "cddstamps on stamps", "home": "http://cddstamps.blogspot.com/", "url": "http://cddstamps.blogspot.com/feeds/posts/default?alt=rss"},
]

IMAGE_FALLBACK = "images/news-placeholder.svg"
BAD_IMAGE_HINTS = (
    "pixel",
    "spacer",
    "doubleclick",
    "feedburner",
    "notoemoji",
    "gravatar",
    "wp-emoji",
)

TAG_RE = re.compile(r"<[^>]+>")
SPACE_RE = re.compile(r"\s+")
IMG_RE = re.compile(r"<img[^>]+src=[\"']([^\"']+)[\"']", re.IGNORECASE)
BLOGGER_SIZE_RE = re.compile(r"/s\d+(?:-[^/]*)?/")
BLOGGER_WIDTH = "w800"

# WordPress serves resized variants as "<name>-<w>x<h>.<ext>". Thumbnails in
# feeds are often 300px wide, which looks soft in the cards on retina screens.
WP_THUMB_RE = re.compile(
    r"^(?P<base>.+)-(?P<w>\d+)x(?P<h>\d+)(?P<ext>\.(?:jpe?g|png|gif|webp))$",
    re.IGNORECASE,
)
WP_TARGET_WIDTH = 768

# Jetpack/Photon proxied images take their size from the query string.
PHOTON_RESIZE_RE = re.compile(r"resize=(\d+)(?:%2C|,)(\d+)")


def ssl_context() -> ssl.SSLContext:
    """Return a context with usable roots on macOS, Linux and CI."""
    try:
        import certifi  # type: ignore

        return ssl.create_default_context(cafile=certifi.where())
    except Exception:  # noqa: BLE001 - optional dependency
        context = ssl.create_default_context()
        for bundle in (
            "/etc/ssl/cert.pem",
            "/etc/pki/tls/certs/ca-bundle.crt",
            "/etc/ssl/certs/ca-certificates.crt",
        ):
            if os.path.exists(bundle):
                try:
                    context.load_verify_locations(bundle)
                    break
                except ssl.SSLError:
                    continue
        return context


SSL_CONTEXT = ssl_context()


def fetch_with_curl(url: str) -> bytes:
    curl = shutil.which("curl")
    if not curl:
        raise RuntimeError("curl is not available")
    result = subprocess.run(
        [
            curl,
            "-fsSL",
            "--compressed",
            "--max-time",
            str(TIMEOUT),
            "-A",
            USER_AGENT,
            "-H",
            "Accept: application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.8",
            url,
        ],
        capture_output=True,
        check=False,
    )
    if result.returncode != 0 or not result.stdout:
        detail = result.stderr.decode("utf-8", "replace").strip()
        raise RuntimeError(detail or f"curl exited with {result.returncode}")
    return result.stdout


def fetch(url: str) -> bytes:
    request = Request(
        url,
        headers={
            "User-Agent": USER_AGENT,
            "Accept": "application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.8",
            "Accept-Language": "en-GB,en;q=0.9",
        },
    )
    try:
        with urlopen(request, timeout=TIMEOUT, context=SSL_CONTEXT) as response:
            raw = response.read()
    except Exception:  # noqa: BLE001 - retry with curl for bot-protected hosts
        raw = fetch_with_curl(url)
    if raw[:2] == b"\x1f\x8b":
        raw = gzip.decompress(raw)
    return raw


def local_name(tag: str) -> str:
    return tag.rsplit("}", 1)[-1]


def child_text(node: ET.Element, names: Iterable[str]) -> str:
    wanted = set(names)
    for child in node:
        if local_name(child.tag) in wanted and child.text:
            return child.text.strip()
    return ""


def entry_link(node: ET.Element) -> str:
    for child in node:
        if local_name(child.tag) != "link":
            continue
        href = child.get("href")
        if href:
            rel = child.get("rel", "alternate")
            if rel == "alternate":
                return href.strip()
        elif child.text:
            return child.text.strip()
    return ""


def parse_date(value: str) -> datetime | None:
    value = (value or "").strip()
    if not value:
        return None
    try:
        parsed = parsedate_to_datetime(value)
        if parsed.tzinfo is None:
            parsed = parsed.replace(tzinfo=timezone.utc)
        return parsed.astimezone(timezone.utc)
    except (TypeError, ValueError, OverflowError):
        pass
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
        if parsed.tzinfo is None:
            parsed = parsed.replace(tzinfo=timezone.utc)
        return parsed.astimezone(timezone.utc)
    except ValueError:
        return None


def clean_text(value: str) -> str:
    value = html.unescape(value or "")
    value = TAG_RE.sub(" ", value)
    value = html.unescape(value)
    value = SPACE_RE.sub(" ", value).strip()
    # Canadian Stamp News appends this boilerplate to every summary.
    value = re.sub(
        r"The post .*? appeared first on .*?\.?\s*$",
        "",
        value,
        flags=re.IGNORECASE | re.DOTALL,
    )
    value = re.sub(r"(Continue reading|Read more|Read the full post).*$", "", value, flags=re.IGNORECASE)
    return value.strip(" \u2013-\u00a0")


def shorten(value: str, limit: int = 260) -> str:
    value = clean_text(value)
    if len(value) <= limit:
        return value
    cut = value[:limit].rsplit(" ", 1)[0].rstrip(" ,.;:")
    return cut + "\u2026"


def good_image(url: str) -> bool:
    lowered = url.lower()
    return not any(hint in lowered for hint in BAD_IMAGE_HINTS) and not lowered.startswith("data:")


def remote_exists(url: str) -> bool:
    """True when a HEAD request succeeds. Used to probe optional image sizes."""
    try:
        request = Request(url, method="HEAD", headers={"User-Agent": USER_AGENT})
        with urlopen(request, timeout=TIMEOUT, context=SSL_CONTEXT) as response:
            return 200 <= response.status < 300
    except Exception:  # noqa: BLE001 - probe only
        pass
    curl = shutil.which("curl")
    if not curl:
        return False
    result = subprocess.run(
        [curl, "-fsSI", "--max-time", str(TIMEOUT), "-A", USER_AGENT, url],
        capture_output=True,
        check=False,
    )
    return result.returncode == 0


def normalise_image(url: str) -> str:
    url = html.unescape(url.strip())
    if url.startswith("//"):
        url = "https:" + url
    if url.startswith("http://"):
        url = "https://" + url[len("http://"):]
    # Blogger serves tiny thumbnails in its feeds (often 72px wide). Ask for a
    # width that stays crisp in the 178px thumbnail and in the mobile layout.
    # Match both blogger.googleusercontent.com and the older bp.blogspot.com.
    if "blogger" in url or "blogspot" in url:
        url = BLOGGER_SIZE_RE.sub(f"/{BLOGGER_WIDTH}/", url)

    # Jetpack/Photon proxies: resizing happens in the query string.
    if "i0.wp.com" in url or "i1.wp.com" in url or "i2.wp.com" in url:
        def bump(match: re.Match) -> str:
            width, height = int(match.group(1)), int(match.group(2))
            if width >= WP_TARGET_WIDTH:
                return match.group(0)
            new_height = max(1, round(height * WP_TARGET_WIDTH / width))
            return f"resize={WP_TARGET_WIDTH}%2C{new_height}"

        return PHOTON_RESIZE_RE.sub(bump, url)

    # Direct WordPress thumbnails: try the 768px variant, keep the original URL
    # if the site did not generate one.
    match = WP_THUMB_RE.match(url) if "wp-content" in url else None
    if match and int(match.group("w")) < WP_TARGET_WIDTH:
        width, height = int(match.group("w")), int(match.group("h"))
        base, ext = match.group("base"), match.group("ext")
        # WordPress rounds the height; the thumb's own height is rounded too, so
        # probe both neighbours instead of trusting one calculation.
        floor_height = height * WP_TARGET_WIDTH // width
        for candidate_height in (floor_height, floor_height + 1):
            candidate = f"{base}-{WP_TARGET_WIDTH}x{candidate_height}{ext}"
            if remote_exists(candidate):
                return candidate

    return url


def find_image(node: ET.Element, html_blobs: list[str]) -> str:
    candidates: list[str] = []

    for child in node:
        name = local_name(child.tag)
        if name in {"thumbnail", "content"}:
            url = child.get("url", "")
            if url and (name == "thumbnail" or (child.get("type") or "").startswith("image")):
                candidates.append(url)
        elif name == "enclosure":
            url = child.get("url", "")
            if url and (child.get("type") or "").startswith("image"):
                candidates.append(url)

    for blob in html_blobs:
        candidates.extend(IMG_RE.findall(blob or ""))

    for candidate in candidates:
        candidate = normalise_image(candidate)
        if candidate.startswith("http") and good_image(candidate):
            return candidate
    return ""


def parse_feed(source: dict, raw: bytes) -> list[dict]:
    root = ET.fromstring(raw)
    items: list[dict] = []

    for node in root.iter():
        if local_name(node.tag) not in {"item", "entry"}:
            continue

        title = clean_text(child_text(node, {"title"}))
        link = entry_link(node)
        if not title or not link:
            continue
        if not link.lower().startswith(("http://", "https://")):
            continue

        description = child_text(node, {"description", "summary"})
        content = child_text(node, {"encoded", "content"})
        published = parse_date(
            child_text(node, {"pubDate", "published", "updated", "date"})
        )
        image = find_image(node, [content, description])

        items.append(
            {
                "title": title,
                "url": link,
                "description": shorten(description or content),
                "image": image or IMAGE_FALLBACK,
                "source": source["name"],
                "source_url": source.get("home", source["url"]),
                "published": published.isoformat().replace("+00:00", "Z") if published else "",
            }
        )

    return items


def collect() -> list[dict]:
    collected: list[dict] = []
    failures: list[str] = []

    with ThreadPoolExecutor(max_workers=8) as pool:
        futures = {pool.submit(fetch, source["url"]): source for source in SOURCES}
        for future in as_completed(futures):
            source = futures[future]
            try:
                raw = future.result()
                items = parse_feed(source, raw)
                items.sort(key=lambda item: item["published"], reverse=True)
                collected.extend(items[:MAX_PER_SOURCE])
                print(f"  {source['name']}: {min(len(items), MAX_PER_SOURCE)} items", file=sys.stderr)
            except Exception as exc:  # noqa: BLE001 - one bad feed must not break the build
                failures.append(f"{source['name']}: {exc}")
                print(f"  {source['name']}: FAILED ({exc})", file=sys.stderr)

    # De-duplicate by URL, preferring the first (newest) occurrence.
    seen: set[str] = set()
    unique: list[dict] = []
    for item in sorted(collected, key=lambda item: item["published"], reverse=True):
        key = item["url"].split("#", 1)[0].rstrip("/")
        if key in seen:
            continue
        seen.add(key)
        unique.append(item)
        if len(unique) >= MAX_ITEMS:
            break

    if failures:
        print(f"\n{len(failures)} feed(s) failed:", file=sys.stderr)
        for failure in failures:
            print(f"  - {failure}", file=sys.stderr)

    return unique


def main() -> int:
    print(f"Fetching {len(SOURCES)} philatelic feeds...", file=sys.stderr)
    items = collect()
    if not items:
        print("No news items were collected; refusing to overwrite news.json.", file=sys.stderr)
        return 1

    payload = {
        "generated_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "sources": [source["name"] for source in SOURCES],
        "count": len(items),
        "items": items,
    }

    # Avoid a commit every few hours when the feeds have not changed.
    if OUTPUT.exists():
        try:
            previous = json.loads(OUTPUT.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            previous = None
        if previous and previous.get("items") == items and previous.get("sources") == payload["sources"]:
            print("No news changes; keeping the existing snapshot.", file=sys.stderr)
            return 0

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(items)} items to {OUTPUT.relative_to(ROOT)}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
