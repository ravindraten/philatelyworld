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

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Accept': 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
    'Referer': BASE_URL + "coronation.php"
}

def download_image(img_path, save_name):
    filepath = os.path.join(OUTPUT_DIR, save_name)
    clean_path = img_path.replace('../', '')
    
    for root in IMAGE_ROOTS:
        url = root + clean_path
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=10) as resp:
                if resp.status == 200:
                    with open(filepath, "wb") as f:
                        f.write(resp.read())
                    return True
        except:
            continue
    return False

# 1. Fetch HTML
print("Fetching catalog...")
req = urllib.request.Request(BASE_URL + "coronation.php", headers=HEADERS)
with urllib.request.urlopen(req) as resp:
    html = resp.read().decode('utf-8')

# 2. Extract sources
img_srcs = re.findall(r'src="([^"]*\.jpg)"', html)
exclude = ["wide_blank", "email", "watermarks", "logo", "crown", "pvoller", "back.jpg", "home.jpg"]
unique_srcs = [s for s in list(dict.fromkeys(img_srcs)) if not any(x in s.lower() for x in exclude)]

print(f"Standardizing and downloading {len(unique_srcs)} stamps...")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# 3. Download and Rename to 1.jpg, 2.jpg...
success_count = 0
for i, src in enumerate(unique_srcs):
    save_name = f"{i+1}.jpg"
    if download_image(src, save_name):
        print(f"[{i+1}/{len(unique_srcs)}] Saved as: {save_name}")
        success_count += 1
    else:
        print(f"[{i+1}/{len(unique_srcs)}] FAILED to download source: {src}")
    time.sleep(0.1)

print(f"\nFinished! {success_count} images saved to 'images' folder.")