const fs = require('fs');
const path = require('path');

// 1. Read data.js and extract the stamps array
const dataJsPath = path.join(__dirname, 'data.js');
let dataContent = fs.readFileSync(dataJsPath, 'utf8');

// A simple eval-like sandbox to extract the stamps variable
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

// Ensure the outer 'item' directory exists
if (!fs.existsSync(outputDir)){
    fs.mkdirSync(outputDir);
}

let generatedCount = 0;

stamps.forEach(stamp => {
    // We strictly need an RN code to identify the item
    if (!stamp.desc) return;
    const rnMatch = stamp.desc.match(/RN\d+/);
    if (!rnMatch) return;
    const rnCode = rnMatch[0];

    // Create a folder for the specific RN code
    const stampDir = path.join(outputDir, rnCode);
    if (!fs.existsSync(stampDir)){
        fs.mkdirSync(stampDir);
    }

    // Prepare metadata
    const cleanYear = stamp.year ? stamp.year.replace(/<\/?b>/g, "") : '';
    const descText = `${stamp.country} | ${cleanYear.replace('Year: ', '')} | Price: ₹${stamp.priceINR}`;
    const imgUrl = `${baseImgPath}/${stamp.folder}/1.${stamp.extension || 'jpg'}`;
    
    // The HTML will act as a static page for crawlers and a redirect for users
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Philately World - ${stamp.name}</title>
    <!-- Open Graph (Facebook/WhatsApp/LinkedIn) -->
    <meta property="og:title" content="Philately World: ${stamp.name}">
    <meta property="og:description" content="${descText}">
    <meta property="og:image" content="${imgUrl}">
    <meta property="og:url" content="https://philatelyworld.in/item/${rnCode}/">
    <meta property="og:type" content="product">
    
    <!-- Twitter Cards -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="Philately World: ${stamp.name}">
    <meta name="twitter:description" content="${descText}">
    <meta name="twitter:image" content="${imgUrl}">

    <!-- Auto-redirect to the actual item page -->
    <meta http-equiv="refresh" content="0; url='../../index.html?item=${rnCode}'" />
    <script>window.location.replace("../../index.html?item=${rnCode}");</script>
</head>
<body>
    <p>Redirecting to <a href="../../index.html?item=${rnCode}">${stamp.name}</a>...</p>
</body>
</html>`;

    fs.writeFileSync(path.join(stampDir, 'index.html'), html);
    generatedCount++;
});

console.log(`\n✅ Generated ${generatedCount} static preview pages in the /docs/item/ folder.`);
console.log(`\nTo get a correct link preview with the 1st image on WhatsApp/Facebook, share the URLs like this:`);
console.log(`➡️  https://philatelyworld.in/item/RN4135/`);
console.log(`(Make sure to push the /item folder to your GitHub repository)`);
