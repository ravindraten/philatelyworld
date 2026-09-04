const fs = require('fs');
const path = require('path');

const blogDir = path.join(__dirname, '..', 'docs', 'blog');

const cssBlock = `
    #backToTop {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 45px;
      height: 45px;
      border-radius: 50%;
      background: #1f7a4d;
      color: #fff;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      opacity: 0;
      visibility: hidden;
      transition: 0.3s;
      z-index: 1001;
    }

    #backToTop.visible {
      opacity: 1;
      visibility: visible;
    }
`;

const bodyBlock = `
  <button id="backToTop" title="Go to top">&uarr;</button>

  <script>
    (function () {
      var backToTopBtn = document.getElementById('backToTop');
      window.addEventListener('scroll', function () {
        if (window.scrollY > 400) {
          backToTopBtn.classList.add('visible');
        } else {
          backToTopBtn.classList.remove('visible');
        }
      }, { passive: true });
      backToTopBtn.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    })();
  </script>
`;

const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.html'));
let done = 0, skipped = 0;

files.forEach(file => {
  const filePath = path.join(blogDir, file);
  let html = fs.readFileSync(filePath, 'utf8');

  if (html.includes('id="backToTop"')) { skipped++; return; }

  let changed = false;

  if (html.includes('</style>') && !/backToTop\.visible/.test(html)) {
    html = html.replace('</style>', cssBlock + '\n  </style>');
    changed = true;
  }

  if (html.includes('</body>')) {
    html = html.replace('</body>', bodyBlock + '\n</body>');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, html, 'utf8');
    done++;
  } else {
    console.log('WARN: could not inject into', file);
  }
});

console.log(`Added #backToTop to ${done} files (${skipped} already had it / skipped).`);
