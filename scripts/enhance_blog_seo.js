const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://philatelyworld.in';
const LOGO_URL = 'https://filedn.eu/lbu0dswNxxUBjQKg0kNdmLu/philatelyworld-images/images/logo.jpg';
const blogDir = path.join(__dirname, '..', 'docs', 'blog');
const datesPath = path.join(__dirname, 'blog_dates.json');
const publishDates = JSON.parse(fs.readFileSync(datesPath, 'utf8'));

function getTagValue(html, pattern) {
    const match = html.match(pattern);
    return match ? match[1].trim() : null;
}

function extractContent(tagHtml) {
    const match = tagHtml.match(/content=(["'])([\s\S]*?)\1/i);
    return match ? match[2].trim() : null;
}

function getMetaProperty(html, prop) {
    const tagMatch = html.match(new RegExp(`<meta[^>]*property=["']${prop}["'][^>]*>`, 'i'));
    if (!tagMatch) return null;
    return extractContent(tagMatch[0]);
}

function getMetaName(html, name) {
    const tagMatch = html.match(new RegExp(`<meta[^>]*name=["']${name}["'][^>]*>`, 'i'));
    if (!tagMatch) return null;
    return extractContent(tagMatch[0]);
}

function hasMeta(html, prop, name) {
    return new RegExp(`(property|name)=["']${prop || name}["']`).test(html);
}

function escapeAttr(value) {
    return value.replace(/"/g, '&quot;');
}

function buildJsonLd({ url, title, description, image, datePublished, schemaType }) {
    return JSON.stringify({
        "@context": "https://schema.org",
        "@type": schemaType,
        "mainEntityOfPage": { "@type": "WebPage", "@id": url },
        "headline": title,
        "description": description,
        "image": image,
        "datePublished": datePublished,
        "url": url,
        "author": {
            "@type": "Organization",
            "name": "Philately World",
            "url": `${SITE_URL}/`
        },
        "publisher": {
            "@type": "Organization",
            "name": "Philately World",
            "url": `${SITE_URL}/`,
            "logo": {
                "@type": "ImageObject",
                "url": LOGO_URL
            }
        }
    }, null, 2);
}

let updatedCount = 0;
let skippedCount = 0;

const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.html'));

files.forEach(file => {
    const filePath = path.join(blogDir, file);
    let html = fs.readFileSync(filePath, 'utf8');
    const original = html;
    const url = `${SITE_URL}/blog/${file}`;
    const changes = [];

    const title = getTagValue(html, /<title>([\s\S]*?)<\/title>/i)
        || getMetaProperty(html, 'og:title')
        || 'Philately World Blog';
    const description = getMetaName(html, 'description')
        || getMetaProperty(html, 'og:description')
        || 'Stamp collecting articles and philatelic news from Philately World.';
    const image = getMetaProperty(html, 'og:image') || LOGO_URL;
    const datePublished = publishDates[file] || null;
    const isCollectionPage = file === 'india-commemoratives.html' || file === 'miniature-sheets-India.html';
    const schemaType = isCollectionPage ? 'CollectionPage' : 'Article';

    if (getMetaProperty(html, 'og:type') === 'website') {
        html = html.replace(
            /(<meta[^>]*property=["']og:type["'][^>]*content=["'])website(["'][^>]*>)/i,
            `$1article$2`
        );
        changes.push('og:type=article');
    }

    if (!hasMeta(html, 'og:site_name', null)) {
        const siteNameTag = `    <meta property="og:site_name" content="Philately World">\n`;
        if (html.includes('</head>')) {
            html = html.replace('</head>', `${siteNameTag}</head>`);
            changes.push('og:site_name');
        }
    }

    if (!/rel=["']canonical["']/i.test(html)) {
        const canonicalTag = `    <link rel="canonical" href="${url}" />\n`;
        html = html.replace('</head>', `${canonicalTag}</head>`);
        changes.push('canonical');
    }

    if (datePublished && !hasMeta(html, 'article:published_time', null)) {
        const publishedTag = `    <meta property="article:published_time" content="${datePublished}T00:00:00+05:30">\n`;
        html = html.replace('</head>', `${publishedTag}</head>`);
        changes.push('article:published_time');
    }

    if (!hasMeta(html, 'article:author', null)) {
        const authorTag = `    <meta property="article:author" content="Philately World">\n`;
        html = html.replace('</head>', `${authorTag}</head>`);
        changes.push('article:author');
    }

    if (!hasMeta(html, null, 'twitter:card')) {
        const twitterBlock = [
            `    <meta name="twitter:card" content="summary_large_image">`,
            `    <meta name="twitter:title" content="${escapeAttr(title)}">`,
            `    <meta name="twitter:description" content="${escapeAttr(description)}">`,
            `    <meta name="twitter:image" content="${image}">`
        ].join('\n') + '\n';
        html = html.replace('</head>', `${twitterBlock}</head>`);
        changes.push('twitter:card');
    }

    const formatJsonLdBlock = indent => `${indent}<script type="application/ld+json">\n${indent}    ${buildJsonLd({ url, title, description, image, datePublished, schemaType })}\n${indent}</script>`;
    const jsonLdRegex = /([\t ]*)<script type="application\/ld\+json">[\s\S]*?<\/script>/g;
    const existingLdBlocks = html.match(jsonLdRegex) || [];
    const articleBlock = existingLdBlocks.find(block => block.includes('"Article"') || block.includes('"CollectionPage"'));

    if (articleBlock) {
        const indent = articleBlock.match(/^([\t ]*)/)[1];
        html = html.replace(articleBlock, () => formatJsonLdBlock(indent));
        changes.push('json-ld enriched');
    } else if (existingLdBlocks.length === 0) {
        html = html.replace('</head>', `${formatJsonLdBlock('    ')}\n</head>`);
        changes.push('json-ld added');
    }

    if (html !== original) {
        fs.writeFileSync(filePath, html, 'utf8');
        console.log(`✅ ${file}: ${changes.join(', ')}`);
        updatedCount++;
    } else {
        skippedCount++;
    }
});

console.log(`\n✅ Enhanced ${updatedCount} blog pages (${skippedCount} already up to date).`);
