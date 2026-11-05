#!/usr/bin/env python3
"""Collect upcoming philatelic exhibitions and stamp shows into docs/exhibitions.json.

Scraped from each organiser's event page:
- ABPS Forthcoming Exhibitions (UK national and international shows)
- FEPA events calendar (Europe-wide, years ahead)
- APS international shows (worldwide, from the American Philatelic Society)
- NAPEX (Washington D.C. area, USA)
- Queensland Stamp & Coin Show (Brisbane, Australia)

The generated snapshot is rendered as a tab on ``docs/philatelic-news.html``.
Run ``python3 scripts/fetch_philatelic_exhibitions.py`` to refresh.
"""

from __future__ import annotations

import calendar
import gzip
import html
import http.cookiejar
import json
import re
import ssl
import sys
import urllib.request
import subprocess
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "docs" / "exhibitions.json"
USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
)
TIMEOUT = 30
SSL_CONTEXT = ssl.create_default_context()

SOURCES = [
    {
        "name": "ABPS",
        "home": "https://www.abps.org.uk/",
        "url": "https://www.abps.org.uk/forthcoming-exhibitions/",
    },
    {
        "name": "FEPA News",
        "home": "https://fepanews.com/",
        "url": "https://fepanews.com/events/",
    },
    {
        "name": "APS",
        "home": "https://stamps.org/",
        "url": "https://stamps.org/events/international-shows",
    },
    {"name": "NAPEX", "home": "https://www.napex.org", "url": "https://www.napex.org/"},
    {
        "name": "Queensland Stamp & Coin Show",
        "home": "https://www.qldstampandcoinshow.com/",
        "url": "https://www.qldstampandcoinshow.com/planyourvisit",
    },
]

IMAGE_FALLBACK = "images/news-placeholder.svg"

TAG_RE = re.compile(r"<[^>]+>")
SPACE_RE = re.compile(r"\s+")

# The Events Calendar markup on fepanews.com/events: one <article> per event
# with machine-readable datetime attributes.
FEPA_ARTICLE_RE = re.compile(r"<article[^>]*>(.*?)</article>", re.S)
FEPA_DT_RE = re.compile(r'<time[^>]*datetime="(\d{4}-\d{2}-\d{2})[^"]*"[^>]*>')
FEPA_START_TEXT_RE = re.compile(r'tribe-event-date-start[^>]*>([^<]+)<')
FEPA_END_TEXT_RE = re.compile(r'tribe-event-date-end[^>]*>([^<]+)<')
FEPA_EU_DATE_RE = re.compile(r"(\d{1,2})\.(\d{1,2})\.(\d{4})")
FEPA_TITLE_RE = re.compile(r'<a\s+href="(https://fepanews\.com/event/[^"]+)"\s+title="([^"]*)"', re.S)
FEPA_VENUE_RE = re.compile(
    r'class="tribe-events-calendar-list__event-venue[^"]*"[^>]*>(.*?)</address>', re.S
)
FEPA_DESCRIPTION_RE = re.compile(
    r'class="tribe-events-calendar-list__event-summary[^"]*"[^>]*>(.*?)</', re.S
)

# ABPS Forthcoming Exhibitions page: prose broken into <h3>/<p> blocks. Each
# exhibition opens with a short title block ending in a parenthesised date,
# e.g. "PRAGA 2028 (22-26 March 2028)".
ABPS_BLOCK_RE = re.compile(r"<(h3|p)[^>]*>(.*?)</\1>", re.S)
ABPS_TITLE_DATE_RE = re.compile(r"\(([^)]*\d{4})\)\s*$")
ABPS_RANGE_RE = re.compile(
    r"(\d{1,2})\s*[\u2013\u2014-]\s*(\d{1,2})\s+([A-Z][a-z]+)\s+(\d{4})"
)
ABPS_DAY_RE = re.compile(r"(\d{1,2})\s+([A-Z][a-z]+)\s+(\d{4})")
ABPS_MONTH_RE = re.compile(r"([A-Z][a-z]+)\s+(\d{4})")
ABPS_LOCATION_RE = re.compile(r"\(to be held at ([^)]+)\)", re.I)
ABPS_LINK_RE = re.compile(r'href="([^"]+)"')
ABPS_SKIP_DETAIL_RE = re.compile(
    r"^(?:fip patronage|full details|uk commissioner|entry deadline|"
    r"now closed|applications|please refer|any queries|the deadline|"
    r"postponed|to register|if you would|extract from)",
    re.I,
)

