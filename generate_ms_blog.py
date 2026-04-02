#!/usr/bin/env python3
"""Generate the miniature sheets blog HTML page from extracted data."""

import json

with open('/Users/ravindra/workspace/GitHub/philatelyworld/ms_data.json') as f:
    data = json.load(f)

# Group entries by decade for organized sections
def get_year(date_str):
    import re
    m = re.search(r'(\d{4})', date_str)
    return int(m.group(1)) if m else 0

sections = {}
for entry in data:
    year = get_year(entry['date'])
    if year == 0:
        decade = "Unknown"
    else:
        decade_start = (year // 5) * 5
        decade = f"{decade_start}-{decade_start+4}"
    if decade not in sections:
        sections[decade] = []
    sections[decade].append(entry)

# Generate cards HTML
cards_html = ""
for entry in data:
    num = entry['num']
    date = entry['date']
    title = entry['title'] if entry['title'] else f"Miniature Sheet {num}"
    # Clean trailing commas from titles
    title = title.rstrip(',').strip()
    cards_html += f"""
            <div class="ms-card" data-num="{num}" data-title="{title.lower()}" data-date="{date.lower()}">
                <div class="ms-number">MS {num}</div>
                <div class="ms-image-placeholder">
                    <img src="https://filedn.eu/lbu0dswNxxUBjQKg0kNdmLu/philatelyworld-images/images/miniature-sheets-India/{num}.jpg" alt="Miniature Sheet {num}" loading="lazy">
                </div>
                <div class="ms-info">
                    <div class="ms-title">{title}</div>
                    <div class="ms-date">{date}</div>
                </div>
            </div>"""

html = f"""<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>India Miniature Sheets: Complete Visual Catalog (1973-2026) - Philately World</title>
    <meta name="description"
        content="Complete visual catalog of all Indian Miniature Sheets from 1973 to 2026. Browse {len(data)} miniature sheets with dates, titles, and images.">

    <!-- Open Graph -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://philatelyworld.in/blog/miniature-sheets.html">
    <meta property="og:title" content="India Miniature Sheets: Complete Visual Catalog (1973-2026)">
    <meta property="og:description"
        content="Complete visual catalog of all {len(data)} Indian Miniature Sheets from 1973 to 2026.">

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:title" content="India Miniature Sheets: Complete Visual Catalog (1973-2026)">

    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">

    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}

        body {{
            font-family: 'Inter', -apple-system, system-ui, sans-serif;
            background: #ebebeb;
            color: #333;
            min-height: 100vh;
        }}

        /* Hero Section */
        .hero {{
            background: linear-gradient(135deg, #e4e4e4 0%, #dbdbdb 50%, #e4e4e4 100%);
            padding: 60px 20px 40px;
            text-align: center;
            position: relative;
            overflow: hidden;
            border-bottom: 1px solid #c9c9c9;
        }}

        .hero::before {{
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: radial-gradient(ellipse at 50% 0%, rgba(0, 0, 0, 0.03) 0%, transparent 70%);
        }}

        .hero h1 {{
            font-size: 2.8rem;
            font-weight: 800;
            color: #222;
            margin-bottom: 12px;
            position: relative;
            line-height: 1.2;
        }}

        .hero .subtitle {{
            font-size: 1.1rem;
            color: #555;
            font-weight: 400;
            max-width: 600px;
            margin: 0 auto 20px;
            position: relative;
        }}

        .stats-bar {{
            display: flex;
            justify-content: center;
            gap: 40px;
            position: relative;
            flex-wrap: wrap;
        }}

        .stat {{
            text-align: center;
        }}

        .stat-number {{
            font-size: 2rem;
            font-weight: 800;
            color: #222;
        }}

        .stat-label {{
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 2px;
            color: #666;
            margin-top: 2px;
        }}

        /* Search & Filter */
        .controls {{
            background: rgba(228, 228, 228, 0.95);
            padding: 20px;
            position: sticky;
            top: 0;
            z-index: 100;
            border-bottom: 1px solid #cdcdcd;
            backdrop-filter: blur(10px);
        }}

        .controls-inner {{
            max-width: 1400px;
            margin: 0 auto;
            display: flex;
            gap: 15px;
            align-items: center;
            flex-wrap: wrap;
        }}

        .search-box {{
            flex: 1;
            min-width: 200px;
            position: relative;
        }}

        .search-box input {{
            width: 100%;
            padding: 12px 16px 12px 42px;
            background: #f4f4f4;
            border: 1px solid #d0d0d0;
            border-radius: 10px;
            color: #333;
            font-size: 0.95rem;
            font-family: 'Inter', sans-serif;
            transition: all 0.3s;
        }}

        .search-box input:focus {{
            outline: none;
            border-color: #555;
            box-shadow: 0 0 15px rgba(0, 0, 0, 0.08);
            background: #ffffff;
        }}

        .search-box::before {{
            content: '🔍';
            position: absolute;
            left: 14px;
            top: 50%;
            transform: translateY(-50%);
            font-size: 1rem;
            color: #666;
        }}

        .filter-btn {{
            padding: 10px 20px;
            background: #eeeeee;
            border: 1px solid #d0d0d0;
            border-radius: 10px;
            color: #555;
            font-size: 0.85rem;
            cursor: pointer;
            transition: all 0.3s;
            font-family: 'Inter', sans-serif;
        }}

        .filter-btn:hover,
        .filter-btn.active {{
            background: #444;
            color: #fff;
            border-color: #444;
        }}

        .count-display {{
            color: #333;
            font-size: 0.85rem;
            font-weight: 600;
            white-space: nowrap;
        }}

        /* Grid Layout */
        .grid-container {{
            max-width: 1400px;
            margin: 0 auto;
            padding: 30px 20px;
        }}

        .ms-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
            gap: 20px;
        }}

        /* Card Styles */
        .ms-card {{
            background: #f4f4f4;
            border: 1px solid #d5d5d5;
            border-radius: 12px;
            overflow: hidden;
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            cursor: pointer;
            position: relative;
        }}

        .ms-card:hover {{
            transform: translateY(-6px);
            border-color: #b0b0b0;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1),
                        0 4px 10px rgba(0, 0, 0, 0.05);
            background: #ffffff;
        }}

        .ms-number {{
            position: absolute;
            top: 10px;
            left: 10px;
            background: rgba(240, 240, 240, 0.9);
            color: #333;
            padding: 3px 10px;
            border-radius: 6px;
            font-size: 0.7rem;
            font-weight: 700;
            border: 1px solid #ccc;
            letter-spacing: 1px;
            z-index: 2;
            backdrop-filter: blur(4px);
        }}

        .ms-image-placeholder {{
            width: 100%;
            aspect-ratio: 5/4;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #e8e8e8;
            position: relative;
            overflow: hidden;
            border-bottom: 1px solid #e0e0e0;
        }}

        .ms-image-placeholder svg {{
            width: 100%;
            height: 100%;
        }}

        .ms-image-placeholder img {{
            width: 100%;
            height: 100%;
            object-fit: contain;
            padding: 8px;
            transition: transform 0.4s ease;
        }}
        
        .ms-card:hover .ms-image-placeholder img {{
            transform: scale(1.05);
        }}

        .ms-info {{
            padding: 14px 16px;
            background: transparent;
        }}

        .ms-title {{
            font-size: 0.85rem;
            font-weight: 600;
            color: #222;
            margin-bottom: 6px;
            line-height: 1.3;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }}

        .ms-date {{
            font-size: 0.75rem;
            color: #555;
            font-weight: 500;
            opacity: 0.9;
        }}

        /* Back to top */
        .back-to-top {{
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 48px;
            height: 48px;
            background: #444;
            border: none;
            border-radius: 50%;
            color: #fff;
            font-size: 1.3rem;
            cursor: pointer;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            z-index: 1000;
        }}

        .back-to-top.visible {{
            opacity: 1;
            visibility: visible;
        }}

        .back-to-top:hover {{
            transform: scale(1.1);
            background: #222;
        }}

        /* Footer */
        .footer {{
            text-align: center;
            padding: 40px 20px;
            color: #555;
            font-size: 0.85rem;
            border-top: 1px solid #d5d5d5;
            margin-top: 40px;
            background: #e4e4e4;
        }}

        .footer a {{
            color: #222;
            text-decoration: underline;
            font-weight: 500;
        }}

        /* No results */
        .no-results {{
            text-align: center;
            padding: 60px 20px;
            color: #555;
            display: none;
        }}

        .no-results .emoji {{
            font-size: 3rem;
            margin-bottom: 16px;
        }}

        /* Responsive */
        @media (max-width: 768px) {{
            .hero h1 {{
                font-size: 1.8rem;
            }}

            .hero .subtitle {{
                font-size: 0.95rem;
            }}

            .stats-bar {{
                gap: 24px;
            }}

            .stat-number {{
                font-size: 1.5rem;
            }}

            .ms-grid {{
                grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
                gap: 12px;
            }}

            .controls-inner {{
                flex-direction: column;
            }}

            .search-box {{
                width: 100%;
            }}

            .filter-buttons {{
                display: flex;
                gap: 8px;
                flex-wrap: wrap;
                width: 100%;
            }}

            .filter-btn {{
                flex: 1;
                min-width: fit-content;
                text-align: center;
                padding: 8px 12px;
                font-size: 0.78rem;
            }}
        }}

        @media (max-width: 400px) {{
            .ms-grid {{
                grid-template-columns: repeat(2, 1fr);
                gap: 8px;
            }}

            .ms-info {{
                padding: 10px 12px;
            }}

            .ms-title {{
                font-size: 0.78rem;
            }}
        }}
    </style>

    <script async src="https://www.googletagmanager.com/gtag/js?id=G-0K58TP8LVP"></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag() {{ dataLayer.push(arguments); }}
        gtag('js', new Date());
        gtag('config', 'G-0K58TP8LVP');
    </script>
    <script data-goatcounter="https://ravindraten.goatcounter.com/count" async src="//gc.zgo.at/count.js"></script>
</head>

<body>
    <div class="hero">
        <h1>🇮🇳 India Miniature Sheets</h1>
        <p class="subtitle">Complete visual catalog of every miniature sheet issued by India Post, from 1973 to 2026</p>
        <div class="stats-bar">
            <div class="stat">
                <div class="stat-number">{len(data)}</div>
                <div class="stat-label">Miniature Sheets</div>
            </div>
            <div class="stat">
                <div class="stat-number">53</div>
                <div class="stat-label">Years Covered</div>
            </div>
            <div class="stat">
                <div class="stat-number">1973</div>
                <div class="stat-label">First Issue</div>
            </div>
        </div>
    </div>

    <div class="controls">
        <div class="controls-inner">
            <div class="search-box">
                <input type="text" id="searchInput" placeholder="Search by title, number, or date..." autocomplete="off">
            </div>
            <div class="filter-buttons">
                <button class="filter-btn active" data-filter="all">All</button>
                <button class="filter-btn" data-filter="1973-2009">1973–2009</button>
                <button class="filter-btn" data-filter="2010-2015">2010–2015</button>
                <button class="filter-btn" data-filter="2016-2019">2016–2019</button>
                <button class="filter-btn" data-filter="2020-2026">2020–2026</button>
            </div>
            <div class="count-display" id="countDisplay">{len(data)} sheets</div>
        </div>
    </div>

    <div class="grid-container">
        <div class="ms-grid" id="msGrid">
{cards_html}
        </div>
        <div class="no-results" id="noResults">
            <div class="emoji">🔍</div>
            <p>No miniature sheets found matching your search.</p>
        </div>
    </div>

    <div class="footer">
        <p>Data sourced from <a href="https://stampsofindia.com/lists/ms1.html" target="_blank">Stamps of India</a> • 
        Built with ❤️ by <a href="https://philatelyworld.in">Philately World</a></p>
        <p style="margin-top: 8px;">Images are placeholders. Actual miniature sheet images to be added.</p>
    </div>

    <button class="back-to-top" id="backToTop" title="Back to top">↑</button>

    <script>
        // Search functionality
        const searchInput = document.getElementById('searchInput');
        const msGrid = document.getElementById('msGrid');
        const cards = document.querySelectorAll('.ms-card');
        const countDisplay = document.getElementById('countDisplay');
        const noResults = document.getElementById('noResults');
        const filterBtns = document.querySelectorAll('.filter-btn');
        const backToTop = document.getElementById('backToTop');

        let currentFilter = 'all';

        // Year ranges for filters
        const yearRanges = {{
            'all': [0, 9999],
            '1973-2009': [1973, 2009],
            '2010-2015': [2010, 2015],
            '2016-2019': [2016, 2019],
            '2020-2026': [2020, 2026]
        }};

        function getYearFromDate(dateStr) {{
            const match = dateStr.match(/(\d{{4}})/);
            return match ? parseInt(match[1]) : 0;
        }}

        function filterCards() {{
            const query = searchInput.value.toLowerCase().trim();
            const [minYear, maxYear] = yearRanges[currentFilter];
            let visibleCount = 0;

            cards.forEach(card => {{
                const num = card.dataset.num;
                const title = card.dataset.title;
                const date = card.dataset.date;
                const year = getYearFromDate(date);

                const matchesSearch = !query || 
                    num.includes(query) || 
                    title.includes(query) || 
                    date.includes(query) ||
                    ('ms ' + num).includes(query);

                const matchesFilter = currentFilter === 'all' || 
                    (year >= minYear && year <= maxYear);

                if (matchesSearch && matchesFilter) {{
                    card.style.display = '';
                    visibleCount++;
                }} else {{
                    card.style.display = 'none';
                }}
            }});

            countDisplay.textContent = visibleCount + ' sheet' + (visibleCount !== 1 ? 's' : '');
            noResults.style.display = visibleCount === 0 ? 'block' : 'none';
        }}

        searchInput.addEventListener('input', filterCards);

        filterBtns.forEach(btn => {{
            btn.addEventListener('click', () => {{
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentFilter = btn.dataset.filter;
                filterCards();
            }});
        }});

        // Back to top button
        window.addEventListener('scroll', () => {{
            backToTop.classList.toggle('visible', window.scrollY > 400);
        }});

        backToTop.addEventListener('click', () => {{
            window.scrollTo({{ top: 0, behavior: 'smooth' }});
        }});

        // Keyboard shortcut: press '/' to focus search
        document.addEventListener('keydown', (e) => {{
            if (e.key === '/' && document.activeElement !== searchInput) {{
                e.preventDefault();
                searchInput.focus();
            }}
            if (e.key === 'Escape') {{
                searchInput.value = '';
                searchInput.blur();
                filterCards();
            }}
        }});
    </script>
</body>

</html>"""

# Write the file
output_path = '/Users/ravindra/workspace/GitHub/philatelyworld/docs/blog/miniature-sheets.html'
with open(output_path, 'w') as f:
    f.write(html)

print(f"✓ Blog page generated: {output_path}")
print(f"  Total entries: {len(data)}")
print(f"  File size: {len(html):,} bytes")
