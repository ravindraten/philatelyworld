# 📬 philatelyWorld: Automated Stamp Album Designer

A high-precision, web-based tool for philatelists to generate professional A4 album pages automatically. Designed to eliminate the need for manual coding or complex design software.

## ✨ Features

  * **Automatic Centering:** Intelligent layout engine that perfectly centers stamps on the page.
  * **Smart Naming Logic:** Extracts **Title**, **Date**, and **Denomination** automatically from filenames.
  * **Professional Borders:** Includes decorative 10mm page borders and precise stamp frames.
  * **Corner Metadata:** Placements for release dates (bottom-left) and prices (bottom-right).
  * **Instant Preview:** High-speed rendering for real-time design adjustments.

## 🚀 Usage Instructions

1.  **Renaming Strategy:** For the metadata to appear, rename your images as: `StampName_Year_Value.jpg` (e.g., `Osprey_2026_2.50.jpg`).
2.  **Configurations:** Adjust width/height to match your stamp mounts.
3.  **Generation:** Upload your files; the engine will populate rows and add pages as needed.

## ⚖️ Limitations

  * **Free Lifetime Limit:** Users are restricted to downloading **10 total pages** (tracked via LocalStorage).
  * **Preview Mode:** Unlimited previews; the counter only increments when the "Download" button is clicked.

## 🛠️ Tech Stack

  * **Frontend:** HTML5 / CSS3 (Flexbox/Grid)
  * **Logic:** Vanilla JavaScript
  * **PDF Engine:** [jsPDF](https://github.com/parallax/jsPDF)

-----

**Developed by Ravindra Nayak** 🌐 [philatelyworld.in](https://philatelyworld.in) | 📸 IG: [@philatelyworld10](https://www.google.com/search?q=https://instagram.com/philatelyworld10)