# APS international shows page: each event is an <h4> heading with the date
# range and title, followed by a table of Location / Website / Note rows.
APS_H4_RE = re.compile(r"<h4[^>]*>(.*?)</h4>", re.S)
APS_ROW_RE = re.compile(r"<tr[^>]*>(.*?)</tr>", re.S)
APS_CELL_RE = re.compile(r"<td[^>]*>(.*?)</td>", re.S)
APS_CROSS_RANGE_RE = re.compile(
    r"^([A-Z][a-z]+)\s+(\d{1,2})\s*[\u2013\u2014-]\s*([A-Z][a-z]+)\s+(\d{1,2}),?\s+(\d{4})"
)
APS_DAY_RANGE_RE = re.compile(
    r"^([A-Z][a-z]+)\s+(\d{1,2})\s*[\u2013\u2014-]\s*(\d{1,2}),?\s+(\d{4})"
)
APS_MONTH_YEAR_RE = re.compile(r"^([A-Z][a-z]+)\s+(\d{4})")

# NAPEX homepage: "NAPEX 2027 will be held June 4-6, 2027."
NAPEX_RANGE_RE = re.compile(
    r"NAPEX (\d{4}) will be held ([A-Z][a-z]+) (\d{1,2})-(\d{1,2}), (\d{4})"
)

# Queensland page: "<strong>DATES:</strong><br/>Thursday 13 August – Sunday 16 August 2026"
QLD_DATES_RE = re.compile(
    r"DATES:</strong><br/>(\w+\s+)?(\d{1,2})\s+([A-Z][a-z]+)(?:\s+\d{4})?\s*[\u2013\u2014-]\s*\w+\s*(\d{1,2})\s+([A-Z][a-z]+)\s+(\d{4})"
)
QLD_VENUE_RE = re.compile(r"VENUE: ([^<\n]{4,120})")

MONTHS = {name: i for i, name in enumerate(
    ("January", "February", "March", "April", "May", "June", "July",
     "August", "September", "October", "November", "December"), start=1)}


def fetch(url: str) -> bytes:
    request = urllib.request.Request(
        url,
        headers={
            "User-Agent": USER_AGENT,
            "Accept": "text/html,application/xhtml+xml,*/*;q=0.8",
            "Accept-Language": "en-GB,en;q=0.9",
        },
    )
    try:
        with urllib.request.urlopen(request, timeout=TIMEOUT, context=SSL_CONTEXT) as response:
            raw = response.read()
    except Exception:  # noqa: BLE001 - retry with curl for bot-protected hosts
        try:
            result = subprocess.run(
                ["curl", "-sS", "-L", "-A", USER_AGENT, "--max-time", str(TIMEOUT), url],
                capture_output=True,
                check=True,
            )
            raw = result.stdout
        except Exception:
            raise
    if raw[:2] == b"\x1f\x8b":
        raw = gzip.decompress(raw)
    return raw


def clean_text(value: str) -> str:
    return SPACE_RE.sub(" ", html.unescape(TAG_RE.sub(" ", value or " "))).strip()


def iso(date: datetime | None) -> str:
    if not date:
        return ""
    return date.isoformat().replace("+00:00", "Z")


def iso_date(text: str, fallback_year: int, fallback_month: int) -> str:
    """Resolve an FEPA display date to ISO. Accepts '21.2.2027' or 'October 31'
    (month-name form has no year, so the start date's context is reused)."""
    text = (text or "").strip()
    eu = FEPA_EU_DATE_RE.fullmatch(text)
    if eu:
        return f"{eu.group(3)}-{int(eu.group(2)):02d}-{int(eu.group(1)):02d}"
    named = re.fullmatch(r"([A-Z][a-z]+) (\d{1,2})", text)
    if named and named.group(1) in MONTHS:
        month = MONTHS[named.group(1)]
        year = fallback_year
        if (month, int(named.group(2))) < (fallback_month, 1):
            year += 1  # wraps to the next year
        return f"{year}-{month:02d}-{int(named.group(2)):02d}"
    return ""


