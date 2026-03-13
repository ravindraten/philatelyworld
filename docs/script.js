/**
 * Philately World - Optimized Engine
 */

const CONFIG = {
    whatsappNumber: "31633467712",
    eurRate: 0.00935,
    baseImgPath: "https://filedn.eu/lbu0dswNxxUBjQKg0kNdmLu/philatelyworld-images/images",

    // 2. CURRENCY CONFIGURATION
    eurRate: 0.011, // Fallback rate
    apiURL: "https://open.er-api.com/v6/latest/EUR",
    wuAdjustment: 1.02 // Adds 2% markup to simulate Western Union spread
};

let state = {
    currency: 'INR',
    currentStampIdx: 0,
    currentImgIdx: 1
};

// --- REPLACE YOUR DOMContentLoaded BLOCK ---
document.addEventListener('DOMContentLoaded', () => {
    // First, get the live exchange rate
    updateLiveExchangeRate();
    const urlParams = new URLSearchParams(window.location.search);
    const itemID = urlParams.get('item');

    if (itemID) {
        const selectedStamp = stamps.find(s => s.desc.includes(itemID));
        
        if (selectedStamp) {
            updateMetaTags(selectedStamp, itemID);
            const filtered = [selectedStamp];
            renderGallery(filtered);
            
            // FIX: Insert the button at the TOP of the results grid
            const grid = document.getElementById('stampGrid');
            if (grid) {
                grid.insertAdjacentHTML('beforebegin', 
                    `<div style="text-align:center; margin: 20px 0;">
                        <button onclick="window.location.href='index.html'" class="toggle-btn active" style="padding: 12px 24px; font-weight: bold;">
                            ← View Full Collection
                        </button>
                    </div>`
                );
            }
        } else {
            initGallery();
        }
    } else {
        initGallery();
    }
    
    initEventListeners();
    updateStatusLine();
});
/**
 * Fetches Live EUR to INR rate and calculates the WU conversion
 */
async function updateLiveExchangeRate() {
    try {
        const response = await fetch(CONFIG.apiURL);
        const data = await response.json();
        
        if (data.result === "success") {
            const marketRateINR = data.rates.INR;
            // Western Union adjustment: Buyers pay more Rupees per Euro
            const adjustedRateINR = marketRateINR * CONFIG.wuAdjustment;
            
            // Set global rate: 1 INR = X EUR
            CONFIG.eurRate = 1 / adjustedRateINR; 

            // Update Header Status
            const statusEl = document.getElementById('lastUpdatedFXRate');
            if (statusEl) {
                const date = new Date().toLocaleDateString();
                statusEl.innerText = `Live WU Rate: 1 INR = ${CONFIG.eurRate.toFixed(4)} EUR (Updated: ${date})`;
            }
        }
    } catch (error) {
        console.error("FX fetch failed, using fallback.");
    }
}

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
    // Replace your scroll listener block with this:
// Find your scroll listener in script.js and update it
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    const backToTopBtn = document.getElementById('backToTop');

    // 1. Toggle Header Pinning (Keep this for the search bar)
    if (window.scrollY > 50) {
        header.classList.add('is-pinned');
    } else {
        header.classList.remove('is-pinned');
    }

    // 2. Back to Top Button visibility
    if (window.scrollY > 400) {
        backToTopBtn.classList.add('visible');
    } else {
        backToTopBtn.classList.remove('visible');
    }
    
    // NOTE: Removed the logic that previously added .scrolled-hidden to the promo card
}, { passive: true });

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

    // Privacy Policy Modal Controls
    const privacyModal = document.getElementById("privacyModal");
    const privacyBtn = document.getElementById("privacyTrigger");
    const privacyClose = document.getElementById("privacyClose");

    if (privacyBtn) {
        privacyBtn.onclick = () => {
            privacyModal.style.display = "flex";
            document.body.style.overflow = "hidden";
        };
    }

    if (privacyClose) {
        privacyClose.onclick = () => {
            privacyModal.style.display = "none";
            document.body.style.overflow = "auto";
        };
    }
    // Close privacy modal if clicking outside the content
    window.addEventListener('click', (event) => {
        if (event.target === privacyModal) {
            privacyModal.style.display = "none";
            document.body.style.overflow = "auto";
        }
    });
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
    
    // Update button UI
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.classList.toggle('active', btn.id === `btn${type}`);
    });

    // Re-run the filter logic, which triggers renderGallery
    const searchInput = document.getElementById('stampSearch');
    filterStamps(searchInput ? searchInput.value : "");
}

