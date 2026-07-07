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
    const cleanYear = stamp.year ? stamp.year.replace(/<\/?b>/g, "") : '';
    const descText = stamp.onSale
        ? `${stamp.country} | ${cleanYear.replace('Year: ', '')} | ON SALE: ₹${stamp.salePriceINR} (was ₹${stamp.priceINR})`
        : `${stamp.country} | ${cleanYear.replace('Year: ', '')} | Price: ₹${stamp.priceINR}`;
    const imgUrl = `${baseImgPath}/${stamp.folder}/1.${stamp.extension || 'jpg'}`;

    // The HTML acts as a static OG/preview page for crawlers and redirects human users.
    // IMPORTANT: The JS redirect is intentionally deferred via setTimeout so WhatsApp's
    // crawler can fully parse the <head> OG tags before any redirect fires.
    // Synchronous window.location.replace() was causing WhatsApp to see a blank page.
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Philately World - ${stamp.name}</title>
    <meta name="description" content="Buy authenticated ${stamp.name}. Established 2017. Ships worldwide.">
    <!-- Open Graph (Facebook/WhatsApp/LinkedIn) -->
    <meta property="og:site_name" content="Philately World">
    <meta property="og:title" content="Philately World: ${stamp.name}">
    <meta property="og:description" content="${descText}">
    <meta property="og:url" content="https://philatelyworld.in/item/${rnCode}/">
    <meta property="og:type" content="product">

    <!-- WhatsApp image: must be HTTPS, ideally under 300KB, 600x315 or square -->
    <meta property="og:image" content="${imgUrl}">
    <meta property="og:image:secure_url" content="${imgUrl}">
    <meta property="og:image:type" content="image/jpeg">
    <meta property="og:image:width" content="600">
    <meta property="og:image:height" content="600">

    <!-- Twitter Cards -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="Philately World: ${stamp.name}">
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

const itemUrls = itemIds.map(id => `
  <url>
    <loc>${baseUrl}/item/${id}/</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`).join('');

const blogUrls = blogIds.map(id => `
  <url>
    <loc>${baseUrl}/blog/${id}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`).join('');

const announcementUrls = announcementIds.map(id => `
  <url>
    <loc>${baseUrl}/announcement/${id}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`).join('');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>${itemUrls}${blogUrls}${announcementUrls}
</urlset>`;

fs.writeFileSync(path.join(__dirname, 'sitemap.xml'), sitemap);
console.log(`✅ sitemap.xml generated with ${itemIds.length} items, ${blogIds.length} blogs, and ${announcementIds.length} announcements.`);