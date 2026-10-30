const fs = require('fs');
const path = require('path');

// 1. Read data.js and extract the stamps array
const dataJsPath = path.join(__dirname, 'data.js');
let dataContent = fs.readFileSync(dataJsPath, 'utf8');

// A simple eval-like sandbox to extract the stamps variable[cite: 2]
dataContent = dataContent.replace('const stamps = [', 'global.stamps = [');

try {
    eval(dataContent);
} catch (e) {
    console.error("Error parsing data.js:", e);
    process.exit(1);
}

const stamps = global.stamps;

if (!stamps || !Array.isArray(stamps)) {
    console.error("Failed to load stamps array. Make sure 'data.js' starts with 'const stamps = ['");
    process.exit(1);
}

const baseImgPath = "https://filedn.eu/lbu0dswNxxUBjQKg0kNdmLu/philatelyworld-images/images";

// Image support: `images` may be a single URL string or an array of URLs.
// Otherwise images are built from `folder` + index (1.jpg…).
function stampImageCount(stamp) {
    if (!stamp) return 0;
    if (stamp.images != null) {
        if (typeof stamp.images === 'string') return stamp.images.trim() ? 1 : 0;
        if (Array.isArray(stamp.images)) return stamp.images.filter(u => typeof u === 'string' && u.trim()).length;
    }
    if (!stamp.folder) return 0;
    const parsed = parseInt(stamp.imageCount, 10);
    return parsed > 0 ? parsed : 1;
}

function stampImageUrl(stamp, index) {
    if (!stamp) return '';
    const i = Math.max(parseInt(index, 10) || 1, 1);
    if (typeof stamp.images === 'string' && stamp.images.trim()) return stamp.images.trim();
    if (Array.isArray(stamp.images)) {
        const list = stamp.images.filter(u => typeof u === 'string' && u.trim());
        if (list.length) return list[Math.min(i, list.length) - 1];
    }
    if (stamp.folder) return `${baseImgPath}/${stamp.folder}/${i}.${stamp.extension || 'jpg'}`;
    return `${baseImgPath}/logo.jpg`;
}

// Read width/height/type of a local image file without extra dependencies.
function localImageMeta(filePath) {
    try {
        const buf = fs.readFileSync(filePath);
        if (buf.length > 24 && buf[0] === 0x89 && buf[1] === 0x50) {
            return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20), type: 'image/png' };
        }
        if (buf.length > 4 && buf[0] === 0xFF && buf[1] === 0xD8) {
            let i = 2;
            while (i < buf.length - 9) {
                if (buf[i] !== 0xFF) { i++; continue; }
                const marker = buf[i + 1];
                const isSOF = marker >= 0xC0 && marker <= 0xCF && marker !== 0xC4 && marker !== 0xC8 && marker !== 0xCC;
                if (isSOF) return { width: buf.readUInt16BE(i + 7), height: buf.readUInt16BE(i + 5), type: 'image/jpeg' };
                if (marker === 0xD8 || marker === 0xD9 || (marker >= 0xD0 && marker <= 0xD7)) { i += 2; continue; }
                i += 2 + buf.readUInt16BE(i + 2);
            }
        }
    } catch (e) { /* fall through */ }
    return null;
}

function imageMimeType(url) {
    if (/\.png(\?|$)/i.test(url)) return 'image/png';
    if (/\.webp(\?|$)/i.test(url)) return 'image/webp';
    if (/\.gif(\?|$)/i.test(url)) return 'image/gif';
    return 'image/jpeg';
}
const outputDir = path.join(__dirname, 'item');

// Ensure the outer 'item' directory exists[cite: 2]
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

let generatedCount = 0;

