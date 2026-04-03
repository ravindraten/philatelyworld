#!/bin/bash
# Download all miniature sheet full-size images from stampsofindia.com
# Images are saved with sequential numbering matching the MS number

OUTPUT_DIR="/Users/ravindra/workspace/GitHub/philatelyworld/docs/images/miniature-sheets"
BASE_URL="https://stampsofindia.com/lists"

mkdir -p "$OUTPUT_DIR"

# Counter for sequential naming
counter=1

# Read each URL and download
while IFS= read -r rel_url; do
    # Skip empty lines
    [ -z "$rel_url" ] && continue
    
    # Build full URL - handle relative paths
    if [[ "$rel_url" == ../* ]]; then
        # URLs starting with ../ need to go up from /lists/
        full_url="https://stampsofindia.com/${rel_url#../}"
    elif [[ "$rel_url" == http* ]]; then
        full_url="$rel_url"
    else
        full_url="${BASE_URL}/${rel_url}"
    fi
    
    # Create filename with zero-padded sequential number
    padded=$(printf "%03d" "$counter")
    filename="${padded}.jpg"
    
    echo "[$counter/303] Downloading: $full_url -> $filename"
    
    # Download with curl, follow redirects, retry on failure
    curl -s -L -o "${OUTPUT_DIR}/${filename}" \
        --retry 3 \
        --retry-delay 1 \
        -H "User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)" \
        -H "Referer: https://stampsofindia.com/lists/ms1.html" \
        "$full_url"
    
    # Check if download succeeded
    if [ $? -eq 0 ] && [ -s "${OUTPUT_DIR}/${filename}" ]; then
        filesize=$(stat -f%z "${OUTPUT_DIR}/${filename}" 2>/dev/null || stat -c%s "${OUTPUT_DIR}/${filename}" 2>/dev/null)
        echo "  ✓ Downloaded (${filesize} bytes)"
    else
        echo "  ✗ FAILED"
    fi
    
    counter=$((counter + 1))
    
    # Small delay to be polite to the server
    sleep 0.3
    
done < /Users/ravindra/workspace/GitHub/philatelyworld/ms_urls.txt

echo ""
echo "=== Download Complete ==="
echo "Total files: $(ls -1 "$OUTPUT_DIR" | wc -l)"
echo "Output directory: $OUTPUT_DIR"
