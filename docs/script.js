/**
 * Philately World - Restored & Optimized Engine
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
    searchInput.addEventListener('input', (e) => filterStamps(e.target.value));

    const backToTopBtn = document.getElementById('backToTop');
    window.addEventListener('scroll', () => {
        const header = document.querySelector('header');
        const backToTopBtn = document.getElementById('backToTop');
    
        // 1. Handle Logo Swap (is-pinned)
        if (window.scrollY > 50) {
            header.classList.add('is-pinned');
        } else {
            header.classList.remove('is-pinned');
        }
    
        // 2. Handle Back to Top Button Visibility
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
    document.getElementById('prevBtn').onclick = () => changeSlide(-1);
    document.getElementById('nextBtn').onclick = () => changeSlide(1);
    
    window.onclick = (event) => {
        const modal = document.getElementById("myModal");
        if (event.target === modal) closeModal();
    };
}
document.addEventListener('keydown', (e) => {
    const modal = document.getElementById("myModal");
    if (modal.style.display === "flex") {
        const stamp = stamps[state.currentStampIdx];
        
        // Only allow sliding if there is more than 1 image
        if (stamp.imageCount > 1) {
            if (e.key === "ArrowLeft") changeSlide(-1);
            if (e.key === "ArrowRight") changeSlide(1);
        }
        
        if (e.key === "Escape") closeModal();
    }
});
function setCurrency(type) {
    state.currency = type;
    document.querySelectorAll('.curr-btn').forEach(btn => 
        btn.classList.toggle('active', btn.id === `btn${type}`)
    );
    const searchTerm = document.getElementById('stampSearch').value;
    filterStamps(searchTerm);
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
        // Restore Sold Out logic
        const soldOutClass = stamp.isSoldOut ? 'sold-out' : '';
        const soldOutBadge = stamp.isSoldOut ? '<div class="sold-out-badge">Sold Out</div>' : '';
        const btnLabel = stamp.isSoldOut ? 'Sold Out' : 'Buy Now';
        const btnLink = stamp.isSoldOut ? 'javascript:void(0)' : `https://wa.me/${CONFIG.whatsappNumber}?text=Interested in: ${encodeURIComponent(stamp.name)}`;

        return `
            <article class="stamp-card ${soldOutClass}">
                ${soldOutBadge}
                <div class="img-container">
                    ${stamp.isSoldOut ? '<div class="sold-out-badge">Sold Out</div>' : ''}
                    <img src="${CONFIG.baseImgPath}/${stamp.folder}/1.jpg" 
                         alt="${stamp.name}" 
                         loading="lazy"
                         style="cursor: zoom-in;" 
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
                        <a href="${btnLink}" 
                           class="buy-btn ${stamp.isSoldOut ? 'disabled' : ''}" 
                           target="${stamp.isSoldOut ? '_self' : '_blank'}">
                           ${btnLabel}
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
    const modal = document.getElementById("myModal");
    modal.style.display = "flex"; // Shows the lightbox
    document.body.style.overflow = "hidden"; // Prevents background scrolling
}

function updateLightbox() {
    const stamp = stamps[state.currentStampIdx];
    const modalImg = document.getElementById("img01");
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");

    // Set the image source
    modalImg.src = `${CONFIG.baseImgPath}/${stamp.folder}/${state.currentImgIdx}.jpg`;
    
    // Update caption text
    document.getElementById("caption").textContent = `${stamp.name} (${state.currentImgIdx}/${stamp.imageCount})`;

    // Hide or Show navigation arrows based on image count
    if (stamp.imageCount <= 1) {
        prevBtn.style.display = "none";
        nextBtn.style.display = "none";
    } else {
        prevBtn.style.display = "block";
        nextBtn.style.display = "block";
    }
}

function changeSlide(n) {
    const stamp = stamps[state.currentStampIdx];
    state.currentImgIdx += n;
    if (state.currentImgIdx > stamp.imageCount) state.currentImgIdx = 1;
    if (state.currentImgIdx < 1) state.currentImgIdx = stamp.imageCount;
    updateLightbox();
}

function closeModal() {
    document.getElementById("myModal").style.display = "none";
    document.body.style.overflow = "auto";
}

function updateStatusLine() {
    const el = document.getElementById('lastUpdated');
    if (el) {
        const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        el.textContent = `Catalog Updated: ${date} • ${stamps.length} Unique Pieces`;
    }
}
