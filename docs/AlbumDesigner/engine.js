const { jsPDF } = window.jspdf;
let uploadedImages = [];
let renderTimer;

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
                status.innerHTML = `<strong>${uploadedImages.length} Images Ready</strong>`;
                generatePreview();
            }
        };
        reader.readAsDataURL(file);
    });
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
    const sw = parseFloat(document.getElementById('stamp-w').value) || 40;
    const sh = parseFloat(document.getElementById('stamp-h').value) || 50;
    const pageW = 210;
    const pageH = 297;
    const margin = 25;
    const gap = 20;
    const borderInset = 10;

    const setupPage = () => {
        drawPageBorder(doc, pageW, pageH, borderInset);
        addBrandedFooter(doc, pageW, pageH);

        // Only save to LocalStorage if the user actually clicked the Download button
        if (isActualDownload) {
            totalPagesUsed++;
            localStorage.setItem('total_pages_count', totalPagesUsed);
        }
    };

    setupPage();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text(title, pageW / 2, margin, { align: 'center' });

    if (uploadedImages.length === 0) return doc;

    const availableW = pageW - (margin * 2);
    const stampsPerRow = Math.max(1, Math.floor((availableW + gap) / (sw + gap)));
    let curY = margin + 25;

    for (let i = 0; i < uploadedImages.length; i += stampsPerRow) {
        const rowImages = uploadedImages.slice(i, i + stampsPerRow);

        if (curY + sh > pageH - margin - 20) {
            // In Download mode, stop if we hit the limit mid-generation
            if (isActualDownload && totalPagesUsed >= MAX_LIFETIME_PAGES) {
                break;
            }

            doc.addPage();
            setupPage();
            curY = margin + 10;
        }

        const totalRowW = (rowImages.length * sw) + ((rowImages.length - 1) * gap);
        let curX = (pageW - totalRowW) / 2;

        rowImages.forEach(img => {
            const parts = img.name.split('.')[0].split('_');
            const stampTitle = parts[0] || "";
            const releaseDate = parts[1] || "";
            const denomination = parts[2] || "";

            doc.setFont("helvetica", "bold"); doc.setFontSize(9);
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
                doc.setFont("helvetica", "normal"); doc.setTextColor(100);
                doc.text(releaseDate, curX, curY + sh + 5, { align: 'left' });
            }
            if (denomination) {
                doc.setFont("helvetica", "bold"); doc.setTextColor(0);
                doc.text(denomination, curX + sw, curY + sh + 5, { align: 'right' });
            }
            curX += sw + gap;
        });
        curY += sh + 25;
    }
    return doc;
}

/**
 * Draws the page border
 */
function drawPageBorder(doc, w, h, inset) {
    doc.setDrawColor(80);
    doc.setLineWidth(0.5);
    doc.rect(inset, inset, w - (inset * 2), h - (inset * 2));
}

/**
 * Adds the specific Ravindra Nayak footer to every page
 */
function addBrandedFooter(doc, w, h) {
    const footerText = "Album by: Ravindra Nayak  |  https://philatelyworld.in  |  IG: @philatelyworld10";
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(120); // Subtle gray
    // Positioned 13mm from bottom (just above the 10mm border line)
    doc.text(footerText, w / 2, h - 13, { align: 'center' });
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
window.onload = generatePreview;