stamps.forEach(stamp => {
    // We strictly need an RN code to identify the item[cite: 2]
    if (!stamp.desc) return;
    const rnMatch = stamp.desc.match(/RN\d+/);
    if (!rnMatch) return;
    const rnCode = rnMatch[0];

    // Create a folder for the specific RN code[cite: 2]
    const stampDir = path.join(outputDir, rnCode);
    if (!fs.existsSync(stampDir)) {
        fs.mkdirSync(stampDir);
    }

    // Prepare metadata[cite: 2]
    const EUR_RATE = 0.011; // matches CONFIG.eurRate fallback in script.js
    const cleanYear = stamp.year ? stamp.year.replace(/<\/?b>/g, "") : '';
    const priceEUR = (stamp.priceINR || 0) * EUR_RATE;
    const saleEUR = (stamp.salePriceINR || 0) * EUR_RATE;
    const descText = stamp.onSale
        ? `${stamp.country} | ${cleanYear.replace('Year: ', '')} | ON SALE: ₹${stamp.salePriceINR} / €${saleEUR.toFixed(2)} (was ₹${stamp.priceINR} / €${priceEUR.toFixed(2)})`
        : `${stamp.country} | ${cleanYear.replace('Year: ', '')} | Price: ₹${stamp.priceINR} / €${priceEUR.toFixed(2)}`;
    const imgUrl = stampImageUrl(stamp, 1);
    const price = stamp.onSale ? stamp.salePriceINR : stamp.priceINR;
    const ogImageMimeType = imageMimeType(imgUrl);

    // Optional per-item OG image: drop an `og.jpg` / `og.png` into docs/item/<RN>/
    // to override the preview image shown by WhatsApp, Facebook and Twitter.
    const localOgFile = ['og.jpg', 'og.jpeg', 'og.png', 'og.webp']
        .map(f => path.join(stampDir, f))
        .find(f => fs.existsSync(f));
    const localOgMeta = localOgFile ? localImageMeta(localOgFile) : null;
    const ogImageUrl = localOgFile
        ? `https://philatelyworld.in/item/${rnCode}/${path.basename(localOgFile)}`
        : imgUrl;
    const ogContentType = localOgMeta ? localOgMeta.type : ogImageMimeType;
    const ogSizeTags = localOgMeta
        ? `<meta property="og:image:width" content="${localOgMeta.width}">
    <meta property="og:image:height" content="${localOgMeta.height}">`
        : '';

    // The HTML acts as a static OG/preview page for crawlers and redirects human users.
    // IMPORTANT: The JS redirect is intentionally deferred via setTimeout so WhatsApp's
    // crawler can fully parse the <head> OG tags before any redirect fires.
    // Synchronous window.location.replace() was causing WhatsApp to see a blank page.
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${stamp.name} | Buy Genuine Stamps | Philately World</title>
    <meta name="description" content="Buy authenticated ${stamp.name} stamp online. Philately World offers rare stamps, FDCs, and postal history. Worldwide shipping.">
    <!-- Open Graph (Facebook/WhatsApp/LinkedIn) -->
    <meta property="og:site_name" content="Philately World">
    <meta property="og:title" content="${stamp.name} | Buy Genuine Stamps | Philately World">
    <meta property="og:description" content="${descText}">
    <meta property="og:url" content="https://philatelyworld.in/item/${rnCode}/">
    <meta property="og:type" content="product">
    <link rel="canonical" href="https://philatelyworld.in/item/${rnCode}/" />

    <!-- Product structured data for rich results -->
    <script type="application/ld+json">
    ${JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Product",
        "name": stamp.name,
        "description": `Buy authenticated ${stamp.name} stamp. Rare stamp and postal history available at Philately World.`,
        "image": ogImageUrl,
        "url": `https://philatelyworld.in/item/${rnCode}/`,
        "offers": {
            "@type": "Offer",
            "priceCurrency": "INR",
            "price": price,
            "availability": stamp.isSoldOut ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
            "url": `https://philatelyworld.in/item/${rnCode}/`,
            "priceValidUntil": "2027-12-31",
            "seller": {
                "@type": "Organization",
                "name": "Philately World",
                "url": "https://philatelyworld.in/"
            }
        }
    }, null, 2)}
    </script>

    <!-- WhatsApp image: must be HTTPS, ideally under 300KB, 600x315 or square -->
    <meta property="og:image" content="${ogImageUrl}">
    <meta property="og:image:secure_url" content="${ogImageUrl}">
    <meta property="og:image:type" content="${ogContentType}">
    ${ogSizeTags}

    <!-- Twitter Cards -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${stamp.name} | Buy Genuine Stamps | Philately World">
    <meta name="twitter:description" content="${descText}">
    <meta name="twitter:image" content="${ogImageUrl}">

    <!-- Deferred JS redirect: crawlers (WhatsApp, Facebook, Googlebot...) don't execute JS or are excluded below,
         so they stay on this page with correct OG tags and the page stays indexable.
         Human users get redirected to the SPA after a short delay. -->
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-0K58TP8LVP');
        // Redirect only real human browsers; search/social crawlers stay
        // on this page so it stays indexable and link previews keep working
        if (!/Googlebot|Bingbot|DuckDuckBot|Yandex|Applebot|Baiduspider|facebookexternalhit|Facebot|WhatsApp|TelegramBot|Twitterbot|LinkedInBot|Pinterest|Slurp/i.test(navigator.userAgent)) {
            setTimeout(function(){ window.location.replace("https://philatelyworld.in/?item=${rnCode}"); }, 100);
        }
    </script>
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-0K58TP8LVP"></script>
    <script data-goatcounter="https://ravindraten.goatcounter.com/count" async src="//gc.zgo.at/count.js"></script>
