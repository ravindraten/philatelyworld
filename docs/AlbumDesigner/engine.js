const { jsPDF } = window.jspdf;
let uploadedImages = [];
let renderTimer;

// --- PERSISTENCE LOGIC (IndexedDB) ---
const DB_NAME = "PhilatelyWorldDB";
const STORE_NAME = "AlbumProject";

function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);
        request.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };
        request.onsuccess = (e) => resolve(e.target.result);
        request.onerror = (e) => reject(e.target.error);
    });
}

async function saveProject() {
    try {
        const db = await openDB();
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        store.put(uploadedImages, "current_images");
        await tx.complete;
    } catch (e) { console.error("Save failed:", e); }
}

async function loadProject() {
    try {
        const db = await openDB();
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const request = store.get("current_images");
        
        request.onsuccess = () => {
            if (request.result && request.result.length > 0) {
                uploadedImages = request.result;
                renderGallery();
            }
            generatePreview(); // Always render (empty or restored)
        };
        request.onerror = () => generatePreview();
    } catch (e) { 
        console.error("Load failed:", e); 
        generatePreview();
    }
}

/**
 * 1. File Handling: Converts uploads to Base64
 */
function handleFiles(files) {
    const status = document.getElementById('file-status');
    status.style.display = 'block';
    status.innerHTML = "<strong>Processing Images...</strong>";

    let loadedCount = 0;
    Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            const originalData = e.target.result;
            const grayscaleData = await convertToGrayscale(originalData);
            
            uploadedImages.push({ 
                name: file.name, 
                data: originalData,
                grayscale: grayscaleData 
            });
            
            loadedCount++;
            if (loadedCount === files.length) {
                renderGallery();
                generatePreview();
                saveProject(); // Persist to IndexedDB
            }
        };
        reader.readAsDataURL(file);
    });
}

/**
 * 1b. Gallery UI: Renders list of uploaded images
 */
function renderGallery() {
    const status = document.getElementById('file-status');
    status.style.display = 'block';
    
    if (uploadedImages.length === 0) {
        status.innerHTML = `
            <h2 style="font-size: 0.8rem; margin-bottom: 12px; color: var(--accent);">Managed Stamps (0)</h2>
            <div style="text-align: center; padding: 20px; color: var(--text-muted); font-size: 0.8rem; border: 1px dashed var(--border); border-radius: 12px; background: rgba(255,255,255,0.3);">
                No stamps uploaded yet.
            </div>
        `;
        return;
    }

    status.innerHTML = `<h2 style="font-size: 0.8rem; margin-bottom: 12px; color: var(--accent);">Managed Stamps (${uploadedImages.length})</h2>`;

    uploadedImages.forEach((img, index) => {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.innerHTML = `
            <img src="${img.data}" class="gallery-thumb" alt="thumb">
            <div class="gallery-info">
                <div class="gallery-name">${img.name}</div>
            </div>
            <button class="delete-btn" onclick="removeImage(${index})" title="Remove Stamp">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
        `;
        status.appendChild(item);
    });
}

function removeImage(index) {
    uploadedImages.splice(index, 1);
    renderGallery();
    generatePreview();
    saveProject(); // Persist deletion to IndexedDB
}

/**
 * Helper: Converts a DataURL image to grayscale using Canvas
 */
function convertToGrayscale(dataUrl) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            
            // Draw original
            ctx.drawImage(img, 0, 0);
            
            // Apply grayscale filter
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            for (let i = 0; i < data.length; i += 4) {
                const avg = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);
                data[i]     = avg; // R
                data[i + 1] = avg; // G
                data[i + 2] = avg; // B
            }
            ctx.putImageData(imageData, 0, 0);
            
            resolve(canvas.toDataURL('image/jpeg', 0.85));
        };
        img.src = dataUrl;
    });
}

/**
 * 2. Layout Logic: Centers rows and draws borders
 * Added 'isActualDownload' flag so previews don't use up the 10-page limit.
 */
