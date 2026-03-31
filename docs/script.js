/**
 * Philately World - Optimized Engine
 */

const CONFIG = {
    whatsappNumber: "31633467712",
    eurRate: 0.00935,
    baseImgPath: "https://filedn.eu/lbu0dswNxxUBjQKg0kNdmLu/philatelyworld-images/images",

    // Feature Switches
    showAnnouncement: true,
    showPromo: false,
    announcementFiles: ['1.html', '2.html', '3.html', '4.html'], // Place your HTML files in the 'announcement' folder

    // 2. CURRENCY CONFIGURATION
    eurRate: 0.011, // Fallback rate
    apiURL: "https://open.er-api.com/v6/latest/EUR",
    wuAdjustment: 1.02 // Adds 2% markup to simulate Western Union spread
};

let state = {
    currency: 'INR',
    currentStampIdx: 0,
    currentImgIdx: 1,
    statusFilter: 'available' // Keep track of the active tab
};

document.addEventListener('DOMContentLoaded', () => {
    // First, get the live exchange rate
    updateLiveExchangeRate();
    const urlParams = new URLSearchParams(window.location.search);
    const itemID = urlParams.get('item');

    // --- NEW PERSISTENCE LOGIC ---
    // Check if we have a saved tab from this session, otherwise default to 'available'
    const savedTab = sessionStorage.getItem('activeTab');
    if (savedTab) {
        state.statusFilter = savedTab;
    } else {
        state.statusFilter = 'available';
    }

    // 1. Initialize Event Listeners & UI First
    initEventListeners();
    updateStatusLine();
    updateFilterCounts();

    // Dynamically set the active tab UI based on the state
    const tabs = document.querySelectorAll('.filter-tab');
    tabs.forEach(tab => {
        if (tab.getAttribute('data-status') === state.statusFilter) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
    // --- END NEW PERSISTENCE LOGIC ---
    // 2. Handle Routing (Deep Links vs Default Load)
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

            // Render ONLY this specific stamp
            renderGallery(filtered);

            // Insert the button at the TOP of the results grid
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
            // If ID not found, load everything
            initGallery();
        }
    } else {
        // If no special link parameters, load everything
        initGallery();
    }
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
    // Instead of renderGallery(stamps), use the filter logic
    filterStamps("");
}

function initEventListeners() {
    const searchInput = document.getElementById('stampSearch');

    // Filter on input (conditionally routing to the correct grid renderer)
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value;
        const urlParams = new URLSearchParams(window.location.search);
        if (term) urlParams.set('q', term); else urlParams.delete('q');
        window.history.replaceState({}, '', `${window.location.pathname}?${urlParams.toString()}`);

        if (document.getElementById('announcementsGrid')) {
            renderAllAnnouncementsPage(term);
        } else {
            filterStamps(term);
        }
    });

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

            // SAVE current tab to session storage so back-button works
            sessionStorage.setItem('activeTab', state.statusFilter);

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
        if (!isSearching && (urlParams.get('item') === null || isPromoShared)) {
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

            let sidebarContent = '';

            if (CONFIG.showAnnouncement && CONFIG.announcementFiles && CONFIG.announcementFiles.length > 0) {
                // Feature the button AT THE TOP for better visibility on smaller screens
                sidebarContent += `
                <a href="all_announcements.html" class="buy-btn" style="display: block; width: 100%; text-align: center; margin-bottom: 20px; text-decoration: none; padding: 12px; border-radius: 8px;">View All Announcements</a>
                
                <div class="announcement-carousel-container stamp-card" style="position: relative; margin-bottom: 12px; width: 100%; overflow: hidden;">
                    <div class="announcement-carousel-track" id="announcementCarouselTrack" style="display: flex; height: 100%; transition: transform 0.5s ease-in-out;">
                    </div>
                    
                    ${CONFIG.announcementFiles.length > 1 ? `
                    <div class="carousel-indicators" id="carouselIndicators" style="position: absolute; bottom: 15px; width: 100%; display: flex; justify-content: center; gap: 8px; z-index: 10;">
                    </div>
                    ` : ''}
                </div>`;

                // Trigger the carousel initialization
                setTimeout(initAnnouncementCarousel, 0);
            }

            if (CONFIG.showPromo) {
                // Feature card in the sidebar utilizing the universal stamp-card format
                sidebarContent += `
                <div class="stamp-card" style="margin-bottom: 20px;">
                    <div class="img-container">
                        <img src="https://filedn.eu/lbu0dswNxxUBjQKg0kNdmLu/philatelyworld-images/images/largest-stamp.jpg" alt="The Royal Collection">
                        <span class="photo-badge" style="background: var(--primary);">Promotion</span>
                    </div>
                    <div class="details">
                        <h3>Get 150 stamps for FREE!</h3>
                        <p class="stamp-desc">Follow our social channels to claim yours.</p>
                        <div class="action-buttons" style="margin-top: auto; justify-content: flex-end;">
                            <a href="${CONFIG.whatsappNumber}?text=Hi!%20I'm%20interested%20in%20The%20Royal%20Collection%20you%20featured." target="_blank" class="buy-btn" style="text-align: center;"><i class="fab fa-whatsapp"></i> Inquire</a>
                        </div>
                    </div>
                </div>`;
            }

            sidebar.innerHTML = sidebarContent;
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
        // --- REPLACE THIS SECTION INSIDE renderGallery in script.js ---

        if (state.statusFilter === 'blog') {
            return `
                <div class="stamp-card blog-card">
                    <a href="${stamp.url || '#'}" class="blog-link-wrapper" style="text-decoration: none; color: inherit;">
                        <div class="img-container" style="cursor: pointer;">
                            <img src="${CONFIG.baseImgPath}/${stamp.folder}/1.jpg" alt="${stamp.name}">
                            <div class="photo-badge">Article</div>
                        </div>
                    </a>
                    <div class="details">
                        <div class="promo-badge" style="background:#e0f2fe; margin-bottom:8px;">Philately Blog</div>
                        <a href="${stamp.url || '#'}" style="text-decoration: none; color: inherit;">
                            <h3 style="cursor: pointer;">${stamp.name}</h3>
                        </a>
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
                        <a href="${stamp.blogUrl}" class="stamp-blog-indicator" title="Read related blog post" style="position: absolute; top: 10px; left: 10px; background: #f6bbbb; padding: 6px; border-radius: 50%; display: flex; box-shadow: 0 2px 8px rgba(0,0,0,0.3); border: 2px solid white; onclick="event.stopPropagation();">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"></path>
                                <path d="M18 14h-8"></path>
                                <path d="M15 18h-5"></path>
                                <path d="M10 6h8v4h-8V6Z"></path>
                            </svg>
                        </a>
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

// --- NEW CAROUSEL LOGIC ---
async function initAnnouncementCarousel() {
    const track = document.getElementById('announcementCarouselTrack');
    const indicators = document.getElementById('carouselIndicators');
    if (!track) return;

    // Safety check so we don't fetch/initialize multiple times
    if (track.children.length > 0) return;

    // LIMIT TO ONLY 2 ANNOUNCEMENTS FOR THE CAROUSEL
    const carouselFiles = CONFIG.announcementFiles.slice(0, 2);

    // Fetch only the sliced announcement HTML files
    const slidesHTML = await Promise.all(carouselFiles.map(async (file) => {
        try {
            const resp = await fetch(`announcement/${file}`);
            if (!resp.ok) return '';
            const html = await resp.text();

            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            const titleEl = doc.querySelector('h1');
            const categoryEl = doc.querySelector('.blog-container > p');
            const descEl = Array.from(doc.querySelectorAll('p')).find(p => p.textContent.length > 30 && p !== categoryEl && !p.classList.contains('img-caption'));
            const imgEl = doc.querySelector('.img-wrap img');

            const title = titleEl ? titleEl.textContent.trim() : 'Announcement';
            const category = categoryEl ? categoryEl.textContent.trim() : 'News';
            let desc = descEl ? descEl.textContent.trim() : 'Click to read more...';
            if (desc.length > 90) desc = desc.substring(0, 90) + '...';

            const imgSrc = imgEl ? imgEl.getAttribute('src') : 'https://placehold.co/400x300/e2e8f0/475569?text=Announcement';

            const slideInner = `
                <div class="stamp-card" style="margin: 0; border: none; box-shadow: none; height: 100%; border-radius: 0;">
                    <div class="img-container">
                        <img src="${imgSrc}" alt="${title}">
                        <span class="photo-badge" style="background: var(--primary);">${category}</span>
                    </div>
                    <div class="details">
                        <h3>${title}</h3>
                        <p class="stamp-desc" style="display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden;">${desc}</p>
                        <div class="action-buttons" style="margin-top: auto; justify-content: flex-end;">
                            <span class="buy-btn" style="text-align: center;">Read More</span>
                        </div>
                    </div>
                </div>
            `;

            return `<a href="announcement/${file}" class="carousel-slide" style="min-width: 100%; flex-shrink: 0; display: block; text-decoration: none; color: inherit; cursor: pointer; height: 100%;">${slideInner}</a>`;
        } catch (e) {
            console.error('Error loading announcement:', file, e);
            return '';
        }
    }));

    const validSlides = slidesHTML.filter(s => s !== '');
    if (validSlides.length === 0) {
        track.parentElement.style.display = 'none';
        return;
    }

    track.innerHTML = validSlides.join('');

    let currentSlide = parseInt(sessionStorage.getItem('announcementSlide')) || 0;
    const totalSlides = validSlides.length;
    if (currentSlide >= totalSlides) currentSlide = 0;

    updateAnnouncementCarousel(currentSlide, track, null);

    if (indicators && totalSlides > 1) {
        let dotsHTML = '';
        for (let i = 0; i < totalSlides; i++) {
            dotsHTML += `<button class="carousel-dot ${i === currentSlide ? 'active' : ''}" data-idx="${i}" aria-label="Slide ${i + 1}"></button>`;
        }
        indicators.innerHTML = dotsHTML;

        const dots = indicators.querySelectorAll('.carousel-dot');
        updateAnnouncementCarousel(currentSlide, track, dots);

        dots.forEach(dot => {
            dot.addEventListener('click', (e) => {
                currentSlide = parseInt(e.target.getAttribute('data-idx'));
                updateAnnouncementCarousel(currentSlide, track, dots);
                resetAutoSlide();
            });
        });
    }

    // Sync height with a standard stamp card in the grid, but enforce a minimum to prevent clipping the button
    const container = track.closest('.announcement-carousel-container');
    const syncHeight = () => {
        const firstGridCard = document.querySelector('#stampGrid .stamp-card');
        if (container) {
            if (firstGridCard && firstGridCard.offsetHeight > 420) {
                container.style.height = firstGridCard.offsetHeight + 'px';
            } else {
                container.style.height = '420px'; // Safe height that fits title, 4-line desc, and button
            }
        }
    };

    // Aggressively sync to handle delayed image rendering
    syncHeight();
    setTimeout(syncHeight, 100);
    setTimeout(syncHeight, 500);
    setTimeout(syncHeight, 1500);

    // Watch for dynamic grid resizes (e.g., window resize or layout shift)
    const gridEl = document.getElementById('stampGrid');
    if (gridEl && window.ResizeObserver) {
        new ResizeObserver(syncHeight).observe(gridEl);
    }

    // Auto-slide functionality
    let slideInterval;
    function startAutoSlide() {
        if (totalSlides <= 1) return;
        slideInterval = setInterval(() => {
            currentSlide = (currentSlide + 1) % totalSlides;
            updateAnnouncementCarousel(currentSlide, track, indicators ? indicators.querySelectorAll('.carousel-dot') : []);
        }, 5000); // Slide every 5 seconds
    }

    function resetAutoSlide() {
        clearInterval(slideInterval);
        startAutoSlide();
    }

    startAutoSlide();
}

function updateAnnouncementCarousel(idx, track, dots) {
    track.style.transform = `translateX(-${idx * 100}%)`;
    sessionStorage.setItem('announcementSlide', idx);

    if (dots && dots.length > 0) {
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === idx);
        });
    }
}

// Internal cache for search filtering
window.announcementsCache = null;

// Global render function for the dedicated all_announcements.html page
async function renderAllAnnouncementsPage(searchTerm = '') {
    const grid = document.getElementById('announcementsGrid');
    if (!grid) return;

    // 1. Initial Data Fetch and Parse (only happens once)
    if (!window.announcementsCache) {
        grid.innerHTML = '<p style="text-align:center; grid-column:1/-1; padding: 40px; color: var(--text-light);">Loading announcements...</p>';

        if (!CONFIG.announcementFiles || CONFIG.announcementFiles.length === 0) {
            grid.innerHTML = '<p style="text-align:center; grid-column:1/-1; padding: 40px; color: var(--text-light);">No announcements presently available.</p>';
            return;
        }

        try {
            const fetchPromises = CONFIG.announcementFiles.map(file =>
                fetch(`announcement/${file}`)
                    .then(response => response.ok ? response.text() : '')
                    .catch(e => '')
            );
            const texts = await Promise.all(fetchPromises);

            const parser = new DOMParser();
            window.announcementsCache = [];

            texts.forEach((html, index) => {
                if (!html) return;
                const file = CONFIG.announcementFiles[index];
                const doc = parser.parseFromString(html, 'text/html');

                const titleEl = doc.querySelector('h1');
                const categoryEl = doc.querySelector('.blog-container > p');
                const descEl = Array.from(doc.querySelectorAll('p')).find(p => p.textContent.length > 30 && p !== categoryEl && !p.classList.contains('img-caption'));
                const imgEl = doc.querySelector('.img-wrap img');

                const title = titleEl ? titleEl.textContent.trim() : 'Announcement';
                const category = categoryEl ? categoryEl.textContent.trim() : 'News';
                let desc = descEl ? descEl.textContent.trim() : 'Click to read more about this announcement...';
                if (desc.length > 120) desc = desc.substring(0, 120) + '...';

                const imgSrc = imgEl ? imgEl.getAttribute('src') : 'https://placehold.co/400x300/e2e8f0/475569?text=Announcement';

                window.announcementsCache.push({ file, title, category, desc, imgSrc });
            });
        } catch (e) {
            console.error('Error rendering announcements page:', e);
            grid.innerHTML = '<p style="text-align:center; grid-column:1/-1; padding: 40px; color: var(--text-light);">Error loading announcements. Please try again.</p>';
            return; // Abort
        }
    }

    // 2. Filter logic
    const s = (searchTerm || '').toLowerCase().trim();
    const filtered = window.announcementsCache.filter(item =>
        item.title.toLowerCase().includes(s) ||
        item.desc.toLowerCase().includes(s) ||
        item.category.toLowerCase().includes(s)
    );

    if (filtered.length === 0) {
        grid.innerHTML = '<p style="text-align:center; grid-column:1/-1; padding: 40px; color: var(--text-light);">No announcements match your search.</p>';
        return;
    }

    // 3. Render
    let cardsHTML = '';
    filtered.forEach(item => {
        cardsHTML += `
            <div class="stamp-card" style="display: flex; flex-direction: column; height: 100%;">
                <div class="img-container">
                    <img src="${item.imgSrc}" alt="${item.title}">
                    <span class="photo-badge" style="background: var(--primary);">${item.category}</span>
                </div>
                <div class="details" style="display: flex; flex-direction: column; flex-grow: 1;">
                    <h3>${item.title}</h3>
                    <p class="stamp-desc" style="display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden; margin-bottom: 20px; flex-grow: 1;">${item.desc}</p>
                    <div class="action-buttons" style="margin-top: auto; justify-content: flex-end;">
                        <a href="announcement/${item.file}" class="buy-btn" style="text-align: center; text-decoration: none; width: 100%;">Read More</a>
                    </div>
                </div>
            </div>
        `;
    });

    grid.innerHTML = cardsHTML;
}