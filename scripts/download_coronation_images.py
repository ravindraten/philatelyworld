#!/usr/bin/env python3
import os
import re
import urllib.request
import time

# Configuration
BASE_URL = "https://www.pvoller.net/new_stamps/ww2/coronation/"
PARENT_BASE = "https://www.pvoller.net/new_stamps/ww2/"
GRANDPARENT_BASE = "https://www.pvoller.net/new_stamps/"
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "images", "coronation")

# 1. Fetch HTML directly if local file doesn't exist
try:
    with open("/tmp/coronation_raw.html", "r") as f:
        html = f.read()
except FileNotFoundError:
    print("Local HTML not found, fetching from web...")
    req = urllib.request.Request(BASE_URL + "coronation.php", headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req) as resp:
        html = resp.read().decode('utf-8')

# 2. Extract and Filter
img_srcs = re.findall(r'src="([^"]*\.jpg)"', html)
exclude = ["wide_blank", "email", "watermarks", "logo"]
unique_images = []
seen = set()

for src in img_srcs:
    if not any(ex in src for ex in exclude) and src not in seen:
        seen.add(src)
        unique_images.append(src)

print(f"Found {len(unique_images)} unique stamp images.")
os.makedirs(OUTPUT_DIR, exist_ok=True)

success, failed = 0, 0
headers = {"User-Agent": "Mozilla/5.0"}

for i, src in enumerate(unique_images):
    # Absolute URL Logic
    if src.startswith("../../"): url = GRANDPARENT_BASE + src[6:]
    elif src.startswith("../"): url = PARENT_BASE + src[3:]
    else: url = BASE_URL + src

    # 3. FILENAME NORMALIZATION (Matches our HTML)
    # src looks like: "images/aden_sg13.jpg" or "images/gb_sg461.jpg"
    clean_name = src.split('/')[-1].lower()
    clean_name = clean_name.replace("_", "-") # e.g., aden_sg13 -> aden-sg13
    
    # Remove extra suffixes often found in these scans
    clean_name = clean_name.replace("-f-1", "")
    
    filepath = os.path.join(OUTPUT_DIR, clean_name)

    try:
        if os.path.exists(filepath):
            print(f"[{i+1}] SKIP: {clean_name}")
            success += 1
            continue
            
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=15) as resp:
            with open(filepath, "wb") as f:
                f.write(resp.read())
        print(f"[{i+1}] OK: {clean_name}")
        success += 1
        time.sleep(0.2) # Polite delay
    except Exception as e:
        print(f"[{i+1}] FAIL: {clean_name} - {e}")
        failed += 1

print(f"\nResults: {success} OK, {failed} Failed")