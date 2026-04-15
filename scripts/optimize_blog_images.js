const fs = require('fs');
const path = require('path');

const blogDir = path.join(__dirname, '..', 'docs', 'blog');
const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.html'));

files.forEach(file => {
    const filePath = path.join(blogDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    content = content.replace(/<img([^>]*?)>/gi, (match, attrs) => {
        if (attrs.includes('loading="lazy"')) return match;

        const closingBracket = match.endsWith('/>') ? '/>' : '>';
        const trimmedAttrs = attrs.trim();

        return `<img${trimmedAttrs ? ' ' + trimmedAttrs : ''} loading="lazy" decoding="async" width="800" height="600"${closingBracket === '/>' ? ' /' : ''}>`;
    });

    fs.writeFileSync(filePath, content);
    console.log(`Updated: ${file}`);
});

console.log(`\nUpdated ${files.length} blog pages with lazy loading and decoding.`);
