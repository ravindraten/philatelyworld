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
    currentImgIdx: 1,
    statusFilter: 'all' // Keep track of the active tab
};

// --- REPLACE YOUR DOMContentLoaded BLOCK ---
document.addEventListener('DOMContentLoaded', () => {
    // First, get the live exchange rate
    updateLiveExchangeRate();
    const urlParams = new URLSearchParams(window.location.search);
    const itemID = urlParams.get('item');

        if (itemID === 'promo') {
        updateMetaTags(null, 'promo'); 
        renderGallery([]); 
        
        // Instead of grid, add the button to the sidebar/container so it's visible
        const container = document.querySelector('.container');
        if (container) {
            container.insertAdjacentHTML('afterbegin', 
                `<div style="text-align:center; margin: 20px 0;">
                    <button onclick="window.location.href='index.html'" class="toggle-btn active" style="padding: 12px 24px; font-weight: bold; cursor: pointer;">
                        ← View Stamp Collection
                    </button>
                </div>`
            );
        }
        } else if (itemID) {
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
    updateFilterCounts();
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
        if (event.target === securityModal) {
            securityModal.style.display = "none";
            document.body.style.overflow = "auto";
        }
    });

    // Inside initEventListeners() function:

    const securityModal = document.getElementById("securityModal");
    const securityBtn = document.getElementById("securityTrigger");
    const securityClose = document.getElementById("securityClose");

    if (securityBtn) {
        securityBtn.onclick = () => {
            securityModal.style.display = "flex";
            document.body.style.overflow = "hidden";
        };
    }

    if (securityClose) {
        securityClose.onclick = () => {
            securityModal.style.display = "none";
            document.body.style.overflow = "auto";
        };
    }

   // Filter Tab Logic
    const filterTabs = document.querySelectorAll('.filter-tab');
    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // UI Update
            filterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Logic Update
            state.statusFilter = tab.getAttribute('data-status');
            const searchVal = document.getElementById('stampSearch').value;
            filterStamps(searchVal);
        });
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
    
    // 1. Update all toggle buttons (Desktop and Mobile)
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.classList.toggle('active', btn.id.includes(type));
    });

    // 2. Determine what is currently being displayed
    const urlParams = new URLSearchParams(window.location.search);
    const itemID = urlParams.get('item');
    const searchInput = document.getElementById('stampSearch');
    const searchTerm = searchInput ? searchInput.value.trim() : "";

    if (itemID && !searchTerm) {
        // If viewing a specific shared item and NOT searching, only re-render that item
        const selectedStamp = stamps.find(s => s.desc.includes(itemID));
        if (selectedStamp) {
            renderGallery([selectedStamp]);
            return;
        }
    }

    // Otherwise, re-run the filter logic with the current search term
    filterStamps(searchTerm);
}

