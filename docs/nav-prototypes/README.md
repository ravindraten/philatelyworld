# Navigation prototypes

Two working header studies for Philately World. Both use the live site's tokens
(navy `#1e293b`, amber `#d97706`, Inter, 1180px wrap) so either direction can be
moved into `docs/style.css` without a rebrand.

## Preview

```bash
cd docs
python3 -m http.server 8765
# open http://localhost:8765/nav-prototypes/
```

Or open `index.html` directly — everything is static and uses relative paths.
The sample images load from the existing image CDN.

## Prototype A — global minimal + local subnav

`prototype-a.html`

- Primary nav grouped by intent: Catalogue, Journal, Album Designer, Exhibitions.
- Catalogue mega-menu with the real top countries and themes.
- Sticky page-level collection index: All lots, Countries, Themes, Eras, Formats, Rarities.
- Each index item opens a filter panel with counts.
- Clicking a country/theme/era/format filters the grid and adds removable chips.
- Mobile: hamburger accordion + horizontally scrollable index.

## Prototype B — search-first + Explore drawer

`prototype-b.html`

- Header omnibox with grouped typeahead (countries, themes, lots, pages).
- `⌘K` / `Ctrl+K` focuses search; arrow keys and Enter work in the suggestion list.
- Hero search with popular collection chips.
- Explore slide-over: country search with multi-select, themes, era, format,
  availability, max price, and page links.
- Live result count in the drawer footer before applying.
- Mobile: full-screen drawer; sort and currency still work.

## Shared behaviour

- `shared.js` holds the demo data and all interactions.
- `shared.css` holds the design system, both headers, the drawer and responsive rules.
- The announcement strip rotates every 5.5s and is clickable.
- Currency toggles INR/EUR on prototype B.
- `preview-a.png` / `preview-b.png` are the screenshots used by `index.html`.

## Data note

Country and theme counts come from the real 149-item catalogue. The grid uses a
12-lot sample so the prototype stays fast; combinations with no sample lots show
an honest empty state. No live catalogue files are modified.

## Next step

Pick one direction, then replace the duplicated masthead in:

- `docs/index.html`
- `docs/philatelic-news.html`
- `docs/philatelic-exhibitions.html`
- `docs/AlbumDesigner/albumeasy.html`

Ideally extract the header into one shared include/template so the four copies
cannot drift again.
