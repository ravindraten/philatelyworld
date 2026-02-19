
// Helper function to build the image path
// This assumes your images are named 1.jpg, 2.jpg, etc.
function getImagePath(stampIndex, imgNum) {
    const stamp = stamps[stampIndex];
    return `images/${stamp.folder}/${imgNum}.jpg`;
}

// 2. CONFIGURATION
const phoneNumber = "31633467712"; 
const exchangeRate = 0.011; 
let currentCurrency = 'INR';
let currentStampIndex = 0;
let currentImageIndex = 0;

// 3. CORE FUNCTIONS
function setCurrency(type) {
    currentCurrency = type;
    document.getElementById('btnINR').classList.toggle('active', type === 'INR');
    document.getElementById('btnEUR').classList.toggle('active', type === 'EUR');
    filterStamps();
}

function displayStamps(data) {
    const grid = document.getElementById('stampGrid');
    grid.innerHTML = ''; 

    data.forEach((stamp) => {
        // Find the ORIGINAL index of this stamp in the master 'stamps' array
        // This ensures the Lightbox opens the correct folder even after filtering
        const originalIndex = stamps.findIndex(s => s.name === stamp.name);
        
        let displayPrice = currentCurrency === 'EUR' 
            ? `€${(stamp.priceINR * exchangeRate).toFixed(2)}`
            : `₹${stamp.priceINR.toLocaleString('en-IN')}`;

        const thumbUrl = `images/${stamp.folder}/1.jpg`;

        const card = document.createElement('div');
        card.className = `stamp-card ${stamp.isSoldOut ? 'sold-out' : ''}`;
        
        card.innerHTML = `
            <div class="img-container">
                ${stamp.isSoldOut ? '<div class="sold-out-badge">Sold Out</div>' : ''}
                <img src="${thumbUrl}" alt="${stamp.name}" onclick="openLightbox(${originalIndex})">
                <div class="photo-badge">${stamp.imageCount} Photos</div>
            </div>
            <div class="details" style="padding:20px;">
            <h3 style="margin: 0 0 10px 0; font-size: 1.4rem; font-weight: 700; color: var(--primary);">${stamp.name}</h3>
            
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                <span class="stamp-year">Year:${stamp.year}</span>
                <span class="meta-location" style="margin:0;">${stamp.country}</span>
            </div>

                <p class="stamp-desc">${stamp.desc}</p>
                
                <div class="price-row">
                    <span class="price">${displayPrice}</span>
                    <a href="https://wa.me/${phoneNumber}?text=Interested in buying: ${stamp.desc}" class="buy-btn">
                        ${stamp.isSoldOut ? 'Sold' : 'Buy Now'}
                    </a>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

// 1. Updated Filter Function
function filterStamps() {
    let term = document.getElementById('stampSearch').value.toLowerCase();
    
    // Filter the original 'stamps' array
    let filtered = stamps.filter(s => 
        `${s.name} ${s.country} ${s.year} ${s.desc}`.toLowerCase().includes(term)
    );
    
    // Re-render only the filtered results
    displayStamps(filtered);
}

// 4. LIGHTBOX
function openLightbox(stampIdx) {
    currentStampIndex = stampIdx;
    currentImageIndex = 0;
    updateLightbox();
    document.getElementById("myModal").style.display = "block";
}

function updateLightbox() {
    const stamp = stamps[currentStampIndex];
    // We use the currentImageIndex + 1 because images are named 1.jpg, 2.jpg...
    document.getElementById("img01").src = getImagePath(currentStampIndex, currentImageIndex + 1);
    document.getElementById("caption").innerHTML = `${stamp.name} (${currentImageIndex + 1}/${stamp.imageCount})`;
}

function changeSlide(n) {
    const stamp = stamps[currentStampIndex];
    currentImageIndex = (currentImageIndex + n + stamp.imageCount) % stamp.imageCount;
    updateLightbox();
}

function closeModal() { document.getElementById("myModal").style.display = "none"; }

// Initialize
displayStamps(stamps);

// Listen for Keyboard Events
document.addEventListener('keydown', function(event) {
    // Only trigger if the Lightbox is currently visible
    const modal = document.getElementById("myModal");
    if (modal.style.display === "block") {
        
        if (event.key === "ArrowLeft") {
            // Left Arrow - Previous Image
            changeSlide(-1);
        } else if (event.key === "ArrowRight") {
            // Right Arrow - Next Image
            changeSlide(1);
        } else if (event.key === "Escape") {
            // Escape Key - Close Lightbox
            closeModal();
        }
    }
});

function updateFooter() {
    const footerElement = document.getElementById('lastUpdated');
    if (footerElement) {
        const today = new Date();
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const formattedDate = today.toLocaleDateString('en-US', options);
        
        // This will now display right under your search bar
        footerElement.innerHTML = `Catalog Updated: ${formattedDate} • ${stamps.length} Exclusive Listings`;
    }
}

// Call this at the very end of your script
updateFooter();