def fepa_events(source: dict) -> list[dict]:
    raw = fetch(source["url"]).decode("utf-8", "replace")
    now = datetime.now(timezone.utc)
    current_year = now.year
    current_month = now.month
    items: list[dict] = []
    seen: set[str] = set()
    for block in FEPA_ARTICLE_RE.findall(raw):
        link_title = FEPA_TITLE_RE.search(block)
        start_text = FEPA_START_TEXT_RE.search(block)
        if not link_title or not start_text:
            continue
        link, title = link_title.group(1), link_title.group(2)
        if link in seen:
            continue
        seen.add(link)

        # Start: datetime attribute when present, otherwise the display date.
        start = ""
        attrs = FEPA_DT_RE.findall(block)
        start_text = start_text.group(1).strip()
        if attrs:
            start = attrs[0]
        else:
            start = iso_date(start_text, current_year, current_month)
            if not start:
                continue
        # An end span ('October 31' or '21.2.2027') is always present; resolve
        # it against the start date's year and wrap to the next year if the
        # month has looped past the start.
        start_parsed = datetime.fromisoformat(start)
        end = ""
        end_text_match = FEPA_END_TEXT_RE.search(block)
        if end_text_match:
            end = iso_date(end_text_match.group(1), start_parsed.year, start_parsed.month)

        venue_text = ""
        venue_match = FEPA_VENUE_RE.search(block)
        if venue_match:
            venue_lines = re.findall(
                r"<(?:span|div)[^>]*>([^<]{2,})</(?:span|div)>", venue_match.group(1), re.S
            )
            venue_text = ", ".join(clean_text(line) for line in venue_lines[:2] if clean_text(line))
        description_match = FEPA_DESCRIPTION_RE.search(block)
        description = clean_text(description_match.group(1)) if description_match else ""
        items.append(
            {
                "title": clean_text(title),
                "url": link,
                "start": start,
                "end": end,
                "venue": venue_text,
                "description": description,
                "image": IMAGE_FALLBACK,
                "source": source["name"],
                "source_url": source["home"],
            }
        )
    return items


def abps_date_range(text: str) -> tuple[str, str] | None:
    """Turn an ABPS parenthesised date into ISO (start, end) date strings."""
    match = ABPS_RANGE_RE.search(text)
    if match and match.group(3) in MONTHS:
        day1, day2, month, year = match.groups()
        return (
            f"{int(year):04d}-{MONTHS[month]:02d}-{int(day1):02d}",
            f"{int(year):04d}-{MONTHS[month]:02d}-{int(day2):02d}",
        )
    match = ABPS_DAY_RE.search(text)
    if match and match.group(2) in MONTHS:
        day, month, year = match.groups()
        value = f"{int(year):04d}-{MONTHS[month]:02d}-{int(day):02d}"
        return value, value
    match = ABPS_MONTH_RE.search(text)
    if match and match.group(1) in MONTHS:
        month, year = match.groups()
        month_number = MONTHS[month]
        last_day = calendar.monthrange(int(year), month_number)[1]
        return (
            f"{int(year):04d}-{month_number:02d}-01",
            f"{int(year):04d}-{month_number:02d}-{last_day:02d}",
        )
    return None


def abps_events(source: dict) -> list[dict]:
    raw = fetch(source["url"]).decode("utf-8", "replace")
    start = raw.find("Forthcoming National Exhibitions")
    if start == -1:
        return []
    end = raw.find("UK handling charges", start)
    segment = raw[start:end] if end != -1 else raw[start:]

    items: list[dict] = []
    current: dict | None = None
    details: list[str] = []
    links: list[str] = []

    def flush() -> None:
        nonlocal current
        if not current:
            return
        description = ""
        postponed = any(line.lower().startswith("postponed") for line in details)
        if not postponed:
            useful = [
                line for line in details
                if not ABPS_SKIP_DETAIL_RE.match(line)
            ]
            description = " ".join(useful)[:320].strip()
            web_links = [link for link in links if link.startswith("http")]
            current["url"] = web_links[0] if web_links else source["url"]
            current["description"] = description
            items.append(current)
        current = None
        details.clear()
        links.clear()

    for tag, block in ABPS_BLOCK_RE.findall(segment):
        text = re.sub(r"<[^>]+>", " ", block)
        text = SPACE_RE.sub(" ", html.unescape(text)).strip()
        text = text.replace("G eneral", "General")
        # The page splits some years across spans, giving "June 20 27)".
        text = re.sub(r"(\d{2})\s+(\d{2})\s*\)", r"\1\2)", text)
        if not text:
            continue

        date_match = ABPS_TITLE_DATE_RE.search(text) if tag == "h3" or len(text) < 180 else None
        dates = abps_date_range(date_match.group(1)) if date_match else None

        if date_match and dates:
            flush()
            title = text[:date_match.start()].strip()
            venue = ""
            location = ABPS_LOCATION_RE.search(title)
            if location:
                venue = location.group(1).strip()
                title = title[:location.start()].strip()
            elif "," in title:
                title, venue = re.split(r"\s*,\s*", title, maxsplit=1)
            title = title.replace("PHILATAPEI", "PHILATAIPEI").replace("Slovfilex", "Slovphilex")
            venue = venue.replace("Tapei", "Taipei")
            if title.isupper() and len(title) > 30:
                title = title.title()
            current = {
                "title": title.strip(),
                "url": source["url"],
                "start": dates[0],
                "end": dates[1],
                "venue": venue.strip(),
                "description": "",
                "image": IMAGE_FALLBACK,
                "source": source["name"],
                "source_url": source["home"],
            }
            links.extend(ABPS_LINK_RE.findall(block))
            continue

        if tag == "h3":
            flush()
            continue

        if current:
            details.append(text)
            links.extend(ABPS_LINK_RE.findall(block))

    flush()
    return items


