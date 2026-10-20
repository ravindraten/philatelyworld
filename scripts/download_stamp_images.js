#!/usr/bin/env node
/**
 * Download all full-size images from a Stampland product page.
 *
 * Usage:
 *   node scripts/download_stamp_images.js <page-url> <folder-name>
 *
 * Example:
 *   node scripts/download_stampland_images.js \
 *     "url" \
 *     D137
 *
 * Full-size images are saved numerically as 1.jpg, 2.jpg, ... inside
 * docs/images/<folder-name>/ — matching the data.js `folder` + `imageCount`
 * convention. Thumbnail images (URLs containing "thumbnail") are skipped.
 */

const fs = require('fs');
const path = require('path');

const IMAGE_RE = /https?:\/\/[^"'\s()<>]+?\.(?:jpe?g|png|webp|gif)(?:\?[^"'\s()<>]*)?/gi;

function usage() {
    console.error('Usage: node scripts/download_stampland_images.js <page-url> <folder-name>');
    process.exit(1);
}

async function fetchText(url) {
    const res = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/*,*/*;q=0.8'
        },
        redirect: 'follow'
    });
    if (!res.ok) throw new Error(`Failed to fetch page (${res.status} ${res.statusText})`);
    return res.text();
}

function extractImages(html, pageUrl) {
    const found = new Set();
    let match;
    while ((match = IMAGE_RE.exec(html)) !== null) {
        let url = match[0];
        // Skip inline thumbnails / placeholder variants.
        if (/thumbnail/i.test(url)) continue;
        // Skip tiny icons and tracking pixels.
        if (/sprite|icon|favicon|logo|placeholder|pixel/i.test(url)) continue;
        // Resolve protocol-relative URLs.
        if (url.startsWith('//')) url = `https:${url}`;
        // Resolve root-relative URLs.
        if (url.startsWith('/')) url = new URL(url, pageUrl).href;
        found.add(url);
    }
    return [...found];
}

function naturalSort(urls) {
    return urls.sort((a, b) => a.localeCompare(b, 'en', { numeric: true, sensitivity: 'base' }));
}

function extensionOf(url) {
    const clean = url.split('?')[0];
    const ext = path.extname(clean).toLowerCase().replace('.', '');
    return ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext) ? ext : 'jpg';
}

async function download(url, dest) {
    const res = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
            'Accept': 'image/*,*/*;q=0.8'
        },
        redirect: 'follow'
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length === 0) throw new Error(`Empty response for ${url}`);
    fs.writeFileSync(dest, buf);
    return buf.length;
}

(async () => {
    const [pageUrl, folderName] = process.argv.slice(2);
    if (!pageUrl || !folderName) usage();

    try {
        new URL(pageUrl);
    } catch {
        console.error(`Invalid URL: ${pageUrl}`);
        process.exit(1);
    }

    if (!/^[A-Za-z0-9._-]+$/.test(folderName)) {
        console.error('Folder name may only contain letters, numbers, dots, dashes and underscores.');
        process.exit(1);
    }

    const repoRoot = path.resolve(__dirname, '..');
    const outDir = path.join(repoRoot, 'docs', 'images', folderName);
    fs.mkdirSync(outDir, { recursive: true });

    console.log(`Fetching page: ${pageUrl}`);
    const html = await fetchText(pageUrl);
    const images = naturalSort(extractImages(html, pageUrl));

    if (images.length === 0) {
        console.error('No images found on the page.');
        process.exit(1);
    }

    console.log(`Found ${images.length} full-size image(s). Downloading to docs/images/${folderName}/`);

    let ok = 0;
    for (let i = 0; i < images.length; i++) {
        const url = images[i];
        const dest = path.join(outDir, `${i + 1}.${extensionOf(url)}`);
        try {
            const bytes = await download(url, dest);
            ok++;
            console.log(`  [${i + 1}/${images.length}] ${path.basename(dest)} <- ${url} (${(bytes / 1024).toFixed(0)} KB)`);
        } catch (err) {
            console.error(`  [${i + 1}/${images.length}] FAILED ${url}: ${err.message}`);
        }
    }

    console.log(`\nDone: ${ok}/${images.length} image(s) saved to docs/images/${folderName}/`);
    if (ok !== images.length) process.exit(1);
})().catch((err) => {
    console.error(err.message || err);
    process.exit(1);
});
