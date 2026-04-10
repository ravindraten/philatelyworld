#!/bin/bash
# Script to download all miniature sheet images from stampsofindia.com

OUTPUT_DIR="/Users/ravindra/workspace/GitHub/philatelyworld/docs/images/miniature-sheets"
BASE_URL="https://stampsofindia.com/lists"
URLS_FILE="/Users/ravindra/workspace/GitHub/philatelyworld/ms_urls.txt"

# Clear URLs file
> "$URLS_FILE"

echo "=== Extracting image URLs from all 6 pages ==="

for page in ms1.html ms2.html ms3.html ms4.html ms5.html ms6.html; do
    echo "Processing $page..."
    curl -s -L "${BASE_URL}/${page}" | \
        grep -oE '<a href="[^"]+\.(jpg|jpeg|png|gif)"' | \
        grep -v 'stanleygibbons\|affiliates\|ads\|banner' | \
        sed 's/<a href="//;s/"//' >> "$URLS_FILE"
done

echo ""
echo "=== Total URLs extracted ==="
wc -l < "$URLS_FILE"
echo ""
echo "=== First 20 URLs ==="
head -20 "$URLS_FILE"
echo ""
echo "=== Last 20 URLs ==="
tail -20 "$URLS_FILE"