</head>
<body>
    <h1>${stamp.name}</h1>
    <p>${descText}</p>
    <img src="${imgUrl}" alt="${stamp.name}" width="300" height="300" loading="lazy" decoding="async" style="max-width:100%">
    <p><a href="https://philatelyworld.in/?item=${rnCode}">View full listing on Philately World &rarr;</a></p>
</body>
</html>`;

    fs.writeFileSync(path.join(stampDir, 'index.html'), html);
    generatedCount++;
});

console.log(`\n✅ Generated ${generatedCount} static item preview pages.`);

// ---------------------------------------------------------------
// 2. Generate announcement preview folders (announcement/N/index.html)
// ---------------------------------------------------------------
const announcementDir = path.join(__dirname, 'announcement');
let announcementPreviewCount = 0;

// Pull name/property + content pairs out of a <meta> tag list.
function readMetaTags(html) {
    const meta = {};
    const tagRe = /<meta\s[^>]*>/gi;
    for (const tag of html.match(tagRe) || []) {
        const key = (tag.match(/(?:name|property)=["']([^"']+)["']/i) || [])[1];
        const value = (tag.match(/content=["']([^"']*)["']/i) || [])[1];
        if (key && value && !(key.toLowerCase() in meta)) {
            meta[key.toLowerCase()] = value.trim();
        }
    }
    return meta;
}

if (fs.existsSync(announcementDir)) {
    const announcementFiles = fs.readdirSync(announcementDir).filter(f => f.endsWith('.html'));

    announcementFiles.forEach(file => {
        const baseName = path.basename(file, '.html');
        const folderDir = path.join(announcementDir, baseName);

        if (!fs.existsSync(folderDir)) {
            fs.mkdirSync(folderDir);
        }

        // Reuse the announcement's own head so every preview carries its real title,
        // description and image instead of a generic placeholder.
        const sourceHtml = fs.readFileSync(path.join(announcementDir, file), 'utf8');
        const sourceMeta = readMetaTags(sourceHtml);
        const sourceTitle = (sourceHtml.match(/<title>([^<]*)<\/title>/i) || [])[1];

        const ogTitle = (sourceTitle || sourceMeta['og:title'] || 'Philately World Announcement').trim();
        const ogDesc = (sourceMeta['og:description'] || sourceMeta['description'] || 'View this announcement on Philately World.').trim();
        const ogImage = sourceMeta['og:image'] || 'https://filedn.eu/lbu0dswNxxUBjQKg0kNdmLu/philatelyworld-images/images/logo.jpg';
        const ogImageType = /\.png(\?|$)/i.test(ogImage) ? 'image/png'
            : /\.webp(\?|$)/i.test(ogImage) ? 'image/webp'
            : 'image/jpeg';

        const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${ogTitle}</title>
    <meta name="description" content="${ogDesc}">
    <meta property="og:site_name" content="Philately World">
    <meta property="og:title" content="${ogTitle}">
    <meta property="og:description" content="${ogDesc}">
    <meta property="og:url" content="https://philatelyworld.in/announcement/${baseName}/">
    <meta property="og:type" content="article">
    <link rel="canonical" href="https://philatelyworld.in/announcement/${baseName}/" />
    <meta property="og:image" content="${ogImage}">
    <meta property="og:image:secure_url" content="${ogImage}">
    <meta property="og:image:type" content="${ogImageType}">
    <meta property="og:image:width" content="600">
    <meta property="og:image:height" content="600">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${ogTitle}">
    <meta name="twitter:description" content="${ogDesc}">
    <meta name="twitter:image" content="${ogImage}">
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-0K58TP8LVP');
        // Redirect only real human browsers; search/social crawlers stay
        // on this page so it stays indexable and link previews keep working
        if (!/Googlebot|Bingbot|DuckDuckBot|Yandex|Applebot|Baiduspider|facebookexternalhit|Facebot|WhatsApp|TelegramBot|Twitterbot|LinkedInBot|Pinterest|Slurp/i.test(navigator.userAgent)) {
            setTimeout(function(){ window.location.replace("https://philatelyworld.in/announcement/${baseName}.html"); }, 100);
        }
    </script>
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-0K58TP8LVP"></script>
    <script data-goatcounter="https://ravindraten.goatcounter.com/count" async src="//gc.zgo.at/count.js"></script>
</head>
<body>
    <h1>${ogTitle}</h1>
    <p><a href="https://philatelyworld.in/announcement/${baseName}.html">View announcement on Philately World &rarr;</a></p>
</body>
</html>`;

        fs.writeFileSync(path.join(folderDir, 'index.html'), html);
        announcementPreviewCount++;
    });
}

