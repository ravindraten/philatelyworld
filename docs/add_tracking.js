import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dirs = ['blog', 'announcement'];

const gtagScript = `
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-0K58TP8LVP"></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-0K58TP8LVP');
    </script>`;

const goatcounterScript = `
    <script data-goatcounter="https://ravindraten.goatcounter.com/count" async src="//gc.zgo.at/count.js"></script>`;

const stylePattern = /<style>/;
const headClosePattern = /<\/head>/;

let updatedCount = 0;

dirs.forEach(dir => {
    const dirPath = path.join(__dirname, dir);
    if (!fs.existsSync(dirPath)) return;

    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.html'));

    files.forEach(file => {
        const filePath = path.join(dirPath, file);
        let content = fs.readFileSync(filePath, 'utf8');

        let hasGtag = content.includes('googletagmanager.com/gtag');
        let hasGoatcounter = content.includes('goatcounter.com/count');

        if (!hasGtag) {
            if (stylePattern.test(content)) {
                content = content.replace(stylePattern, gtagScript + '\n    <style>');
            } else if (headClosePattern.test(content)) {
                content = content.replace(headClosePattern, gtagScript + '\n</head>');
            }
        }

        if (!hasGoatcounter) {
            if (stylePattern.test(content)) {
                content = content.replace(stylePattern, goatcounterScript + '\n    <style>');
            } else if (headClosePattern.test(content)) {
                content = content.replace(headClosePattern, goatcounterScript + '\n</head>');
            }
        }

        if (!hasGtag || !hasGoatcounter) {
            fs.writeFileSync(filePath, content);
            updatedCount++;
            console.log(`✅ Updated: ${dir}/${file}`);
        }
    });
});

console.log(`\n✅ Updated ${updatedCount} files with SEO and Goatcounter tracking.`);