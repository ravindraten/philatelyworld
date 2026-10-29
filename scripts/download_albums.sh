#!/usr/bin/env bash
# Downloads all albums from albumeasy_albums.csv into country subfolders

set -euo pipefail

CSV="$(dirname "$0")/albumeasy_albums.csv"
OUTPUT_DIR="/Users/ravindra/workspace/GitHub/philatelyworld/albums"

SUCCESS=0
SKIPPED=0
FAILED=0
TOTAL=0

# Read CSV, skipping header
tail -n +2 "$CSV" | while IFS= read -r line; do
  # Skip blank lines
  [[ -z "$line" ]] && continue

  # Parse CSV fields (handle quoted fields with commas)
  # Fields: country,title,file,author,size_mb,pcloud_url,source_url
  country=$(echo "$line" | python3 -c "
import sys, csv
row = next(csv.reader([sys.stdin.read().strip()]))
print(row[0]) if len(row) > 0 else print('')
")
  filename=$(echo "$line" | python3 -c "
import sys, csv
row = next(csv.reader([sys.stdin.read().strip()]))
print(row[2]) if len(row) > 2 else print('')
")
  url=$(echo "$line" | python3 -c "
import sys, csv
row = next(csv.reader([sys.stdin.read().strip()]))
print(row[6]) if len(row) > 6 else print('')
")

  # Skip if no URL or no filename
  if [[ -z "$url" || -z "$filename" || -z "$country" ]]; then
    continue
  fi

  TOTAL=$((TOTAL + 1))

  # Sanitize country name for directory (replace slashes and special chars)
  safe_country=$(echo "$country" | sed 's|/|_|g' | sed 's|[<>:"\*?|]|_|g' | sed 's|^ *||; s| *$||')
  dest_dir="$OUTPUT_DIR/$safe_country"
  dest_file="$dest_dir/$filename"

  # Skip if already downloaded
  if [[ -f "$dest_file" && -s "$dest_file" ]]; then
    echo "[SKIP] $country/$filename (already exists)"
    SKIPPED=$((SKIPPED + 1))
    continue
  fi

  mkdir -p "$dest_dir"

  echo "[DOWN] $country/$filename"
  if curl -sSL --max-time 120 --retry 2 -o "$dest_file" "$url"; then
    # Verify it's a PDF (non-empty and starts with %PDF or is at least 1KB)
    if [[ -s "$dest_file" ]]; then
      file_size=$(wc -c < "$dest_file")
      if [[ $file_size -gt 1024 ]]; then
        echo "  ✓ OK (${file_size} bytes)"
        SUCCESS=$((SUCCESS + 1))
      else
        echo "  ✗ Too small (${file_size} bytes), likely failed"
        rm -f "$dest_file"
        FAILED=$((FAILED + 1))
      fi
    else
      echo "  ✗ Empty file"
      rm -f "$dest_file"
      FAILED=$((FAILED + 1))
    fi
  else
    echo "  ✗ curl failed"
    FAILED=$((FAILED + 1))
  fi

done

echo ""
echo "=============================="
echo "Download complete!"
echo "  Total:   $TOTAL"
echo "  Success: $SUCCESS"
echo "  Skipped: $SKIPPED"
echo "  Failed:  $FAILED"
echo "=============================="
