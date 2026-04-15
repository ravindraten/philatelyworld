# 📬 Philately World: Automated Stamp Album Designer

A high-precision, web-based tool for philatelists to generate professional A4 album pages automatically. Eliminate manual design work and complex software with our intelligent, server-less designer.

## ✨ Core Features

*   **Intelligent Layout Engine:** Automatically calculates centering, spacing, and row distribution for a perfectly balanced A4 page with variable image sizes.
*   **Per-Image Size Control:** Customize width and height (in mm) for each uploaded image individually. Layout adapts dynamically.
*   **Managed Stamps Gallery:** A dedicated dashboard to track, preview, delete, and resize uploaded stamps before final generation.
*   **Session Persistence (Auto-Save):** Powered by **IndexedDB**, your collection is automatically saved locally. Close your browser and pick up exactly where you left off.
*   **Universal Image Support:** Automatically converts HEIC, PNG, and other formats to PNG for consistent output.
*   **Global Typography:** Choose from **25 world-class fonts** (Sans-Serif, Serif, and Monospace) to match your album's aesthetic.
*   **Smart Metadata Extraction:** Pre-fill stamp details directly from filenames (format: `Title_Year_Price.jpg`).
*   **Dynamic Currency Support:** Automatic symbol prepending for all major world currencies (₹, €, $, £, ¥, CHF, AU$, CA$).
*   **High-Resolution PDF:** Generates print-ready PDFs with binding-aware margins (20mm binding edge).
*   **Privacy First:** 100% server-less. All images and data stay on your local device.

## 🚀 Usage Guide

1.  **Preparation:** Rename your stamp images following the pattern: `Title_Year_Price.jpg`
    *   *Example:* `Birds_of_Europe_2026_1.50.jpg`
2.  **Configuration:** Set your global album title, typography, and default stamp dimensions (width/height in mm).
3.  **Upload:** Drag & drop or click the upload card. Images are automatically converted to PNG. Watch the progress indicator.
4.  **Customize:** Adjust width and height for each image individually in the gallery. Layout adapts automatically.
5.  **Refine:** Use the "Managed Stamps" gallery to remove unwanted items or re-upload.
6.  **Export:** Click "Download High-Res PDF" to save your page.

## ⚖️ Fair Usage Policy

*   **Free Lifetime Limit:** Users can download up to **10 high-resolution pages** for free.
*   **Drafting Is FREE:** Unlimited previews and image management. The counter only increments upon a successful high-res PDF download.
*   **Device Persistent:** Your progress and usage limit are stored locally in your browser.

## 🛠️ Technology Stack

*   **Engine:** Vanilla JavaScript / ES6+
*   **Persistence:** IndexedDB (for image data) & LocalStorage (for session metadata)
*   **Rendering:** [jsPDF](https://github.com/parallax/jsPDF) PDF library
*   **Image Conversion:** [heic2any](https://github.com/nuintun/heic2any) for HEIC support
*   **Design:** Premium Glassmorphism UI with responsive CSS Grid/Flexbox
*   **Compatibility:** Optimized for Desktop and Tablet (800px+ viewports)

---

**Developed by Ravindra Nayak**  
🌐 [philatelyworld.in](https://philatelyworld.in)  
📸 Follow on Instagram: [@philatelyworld10](https://www.instagram.com/philatelyworld10)  
☕ Support the Project: UPI (India) & PayPal (Global) options available in-app.