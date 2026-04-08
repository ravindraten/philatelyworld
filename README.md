# Philatelyworld
Welcome to Philatelyworld — a space for stamp lovers and collectors around the world!   Discover rare stamps, postal histories, and stories behind iconic issue. Also a marketplace.

## Developer Notes

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

### Generating Announcement Previews
Similar to item listings, social media previews for site announcements must be statically pre-generated to be visible on platforms like WhatsApp and Facebook.

**Whenever you add a new announcement:**
1.  **Create the file**: Add your new announcement (e.g., `6.html`) to the `docs/announcement/` folder.
2.  **Register it**: Open `docs/script.js` and add `'6.html'` to the beginning of the `announcementFiles` list (line 14).
3.  **Generate Previews**: Run the automated script:
    ```bash
    cd docs
    node generate_announcement_previews.js
    ```
This creates the required deep-link folders (e.g., `docs/announcement/6/`) with correct metadata extracted from your HTML.

When sharing, use the generated folder path:
`https://philatelyworld.in/announcement/6/`
