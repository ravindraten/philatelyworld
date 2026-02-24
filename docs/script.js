/**
 * Philately World - Optimized Engine
 */

const CONFIG = {
    whatsappNumber: "31633467712",
    eurRate: 0.011,
    baseImgPath: "images"
};

let state = {
    currency: 'INR',
    currentStampIdx: 0,
    currentImgIdx: 1
};

document.addEventListener('DOMContentLoaded', () => {
    initGallery();
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

function renderGallery(data) {
    const grid = document.getElementById('stampGrid');
    if (!data.length) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 40px;">No stamps found.</p>';
        return;
    }

    grid.innerHTML = data.map(stamp => {
        const originalIdx = stamps.findIndex(s => s.name === stamp.name);
        const priceDisplay = state.currency === 'EUR' 
            ? `€${(stamp.priceINR * CONFIG.eurRate).toFixed(2)}`
            : `₹${stamp.priceINR.toLocaleString('en-IN')}`;
        
        return `
            <article class="stamp-card ${stamp.isSoldOut ? 'sold-out' : ''}">
                <div class="img-container">
                    ${stamp.isSoldOut ? '<div class="sold-out-badge">Sold Out</div>' : ''}
                    <img src="${CONFIG.baseImgPath}/${stamp.folder}/1.jpg" 
                         alt="${stamp.name}" 
                         loading="lazy"
                         onclick="openLightbox(${originalIdx})">
                    <div class="photo-badge">${stamp.imageCount} Photos</div>
                </div>
                <div class="details">
                    <h3>${stamp.name}</h3>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <span class="stamp-year">${stamp.year}</span>
                        <small style="color: #64748b">${stamp.country}</small>
                    </div>
                    <p class="stamp-desc">${stamp.desc}</p>
                    <div class="price-row">
                        <span class="price">${priceDisplay}</span>
                        <a href="${stamp.isSoldOut ? 'javascript:void(0)' : `https://wa.me/${CONFIG.whatsappNumber}?text=Interested in: ${encodeURIComponent(stamp.name)}`}" 
                           class="buy-btn ${stamp.isSoldOut ? 'disabled' : ''}" 
                           target="${stamp.isSoldOut ? '_self' : '_blank'}">
                           ${stamp.isSoldOut ? 'Sold Out' : 'Buy Now'}
                        </a>
                    </div>
                </div>
            </article>`;
    }).join('');
}

function filterStamps(term) {
    const cleanTerm = term.toLowerCase().trim();
    const filtered = stamps.filter(s => 
        `${s.name} ${s.country} ${s.year}`.toLowerCase().includes(cleanTerm)
    );
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
    modalImg.src = `${CONFIG.baseImgPath}/${stamp.folder}/${state.currentImgIdx}.jpg`;
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
        btn.innerText = "Copied!";
        btn.style.background = "#22c55e";
        setTimeout(() => {
            btn.innerText = "Copy";
            btn.style.background = "";
        }, 2000);
    });
}