// 1. STAMP DATABASE
const stamps = [
    { 
        name: "World stamps", 
        country: "worldwide", 
        year: "1970 onwards", 
        priceINR: 8999, 
        isSoldOut: false,
        folder: "world-stamps",
        imageCount: 31,
        //images: ["https://picsum.photos/400/300?random=1", "https://picsum.photos/400/300?random=2"],
        desc: "RN4057: Thick stockbook with stamp collection various.Check the photos. What you see is what you get.(+ shipping Inside India in April 2026).Thick album for free" 
    },
    { 
        name: "Penny Black", 
        country: "UK", 
        year: "1840", 
        priceINR: 45000, 
        isSoldOut: true,
        folder: "penny-black",
        imageCount: 2,
        //images: ["https://picsum.photos/400/300?random=3"],
        desc: "The world's first adhesive postage stamp. Features Queen Victoria." 
    }
];

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

    data.forEach((stamp, index) => {
        let displayPrice = currentCurrency === 'INR' 
            ? `₹${stamp.priceINR.toLocaleString('en-IN')}` 
            : `€${(stamp.priceINR * exchangeRate).toFixed(2)}`;

        // We use getImagePath with '1' to show the first image as the thumbnail
        const thumbUrl = getImagePath(index, 1);

        const card = document.createElement('div');
        card.className = `stamp-card ${stamp.isSoldOut ? 'sold-out' : ''}`;
        card.innerHTML = `
            <div class="img-container">
                ${stamp.isSoldOut ? '<div class="sold-out-badge">Sold Out</div>' : ''}
                <img src="${thumbUrl}" alt="${stamp.name}" onclick="openLightbox(${index})" style="width:100%; cursor:zoom-in;">
                <div class="photo-badge">${stamp.imageCount} Photos</div>
            </div>
            <div class="details" style="padding:20px;">
                <div class="meta" style="font-size:0.8rem; color:var(--accent); font-weight:600;">${stamp.country} • ${stamp.year}</div>
                <h3 style="margin:5px 0;">${stamp.name}</h3>
                <p class="stamp-desc">${stamp.desc}</p>
                <div class="price-row" style="display:flex; justify-content:space-between; align-items:center;">
                    <span class="price">${displayPrice}</span>
                    <a href="https://wa.me/${phoneNumber}?text=Interested in: ${stamp.name}" class="buy-btn" style="background:var(--whatsapp); color:white; padding:8px 15px; border-radius:8px; text-decoration:none; font-size:0.8rem;">
                        ${stamp.isSoldOut ? 'Sold' : 'Buy'}
                    </a>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

function filterStamps() {
    let term = document.getElementById('stampSearch').value.toLowerCase();
    let filtered = stamps.filter(s => 
        `${s.name} ${s.country} ${s.year} ${s.desc}`.toLowerCase().includes(term)
    );
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