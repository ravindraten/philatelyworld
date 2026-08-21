const { jsPDF } = window.jspdf;
let uploadedImages = [];
let renderTimer;
let isProcessing = false;
let defaultWidth = 40;
let defaultHeight = 50;

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
                uploadedImages = request.result.map(img => ({
                    ...img,
                    customW: img.customW || defaultWidth,
                    customH: img.customH || defaultHeight
                }));
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
 * 1. File Handling: Converts uploads to PNG/JPEG Base64
 */
function handleFiles(files) {
    if (isProcessing) return;

    isProcessing = true;
    const uploadCard = document.querySelector('.upload-card');
    const status = document.getElementById('file-status');
    uploadCard.style.pointerEvents = 'none';
    uploadCard.style.opacity = '0.6';

    const fileCount = files.length;
    status.style.display = 'block';
    status.innerHTML = `
        <div style="text-align: center; padding: 20px;">
            <div style="font-size: 1.5rem; margin-bottom: 10px;">🖼️</div>
            <div style="font-weight: 600; color: var(--text); margin-bottom: 6px;">
                Converting your ${fileCount} image${fileCount > 1 ? 's' : ''}...
            </div>
            <div style="font-size: 0.75rem; color: var(--text-light);">
                HEIC, PNG, and other formats → JPEG/PNG
            </div>
            <div style="margin-top: 12px; height: 4px; background: #e2e8f0; border-radius: 2px; overflow: hidden;">
                <div id="progress-bar" style="height: 100%; background: var(--accent); width: 0%; transition: width 0.3s;"></div>
            </div>
        </div>
    `;

    const stampWInput = document.getElementById('stamp-w');
    const stampHInput = document.getElementById('stamp-h');
    const currentDefWidth = stampWInput ? parseFloat(stampWInput.value) || 40 : 40;
    const currentDefHeight = stampHInput ? parseFloat(stampHInput.value) || 50 : 50;

    let loadedCount = 0;
    const totalFiles = files.length;

    Array.from(files).forEach(async file => {
        try {
            let blob = file;
            const isHeic = file.type === 'image/heic' || file.type === 'image/heif' ||
                file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif');

            if (isHeic && typeof heic2any !== 'undefined') {
                status.innerHTML = `
                    <div style="text-align: center; padding: 20px;">
                        <div style="font-size: 1.5rem; margin-bottom: 10px;">🍎</div>
                        <div style="font-weight: 600; color: var(--text);">Converting HEIC to JPEG...</div>
                        <div style="font-size: 0.75rem; color: var(--text-light); margin-top: 4px;">${file.name}</div>
                    </div>
                `;
                blob = await heic2any({
                    blob: file,
                    toType: 'image/jpeg',
                    quality: 0.85
                });
            }

            const reader = new FileReader();
            reader.onload = async (e) => {
                const originalData = e.target.result;
                const convertedData = await convertToStandardFormat(originalData, blob.type || 'image/jpeg');
                const grayscaleData = await convertToGrayscale(convertedData);

                const ext = (blob.type === 'image/png') ? '.png' : '.jpg';
                const baseName = file.name.replace(/\.[^.]+$/, '');

                uploadedImages.push({
                    name: baseName + ext,
                    data: convertedData,
                    grayscale: grayscaleData,
                    customW: currentDefWidth,
                    customH: currentDefHeight
                });

                loadedCount++;
                const progress = (loadedCount / totalFiles) * 100;
                const progressBar = document.getElementById('progress-bar');
                if (progressBar) progressBar.style.width = progress + '%';

                if (loadedCount === totalFiles) {
                    isProcessing = false;
                    uploadCard.style.pointerEvents = 'auto';
                    uploadCard.style.opacity = '1';
                    renderGallery();
                    generatePreview();
                    saveProject();
                }
            };
            reader.readAsDataURL(blob);
        } catch (err) {
            console.error('Error processing file:', file.name, err);
            loadedCount++;
            if (loadedCount === totalFiles) {
                isProcessing = false;
                uploadCard.style.pointerEvents = 'auto';
                uploadCard.style.opacity = '1';
                renderGallery();
                generatePreview();
                saveProject();
            }
        }
    });
}