function createPDF(isDownload = false, isActualDownload = false) {
    const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: isDownload });

    const MAX_LIFETIME_PAGES = 10;
    let totalPagesUsed = parseInt(localStorage.getItem('total_pages_count')) || 0;

    // Only block if they are trying to DOWNLOAD and are already over the limit
    if (isActualDownload && totalPagesUsed >= MAX_LIFETIME_PAGES) {
        alert("Free lifetime limit reached. Please visit philatelyworld.in to upgrade!");
        return null;
    }

    const title = document.getElementById('album-title').value || "Stamp Album";
    const subtitle = document.getElementById('album-subtitle').value || "";
    const chosenFont = document.getElementById('album-font').value || "helvetica";
    const sw = parseFloat(document.getElementById('stamp-w').value) || 40;
    const sh = parseFloat(document.getElementById('stamp-h').value) || 50;
    const pageW = 210;
    const pageH = 297;
    
    // Binding-aware Spacing
    const rightBorderSp = 10;
    const leftBorderSp = rightBorderSp * 2; 
    const topBorderSp = 10;
    const bottomBorderSp = 10;
    const innerPageW = pageW - leftBorderSp - rightBorderSp; 
    const centerX = leftBorderSp + (innerPageW / 2); 

    // Unified Mapping Logic for 25 Fonts
    let pdfFont = "helvetica"; 
    const sans = ["arial", "calibri", "helvetica", "roboto", "aptos", "verdana", "tahoma", "trebuchet", "montserrat", "open-sans", "segoe", "lucida", "franklin"];
    const serif = ["times", "georgia", "garamond", "baskerville", "palatino", "cambria", "book-antiqua", "century-schoolbook", "didot", "playfair", "loratext"];
    
    if (serif.includes(chosenFont)) pdfFont = "times";
    if (sans.includes(chosenFont)) pdfFont = "helvetica";
    if (chosenFont === "courier") pdfFont = "courier";

    const setupPage = () => {
        // Draw Border
        doc.setDrawColor(80);
        doc.setLineWidth(0.5);
        doc.rect(leftBorderSp, topBorderSp, innerPageW, pageH - topBorderSp - bottomBorderSp);
        
        addBrandedFooter(doc, pageW, pageH, centerX, pdfFont);

        if (isActualDownload) {
            totalPagesUsed++;
            localStorage.setItem('total_pages_count', totalPagesUsed);
        }
    };

    setupPage();

    const titleY = topBorderSp + 18; 

    // Render Title (Master Font)
    doc.setFont(pdfFont, "bold");
    doc.setFontSize(22);
    doc.text(title, centerX, titleY, { align: 'center' });

    // Render Optional Subtitle (Master Font)
    if (subtitle) {
        doc.setFont(pdfFont, "normal");
        doc.setFontSize(14);
        doc.setTextColor(100);
        doc.text(subtitle, centerX, titleY + 9, { align: 'center' });
        doc.setTextColor(0);
    }

    if (uploadedImages.length === 0) return doc;

    const gap = 20;
    const stampsPerRow = Math.max(1, Math.floor((innerPageW + gap) / (sw + gap)));
    
    // Dynamic vertical start position
    let curY = titleY + (subtitle ? 28 : 22);

    for (let i = 0; i < uploadedImages.length; i += stampsPerRow) {
        const rowImages = uploadedImages.slice(i, i + stampsPerRow);

        if (curY + sh > pageH - bottomBorderSp - 20) {
            if (isActualDownload && totalPagesUsed >= MAX_LIFETIME_PAGES) {
                break;
            }

            doc.addPage();
            setupPage();
            curY = topBorderSp + 15;
        }

        const totalRowW = (rowImages.length * sw) + ((rowImages.length - 1) * gap);
        let curX = leftBorderSp + (innerPageW - totalRowW) / 2;

        rowImages.forEach(img => {
            const parts = img.name.split('.')[0].split('_');
            const stampTitle = parts[0] || "";
            const releaseDate = parts[1] || "";
            const denomination = parts[2] || "";

            doc.setFont(pdfFont, "bold"); doc.setFontSize(9);
            doc.text(stampTitle, curX + (sw / 2), curY - 3, { align: 'center' });

            doc.setDrawColor(0); doc.setLineWidth(0.4);
            doc.rect(curX, curY, sw, sh);

            try {
                const pad = 0.5;
                const isGrayscale = document.getElementById('grayscale-opt').checked;
                const imageData = isGrayscale ? (img.grayscale || img.data) : img.data;
                doc.addImage(imageData, 'JPEG', curX + pad, curY + pad, sw - (pad * 2), sh - (pad * 2));
            } catch (e) { }

            doc.setFontSize(8);
            if (releaseDate) {
                doc.setFont(pdfFont, "normal"); doc.setTextColor(100);
                doc.text(releaseDate, curX, curY + sh + 5, { align: 'left' });
            }
            if (denomination) {
                const currency = document.getElementById('album-currency').value;
                const priceText = currency === "None" ? denomination : `${currency} ${denomination}`;
                doc.setFont(pdfFont, "bold"); doc.setTextColor(0);
                doc.text(priceText, curX + sw, curY + sh + 5, { align: 'right' });
            }
            curX += sw + gap;
        });
        curY += sh + 25;
    }
    return doc;
}

/**
 * Adds the specific Ravindra Nayak footer to every page, centered in usable area
 */
function addBrandedFooter(doc, w, h, x, font) {
    const footerText = "Album by: Ravindra Nayak  |  https://philatelyworld.in  |  IG: @philatelyworld10";
    doc.setFont(font || "helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(120); // Subtle gray
    // Positioned 13mm from bottom (just above the border line), using the dynamic x (centerX)
    doc.text(footerText, x, h - 13, { align: 'center' });
}
/**
 * 4. UI Rendering Controllers
 */
function generatePreview() {
    // isDownload = false, isActualDownload = false
    const doc = createPDF(false, false);
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    document.getElementById('pdf-viewer').src = url;
}

function debounceRender() {
    clearTimeout(renderTimer);
    renderTimer = setTimeout(generatePreview, 400);
}

function downloadPDF() {
    // isDownload = true, isActualDownload = true
    const doc = createPDF(true, true);
    if (doc) {
        const title = document.getElementById('album-title').value || "Album";
        doc.save(`${title}.pdf`);
    }
}

// Ensure the preview renders empty state on load
window.onload = loadProject;