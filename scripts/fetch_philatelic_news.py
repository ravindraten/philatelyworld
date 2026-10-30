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

# 17 sources × 12 per source: high enough that every source's full slice
# survives the date sort, so no feed is silently truncated by the cap.
MAX_ITEMS = 204
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
    # FEPA publishes a normal WordPress RSS feed.
    {"name": "FEPA News", "home": "https://fepanews.com/", "url": "https://fepanews.com/feed/"},
    # Linn's has no RSS anymore; its site reads this JSON endpoint.
    {
        "name": "Linn's Stamp News",
        "home": "https://www.linns.com/",
        "kind": "linns",
        "url": "https://www.linns.com/api/content/article/list",
        "payload": {
            "content_type_id": [1882, 1884, 1885, 1883, 1886],
            "mode": "COMBINED",
            "sort": "newest",
            "limit": 12,
        },
    },
    # Poczta Polska has no feed; the new-issues page is scraped instead.
    {
        "name": "Poczta Polska",
        "home": "https://www.poczta-polska.pl/en/dla-ciebie/filatelistyka/nowosci/znaczki/",
        "kind": "html",
        "url": "https://www.poczta-polska.pl/en/dla-ciebie/filatelistyka/nowosci/znaczki/",
    },
    # MaltaPost server-renders its complete news archive; newest rows are
    # enriched from their detail pages (paragraph + file.aspx image).
    {
        "name": "MaltaPost News",
        "home": "https://www.maltapost.com/latest-news",
        "kind": "html",
        "parser": "maltapost",
        "url": "https://www.maltapost.com/latest-news",
    },
    # Philatelicly blog has a standard WordPress RSS feed.
    {"name": "Philatelicly", "home": "https://www.philatelicly.com/blog/", "url": "https://www.philatelicly.com/feed"},
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
    # Some RSS feeds have leading whitespace/newlines before the XML decl.
    # Strip them so ElementTree can parse the document.
    text = raw.decode("utf-8", "replace").lstrip("\ufeff\x02\x03\x00\n\r ")
    raw = text.encode("utf-8")
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


def fetch_json(url: str, payload: dict) -> bytes:
    """POST a JSON body. Linn's site reads its article list this way."""
    body = json.dumps(payload).encode("utf-8")
    request = Request(
        url,
        data=body,
        method="POST",
        headers={
            "User-Agent": USER_AGENT,
            "Accept": "application/json",
            "Content-Type": "application/json",
        },
    )
    try:
        with urlopen(request, timeout=TIMEOUT, context=SSL_CONTEXT) as response:
            return response.read()
    except Exception:  # noqa: BLE001 - retry with curl for bot-protected hosts
        curl = shutil.which("curl")
        if not curl:
            raise
        result = subprocess.run(
            [
                curl, "-fsSL", "--compressed", "--max-time", str(TIMEOUT),
                "-A", USER_AGENT,
                "-H", "Content-Type: application/json",
                "-H", "Accept: application/json",
                "-d", body.decode("utf-8"),
                url,
            ],
            capture_output=True,
            check=False,
        )
        if result.returncode != 0 or not result.stdout:
            detail = result.stderr.decode("utf-8", "replace").strip()
            raise RuntimeError(detail or f"curl exited with {result.returncode}")
        return result.stdout


def linns_image(path: str) -> str:
    path = html.unescape((path or "").strip())
    if not path:
        return ""
    if path.startswith("//"):
        return "https:" + path
    if path.lower().startswith(("http://", "https://")):
        return path
    # The API returns "assets/images/content//file.jpg" for most articles: the
    # client folder is missing, so the raw URL would 404. Restore it.
    if "content//" in path:
        path = path.replace("content//", "content/scottstamps/")
    # CMS files live on the SEMKHOR asset host, not on linns.com.
    return "https://www.semkhor.com/" + path.lstrip("/")


def parse_linns(source: dict, raw: bytes) -> list[dict]:
    data = json.loads(raw)
    items: list[dict] = []

    for row in data.get("results") or []:
        title = clean_text(row.get("title") or "")
        slug = (row.get("url_path") or "").strip("/")
        if not title or not slug:
            continue
        payload = row.get("data") or {}
        description = shorten(payload.get("Content") or "")
        # Most Linn's stories open with a centred byline that reads oddly as a
        # summary. Drop the common one.
        description = re.sub(r"^By Linn'?s Staff\s*", "", description, flags=re.IGNORECASE)
        published = parse_date(row.get("content_date") or "")
        items.append(
            {
                "title": title,
                "url": f"https://www.linns.com/news/{slug}",
                "description": description,
                "image": linns_image(payload.get("Image_0") or "") or IMAGE_FALLBACK,
                "source": source["name"],
                "source_url": source.get("home", source["url"]),
                "published": published.isoformat().replace("+00:00", "Z") if published else "",
            }
        )

    return items