def aps_date_and_title(text: str) -> tuple[str, str, str] | None:
    """Split an APS heading such as "June 30 - July 4, 2027 - Slovphilex 2027"."""
    match = APS_CROSS_RANGE_RE.match(text)
    if match and match.group(1) in MONTHS and match.group(3) in MONTHS:
        month1, day1, month2, day2, year = match.groups()
        start = f"{int(year):04d}-{MONTHS[month1]:02d}-{int(day1):02d}"
        end = f"{int(year):04d}-{MONTHS[month2]:02d}-{int(day2):02d}"
        title = text[match.end():].lstrip(" \u2013\u2014-")
        return start, end, title

    match = APS_DAY_RANGE_RE.match(text)
    if match and match.group(1) in MONTHS:
        month, day1, day2, year = match.groups()
        start = f"{int(year):04d}-{MONTHS[month]:02d}-{int(day1):02d}"
        end = f"{int(year):04d}-{MONTHS[month]:02d}-{int(day2):02d}"
        title = text[match.end():].lstrip(" \u2013\u2014-")
        return start, end, title

    match = APS_MONTH_YEAR_RE.match(text)
    if match and match.group(1) in MONTHS:
        month, year = match.groups()
        month_number = MONTHS[month]
        last_day = calendar.monthrange(int(year), month_number)[1]
        start = f"{int(year):04d}-{month_number:02d}-01"
        end = f"{int(year):04d}-{month_number:02d}-{last_day:02d}"
        title = text[match.end():].lstrip(" \u2013\u2014-")
        return start, end, title

    return None


def aps_events(source: dict) -> list[dict]:
    raw = fetch(source["url"]).decode("utf-8", "replace")
    start = raw.find("Below is a list of International Exhibitions")
    if start == -1:
        return []
    end = raw.find("Further information on the International Federation", start)
    segment = raw[start:end] if end != -1 else raw[start:]

    items: list[dict] = []
    for part in re.split(r"<hr\s*/?>", segment, flags=re.I):
        heading = APS_H4_RE.search(part)
        if not heading:
            continue
        heading_text = clean_text(heading.group(1))
        parsed = aps_date_and_title(heading_text)
        if not parsed:
            continue
        start_date, end_date, title = parsed

        venue = ""
        description = ""
        url = source["url"]
        for row in APS_ROW_RE.findall(part):
            cells = APS_CELL_RE.findall(row)
            if len(cells) < 2:
                continue
            label = clean_text(cells[0]).rstrip(":").strip().lower()
            if label.startswith("location"):
                venue = clean_text(cells[1])
            elif label.startswith("website"):
                anchors = re.findall(r'<a[^>]*href="([^"]+)"[^>]*>(.*?)</a>', cells[1], re.S)
                for href, text in anchors:
                    text = clean_text(text)
                    if text.startswith("http"):
                        url = text
                        break
                else:
                    for href, _ in anchors:
                        href = html.unescape(href)
                        if href.startswith("http"):
                            url = href
                            break
            elif label.startswith("note"):
                for line in re.split(r"<br\s*/?>", cells[1], flags=re.I):
                    line = clean_text(line)
                    if line:
                        description = line[:320]
                        break

        items.append(
            {
                "title": title,
                "url": url,
                "start": start_date,
                "end": end_date,
                "venue": venue,
                "description": description,
                "image": IMAGE_FALLBACK,
                "source": source["name"],
                "source_url": source["home"],
            }
        )
    return items


