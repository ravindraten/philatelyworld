const blogPosts = [
    {
        name: "India Miniature Sheets: Complete Visual Catalog (1973-2026)",
        year: "1973-2026",
        country: "India",
        desc: "Complete visual catalog of all 298 Indian Miniature Sheets from 1973 to 2026. Browse every miniature sheet with dates, titles, and images.",
        folder: "miniature-sheets",
        imageCount: 1,
        url: "blog/miniature-sheets.html",
        isBlog: true
    },
    {
        name: "Compilation Innovation Exhibition Philately - Philately World",
        year: "2025",
        country: "Austria",
        desc: "Explore Austria Post's 2025 Compilation Innovation Exhibition Philately, a premium set featuring eight iconic Austrian stamp innovations from the last 20 years.",
        folder: "innovation",
        imageCount: 1,
        // Update this to your local file path:
        url: "blog/innovation-exhibition-philately.html",
        isBlog: true
    },
    {
        name: "WorldPride Amsterdam 2026 Stamp Sheet - Philately World",
        year: "2026",
        country: "Netherlands",
        desc: "Discover the WorldPride Amsterdam 2026 stamp sheet by PostNL, featuring a colorful geometric design and honoring 25 years of marriage equality in the Netherlands.",
        folder: "pride",
        imageCount: 1,
        // Update this to your local file path:
        url: "blog/worldpride-amsterdam-stamp.html",
        isBlog: true
    },
    {
        name: "Gold Stamp: The Goldfinch (Het Puttertje) - Philately World",
        year: "2026",
        country: "Netherlands",
        desc: "Discover the exclusive 24-carat gold stamp featuring 'The Goldfinch' by Carel Fabritius. A unique masterpiece for philatelists and art lovers.",
        folder: "goldfinch",
        imageCount: 1,
        // Update this to your local file path:
        url: "blog/goldfinch-gold-stamp.html",
        isBlog: true
    },
    {
        name: "Digital Philately: A Guide to Using bpost’s StampConnect App",
        year: "-",
        country: "Technology & Philately",
        desc: "A comprehensive guide to the StampConnect app by bpost, designed to bridge the gap between traditional stamp collecting and the digital age.",
        folder: "stampconnect",
        imageCount: 1,
        // Update this to your local file path:
        url: "blog/stampconnect.html",
        isBlog: true
    },
    {
        name: "The Crown Jewels of Indian Philately: Most Valuable Postage Stamps",
        year: "-",
        country: "Valuable",
        desc: "An extensive guide to the rarest and most expensive postage stamps of India, from the Scinde Dawk to the record-breaking Gandhi Service stamps.",
        folder: "ScindeDawk",
        imageCount: 1,
        // Update this to your local file path:
        url: "blog/valuableIndianStamps.html",
        isBlog: true
    },
    {
        name: "The Philatelic Detective: How to Identify a Stamp?",
        year: "-",
        country: "Identify stamps",
        desc: "Learn professional techniques for detecting and identifying stamp watermarks using traditional methods and modern digital tools.",
        folder: "identifyStamp",
        imageCount: 1,
        // Update this to your local file path:
        url: "blog/identifystamp.html",
        isBlog: true
    },
    {
        name: "Hidden Security: A Guide to Stamp Watermark Detection",
        year: "",
        country: "Watermark",
        desc: "Learn professional techniques for detecting and identifying stamp watermarks using traditional methods and modern digital tools.",
        folder: "watermark",
        imageCount: 1,
        // Update this to your local file path:
        url: "blog/identify_watermark.html",
        isBlog: true
    },
    {
        name: "India Philately 1854-1993: From Victoria to Gandhi",
        year: "1854-1993",
        country: "India",
        desc: "Trace the postal history of India from 1854 classics to the 1948 Gandhi Memorial set. Professional study featuring SG-listed rarities and service overprints.",
        folder: "D21",
        imageCount: 1,
        // Update this to your local file path:
        url: "blog/bharat.html",
        isBlog: true
    },
    {
        name: "André Buzin Bird Stamps: A Philatelic Study of Belgium",
        year: "1985+",
        country: "Belgium",
        desc: "Discover the biological realism of André Buzin’s bird stamps. A complete guide to the MNH Belgian definitive series for thematic bird collectors.",
        folder: "D38",
        imageCount: 1,
        // Update this to your local file path:
        url: "blog/buzin.html",
        isBlog: true
    },
    {
        name: "Europa CEPT 1956-2000: The Complete Philatelic Guide",
        year: "1956+",
        country: "European countries",
        desc: "A comprehensive study of Europa CEPT stamps from 1956 to 2000. 99% complete collection in Leuchtturm albums. Ideal for European history specialists.",
        folder: "D23",
        imageCount: 1,
        // Update this to your local file path:
        url: "blog/europa_cept.html",
        isBlog: true
    },
    {
        name: "Red Cross Postal History: 60 Years of Humanitarian Aid",
        year: "1904+",
        country: "German Empire",
        desc: "Explore a massive 8-album Red Cross stamp collection spanning 1917–1980. Includes rare imperforates, FDCs, and wartime semi-postal issues.",
        folder: "D24",
        imageCount: 1,
        // Update this to your local file path:
        url: "blog/redcross.html",
        isBlog: true
    },
    {
        name: "Divine Power on the Blockchain: Exploring the 'Heroes of Mytholog' Set",
        year: "2025",
        country: "Netherlands, Austria, Luxembourg, Belgium, Portugal",
        desc: "A visual walkthrough of the collection featuring the 2025 'Heroes of Mythology' Crypto Stamps. Discover the six gods of Olympus from across Europe..",
        folder: "crypto",
        imageCount: 1,
        // Update this to your local file path:
        url: "blog/crypto.html",
        isBlog: true
    },
    {
        name: "Ramayana Book on Ram Mandir: A Philatelic Tribute",
        year: "2024",
        country: "India",
        desc: "A specialized study of the Ramayana and Ram Mandir book release on 18.01.2024. Explore the philatelic documentation of this historic cultural event.",
        folder: "ramayana",
        imageCount: 1,
        url: "blog/ramayana.html",
        isBlog: true
    },
    {
        name: "Is my Penny Red worth millions? – A Philatelic Guide",
        year: "1841-1879",
        country: "Great Britain",
        desc: "Learn how to date and value your British Penny Red stamps. A detailed guide covering design elements, plate numbers, and rarity, including the legendary Plate 77.",
        folder: "RedPenny",
        imageCount: 1,
        url: "blog/penny-red.html",
        isBlog: true
    },
    {
        name: "70 Years of Diplomatic Ties: Lao PDR & India Joint Postage Stamp Issue",
        year: "2026",
        country: "Lao PDR & India",
        desc: "Commemorating 70 years of friendship between Laos and India (1956-2026). Explore the technical details and historical significance of this joint commemorative stamp.",
        folder: "JointIssue",
        imageCount: 3,
        url: "blog/lao-india-joint-issue-2026.html",
        isBlog: true
    }
];
