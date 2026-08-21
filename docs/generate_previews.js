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
    const imgUrl = `${baseImgPath}/${stamp.folder}/1.${stamp.extension || 'jpg'}`;
    const price = stamp.onSale ? stamp.salePriceINR : stamp.priceINR;
    const imageMimeType = stamp.extension === 'png' ? 'image/png' : 'image/jpeg';

    // The HTML acts as a static OG/preview page for crawlers and redirects human users.
    // IMPORTANT: The JS redirect is intentionally deferred via setTimeout so WhatsApp's
    // crawler can fully parse the <head> OG tags before any redirect fires.
    // Synchronous window.location.replace() was causing WhatsApp to see a blank page.
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>${stamp.name} | Buy Rare Stamps | Philately World</title>
    <meta name="description" content="Buy authenticated ${stamp.name} stamp online. Philately World offers rare stamps, FDCs, and postal history. Worldwide shipping.">
    <!-- Open Graph (Facebook/WhatsApp/LinkedIn) -->
    <meta property="og:site_name" content="Philately World">
    <meta property="og:title" content="${stamp.name} | Buy Rare Stamps | Philately World">
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
        "image": imgUrl,
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
    <meta property="og:image" content="${imgUrl}">
    <meta property="og:image:secure_url" content="${imgUrl}">
    <meta property="og:image:type" content="${imageMimeType}">
    <meta property="og:image:width" content="600">
    <meta property="og:image:height" content="600">

    <!-- Twitter Cards -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${stamp.name} | Buy Rare Stamps | Philately World">
    <meta name="twitter:description" content="${descText}">
    <meta name="twitter:image" content="${imgUrl}">

    <!-- Deferred JS redirect: crawlers (WhatsApp, Facebook) don't execute JS and stay on this page with correct OG tags. Human users get redirected to the SPA after a short delay. -->
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-0K58TP8LVP');
        setTimeout(function(){ window.location.replace("https://philatelyworld.in/?item=${rnCode}"); }, 100);
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

if (fs.existsSync(announcementDir)) {
    const announcementFiles = fs.readdirSync(announcementDir).filter(f => f.endsWith('.html'));

    announcementFiles.forEach(file => {
        const baseName = path.basename(file, '.html');
        const folderDir = path.join(announcementDir, baseName);

        if (!fs.existsSync(folderDir)) {
            fs.mkdirSync(folderDir);
        }

        const ogTitle = file === '7.html'
            ? `Philately Forward – FEPA's €1,000 Competition to Attract New Collectors`
            : `Philately World Announcement`;

        const ogDesc = file === '7.html'
            ? `FEPA launches Philately Forward — a competition awarding €1,000 for the best idea to attract new stamp collectors. Deadline 31 October 2026.`
            : `View this announcement on Philately World.`;

        const ogImage = file === '7.html'
            ? `https://fepanews.com/wp-content/uploads/2026/04/Logo-star-cr.png`
            : `https://filedn.eu/lbu0dswNxxUBjQKg0kNdmLu/philatelyworld-images/images/logo.jpg`;

        const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
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
    <meta property="og:image:type" content="image/jpeg">
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
        setTimeout(function(){ window.location.replace("https://philatelyworld.in/announcement/${baseName}.html"); }, 100);
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

// Collect all item folders
const itemIds = fs.readdirSync(itemDir).filter(f =>
    fs.statSync(path.join(itemDir, f)).isDirectory()
);

// Collect all blog files
const blogIds = fs.existsSync(blogDir) 
    ? fs.readdirSync(blogDir).filter(f => f.endsWith('.html')) 
    : [];

// Collect all announcement folders (clean URLs)
const announcementIds = fs.existsSync(announcementDir) 
    ? fs.readdirSync(announcementDir).filter(f => {
        const fullPath = path.join(announcementDir, f);
        return fs.statSync(fullPath).isDirectory();
    }) 
    : [];

const today = new Date().toISOString().split('T')[0];

const itemUrls = itemIds.map(id => `
  <url>
    <loc>${baseUrl}/item/${id}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`).join('');

const blogUrls = blogIds.map(id => `
  <url>
    <loc>${baseUrl}/blog/${id}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`).join('');

const announcementUrls = announcementIds.map(id => `
  <url>
    <loc>${baseUrl}/announcement/${id}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`).join('');

const giveawayUrl = `
  <url>
    <loc>${baseUrl}/giveaway.html</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`;

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>${giveawayUrl}${itemUrls}${blogUrls}${announcementUrls}
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
        const imgUrl = `${baseImgPath}/${stamp.folder}/1.${stamp.extension || 'jpg'}`;
        const priceText = stamp.onSale 
            ? `₹${stamp.salePriceINR} (was ₹${stamp.priceINR})`
            : `₹${stamp.priceINR}`;

        return `
                <div class="stamp-card">
                    <div class="img-container">
                        <img src="${imgUrl}" alt="${stamp.name}" loading="lazy" width="300" height="300">
                        <div class="photo-badge">${stamp.imageCount} Photos</div>
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