function renderGallery(data) {
    const grid = document.getElementById('stampGrid');
    const sidebar = document.getElementById('sidebarPromo');
    const mainContent = document.querySelector('.main-content');
    const searchInput = document.getElementById('stampSearch');
    
    if (!grid) return;

    const isSearching = searchInput && searchInput.value.trim() !== "";
    const urlParams = new URLSearchParams(window.location.search);
    const isSharedLink = urlParams.has('item');

    // 1. Handle Sidebar (Hero Card)
    if (sidebar) {
        const isPromoShared = urlParams.get('item') === 'promo';
        if (!isSearching && (urlParams.get('item') === null || isPromoShared)){
            // Toggle the centering class
            if (isPromoShared) {
                sidebar.classList.add('centered-view');
                if (mainContent) mainContent.style.display = "none"; // HIDE STAMP AREA
            } else {
                sidebar.classList.remove('centered-view');
                if (mainContent) mainContent.style.display = "block"; // SHOW STAMP AREA
            }
            // Create the unique share URL for the promo
            const promoShareUrl = `${window.location.origin}${window.location.pathname}?item=promo`;
            sidebar.innerHTML = `
                <article class="stamp-card promo-card">
                    <div class="promo-content">
                        <div style="position: absolute; top: 10px; right: 10px;">
                                <button class="share-icon-btn-promo" onclick="copyShareLink('${promoShareUrl}', this)" title="Share Announcement" style="background: rgba(255, 255, 255, 0.2); border-radius: 50%;">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg>
                                </button>
                            </div>
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
                        <p><a href="https://wa.me/31633467712" target="_blank" class="buy-btn">Share mailing address</a></p>
                    </div>
                </article>`;
            sidebar.style.display = "block";
        } else {
            sidebar.classList.remove('centered-view');
            if (mainContent) mainContent.style.display = "block"; // ENSURE SHOWN
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
        // Fix: Use 'stamp' instead of 'item' to match the loop parameter
        if (state.statusFilter === 'blog') {
            return `
                <div class="stamp-card blog-card">
                    <div class="img-container">
                        <img src="${CONFIG.baseImgPath}/${stamp.folder}/1.jpg" alt="${stamp.name}">
                        <div class="photo-badge">Article</div>
                    </div>
                    <div class="details">
                        <div class="promo-badge" style="background:#e0f2fe; margin-bottom:8px;">Philately Blog</div>
                        <h3>${stamp.name}</h3>
                        <div style="display: flex; gap: 8px; align-items: center;">
                            <span class="stamp-year">${stamp.year}</span>
                            <small style="color: var(--text-light)">${stamp.country}</small>
                        </div>
                        <div class="stamp-desc">${stamp.desc}</div>
                        <div class="price-row" style="justify-content: flex-end;">
                            <a href="${stamp.url || '#'}" class="buy-btn" style="background:#e0f2fe">Read Post</a>
                        </div>
                    </div>
                </div>`;
        }
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
                        ${stamp.blogUrl ? `
                        <div class="stamp-blog-indicator" title="Read related blog post" style="position: absolute; top: 10px; left: 10px; background: #cbc9f5; padding: 6px; border-radius: 50%; display: flex; box-shadow: 0 2px 8px rgba(0,0,0,0.3); border: 2px solid white;">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"></path>
                                <path d="M18 14h-8"></path>
                                <path d="M15 18h-5"></path>
                                <path d="M10 6h8v4h-8V6Z"></path>
                            </svg>
                        </div>
                    ` : ''}
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
    
    // Switch data source based on active tab
    const activeData = (state.statusFilter === 'blog') ? blogPosts : stamps;

    const filtered = activeData.filter(item => {
        // 1. Text Search Match
        const textMatch = !term || (
            item.name.toLowerCase().includes(term) ||
            item.country.toLowerCase().includes(term) ||
            (item.desc && item.desc.toLowerCase().includes(term))
        );

        // 2. Status Match (only applicable to stamps)
        if (state.statusFilter === 'blog') return textMatch;

        let statusMatch = true;
        if (state.statusFilter === 'available') statusMatch = !item.isSoldOut;
        if (state.statusFilter === 'sold') statusMatch = item.isSoldOut;

        return textMatch && statusMatch;
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
function updateFilterCounts() {
    const total = stamps.length;
    const sold = stamps.filter(s => s.isSoldOut).length;
    const available = total - sold;
    const blogTotal = blogPosts.length; // From data.js

    const tabs = document.querySelectorAll('.filter-tab');
    tabs.forEach(tab => {
        const status = tab.getAttribute('data-status');
        if (status === 'all') tab.innerText = `All Items (${total})`;
        if (status === 'available') tab.innerText = `Available (${available})`;
        if (status === 'sold') tab.innerText = `Sold Out (${sold})`;
        if (status === 'blog') tab.innerText = `Blog (${blogTotal})`; // Add this
    });
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

function updateMetaTags(stamp, id) {
    let title, desc, imgUrl;
    if (id === 'promo') {
        title = "Philately World - Exclusive Announcement";
        desc = "Get 150 stamps for FREE! Follow our social channels to claim yours.";
        imgUrl = "https://filedn.eu/lbu0dswNxxUBjQKg0kNdmLu/philatelyworld-images/images/logo.jpg";
    } else if (stamp) {
        title = `Philately World: ${stamp.name}`;
        const cleanYear = stamp.year.replace(/<\/?[^>]+(>|$)/g, "");
        desc = `${stamp.country} | ${cleanYear} | Price: ₹${stamp.priceINR}`;
        imgUrl = `${CONFIG.baseImgPath}/${stamp.folder}/1.jpg`;
    }
    // // 1. Clean up the title and description
    // const title = `Philately World: ${stamp.name}`;
    // const cleanYear = stamp.year.replace(/<\/?[^>]+(>|$)/g, "");
    // const desc = `${stamp.country} | ${cleanYear} | Price: ₹${stamp.priceINR}`;
    
    // // 2. Point to the FIRST image in the folder (1.jpg)
    // // Using your CONFIG.baseImgPath for consistency
    // const imgUrl = `${CONFIG.baseImgPath}/${stamp.folder}/1.jpg`;
    
    // 3. Update the Browser Tab Title
    document.title = title;
    
    // 4. Update Open Graph tags for social media previews
    // These IDs must match the meta tags in your index.html
    const tags = {
        'og-title': title,
        'og-desc': desc,
        'og-image': imgUrl,
        'og-url': window.location.href
    };

    for (const [id, value] of Object.entries(tags)) {
        const el = document.getElementById(id);
        if (el) el.setAttribute('content', value);
    }
}