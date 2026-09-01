/**
 * Philately World - Internationalization (i18n)
 * Lightweight vanilla-JS translation engine with a compact NL/DE/EN switcher.
 *
 * Features:
 *  - Language stored in localStorage + optional ?lang= query param.
 *  - Automatic detection of browser language on first visit.
 *  - Translates static UI (via [data-i18n]) and dynamic content (via helper APIs).
 *  - Product & blog translations are merged into the source data at runtime.
 */
(function () {
    'use strict';

    var STORAGE_KEY = 'pw_lang';
    var SUPPORTED = ['en', 'nl', 'de'];
    var DEFAULT_LANG = 'en';

    /* ------------------------------------------------------------------ *
     * 1. UI LABEL DICTIONARY
     * ------------------------------------------------------------------ */
    var LABELS = {
        // Header / top bar
        topBar: {
            en: 'Global Shipping Available • Expertly Authenticated',
            nl: 'Wereldwijde verzending beschikbaar • Zorgvuldig gecertificeerd',
            de: 'Weltweiter Versand verfügbar • Fachmännisch zertifiziert'
        },
        establishedSince: {
            en: 'ESTABLISHED 2017 • PREMIUM STAMP CURATION',
            nl: 'OPGERICHT 2017 • PREMIUM ZEGELCURATIE',
            de: 'GEGRÜNDET 2017 • PREMIUM BRIEFMARKEN-KURATION'
        },
        searchPlaceholder: {
            en: 'Search stamps by theme, country, or year...',
            nl: 'Zoek postzegels op thema, land of jaar...',
            de: 'Briefmarken nach Thema, Land oder Jahr suchen...'
        },
        // Filter tabs
        tabAll: {
            en: 'All Items',
            nl: 'Alle Items',
            de: 'Alle Artikel'
        },
        tabAvailable: {
            en: 'Available',
            nl: 'Beschikbaar',
            de: 'Verfügbar'
        },
        tabSold: {
            en: 'Sold Out',
            nl: 'Uitverkocht',
            de: 'Ausverkauft'
        },
        tabBlog: {
            en: 'Blog',
            nl: 'Blog',
            de: 'Blog'
        },
        // Status / counts
        loadingRates: {
            en: 'Loading live exchange rates...',
            nl: 'Live wisselkoersen laden...',
            de: 'Live-Wechselkurse werden geladen...'
        },
        noStampsFound: {
            en: 'No stamps found.',
            nl: 'Geen postzegels gevonden.',
            de: 'Keine Briefmarken gefunden.'
        },
        noBlogFound: {
            en: 'No blog posts found.',
            nl: 'Geen blogberichten gevonden.',
            de: 'Keine Blogbeiträge gefunden.'
        },
        photoBadge: {
            en: 'Photos',
            nl: 'Foto\u2019s',
            de: 'Fotos'
        },
        viewListing: {
            en: 'View Listing',
            nl: 'Bekijk aanbieding',
            de: 'Angebot ansehen'
        },
        buyNow: {
            en: 'Buy Now',
            nl: 'Koop nu',
            de: 'Jetzt kaufen'
        },
        soldOutBtn: {
            en: 'Sold Out',
            nl: 'Uitverkocht',
            de: 'Ausverkauft'
        },
        onSaleBadge: {
            en: 'On Sale',
            nl: 'In de aanbieding',
            de: 'Im Angebot'
        },
        freeTrackedShipping: {
            en: 'Free Tracked Shipping',
            nl: 'Gratis verzending met track & trace',
            de: 'Kostenloser Versand mit Sendungsverfolgung'
        },
        freeLetterPost: {
            en: 'Free Letter Post',
            nl: 'Gratis briefpost',
            de: 'Kostenloser Briefversand'
        },
        readPost: {
            en: 'Read Post',
            nl: 'Lees artikel',
            de: 'Beitrag lesen'
        },
        articleBadge: {
            en: 'Article',
            nl: 'Artikel',
            de: 'Artikel'
        },
        phillyBlog: {
            en: 'Philately Blog',
            nl: 'Filatelie Blog',
            de: 'Philatelie-Blog'
        },
        copyShare: {
            en: 'Copy Share Link',
            nl: 'Deel link kopiëren',
            de: 'Teilen-Link kopieren'
        },
        copied: {
            en: 'COPIED',
            nl: 'GEKOPIEERD',
            de: 'KOPIERT'
        },
        copiedLabel: {
            en: 'COPIED',
            nl: 'GEKOPIEERD',
            de: 'KOPIERT'
        },
        chat: {
            en: 'Chat',
            nl: 'Chat',
            de: 'Chat'
        },
        // Meta / buttons
        viewCollection: {
            en: '← View Full Collection',
            nl: '← Bekijk volledige collectie',
            de: '← Komplette Sammlung ansehen'
        },
        viewStampCollection: {
            en: '← View Stamp Collection',
            nl: '← Bekijk postzegelcollectie',
            de: '← Briefmarkensammlung ansehen'
        },
        inquire: {
            en: 'Inquire',
            nl: 'Informeer',
            de: 'Anfragen'
        },
        // Footer
        privacyPolicy: {
            en: 'Privacy Policy',
            nl: 'Privacybeleid',
            de: 'Datenschutzerklärung'
        },
        securityGuarantee: {
            en: 'Security & Guarantee',
            nl: 'Veiligheid & Garantie',
            de: 'Sicherheit & Garantie'
        },
        scanToPay: {
            en: 'Scan to Pay',
            nl: 'Scan om te betalen',
            de: 'Scannen zum Bezahlen'
        },
        copy: {
            en: 'Copy',
            nl: 'Kopieer',
            de: 'Kopieren'
        },
        copiedDone: {
            en: 'Copied!',
            nl: 'Gekopieerd!',
            de: 'Kopiert!'
        },
        securityGuaranteeTitle: {
            en: 'Security & Guarantee',
            nl: 'Veiligheid & Garantie',
            de: 'Sicherheit & Garantie'
        },
        lastUpdated: {
            en: 'Last Updated:',
            nl: 'Laatst bijgewerkt:',
            de: 'Zuletzt aktualisiert:'
        },
        // Carousel / announcements
        readMore: {
            en: 'Read More',
            nl: 'Lees meer',
            de: 'Mehr lesen'
        },
        announcement: {
            en: 'Announcement',
            nl: 'Mededeling',
            de: 'Ankündigung'
        },
        news: {
            en: 'News',
            nl: 'Nieuws',
            de: 'Nachrichten'
        },
        clickReadMore: {
            en: 'Click to read more...',
            nl: 'Klik om meer te lezen...',
            de: 'Klicken Sie, um mehr zu lesen...'
        },
        placeholderImg: {
            en: 'Announcement',
            nl: 'Mededeling',
            de: 'Ankündigung'
        },
        loadingAnnouncements: {
            en: 'Loading announcements...',
            nl: 'Mededelingen laden...',
            de: 'Ankündigungen werden geladen...'
        },
        noAnnouncements: {
            en: 'No announcements presently available.',
            nl: 'Er zijn momenteel geen mededelingen.',
            de: 'Derzeit keine Ankündigungen verfügbar.'
        },
        errorLoading: {
            en: 'Error loading announcements. Please try again.',
            nl: 'Fout bij het laden van mededelingen. Probeer het opnieuw.',
            de: 'Fehler beim Laden der Ankündigungen. Bitte erneut versuchen.'
        },
        noMatch: {
            en: 'No announcements match your search.',
            nl: 'Geen mededelingen komen overeen met uw zoekopdracht.',
            de: 'Keine Ankündigungen passen zu Ihrer Suche.'
        },
        // Privacy / Security modal headings
        infoWeCollect: {
            en: '1. Information We Collect',
            nl: '1. Informatie die we verzamelen',
            de: '1. Informationen, die wir sammeln'
        },
        useOfData: {
            en: '2. Use of Data',
            nl: '2. Gebruik van gegevens',
            de: '2. Verwendung der Daten'
        },
        thirdParty: {
            en: '3. Third-Party Services',
            nl: '3. Diensten van derden',
            de: '3. Dienste Dritter'
        },
        yourRights: {
            en: '4. Your Rights (GDPR)',
            nl: '4. Uw rechten (AVG)',
            de: '4. Ihre Rechte (DSGVO)'
        },
        expertAuth: {
            en: '1. Expert Authentication',
            nl: '1. Deskundige authenticatie',
            de: '1. Fachmännische Beglaubigung'
        },
        securePayments: {
            en: '2. Secure Payments',
            nl: '2. Veilige betalingen',
            de: '2. Sichere Zahlungen'
        },
        globalShipping: {
            en: '3. Global Shipping Protection',
            nl: '3. Bescherming wereldwijde verzending',
            de: '3. Schutz beim weltweiten Versand'
        },
        satisfaction: {
            en: '4. Satisfaction Guarantee',
            nl: '4. Tevredenheidsgarantie',
            de: '4. Zufriedenheitsgarantie'
        },
        // Language switcher
        language: {
            en: 'Language',
            nl: 'Taal',
            de: 'Sprache'
        },
        catalogCount: {
            en: 'Catalog Updated: {date} • {count} Unique Pieces',
            nl: 'Catalogus bijgewerkt: {date} • {count} unieke stukken',
            de: 'Katalog aktualisiert: {date} • {count} einzigartige Stücke'
        },
        tabOnSale: {
            en: 'On Sale',
            nl: 'In de aanbieding',
            de: 'Im Angebot'
        },
        promoFreeStamps: {
            en: 'Get 150 stamps for FREE!',
            nl: 'Ontvang 150 postzegels GRATIS!',
            de: '150 Briefmarken GRATIS erhalten!'
        },
        promoFollow: {
            en: 'Follow our social channels to claim yours.',
            nl: 'Volg onze sociale kanalen om de uwe op te halen.',
            de: 'Folgen Sie unseren Social-Media-Kanälen, um Ihre zu erhalten.'
        },
        cachedRate: {
            en: 'Cached WU Rate',
            nl: 'Gecachte WU-koers',
            de: 'Zwischengespeicherter WU-Kurs'
        },
        liveRate: {
            en: 'Live WU Rate',
            nl: 'Live WU-koers',
            de: 'Live-WU-Kurs'
        },
        rate: {
            en: 'Rate',
            nl: 'Koers',
            de: 'Kurs'
        },
        updated: {
            en: 'Updated',
            nl: 'Bijgewerkt',
            de: 'Aktualisiert'
        },
        cachedFallback: {
            en: 'cached/fallback',
            nl: 'gecached/fallback',
            de: 'zwischengespeichert/Fallback'
        },
        announcements: {
            en: 'Announcements',
            nl: 'Mededelingen',
            de: 'Ankündigungen'
        },
        newAnnouncement: {
            en: 'New Announcement!',
            nl: 'Nieuwe mededeling!',
            de: 'Neue Ankündigung!'
        },
        newBlogPost: {
            en: 'New Blog Post!',
            nl: 'Nieuw blogbericht!',
            de: 'Neuer Blogbeitrag!'
        }
    };

    /* ------------------------------------------------------------------ *
     * 2. PRODUCT (STAMP) TRANSLATIONS - keyed by RN code (part of desc)
     *    Each entry: { name: {en,nl,de}, desc: {en,nl,de}, country: {...} }
     *
     *    The bulk of listings live in translations.js (window.STAMP_T /
     *    window.BLOG_T), which is loaded before this file. Entries defined
     *    here override/merge with those at runtime.
     * ------------------------------------------------------------------ */
    var STAMP_T = {
        RN4185: {
            name: {
                en: 'Czechoslovakia 1918-1992 stamp collection in album',
                nl: 'Tsjecho-Slowakije 1918-1992 postzegelverzameling in album',
                de: 'Tschechoslowakei 1918-1992 Briefmarkensammlung im Album'
            },
            desc: {
                en: 'KaBe album (loose binder) Czechoslovakia 1918-1992 with very well filled stamp collection. Check the photos to see a small part, but there is a lot more than you can see here.',
                nl: 'KaBe-album (losbladig) Tsjecho-Slowakije 1918-1992 met een zeer goed gevulde postzegelverzameling. Bekijk de foto\u2019s om een klein deel te zien, maar er is veel meer dan u hier ziet.',
                de: 'KaBe-Album (lose Blätter) Tschechoslowakei 1918-1992 mit sehr gut gefüllter Briefmarkensammlung. Schauen Sie sich die Fotos an, um einen kleinen Teil zu sehen, aber es gibt viel mehr als hier gezeigt.'
            }
        },
        RN4184: {
            name: {
                en: 'Netherlands lot 500 FDC covers',
                nl: 'Nederland kavel 500 FDC-enveloppen',
                de: 'Niederlande Los 500 FDC-Umschläge'
            },
            desc: {
                en: 'Box with collection about 500 FDC covers Netherlands. Rs.40 per cover. Check the photos to see a small part, but there is a lot more than you can see here.',
                nl: 'Doos met een verzameling van ongeveer 500 FDC-enveloppen Nederland. Rs.40 per enveloppe. Bekijk de foto\u2019s om een klein deel te zien, maar er is veel meer dan u hier ziet.',
                de: 'Box mit Sammlung von etwa 500 FDC-Umschlägen Niederlande. Rs.40 pro Umschlag. Schauen Sie sich die Fotos an, um einen kleinen Teil zu sehen, aber es gibt viel mehr als hier gezeigt.'
            }
        }
    };

    // Merge in the bulk translations from translations.js
    if (typeof window !== 'undefined' && window.STAMP_T) {
        Object.keys(window.STAMP_T).forEach(function (rn) {
            STAMP_T[rn] = Object.assign({}, window.STAMP_T[rn]);
        });
    }

    /* ------------------------------------------------------------------ *
     * 3. BLOG TRANSLATIONS - keyed by blog URL
     * ------------------------------------------------------------------ */
    var BLOG_T = {
        'blog/kinderpostzegels-2026-blond-amsterdam.html': {
            name: {
                en: 'Kinderpostzegels 2026: Designed by Blond Amsterdam',
                nl: 'Kinderpostzegels 2026: Ontworpen door Blond Amsterdam',
                de: 'Kinderpostzegels 2026: Entworfen von Blond Amsterdam'
            },
            desc: {
                en: 'Kinderpostzegels announces that the 2026 kinderpostzegels are designed by Blond Amsterdam. Discover the hand-drawn stamp series around the theme Growing up safely with house-shaped self-adhesive stamps and extra decorative stickers.',
                nl: 'Kinderpostzegels maakt bekend dat de kinderpostzegels van 2026 zijn ontworpen door Blond Amsterdam. Ontdek de handgetekende postzegelserie rond het thema Veilig opgroeien met huisvormige zelfklevende postzegels en extra decoratieve stickers.',
                de: 'Kinderpostzegels gibt bekannt, dass die Kinderpostzegels 2026 von Blond Amsterdam entworfen wurden. Entdecken Sie die handgezeichnete Briefmarkenserie zum Thema Sicher aufwachsen mit hausförmigen selbstklebenden Briefmarken und zusätzlichen dekorativen Stickern.'
            }
        }
    };

    // Merge in the bulk blog translations from translations.js
    if (typeof window !== 'undefined' && window.BLOG_T) {
        Object.keys(window.BLOG_T).forEach(function (url) {
            BLOG_T[url] = Object.assign({}, window.BLOG_T[url]);
        });
    }

    /* ------------------------------------------------------------------ *
     * 4. ENGINE
     * ------------------------------------------------------------------ */
    var currentLang = null;

    function detectLang() {
        var urlLang = new URLSearchParams(window.location.search).get('lang');
        if (urlLang && SUPPORTED.indexOf(urlLang) !== -1) return urlLang;

        var stored;
        try { stored = localStorage.getItem(STORAGE_KEY); } catch (e) {}
        if (stored && SUPPORTED.indexOf(stored) !== -1) return stored;

        if (navigator.language) {
            var browser = (navigator.language || 'en').toLowerCase().split('-')[0];
            if (browser === 'nl') return 'nl';
            if (browser === 'de') return 'de';
        }
        return DEFAULT_LANG;
    }

    function getLang() {
        if (!currentLang) currentLang = detectLang();
        return currentLang;
    }

    function setLang(lang, persist) {
        if (SUPPORTED.indexOf(lang) === -1) lang = DEFAULT_LANG;
        currentLang = lang;
        if (persist !== false) {
            try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
        }
        syncLangButtons();
        applyTranslations();
        if (window.PWApp && typeof window.PWApp.refresh === 'function') {
            window.PWApp.refresh();
        }
        if (typeof window.PWRefreshAll === 'function') {
            window.PWRefreshAll();
        }
    }

    // Look up a label for the current language (fallback to en)
    function t(key) {
        var entry = LABELS[key];
        if (!entry) return key;
        return entry[currentLang] || entry.en;
    }

    function tr(dict) {
        if (!dict) return null;
        return dict[currentLang] || dict.en || null;
    }

    function translateStamp(stamp) {
        var rn = (stamp.desc && stamp.desc.match(/RN\d+/)) ? stamp.desc.match(/RN\d+/)[0] : null;
        var d = rn ? STAMP_T[rn] : null;
        if (!d) return stamp;
        var copy = Object.assign({}, stamp);
        var name = tr(d.name);
        var desc = tr(d.desc);
        if (name) copy.name = name;
        if (desc) copy.desc = (rn + ': ' + desc);
        return copy;
    }

    function translateBlog(post) {
        var d = post.url ? BLOG_T[post.url] : null;
        if (!d) return post;
        var copy = Object.assign({}, post);
        var name = tr(d.name);
        var desc = tr(d.desc);
        if (name) copy.name = name;
        if (desc) copy.desc = desc;
        return copy;
    }

    // Apply [data-i18n] attributes on static DOM
    function applyTranslations() {
        document.documentElement.setAttribute('lang', currentLang);
        document.querySelectorAll('[data-i18n]').forEach(function (el) {
            var key = el.getAttribute('data-i18n');
            var value = t(key);
            if (value !== key) {
                var attr = el.getAttribute('data-i18n-attr') || 'textContent';
                if (attr === 'placeholder') el.setAttribute('placeholder', value);
                else if (attr === 'title') el.setAttribute('title', value);
                else if (attr === 'aria-label') el.setAttribute('aria-label', value);
                else el.textContent = value;
            }
        });
        syncLangButtons();
    }

    /* ------------------------------------------------------------------ *
     * 5. TOGGLE UI (styled like the currency toggle)
     * ------------------------------------------------------------------ */
    // Update the .active state on all language toggle buttons
    function syncLangButtons() {
        document.querySelectorAll('.lang-btn').forEach(function (btn) {
            var code = btn.getAttribute('data-lang');
            if (!code) return;
            var active = code === getLang();
            btn.classList.toggle('active', active);
            if (active) btn.setAttribute('aria-pressed', 'true');
            else btn.removeAttribute('aria-pressed');
        });
    }

    window.PW = {
        getLang: getLang,
        setLang: setLang,
        t: t,
        translateStamp: translateStamp,
        translateBlog: translateBlog,
        syncLangButtons: syncLangButtons,
        applyTranslations: applyTranslations,
        SUPPORTED: SUPPORTED
    };

    // Auto-init when DOM is ready
    function boot() {
        currentLang = detectLang();
        document.documentElement.setAttribute('lang', currentLang);
        syncLangButtons();
        applyTranslations();
        if (typeof window.PWAppReady === 'function') window.PWAppReady();
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