function renderGallery(data) {
    const grid = document.getElementById('stampGrid');
    const sidebar = document.getElementById('sidebarPromo');
    const searchInput = document.getElementById('stampSearch');
    
    if (!grid) return;

    const isSearching = searchInput && searchInput.value.trim() !== "";
    const urlParams = new URLSearchParams(window.location.search);
    const isSharedLink = urlParams.has('item');

    // 1. Handle Sidebar (Hero Card)
    if (sidebar) {
        if (!isSearching && !isSharedLink) {
            sidebar.innerHTML = `
                <article class="stamp-card promo-card">
                    <div class="promo-content">
                        <div class="promo-badge">Featured Announcement</div>
                        <h2>Exclusives</h2>
                        <p>Receive 150 stamps in your mail box for FREE! When you follow our</p>
                        <div class="promo-actions">
                            <a href="https://whatsapp.com/channel/0029VaafwRWAojYq5jzkJJ2u" target="_blank" class="promo-btn">WhatsApp Channel</a>
                        </div>
                        <div class="promo-actions">
                            <a href="https://www.instagram.com/philately_world" target="_blank" class="promo-btn">Instagram</a>
                        </div>
                        <div class="promo-actions">
                            <a href="https://x.com/philately_wrld?s=21&t=QZ8DtcmMWFm0zBxcSOur3w" target="_blank" class="promo-btn">X account</a>
                        </div>
                        <div class="promo-actions">
                            <a href="https://www.facebook.com/share/1DosA1sNnK/?mibextid=wwXIfr" target="_blank" class="promo-btn">Facebook Page</a>
                        </div>
                        <p>AWESOME!!</p>
                        <p><a href="https://wa.me/31633467712" target="_blank" class="buy-btn">Now share mailing address</a></p>
                    </div>
                </article>`;
            sidebar.style.display = "block";
        } else {
            sidebar.innerHTML = "";
            sidebar.style.display = "none";
        }
    }

    // 2. Handle Stamp Grid
    if (data.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 40px;">No stamps found.</p>';
        return;
    }

    grid.innerHTML = data.map(stamp => {
        const itemID = stamp.desc.split(':')[0].trim();
        const shareUrl = `${window.location.origin}${window.location.pathname}?item=${encodeURIComponent(itemID)}`;
        
        // --- CURRENCY LOGIC ---
        let displayPrice;
        if (state.currency === 'EUR') {
            // Convert INR to EUR using the live/fallback rate
            const priceEUR = stamp.priceINR * CONFIG.eurRate;
            displayPrice = `€${priceEUR.toFixed(2)}`;
        } else {
            displayPrice = `₹${stamp.priceINR}`;
        }

        return `
            <div class="stamp-card ${stamp.isSoldOut ? 'sold-out' : ''}">
                ${stamp.isSoldOut ? '<div class="sold-out-badge">Sold Out</div>' : ''}
                <div class="img-container">
                    <img src="${CONFIG.baseImgPath}/${stamp.folder}/1.jpg" 
                        alt="${stamp.name}" 
                        onclick="openLightbox(${stamps.indexOf(stamp)})">
                    <div class="photo-badge">${stamp.imageCount} Photos</div>
                </div>
                <div class="details">
                    <h3>${stamp.name}</h3>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <span class="stamp-year">${stamp.year}</span>
                        <small style="color: var(--text-light)">${stamp.country}</small>
                    </div>

                    <div class="stamp-desc">${stamp.desc}</div>
                    
                    <div class="price-row">
                        <div class="price">${displayPrice}</div>
                        <div class="action-buttons">
                            <button class="share-icon-btn" onclick="copyShareLink('${shareUrl}', this)" title="Copy Share Link">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg>
                            </button>
                            
                            ${stamp.isSoldOut 
                                ? `<button class="buy-btn disabled" disabled>Sold Out</button>`
                                : (() => {
                                    // 1. Extract the Item ID (e.g., RN4112) from the description
                                    const itemID = stamp.desc.split(':')[0];
                                    // 2. Construct the direct link to this listing
                                    const listingUrl = `https://philatelyworld.in/index.html?item=${itemID}`;
                                    // 3. Create the encoded WhatsApp message
                                    const message = encodeURIComponent(
                                        `Hi, I am interested in buying :\n${stamp.name}\nLink: ${listingUrl}`
                                    );
                                return `<a href="https://wa.me/${CONFIG.whatsappNumber}?text=${message}" 
                                        target="_blank" class="buy-btn">Buy Now</a>`;
                                    })()
                                }
                        </div>
                    </div>
                </div>
            </div>`;
    }).join('');
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