function convertToStandardFormat(dataUrl, originalMime) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            const targetMime = 'image/png';
            resolve(canvas.toDataURL(targetMime));
        };
        img.src = dataUrl;
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
        item.style.flexWrap = 'wrap';
        item.innerHTML = `
            <img src="${img.data}" class="gallery-thumb" alt="thumb">
            <div class="gallery-info" style="flex: 1; min-width: 120px;">
                <div class="gallery-name">${img.name}</div>
                <div style="display: flex; gap: 6px; margin-top: 6px; align-items: center;">
                    <input type="number" value="${img.customW || defaultWidth}" 
                        onchange="updateImageDim(${index}, 'w', this.value)"
                        style="width: 55px; padding: 4px 6px; border: 1px solid var(--border); border-radius: 4px; font-size: 0.7rem; text-align: center;"
                        title="Width (mm)" min="5" max="150">
                    <span style="font-size: 0.65rem; color: var(--text-light);">×</span>
                    <input type="number" value="${img.customH || defaultHeight}" 
                        onchange="updateImageDim(${index}, 'h', this.value)"
                        style="width: 55px; padding: 4px 6px; border: 1px solid var(--border); border-radius: 4px; font-size: 0.7rem; text-align: center;"
                        title="Height (mm)" min="5" max="200">
                    <span style="font-size: 0.65rem; color: var(--text-light);">mm</span>
                </div>
            </div>
            <button class="delete-btn" onclick="removeImage(${index})" title="Remove Stamp">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
        `;
        status.appendChild(item);
    });
}

