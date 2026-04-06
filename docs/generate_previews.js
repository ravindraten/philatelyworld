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
    const descText = `${stamp.country} | ${cleanYear.replace('Year: ', '')} | Price: ₹${stamp.priceINR}`;
    const imgUrl = `${baseImgPath}/${stamp.folder}/1.${stamp.extension || 'jpg'}`;

    // The HTML will act as a static page for crawlers and a redirect for users[cite: 2]
    // UPDATED: Added explicit image dimensions and site_name for WhatsApp
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Philately World - ${stamp.name}</title>
    
    <!-- Open Graph (Facebook/WhatsApp/LinkedIn) -->
    <meta property="og:site_name" content="Philately World">
    <meta property="og:title" content="Philately World: ${stamp.name}">
    <meta property="og:description" content="${descText}">
    <meta property="og:url" content="https://philatelyworld.in/item/${rnCode}/">
    <meta property="og:type" content="website">

    <!-- WhatsApp specific image optimization -->
    <meta property="og:image" itemprop="image" content="${imgUrl}">
    <meta property="og:image:secure_url" content="${imgUrl}">
    <meta property="og:image:type" content="image/jpeg">
    <meta property="og:image:width" content="600">
    <meta property="og:image:height" content="600">
    
    <!-- Twitter Cards -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="Philately World: ${stamp.name}">
    <meta name="twitter:description" content="${descText}">
    <meta name="twitter:image" content="${imgUrl}">

    <!-- Auto-redirect to the actual item page[cite: 1, 2] -->
    <meta http-equiv="refresh" content="0; url='../../index.html?item=${rnCode}'" />
    <script>window.location.replace("../../index.html?item=${rnCode}");</script>

    <!-- Google tag (gtag.js)[cite: 2] -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-0K58TP8LVP"></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-0K58TP8LVP');
    </script>
    <script data-goatcounter="https://ravindraten.goatcounter.com/count" async src="//gc.zgo.at/count.js"></script>
</head>
<body>
    <p>Redirecting to <a href="../../index.html?item=${rnCode}">${stamp.name}</a>...</p>
</body>
</html>`;

    fs.writeFileSync(path.join(stampDir, 'index.html'), html);
    generatedCount++;
});

console.log(`\n✅ Generated ${generatedCount} static preview pages.`);