POCZTA_CARD_RE = re.compile(r'<article class="card">(.*?)</article>', re.S)
POCZTA_TITLE_RE = re.compile(r'class="card-title"[^>]*>(.*?)</h4>', re.S)
POCZTA_TERM_RE = re.compile(r'class="card-terms"[^>]*>(.*?)</p>', re.S)
POCZTA_DATE_RE = re.compile(r"<p>\s*(20\d\d-\d\d-\d\d)\s*</p>")
POCZTA_LINK_RE = re.compile(r'href="([^"]+)"[^>]*title="View post details"')
POCZTA_IMAGE_RE = re.compile(r'data-lazy-src="([^"]+)"')


def parse_poczta(source: dict, raw: bytes) -> list[dict]:
    page = raw.decode("utf-8", "replace")
    items: list[dict] = []

    for block in POCZTA_CARD_RE.findall(page):
        title_match = POCZTA_TITLE_RE.search(block)
        link_match = POCZTA_LINK_RE.search(block)
        if not title_match or not link_match:
            continue
        title = clean_text(title_match.group(1))
        link = html.unescape(link_match.group(1)).strip()
        if not title or not link.startswith(("http://", "https://")):
            continue

        term = POCZTA_TERM_RE.search(block)
        label = clean_text(term.group(1)) if term else ""
        date = POCZTA_DATE_RE.search(block)
        image = POCZTA_IMAGE_RE.search(block)
        published = parse_date(date.group(1)) if date else None

        items.append(
            {
                "title": title,
                "url": link,
                "description": (
                    f"New stamp issue from Poczta Polska ({label})."
                    if label
                    else "New stamp issue from Poczta Polska."
                ),
                "image": normalise_image(image.group(1)) if image else IMAGE_FALLBACK,
                "source": source["name"],
                "source_url": source.get("home", source["url"]),
                "published": published.isoformat().replace("+00:00", "Z") if published else "",
            }
        )

    return items


# MaltaPost publishes its whole news archive (1,500+ rows) server-rendered on
# one page: title, DD/MM/YYYY date and a news-details?id=N link per row. No
# images or summaries on the list, so the newest rows are opened on their
# detail pages for a first paragraph and a `file.aspx?f=` image.
MALTA_ROW_RE = re.compile(
    r'archive_Title">(.*?)</td>.*?archive_Date">(\d{2}/\d{2}/\d{4})</td>.*?href="(news-details\?id=\d+)"',
    re.S,
)
MALTA_CONTENT_RE = re.compile(r'lblNewsContent[^>]*>(.*?)</span>', re.S)
MALTA_IMAGE_RE = re.compile(r'<img[^>]+src="(file\.aspx\?f=\d+)"')
MALTA_SOURCE_TIMEOUT = 15


def parse_maltapost(source: dict, raw: bytes) -> list[dict]:
    page = raw.decode("utf-8", "replace")
    rows: list[tuple[str, str, str]] = []
    seen: set[str] = set()
    for title_blob, date, link in MALTA_ROW_RE.findall(page):
        title = clean_text(title_blob)
        if not title or title.startswith("Title "):
            continue  # column header/placeholder artefact
        if link in seen:
            continue
        seen.add(link)
        rows.append((title, date, link))

    def row_date(row: tuple[str, str, str]) -> str:
        day, month, year = row[1].split("/")
        return f"{year}-{month}-{day}T00:00:00+00:00"

    rows.sort(key=row_date, reverse=True)
    rows = rows[:12]

    items: list[dict] = []
    for title, date, link in rows:
        description = ""
        image = ""
        try:
            detail = fetch(f"https://www.maltapost.com/{link}")
            content_match = MALTA_CONTENT_RE.search(detail.decode("utf-8", "replace"))
            if content_match:
                paragraphs = re.findall(r"<(?:p|div)[^>]*>(.*?)</(?:p|div)>", content_match.group(1), re.S)
                for raw_paragraph in paragraphs:
                    text = shorten(raw_paragraph)
                    if text:
                        description = description or text
                image_match = MALTA_IMAGE_RE.search(content_match.group(1))
            else:
                image_match = None
            if not image_match:
                image_match = MALTA_IMAGE_RE.search(detail.decode("utf-8", "replace"))
            if image_match:
                image = normalise_image(f"https://www.maltapost.com/{image_match.group(1)}")
        except Exception:
            pass  # detail fetch is best-effort; list data is already good

        items.append(
            {
                "title": title,
                "url": f"https://www.maltapost.com/{link}",
                "description": description,
                "image": image or IMAGE_FALLBACK,
                "source": source["name"],
                "source_url": source.get("home", source["url"]),
                "published": row_date((title, date, link)),
            }
        )

    return items


def load_source(source: dict) -> list[dict]:
    kind = source.get("kind", "rss")
    if kind == "linns":
        return parse_linns(source, fetch_json(source["url"], source.get("payload") or {}))
    if kind == "html":
        if source.get("parser") == "maltapost":
            return parse_maltapost(source, fetch(source["url"]))
        return parse_poczta(source, fetch(source["url"]))
    return parse_feed(source, fetch(source["url"]))


def collect() -> list[dict]:
    collected: list[dict] = []
    failures: list[str] = []

    with ThreadPoolExecutor(max_workers=8) as pool:
        futures = {pool.submit(load_source, source): source for source in SOURCES}
        for future in as_completed(futures):
            source = futures[future]
            try:
                items = future.result()
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
