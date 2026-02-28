/**
 * Philately World - Optimized Engine
 */

const CONFIG = {
    whatsappNumber: "31633467712",
    eurRate: 0.00935,
    baseImgPath: "https://filedn.eu/lbu0dswNxxUBjQKg0kNdmLu/philatelyworld-images/images"
};

let state = {
    currency: 'INR',
    currentStampIdx: 0,
    currentImgIdx: 1
};

// --- REPLACE YOUR DOMContentLoaded BLOCK ---
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const itemID = urlParams.get('item');

    if (itemID) {
        // 1. Find the specific stamp in your data.js array
        const selectedStamp = stamps.find(s => s.desc.includes(itemID));
        
        if (selectedStamp) {
            // 2. Update Meta Tags for Link Previews
            updateMetaTags(selectedStamp, itemID);
            
            // 3. Filter gallery as usual
            const filtered = [selectedStamp];
            renderGallery(filtered);
            
            // Show the "View Full Collection" button
            document.getElementById('backToTop').insertAdjacentHTML('beforebegin', 
                `<div style="text-align:center; margin: 20px 0;">
                    <button onclick="window.location.href='index.html'" class="toggle-btn active">View Full Collection</button>
                </div>`
            );
        } else {
            initGallery();
        }
    } else {
        initGallery();
    }
    
    initEventListeners();
    updateStatusLine();
});

function initGallery() {
    renderGallery(stamps);
}

function initEventListeners() {
    const searchInput = document.getElementById('stampSearch');
    
    // Filter on input
    searchInput.addEventListener('input', (e) => filterStamps(e.target.value));

    // Reset view when the search bar is selected (tapped/clicked)
    searchInput.addEventListener('focus', () => {
        // Delay slightly to allow the mobile keyboard to appear first
        setTimeout(() => {
            scrollToGrid();
        }, 300);
    });

    // Handle "Enter" key
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            scrollToGrid();
            searchInput.blur(); 
        }
    });

    const backToTopBtn = document.getElementById('backToTop');
    window.addEventListener('scroll', () => {
        const header = document.querySelector('header');
        if (window.scrollY > 50) {
            header.classList.add('is-pinned');
        } else {
            header.classList.remove('is-pinned');
        }
        if (window.scrollY > 400) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    document.getElementById('closeModal').onclick = closeModal;
    const closeBtn = document.getElementById("closeModal");
    const modal = document.getElementById("myModal");
    document.getElementById('prevBtn').onclick = () => changeSlide(-1);
    document.getElementById('nextBtn').onclick = () => changeSlide(1);
    
    window.onclick = (event) => {
        const modal = document.getElementById("myModal");
        if (event.target === modal) closeModal();
    };
    // 1. Close on Touch (Instant for mobile)
    closeBtn.addEventListener('touchstart', closeModal, { passive: false });
    
    // 2. Close on Click (Fallback for desktop)
    closeBtn.addEventListener('click', closeModal);

    // 3. Fast close when clicking/tapping the dark background
    modal.addEventListener('touchstart', (e) => {
        if (e.target === modal || e.target.classList.contains('modal-image-wrapper')) {
            closeModal(e);
        }
    }, { passive: false });

    modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target.classList.contains('modal-image-wrapper')) {
            closeModal();
        }
    });
    // BHIM Modal Controls
    const qrModal = document.getElementById("qrModal");
    const bhimBtn = document.getElementById("bhimTrigger");
    const qrClose = document.getElementById("qrClose");

    if (bhimBtn) {
        bhimBtn.onclick = () => {
            qrModal.style.display = "flex";
            document.body.style.overflow = "hidden";
        };
    }
    if (qrClose) {
        qrClose.onclick = () => {
            qrModal.style.display = "none";
            document.body.style.overflow = "auto";
        };
    }
}

// Helper to reset view to the top of results
function scrollToGrid() {
    const grid = document.getElementById('stampGrid');
    const header = document.querySelector('header');
    // Calculate offset based on sticky search bar height
    const offset = header ? header.offsetHeight + 10 : 100;
    const elementPosition = grid.getBoundingClientRect().top + window.pageYOffset;
    
    window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth'
    });
}

function setCurrency(type) {
    state.currency = type;
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.classList.toggle('active', btn.id === `btn${type}`);
    });
    filterStamps(document.getElementById('stampSearch').value);
}