function updateImageDim(index, dim, value) {
    const val = parseFloat(value) || (dim === 'w' ? defaultWidth : defaultHeight);
    if (dim === 'w') {
        uploadedImages[index].customW = val;
    } else {
        uploadedImages[index].customH = val;
    }
    saveProject();
    debounceRender();
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
                data[i] = avg;     // R
                data[i + 1] = avg; // G
                data[i + 2] = avg; // B
            }
            ctx.putImageData(imageData, 0, 0);

            resolve(canvas.toDataURL('image/png'));
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
    const footerOffset = 20;
    const isGrayscale = document.getElementById('grayscale-opt').checked;
    const currency = document.getElementById('album-currency').value;

    let curY = titleY + (subtitle ? 28 : 22);
    let i = 0;

    while (i < uploadedImages.length) {
        const rowImages = [];
        let rowWidth = 0;
        let rowMaxH = 0;

        while (i < uploadedImages.length) {
            const img = uploadedImages[i];
            const iw = img.customW || sw;
            const ih = img.customH || sh;

            if (rowImages.length > 0 && rowWidth + gap + iw > innerPageW) break;

            rowImages.push(img);
            rowWidth += iw + (rowImages.length > 1 ? gap : 0);
            rowMaxH = Math.max(rowMaxH, ih);
            i++;
        }

        const topOfNewPageY = topBorderSp + 15;
        if (curY > topOfNewPageY && curY + rowMaxH + 25 > pageH - bottomBorderSp - footerOffset) {
            if (isActualDownload && totalPagesUsed >= MAX_LIFETIME_PAGES) break;
            doc.addPage();
            setupPage();
            curY = topOfNewPageY;
        }

        const totalRowW = rowImages.reduce((sum, im, idx) => sum + (im.customW || sw) + (idx > 0 ? gap : 0), 0);
        let rowX = leftBorderSp + (innerPageW - totalRowW) / 2;

        rowImages.forEach(rimg => {
            const rsw = rimg.customW || sw;
            const rsh = rimg.customH || sh;
            const alignY = curY + (rowMaxH - rsh) / 2;

            const parts = rimg.name.split('.')[0].split('_');
            const stampTitle = parts[0] || "";
            const releaseDate = parts[1] || "";
            const denomination = parts[2] || "";

            doc.setFont(pdfFont, "bold"); doc.setFontSize(9);
            const wrappedTitle = doc.splitTextToSize(stampTitle, rsw);
            const titleLineCount = wrappedTitle.length;
            const textY = alignY - 3 - (titleLineCount - 1) * 3.5;
            doc.text(wrappedTitle, rowX + (rsw / 2), textY, { align: 'center' });

            doc.setDrawColor(0); doc.setLineWidth(0.4);
            doc.rect(rowX, alignY, rsw, rsh);

            try {
                const pad = 0.5;
                const imageData = isGrayscale ? (rimg.grayscale || rimg.data) : rimg.data;
                const imgFormat = imageData.startsWith('data:image/png') ? 'PNG' : 'JPEG';
                doc.addImage(imageData, imgFormat, rowX + pad, alignY + pad, rsw - (pad * 2), rsh - (pad * 2));
            } catch (e) {
                console.error('Error adding image to PDF:', e, rimg.name);
            }

            doc.setFontSize(8);
            if (releaseDate) {
                doc.setFont(pdfFont, "normal"); doc.setTextColor(100);
                doc.text(releaseDate, rowX, alignY + rsh + 5, { align: 'left' });
            }
            if (denomination) {
                const priceText = currency === "None" ? denomination : `${currency} ${denomination}`;
                doc.setFont(pdfFont, "bold"); doc.setTextColor(0);
                doc.text(priceText, rowX + rsw, alignY + rsh + 5, { align: 'right' });
            }
            rowX += rsw + gap;
        });

        curY += rowMaxH + 25;
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
let currentPreviewUrl = null;

function saveSettings() {
    try {
        const settings = {
            title: document.getElementById('album-title').value,
            subtitle: document.getElementById('album-subtitle').value,
            width: document.getElementById('stamp-w').value,
            height: document.getElementById('stamp-h').value,
            currency: document.getElementById('album-currency').value,
            font: document.getElementById('album-font').value,
            grayscale: document.getElementById('grayscale-opt').checked,
            subtitleVisible: document.getElementById('subtitle-container').style.display === 'block'
        };
        localStorage.setItem('album_designer_settings', JSON.stringify(settings));
    } catch (e) {
        console.error("Save settings failed:", e);
    }
}

function loadSettings() {
    try {
        const stored = localStorage.getItem('album_designer_settings');
        if (stored) {
            const settings = JSON.parse(stored);
            if (settings.title !== undefined) document.getElementById('album-title').value = settings.title;
            if (settings.subtitle !== undefined) document.getElementById('album-subtitle').value = settings.subtitle;
            if (settings.width !== undefined) document.getElementById('stamp-w').value = settings.width;
            if (settings.height !== undefined) document.getElementById('stamp-h').value = settings.height;
            if (settings.currency !== undefined) document.getElementById('album-currency').value = settings.currency;
            if (settings.font !== undefined) document.getElementById('album-font').value = settings.font;
            if (settings.grayscale !== undefined) document.getElementById('grayscale-opt').checked = settings.grayscale;
            
            if (settings.subtitleVisible) {
                document.getElementById('subtitle-container').style.display = 'block';
                const btn = document.getElementById('add-subtitle-btn');
                if (btn) {
                    btn.style.opacity = '0.5';
                    btn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> REMOVE SUBTITLE`;
                }
            }
        }
    } catch (e) {
        console.error("Load settings failed:", e);
    }
}

function generatePreview() {
    // isDownload = false, isActualDownload = false
    const doc = createPDF(false, false);
    const blob = doc.output('blob');
    if (currentPreviewUrl) {
        URL.revokeObjectURL(currentPreviewUrl);
    }
    currentPreviewUrl = URL.createObjectURL(blob);
    document.getElementById('pdf-viewer').src = currentPreviewUrl;
    saveSettings(); // Save global preferences automatically on render
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
window.onload = () => {
    loadSettings();
    loadProject();
};