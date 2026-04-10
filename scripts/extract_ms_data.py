#!/usr/bin/env python3
"""Extract miniature sheet data (number, date, title) from stampsofindia.com"""

import subprocess
import re
import html
import json

BASE_URL = "https://stampsofindia.com/lists"
PAGES = ["ms1.html", "ms2.html", "ms3.html", "ms4.html", "ms5.html", "ms6.html"]

all_entries = []

for page in PAGES:
    url = f"{BASE_URL}/{page}"
    print(f"Fetching {url}...")
    
    result = subprocess.run(
        ["curl", "-s", "-L", url],
        capture_output=True, timeout=60
    )
    content = result.stdout.decode('latin-1', errors='replace')
    
    # Split into table cells
    cells = re.split(r'<td[^>]*>', content)
    
    for cell in cells:
        # Look for MS number - multiple patterns
        num = None
        
        # Pattern 1: <b>NNN or <strong>NNN
        num_match = re.search(r'<(?:b|strong)>\s*(\d{3})\s*(?:<br|</)', cell)
        if num_match:
            num = num_match.group(1)
        
        # Pattern 2: <span><strong>NNN
        if not num:
            num_match = re.search(r'<span[^>]*>\s*<strong>\s*(\d{3})\s*(?:<br|</)', cell)
            if num_match:
                num = num_match.group(1)
        
        # Pattern 3: plain number at start of cell (for ms6 entries 276+)
        if not num:
            # Cell starts with whitespace then 3-digit number followed by <br>
            num_match = re.match(r'\s*(?:<span[^>]*>)?\s*(\d{3})\s*<br', cell)
            if num_match:
                num = num_match.group(1)
        
        # Pattern 4: number right after cell start
        if not num:
            num_match = re.match(r'\s+(\d{3})\s*<br', cell)
            if num_match:
                num = num_match.group(1)
        
        if not num:
            continue
            
        # Skip non-MS numbers (navigation etc)
        num_int = int(num)
        if num_int < 1 or num_int > 350:
            continue
        
        # Look for date
        date = "Unknown"
        date_patterns = [
            r'(?:</(?:b|strong)>|<br\s*/?>)\s*(?:</strong>)?\s*(?:<span[^>]*>)?\s*([A-Za-z]+\s+\d{1,2},?\s*\d{4})',
            r'>\s*([A-Za-z]+\s+\d{1,2},?\s*\d{4})\s*<',
            r'<br\s*/?>\s*([A-Za-z]+\s+\d{1,2},?\s*\d{4})',
        ]
        for dp in date_patterns:
            date_match = re.search(dp, cell)
            if date_match:
                date = date_match.group(1).strip()
                date = re.sub(r'\s+', ' ', date)
                break
        
        # Look for image href
        href_match = re.search(r'<a href="([^"]+\.jpg)"', cell)
        href = href_match.group(1) if href_match else ''
        
        # Look for title
        title = ""
        
        # Method 1: text after </a> tag
        after_a = re.search(r'</a>\s*(?:</p>)?\s*(?:<p[^>]*>)?\s*(?:<font[^>]*>)?\s*([^<]+)', cell)
        if after_a:
            t = after_a.group(1).strip()
            if t and t not in ('Rs', '&nbsp;', '') and not t.startswith('Rs ') and len(t) > 1:
                title = t

        # Method 2: text after <br> following </a> or </img>
        if not title:
            after_img = re.search(r'</a>\s*<br\s*/?>\s*(?:<span[^>]*>)?\s*([^<]+)', cell)
            if after_img:
                t = after_img.group(1).strip()
                if t and not t.startswith('Rs') and len(t) > 1:
                    title = t
        
        # Method 3: text in span after image
        if not title:
            span_text = re.search(r'</a>\s*(?:<br\s*/?>)?\s*<span[^>]*>\s*([^<]+)', cell)
            if span_text:
                t = span_text.group(1).strip()
                if t and not t.startswith('Rs') and len(t) > 1:
                    title = t

        # Method 4: For ms6 late entries - text after image closing
        if not title:
            after_img2 = re.search(r'>\s*</a>\s*<br\s*/?>\s*([^<]+)', cell)
            if after_img2:
                t = after_img2.group(1).strip()
                if t and not t.startswith('Rs') and len(t) > 1:
                    title = t
        
        # Clean up title
        title = html.unescape(title).strip()
        title = re.sub(r'\s+', ' ', title)
        title = re.sub(r'\s*Rs\s*\d+\s*$', '', title)
        
        # Avoid duplicates
        if any(e['num'] == num for e in all_entries):
            continue
            
        all_entries.append({
            'num': num,
            'date': date,
            'title': title,
            'href': href
        })

# Sort by number
all_entries.sort(key=lambda x: int(x['num']))

# Output as JSON
with open('/Users/ravindra/workspace/GitHub/philatelyworld/ms_data.json', 'w') as f:
    json.dump(all_entries, f, indent=2)

# Also print for review
print(f"\nTotal entries: {len(all_entries)}\n")
for e in all_entries:
    print(f"MS {e['num']} | {e['date']} | {e['title']}")