// --- REPLACE YOUR renderGallery FUNCTION ---
function renderGallery(data) {
    const grid = document.getElementById('stampGrid');
    const urlParams = new URLSearchParams(window.location.search);
    const isSharedLink = urlParams.has('item');

    if (!data.length) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 40px;">No stamps found.</p>';
        return;
    }

    let html = '';
    
    if (isSharedLink) {
        html += `
            <div style="grid-column: 1/-1; display: flex; justify-content: center; margin-bottom: 20px;">
                <button onclick="window.location.href='index.html'" class="curr-btn" style="width: auto; padding: 8px 20px;">
                    ← View Full Collection
                </button>
            </div>`;
    }

    html += data.map(stamp => {
        const originalIdx = stamps.findIndex(s => s.name === stamp.name);
        const rnMatch = stamp.desc.match(/RN\d+/);
        const rnCode = rnMatch ? rnMatch[0] : "";
        const shareUrl = `${window.location.origin}${window.location.pathname}?item=${rnCode}`;

        // SEO Optimized Alt Text: "Stamp Name - Country (RNCode)"
        const seoAltText = `${stamp.name} - ${stamp.country} Philately ${rnCode}`.replace(/"/g, '&quot;');

        const priceDisplay = state.currency === 'EUR' 
            ? `€${(stamp.priceINR * CONFIG.eurRate).toFixed(2)}`
            : `₹${stamp.priceINR.toLocaleString('en-IN')}`;
        const waMessage = `Interested in Buying: ${stamp.name} (Ref: ${rnCode})\nLink: ${shareUrl}`;
        return `
            <article class="stamp-card ${stamp.isSoldOut ? 'sold-out' : ''}">
                <div class="img-container">
                    ${stamp.isSoldOut ? '<div class="sold-out-badge">Sold Out</div>' : ''}
                    <img 
                        src="${CONFIG.baseImgPath}/${stamp.folder}/1.jpg" 
                        alt="${seoAltText}" 
                        title="${seoAltText}"
                        onclick="openLightbox(${originalIdx})">
                    <div class="photo-badge">${stamp.imageCount} Photos</div>
                </div>
                <div class="details">
                    <h3>${stamp.name}</h3>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <span class="stamp-year">${stamp.year}</span>
                        <small style="color: var(--text-light)">${stamp.country}</small>
                    </div>
                    <p class="stamp-desc">${stamp.desc}</p>
                    
                    <div class="price-row">
                        <span class="price">${priceDisplay}</span>
                        <div class="action-buttons">
                            <button onclick="copyShareLink('${shareUrl}', this)" class="share-icon-btn" title="Copy Share Link">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg>
                            </button>
                            
                            <a href="${stamp.isSoldOut ? 'javascript:void(0)' : `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(waMessage)}`}" 
                               class="buy-btn ${stamp.isSoldOut ? 'disabled' : ''}">
                               ${stamp.isSoldOut ? 'Sold Out' : 'Buy Now'}
                            </a>
                        </div>
                    </div>
                </div>
            </article>`;
    }).join('');

    grid.innerHTML = html;
}

function filterStamps(query) {
    const term = query.toLowerCase().trim();
    
    // If search is cleared, show all
    if (!term) {
        renderGallery(stamps);
        return;
    }

    const filtered = stamps.filter(stamp => {
        return (
            stamp.name.toLowerCase().includes(term) ||
            stamp.country.toLowerCase().includes(term) ||
            // Adding description to the search logic
            (stamp.desc && stamp.desc.toLowerCase().includes(term)) ||
            // Stripping HTML tags from year before searching
            stamp.year.replace(/<[^>]*>/g, '').toLowerCase().includes(term)
        );
    });

    renderGallery(filtered);
}

function openLightbox(idx) {
    state.currentStampIdx = idx;
    state.currentImgIdx = 1;
    updateLightbox();
    document.getElementById("myModal").style.display = "flex";
    document.body.style.overflow = "hidden";
}

function updateLightbox() {
    const stamp = stamps[state.currentStampIdx];
    const modalImg = document.getElementById("img01");
    const rnMatch = stamp.desc.match(/RN\d+/);
    const rnCode = rnMatch ? rnMatch[0] : "ref";
    
    // Create a descriptive filename for the browser/SEO
    const slug = `${stamp.name}-${stamp.country}-${rnCode}`
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-'); // Turn "India Stamp!" into "india-stamp"

    modalImg.src = `${CONFIG.baseImgPath}/${stamp.folder}/${state.currentImgIdx}.jpg`;
    
    // SEO Trick: The 'alt' and 'title' are key for dynamic ranking
    modalImg.alt = `${stamp.name} - Photo ${state.currentImgIdx}`;
    modalImg.title = `Philately World: ${stamp.name} (${rnCode})`;

    document.getElementById("caption").textContent = `${stamp.name} (${state.currentImgIdx}/${stamp.imageCount})`;
    
    const display = stamp.imageCount <= 1 ? "none" : "block";
    document.getElementById("prevBtn").style.display = display;
    document.getElementById("nextBtn").style.display = display;
}

