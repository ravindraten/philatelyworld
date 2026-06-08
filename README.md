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