console.log(`✅ Generated ${announcementPreviewCount} announcement preview folders.`);

// At the bottom of generate_previews.js — auto-generate sitemap

const baseUrl = 'https://philatelyworld.in';
const itemDir = path.join(__dirname, 'item');
const blogDir = path.join(__dirname, 'blog');

const today = new Date().toISOString().split('T')[0];

function fileDate(filePath) {
    try {
        return fs.statSync(filePath).mtime.toISOString().split('T')[0];
    } catch {
        return today;
    }
}

// Optional per-blog publish dates, shared with the blog tooling.
let blogDates = {};
try {
    blogDates = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'scripts', 'blog_dates.json'), 'utf8'));
} catch {
    blogDates = {};
}

// Collect all item folders
const itemIds = fs.readdirSync(itemDir)
    .filter(f => fs.statSync(path.join(itemDir, f)).isDirectory())
    .sort();

// Collect all blog files
const blogIds = fs.existsSync(blogDir)
    ? fs.readdirSync(blogDir)
        .filter(f => f.endsWith('.html') && !f.startsWith('_'))
        .sort()
    : [];

// Collect all announcement folders (clean URLs)
const announcementIds = fs.existsSync(announcementDir)
    ? fs.readdirSync(announcementDir)
        .filter(f => {
            const fullPath = path.join(announcementDir, f);
            return fs.statSync(fullPath).isDirectory();
        })
        .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }))
    : [];

const itemUrls = itemIds.map(id => `
  <url>
    <loc>${baseUrl}/item/${id}/</loc>
    <lastmod>${fileDate(path.join(itemDir, id, 'index.html'))}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`).join('');