function changeSlide(n) {
    const stamp = stamps[state.currentStampIdx];
    state.currentImgIdx += n;
    if (state.currentImgIdx > stamp.imageCount) state.currentImgIdx = 1;
    if (state.currentImgIdx < 1) state.currentImgIdx = stamp.imageCount;
    updateLightbox();
}

// High-performance close logic
function closeModal(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    const modal = document.getElementById("myModal");
    modal.style.display = "none";
    document.body.style.overflow = "auto";
}

function updateStatusLine() {
    const el = document.getElementById('lastUpdated');
    if (el) {
        const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        el.textContent = `Catalog Updated: ${date} • ${stamps.length} Unique Pieces`;
    }
}

function copyUPI() {
    const upiId = document.getElementById('upiIdText').innerText;
    navigator.clipboard.writeText(upiId).then(() => {
        const btn = document.getElementById('copyBtn');
        btn.innerText = "Copy";
        btn.style.background = "#22c55e";
        setTimeout(() => {
            btn.innerText = "Copied!";
            btn.style.background = "";
        }, 10);
    });
}

// Add this helper function at the bottom of script.js
function copyShareLink(url, btn) {
    navigator.clipboard.writeText(url).then(() => {
        const originalSVG = btn.innerHTML;
        btn.innerHTML = `<span style="font-size:10px; color:#059669; font-weight:bold;">COPIED</span>`;
        setTimeout(() => { btn.innerHTML = originalSVG; }, 2000);
    });
}

// New function to handle link preview data
function updateMetaTags(stamp, id) {
    const title = `Philately World: ${stamp.name}`;
    const desc = `${stamp.country} | Price: ₹${stamp.priceINR}`;
    const imgUrl = `https://philatelyworld.in/images/${stamp.folder}/1.jpg`; // Path to first image

    document.title = title;
    
    // Update Open Graph tags for social previews
    document.getElementById('og-title').setAttribute('content', title);
    document.getElementById('og-desc').setAttribute('content', desc);
    document.getElementById('og-image').setAttribute('content', imgUrl);
    document.getElementById('og-url').setAttribute('content', window.location.href);
}

// --- HUB LOGIC ---

function switchTab(tabName) {
    const gallery = document.getElementById('gallerySection');
    const hub = document.getElementById('hubSection');
    const searchBar = document.querySelector('.search-sticky-container');
    
    // Select tabs by ID (make sure these IDs exist in your HTML)
    const tabGallery = document.getElementById('tabGallery');
    const tabHub = document.getElementById('tabHub');

    if (tabName === 'gallery') {
        gallery.style.display = 'block';
        hub.style.display = 'none';
        searchBar.style.display = 'block';
        tabGallery.classList.add('active');
        tabHub.classList.remove('active');
    } else {
        gallery.style.display = 'none';
        hub.style.display = 'block';
        searchBar.style.display = 'none'; // Keeps header clean for reading articles
        tabHub.classList.add('active');
        tabGallery.classList.remove('active');
        
        // Load the hub content if it's the first time
        if (typeof initHub === "function") initHub();
    }
    
    // Scroll to the top of the content area
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function initHub() {
    const articleList = document.getElementById('articleList');
    const newsList = document.getElementById('newsMiniList');

    // Load Article Sidebar
    articleList.innerHTML = hubContent.articles.map(art => 
        `<li><a href="javascript:void(0)" onclick="loadArticle('${art.id}')">${art.title}</a></li>`
    ).join('');

    // Load News Sidebar
    newsList.innerHTML = hubContent.news.map(n => 
        `<div class="news-item">
            <small>${n.date}</small>
            <h4>${n.headline}</h4>
        </div>`
    ).join('');

    // Load first article by default if main area is empty
    if (!document.getElementById('hubActiveContent').innerHTML.trim()) {
        loadArticle(hubContent.articles[0].id);
    }
}

function loadArticle(id) {
    const article = hubContent.articles.find(a => a.id === id);
    const contentArea = document.getElementById('hubActiveContent');
    if (article) {
        contentArea.innerHTML = `
            <h2 class="article-title">${article.title}</h2>
            <div class="article-body">${article.content}</div>
        `;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}