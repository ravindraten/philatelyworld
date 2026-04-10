#!/usr/bin/env python3
import os
import re
import urllib.request
import time

# Configuration
BASE_URL = "https://www.pvoller.net/new_stamps/ww2/coronation/"
IMAGE_ROOTS = [
    "https://www.pvoller.net/new_stamps/ww2/coronation/",
    "https://www.pvoller.net/new_stamps/ww2/",
    "https://www.pvoller.net/new_stamps/"
]
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "images")

# Advanced Headers to bypass 406 Not Acceptable
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Referer': 'https://www.pvoller.net/new_stamps/ww2/coronation/coronation.php',
    'Connection': 'keep-alive'
}

def download_image(img_path):
    # Extract the filename (e.g., aden_sg13.jpg)
    filename = img_path.split('/')[-1].lower()
    filepath = os.path.join(OUTPUT_DIR, filename)
    
    if os.path.exists(filepath):
        return True, f"{filename} (Exists)"

    # Remove relative path dots to get the clean internal path
    clean_path = img_path.replace('../', '')
    
    for root in IMAGE_ROOTS:
        url = root + clean_path
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=15) as resp:
                if resp.status == 200:
                    with open(filepath, "wb") as f:
                        f.write(resp.read())
                    return True, filename
        except Exception:
            continue
    return False, filename

# 1. Fetch the main page HTML
print("--- Starting Coronation Stamp Downloader ---")
try:
    req = urllib.request.Request(BASE_URL + "coronation.php", headers=HEADERS)
    with urllib.request.urlopen(req) as resp:
        html = resp.read().decode('utf-8')
except Exception as e:
    print(f"Critical Error accessing website: {e}")
    exit(1)

# 2. Extract image sources using Regex
img_srcs = re.findall(r'src="([^"]*\.jpg)"', html)
# Filter out icons and site graphics
exclude = ["wide_blank", "email", "watermarks", "logo", "crown", "pvoller", "back.jpg", "home.jpg"]
unique_srcs = [s for s in list(dict.fromkeys(img_srcs)) if not any(x in s.lower() for x in exclude)]

print(f"Targeting {len(unique_srcs)} unique stamp images...")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# 3. Execution Loop
success_count = 0
for i, src in enumerate(unique_srcs):
    success, name = download_image(src)
    if success:
        success_count += 1
        print(f"[{i+1}/{len(unique_srcs)}] OK: {name}")
    else:
        print(f"[{i+1}/{len(unique_srcs)}] FAILED: {src}")
    
    # Small delay to prevent the server from blocking us again
    time.sleep(0.2)

print(f"\nFinished! Successfully downloaded {success_count} images to the 'images' folder.")