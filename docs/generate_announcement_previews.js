const fs = require('fs');
const path = require('path');

const announcementDir = path.join(__dirname, 'announcement');
const outputDir = announcementDir; // Previews will be in announcement/X/

// Ensure the directory exists
if (!fs.existsSync(announcementDir)) {
    console.error("Announcement directory not found.");
    process.exit(1);
}

// Get all .html files in the announcement folder (excluding index.html)
const announcementFiles = fs.readdirSync(announcementDir).filter(file => 
    file.endsWith('.html') && file !== 'index.html'
);

let generatedCount = 0;

announcementFiles.forEach(file => {
    const filePath = path.join(announcementDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const id = file.replace('.html', '');

    // 1. Extract Title (h1)
    const titleMatch = content.match(/<h1>(.*?)<\/h1>/);
    const title = titleMatch ? titleMatch[1].trim() : 'Philately World Announcement';

    // 2. Extract Image (img in img-wrap)
    const imgMatch = content.match(/<div class="img-wrap">[\s\S]*?<img src="(.*?)"/);
    const imgUrl = imgMatch ? imgMatch[1].trim() : 'https://filedn.eu/lbu0dswNxxUBjQKg0kNdmLu/philatelyworld-images/images/logo.jpg';

    // 3. Extract Description (first p with length > 50)
    const paragraphs = content.match(/<p[^>]*>([\s\S]*?)<\/p>/g) || [];
    let descText = "Discover our latest philatelic news and exclusive releases.";
    for (const p of paragraphs) {
        const text = p.replace(/<[^>]*>/g, '').trim();
        if (text.length > 50 && !text.includes('category-tag')) {
            descText = text.substring(0, 160).trim() + "...";
            break;
        }
    }

    // Create the subfolder for the deep link
    const deepLinkFolder = path.join(announcementDir, id);
    if (!fs.existsSync(deepLinkFolder)) {
        fs.mkdirSync(deepLinkFolder);
    }

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>${title}</title>
    
    <!-- Open Graph (Facebook/WhatsApp/LinkedIn) -->
    <meta property="og:site_name" content="Philately World">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${descText}">
    <meta property="og:url" content="https://philatelyworld.in/announcement/${id}/">
    <meta property="og:type" content="article">

    <!-- WhatsApp specific image optimization -->
    <meta property="og:image" itemprop="image" content="${imgUrl}">
    <meta property="og:image:secure_url" content="${imgUrl}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="675">
    
    <!-- Twitter Cards -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${descText}">
    <meta name="twitter:image" content="${imgUrl}">

    <!-- Auto-redirect -->
    <meta http-equiv="refresh" content="0; url='../../index.html?announcement=${id}'" />
    <script>window.location.replace("../../index.html?announcement=${id}");</script>

    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-0K58TP8LVP"></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-0K58TP8LVP');
    </script>
</head>
<body>
    <p>Redirecting to <a href="../../index.html?announcement=${id}">${title}</a>...</p>
</body>
</html>`;

    fs.writeFileSync(path.join(deepLinkFolder, 'index.html'), html);
    generatedCount++;
});

console.log(`\n✅ Generated ${generatedCount} announcement preview folders.`);