def napex_events(source: dict) -> list[dict]:
    raw = fetch(source["url"]).decode("utf-8", "replace")
    text = clean_text(raw)
    items: list[dict] = []
    matches = NAPEX_RANGE_RE.findall(text)
    # The homepage may still show older banners; keep only the newest show.
    match = max(matches, key=lambda counts: int(counts[0])) if matches else None
    if match:
        year, month, day1, day2, end_year = match
        start = datetime(int(year), MONTHS[month], int(day1), tzinfo=timezone.utc)
        end = datetime(int(end_year), MONTHS[month], int(day2), tzinfo=timezone.utc)
        items.append(
            {
                "title": f"NAPEX {year}",
                "url": source["home"],
                "start": iso(start),
                "end": iso(end),
                "venue": "Washington D.C. area, USA",
                "description": "A World Series of Philately event serving Maryland, Virginia and Washington D.C.",
                "image": IMAGE_FALLBACK,
                "source": source["name"],
                "source_url": source["home"],
            }
        )
    return items


def qld_events(source: dict) -> list[dict]:
    raw = fetch(source["url"]).decode("utf-8", "replace")
    dates = QLD_DATES_RE.search(raw)
    items: list[dict] = []
    if dates:
        _, day1, month1, day2, month2, year = dates.groups()
        venue_match = QLD_VENUE_RE.search(raw)
        venue = clean_text(venue_match.group(1)) if venue_match else "Brisbane, Australia"
        start_text = f"{day1} {month1} {year}"
        items.append(
            {
                "title": "Queensland Stamp & Coin Show (QSACS)",
                "url": source["url"],
                "start": iso(datetime.strptime(start_text, "%d %B %Y").replace(tzinfo=timezone.utc)),
                "end": iso(
                    datetime.strptime(f"{day2} {month2} {year}", "%d %B %Y").replace(tzinfo=timezone.utc)
                ),
                "venue": venue,
                "description": "Queensland's premier philatelic and numismatic event: competitive national displays and a dealer marketplace in Brisbane.",
                "image": IMAGE_FALLBACK,
                "source": source["name"],
                "source_url": source["home"],
            }
        )
    return items


PARSERS = {
    "ABPS": abps_events,
    "FEPA News": fepa_events,
    "APS": aps_events,
    "NAPEX": napex_events,
    "Queensland Stamp & Coin Show": qld_events,
}


GENERIC_TITLE_WORDS = re.compile(
    r"\b(?:world|international|national|stamp|stamps|philatelic|"
    r"exhibition|exhibitions|show|competitive)\b"
)


def event_key(title: str) -> str:
    text = re.sub(r"\b(?:19|20)\d{2}\b", " ", title.lower())
    text = GENERIC_TITLE_WORDS.sub(" ", text)
    return re.sub(r"[^a-z0-9]+", "", text)


def dedupe(items: list[dict]) -> list[dict]:
    """Keep one entry per event, preferring the source listed first and
    borrowing any missing details from later duplicates."""
    seen: dict[str, dict] = {}
    unique: list[dict] = []
    for item in items:
        key = event_key(item["title"])
        if key in seen:
            existing = seen[key]
            for field in ("venue", "description", "url"):
                if not existing.get(field) and item.get(field):
                    existing[field] = item[field]
            # A month-only range (e.g. "June 2027") is less useful than the
            # exact dates another source may publish for the same show.
            month_only = existing["start"].endswith("-01") and existing["end"].endswith(
                str(calendar.monthrange(
                    int(existing["end"][:4]), int(existing["end"][5:7])
                )[1]).zfill(2)
            )
            if month_only and (item["start"], item["end"]) != (existing["start"], existing["end"]):
                existing["start"], existing["end"] = item["start"], item["end"]
            continue
        seen[key] = item
        unique.append(item)
    return unique


def main() -> int:
    items: list[dict] = []
    failures: list[str] = []
    sources: list[str] = []
    for source in SOURCES:
        try:
            parsed = PARSERS[source["name"]](source)
            sources.append(source["name"])
            print(f"  {source['name']}: {len(parsed)} events", file=sys.stderr)
            items.extend(parsed)
        except Exception as error:  # noqa: BLE001
            failures.append(f"  - {source['name']}: {error}")

    for failure in failures:
        print(f"Failed source {failure}", file=sys.stderr)

    if not items:
        print("No exhibitions collected; refusing to overwrite exhibitions.json.", file=sys.stderr)
        return 1

    items = dedupe(items)
    items.sort(key=lambda item: item["start"])
    payload = {
        "generated_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "sources": sources,
        "count": len(items),
        "items": items,
    }

    if OUTPUT.exists():
        try:
            previous = json.loads(OUTPUT.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            previous = None
        if previous and previous.get("items") == items and previous.get("sources") == payload["sources"]:
            print("No exhibition changes; keeping the existing snapshot.", file=sys.stderr)
            return 0

    OUTPUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(items)} events to {OUTPUT.relative_to(ROOT)}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