const blogUrls = blogIds.map(id => {
    const lastmod = blogDates[id] || fileDate(path.join(blogDir, id));
    return `
  <url>
    <loc>${baseUrl}/blog/${id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
}).join('');

const announcementUrls = announcementIds.map(id => `
  <url>
    <loc>${baseUrl}/announcement/${id}/</loc>
    <lastmod>${fileDate(path.join(announcementDir, id, 'index.html'))}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`).join('');

const giveawayUrl = fs.existsSync(path.join(__dirname, 'giveaway.html')) ? `
  <url>
    <loc>${baseUrl}/giveaway.html</loc>
    <lastmod>${fileDate(path.join(__dirname, 'giveaway.html'))}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>` : '';

// Standalone album tool pages, which are not generated by this script.
const albumToolUrls = ['albumeasy.html', 'auto-album.html']
    .map(page => path.join(__dirname, 'AlbumDesigner', page))
    .filter(pagePath => fs.existsSync(pagePath))
    .map(pagePath => `
  <url>
    <loc>${baseUrl}/AlbumDesigner/${path.basename(pagePath)}</loc>
    <lastmod>${fileDate(pagePath)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`).join('');

const announcementsIndexUrl = fs.existsSync(path.join(__dirname, 'all_announcements.html')) ? `
  <url>
    <loc>${baseUrl}/all_announcements.html</loc>
    <lastmod>${fileDate(path.join(__dirname, 'all_announcements.html'))}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>` : '';

// The news desk is refreshed by a scheduled Action, so it changes far more often
// than the catalogue. Date it by news.json rather than the static HTML shell.
const newsJsonPath = path.join(__dirname, 'news.json');
const newsPagePath = path.join(__dirname, 'philatelic-news.html');
const newsUrl = fs.existsSync(newsPagePath) ? `
  <url>
    <loc>${baseUrl}/philatelic-news.html</loc>
    <lastmod>${fs.existsSync(newsJsonPath) ? fileDate(newsJsonPath) : fileDate(newsPagePath)}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.8</priority>
  </url>` : '';

// The exhibitions calendar is refreshed alongside the news desk.
const exhibitionsJsonPath = path.join(__dirname, 'exhibitions.json');
const exhibitionsPagePath = path.join(__dirname, 'philatelic-exhibitions.html');
const exhibitionsUrl = fs.existsSync(exhibitionsPagePath) ? `
  <url>
    <loc>${baseUrl}/philatelic-exhibitions.html</loc>
    <lastmod>${fs.existsSync(exhibitionsJsonPath) ? fileDate(exhibitionsJsonPath) : fileDate(exhibitionsPagePath)}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>` : '';

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${fileDate(path.join(__dirname, 'index.html'))}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>${giveawayUrl}${announcementsIndexUrl}${newsUrl}${exhibitionsUrl}${albumToolUrls}${itemUrls}${blogUrls}${announcementUrls}
</urlset>`;

fs.writeFileSync(path.join(__dirname, 'sitemap.xml'), sitemap);
console.log(`✅ sitemap.xml generated with ${itemIds.length} items, ${blogIds.length} blogs, and ${announcementIds.length} announcements.`);

// ---------------------------------------------------------------
// 3. Pre-render stamps into index.html for non-JS crawlers
// ---------------------------------------------------------------
const indexHtmlPath = path.join(__dirname, 'index.html');
if (fs.existsSync(indexHtmlPath)) {
    let indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
    
    // Generate static stamp cards HTML (only available ones to keep payload optimized)
    const staticStampCards = stamps.filter(s => !s.isSoldOut).map(stamp => {
        if (!stamp.desc) return '';
        const rnMatch = stamp.desc.match(/RN\d+/);
        if (!rnMatch) return '';
        const rnCode = rnMatch[0];
        const shareUrl = `https://philatelyworld.in/item/${encodeURIComponent(rnCode)}/`;
        const cleanYear = stamp.year ? stamp.year.replace(/<\/?b>/g, "") : '';
        const imgUrl = stampImageUrl(stamp, 1);
        const priceText = stamp.onSale 
            ? `₹${stamp.salePriceINR} (was ₹${stamp.priceINR})`
            : `₹${stamp.priceINR}`;

        return `
                <div class="stamp-card">
                    <div class="img-container">
                        <img src="${imgUrl}" alt="${stamp.name}" loading="lazy" width="300" height="300">
                        <div class="photo-badge">${stampImageCount(stamp)} Photos</div>
                    </div>
                    <div class="details">
                        <h3>${stamp.name}</h3>
                        <div style="display: flex; gap: 8px; align-items: center;">
                            <span class="stamp-year">${cleanYear}</span>
                            <small style="color: var(--text-light)">${stamp.country}</small>
                        </div>
                        <div class="stamp-desc">${stamp.desc}</div>
                        <div class="price-row">
                            <div class="price">${priceText}</div>
                            <div class="action-buttons">
                                <a href="${shareUrl}" class="buy-btn" style="text-align: center;">View Listing</a>
                            </div>
                        </div>
                    </div>
                </div>`;
    }).join('\n');

    const startTag = '<!-- STAMP_GRID_START -->';
    const endTag = '<!-- STAMP_GRID_END -->';
    
    const startIndex = indexHtml.indexOf(startTag);
    const endIndex = indexHtml.indexOf(endTag);
    
    if (startIndex !== -1 && endIndex !== -1) {
        const before = indexHtml.substring(0, startIndex + startTag.length);
        const after = indexHtml.substring(endIndex);
        const newHtml = before + '\n' + staticStampCards + '\n' + after;
        fs.writeFileSync(indexHtmlPath, newHtml, 'utf8');
        console.log(`✅ Statically pre-rendered ${stamps.filter(s => !s.isSoldOut).length} stamps inside index.html`);
    } else {
        console.warn("⚠️ Warning: Could not find STAMP_GRID comment placeholders in index.html");
    }
}