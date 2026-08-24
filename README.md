# Philatelyworld
Welcome to Philatelyworld — a space for stamp lovers and collectors around the world!   Discover rare stamps, postal histories, and stories behind iconic issue. Also a marketplace.

## Developer Notes.

### Generating Link Previews
Because this website is a static Single Page Application hosted on GitHub Pages, social media crawlers (like Facebook and WhatsApp) cannot execute JavaScript to dynamically update `<meta>` tags for link sharing. 

To ensure shared links correctly preview the 1st photo of a stamp listing instead of the website's default logo, you **MUST** run the preview generator script whenever you add or modify stamps in `data.js`.

**Run the following command:**
```bash
cd docs
node generate_previews.js
```
This generates a static HTML file inside `docs/item/` for every stamp. 

When sharing, use the generated folder path:
`https://philatelyworld.in/item/RN4135/`

When sharing, use the generated folder path:
`https://philatelyworld.in/announcement/6/`

### Blog Post SEO (OG tags & structured data)
Every blog page in `docs/blog/` needs a complete SEO `<head>`: canonical link, `og:type=article`, `og:site_name`, `article:*` meta tags, Twitter card, and full JSON-LD `Article` structured data. This is handled by an idempotent script, so it is safe to run any time.

**When you create a new blog post:**
1. Add your post's publish date to `scripts/blog_dates.json`, keyed by filename:
   ```json
   "my-new-post.html": "2026-08-24"
   ```
2. Run:
   ```bash
   node scripts/enhance_blog_seo.js
   ```
3. Commit the updated blog HTML along with your new post.

Only files that are missing something get modified — re-running changes nothing if all posts are already up to date.

### Testimonials Section
The "What Collectors Say" section lives directly in `docs/index.html` (between `</main>` and the image modal) — pure static HTML, so it renders for crawlers and works without JavaScript. Styles are at the bottom of `docs/style.css` under `/* --- Testimonials --- */`.

**To add or edit a testimonial**, duplicate one `<figure class="testimonial-card">...</figure>` block inside `.testimonials-grid` and update:
- the quote text inside `<blockquote>`
- initials and background color on `<span class="avatar">`
- name, verified badge, and location/order line in `<figcaption>`
- star count in the `aria-label` and the `&#9733;` characters

Keep the count at 3, 6, or 9 cards so the responsive 3-column grid stays balanced. Bump the CSS version query (`style.css?v=YYYYMMDD`) in `index.html` when changing styles.

> **Note:** the quotes currently shown are examples — replace them with real buyer feedback from WhatsApp/Instagram conversations (with permission) before relying on them publicly.
