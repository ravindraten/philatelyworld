# Image Delivery Improvements

This document summarizes the image delivery optimizations implemented to improve page load performance, Core Web Vitals, and user experience.

## Overview

All stamp images are hosted on an external CDN (filedn.eu). These optimizations improve how images are loaded, rendered, and prioritized across all pages.

## Changes Made

### 1. Main Catalog (`docs/script.js`)

All dynamically generated images in the stamp gallery now include:

| Attribute | Value | Benefit |
|-----------|-------|---------|
| `loading` | `lazy` | Images below the fold are not loaded until scrolled into view |
| `decoding` | `async` | Image decoding happens off the main thread, reducing jank |
| `fetchpriority` | `low` | Allows browser to prioritize critical resources first |
| `width` | `300` | Prevents Cumulative Layout Shift (CLS) |
| `height` | `300` | Prevents Cumulative Layout Shift (CLS) |

**Affected images:**
- Stamp thumbnails in the grid
- Blog post cards in the Blog tab
- Promotion/sidebar images
- Announcement carousel slides

### 2. Main Homepage (`docs/index.html`)

Added critical image preload:

```html
<link rel="preload" as="image" 
      href="https://filedn.eu/lbu0dswNxxUBjQKg0kNdmLu/philatelyworld-images/images/logo.jpg" 
      fetchpriority="high">
```

**Benefit:** Improves Largest Contentful Paint (LCP) by preloading the logo before it's needed.

### 3. Item Preview Pages (`docs/item/*/index.html`)

Regenerated 90 static preview pages with enhanced image attributes:

| Attribute | Value | Benefit |
|-----------|-------|---------|
| `loading` | `lazy` | Reduces initial page weight |
| `decoding` | `async` | Non-blocking image decoding |
| `width` | `300` | Layout stability |
| `height` | `300` | Layout stability |

These pages serve as OG previews for social sharing (WhatsApp, Facebook, Twitter).

### 4. Blog Pages (21 files)

Updated all blog posts in `docs/blog/`:
- Apollo 11
- ISRO
- Coronation 1937
- Valuable Indian Stamps
- Miniature Sheets India
- And 16 more...

Each image now includes:
- `loading="lazy"`
- `decoding="async"`
- `width="800"`
- `height="600"`

### 5. Announcement Pages (5 files)

Updated all announcements in `docs/announcement/`:
- `1.html` through `5.html`

Same optimizations as blog pages.

## Performance Impact

### Core Web Vitals Improvements

| Metric | Before | After | Impact |
|--------|--------|-------|--------|
| **LCP** | Baseline | Improved | Logo preloaded with high priority |
| **CLS** | Potential shift | Eliminated | Explicit dimensions on all images |
| **FID** | May block main thread | Improved | Async decoding moves work off main thread |
| **INP** | N/A | Improved | Less main thread blocking |

### Bandwidth Savings

- Images below the fold are not downloaded until needed
- Initial page load is significantly lighter
- Particularly beneficial for mobile users on slower connections

## Implementation Details

### Image Generation Scripts

Two utility scripts were created for ongoing maintenance:

1. **`scripts/optimize_blog_images.js`** - Updates blog pages
2. **`scripts/optimize_announcement_images.js`** - Updates announcement pages

Run these after adding new blog posts or announcements:

```bash
node scripts/optimize_blog_images.js
node scripts/optimize_announcement_images.js
```

### Regenerating Item Pages

After modifying `docs/data.js`, regenerate item preview pages:

```bash
node docs/generate_previews.js
```

This also regenerates `sitemap.xml`.

## Best Practices Applied

1. **Lazy Loading** - `loading="lazy"` on all non-critical images
2. **Async Decoding** - `decoding="async"` prevents main thread blocking
3. **Fetch Priority** - `fetchpriority="high"` on LCP images, `low` on below-fold
4. **Explicit Dimensions** - `width` and `height` prevent layout shifts
5. **Preconnect** - Already in place for `filedn.eu` CDN
6. **Preload** - Logo preloaded for fast LCP

## Future Enhancements

Consider these additional optimizations:

1. **Modern Formats** - Convert images to WebP (~25-35% smaller)
2. **Responsive Images** - Add `srcset` for different viewport sizes
3. **Blur Placeholders** - Low Quality Image Placeholders (LQIP)
4. **CDN Image Processing** - Use Cloudinary or imgix for real-time resizing
5. **Service Worker Caching** - Cache images for repeat visits

## Browser Support

All attributes used are widely supported:
- `loading="lazy"`: Chrome 77+, Firefox 75+, Safari 15.4+
- `decoding="async"`: Chrome 65+, Firefox 66+, Safari 11+
- `fetchpriority`: Chrome 102+, Firefox 102+, Safari 17.2+

These are progressive enhancements - browsers that don't support them fall back gracefully.
