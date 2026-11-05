/* Catalogue left-rail filters: Availability, Country, Themes.
 * Extends the existing script.js filter pipeline (state.statusFilter,
 * state.saleActive, filterStamps) without touching it: the original
 * filterStamps is wrapped, and the availability card drives script.js's
 * state directly so deep-links (?tab=, ?item=), blog and sale logic keep working.
 */
(function () {
    'use strict';

    const THEME_KEYWORDS = {
        'Miniature sheets & sheetlets': /miniature sheet|sheetlet|\bMS\b/i,
        'Birds': /\bbird|buzin/i,
        'FDCs': /first day cover|\bFDC\b/i,
        'Postcards': /postcard/i,
        'Ships & Nautical': /\bship|nautic|maritim/i,
        'Butterflies & Nature': /butterfl|nature|\bflowers?\b/i,
        'Europa CEPT': /europa/i,
        'Royalty': /\bking\b|\bqueen\b|\bprince\b|\broyal\b/i,
        'Trains & Railways': /railway|\btrains?\b|locomot/i,
        'WWII & Third Reich': /nazi|third reich|reichspfennig|\bhitler\b/i,
        'Red Cross': /red cross/i,
        'Space & Astronomy': /space|astronom|\bmoon\b|satellite|rocket/i,
        'Cartoons': /cartoon/i,
        'Masks & Folk': /\bmask|folk/i,
        'Sports': /\bsport|olympic|football|cricket/i
    };

    const filterState = {
        country: '',
        theme: ''
    };

    const els = {
        rail: document.getElementById('catalogFilters'),
        availability: document.getElementById('availabilityList'),
        country: document.getElementById('countryFilterList'),
        countrySearch: document.getElementById('countryFilterSearch'),
        theme: document.getElementById('themeList'),
        clear: document.getElementById('catalogClearFilters')
    };

    if (!els.rail) return;

    /* Mobile hero quick-filter chips (Available now / FDCs / Miniature sheets).
     * They drive the same rail buttons, so status, country and theme logic stay
     * in one place. */
    const quickChips = Array.prototype.slice.call(
        document.querySelectorAll('.mobile-chip[data-quick-type]')
    );

    function syncQuickChips() {
        if (!quickChips.length) return;
        const status = activeTabStatus();
        const themeButton = els.theme ? els.theme.querySelector('button[data-theme].is-active') : null;
        const theme = themeButton ? (themeButton.getAttribute('data-theme') || '') : '';
        quickChips.forEach(function (chip) {
            const type = chip.getAttribute('data-quick-type');
            const value = chip.getAttribute('data-quick-value');
            const active = type === 'status' ? status === value : theme === value;
            chip.classList.toggle('is-active', active);
            chip.setAttribute('aria-pressed', String(active));
        });
    }

    function esc(value) {
        return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }

    /* Reveal the "Clear filters" button; dim + disable it when country/theme is not set. */
    function updateClearButton() {
        if (!els.clear) return;
        const dirty = filterState.country !== '' || filterState.theme !== '';
        els.clear.classList.toggle('is-active', dirty);
        els.clear.disabled = !dirty;
        els.clear.setAttribute('aria-disabled', String(!dirty));
    }

    /* ---------- data ---------- */

    function stampsData() {
        return (typeof stamps !== 'undefined' && Array.isArray(stamps)) ? stamps : [];
    }

    function countryCounts() {
        const counts = new Map();
        const canonical = typeof canonicalCountry === 'function'
            ? canonicalCountry
            : function (name) { return name; };
        stampsData().forEach(function (stamp) {
            const name = canonical(stamp.country);
            counts.set(name, (counts.get(name) || 0) + 1);
        });
        return counts;
    }

    function themeCounts() {
        const counts = new Map();
        stampsData().forEach(function (stamp) {
            const hay = (stamp.name + ' ' + (stamp.desc || '')).toLowerCase();
            Object.keys(THEME_KEYWORDS).forEach(function (label) {
                if (THEME_KEYWORDS[label].test(hay)) counts.set(label, (counts.get(label) || 0) + 1);
            });
        });
        return counts;
    }

    function activeTheme() {
        return filterState.theme ? THEME_KEYWORDS[filterState.theme] : null;
    }

    /* ---------- rendering ---------- */

    function availabilityCounts() {
        const data = stampsData();
        return {
            all: data.length,
            available: data.filter(function (s) { return !s.isSoldOut; }).length,
            sold: data.filter(function (s) { return s.isSoldOut; }).length,
            sale: data.filter(function (s) { return s.onSale === true; }).length
        };
    }

    function activeTabStatus() {
        // The sticky tab bar was removed; active status now comes from
        // script.js's state directly (synced by the availability card).
        if (typeof state !== 'undefined' && state) {
            if (state.saleActive) return 'sale';
            if (state.statusFilter) return state.statusFilter;
        }
        return 'all';
    }

    /* Show the rail on the catalogue, hide it on item/blog views.
     * script.js always adds .no-sidebar when the promo card is disabled,
     * so we manage our own .rail-collapsed class instead. */
    function syncRail() {
        const wrapper = document.querySelector('.layout-wrapper');
        if (!wrapper) return;
        const params = new URLSearchParams(window.location.search);
        const itemMode = params.has('item');
        const blogMode = itemMode ? false : (typeof state !== 'undefined' && state && state.statusFilter === 'blog');
        const hide = itemMode || blogMode;
        wrapper.classList.toggle('rail-collapsed', hide);
        if (!hide) wrapper.classList.remove('no-sidebar');
    }

    // Wrap renderGallery (declared globally in script.js) so the rail survives
    // every re-render, including script.js's own initial pass.
    const originalRenderGallery = typeof window.renderGallery === 'function' ? window.renderGallery : null;

    function renderGalleryWrapper(data) {
        if (originalRenderGallery) originalRenderGallery(data);
        syncRail();
    }

    function renderAvailability() {
        if (!els.availability) return;
        const counts = availabilityCounts();
        const current = activeTabStatus();
        const rows = [
            { value: 'all', label: 'All items', count: counts.all },
            { value: 'available', label: 'Available', count: counts.available },
            { value: 'sold', label: 'Sold out', count: counts.sold },
            { value: 'sale', label: 'On sale', count: counts.sale }
        ];
        els.availability.innerHTML = rows.map(function (row) {
            const isActive = current === row.value;
            return '<button type="button" data-status="' + row.value + '" class="seg' +
                (isActive ? ' is-active' : '') + '" aria-pressed="' + isActive + '">' +
                '<span>' + esc(row.label) + '</span><b class="seg-count">' + row.count + '</b>' +
                '</button>';
        }).join('');
    }

    function renderCountries() {
        if (!els.country) return;
        const counts = Array.from(countryCounts().entries())
            .sort(function (a, b) { return b[1] - a[1] || a[0].localeCompare(b[0]); });
        const term = els.countrySearch ? els.countrySearch.value.trim().toLowerCase() : '';

        const visible = term
            ? counts.filter(function (entry) { return entry[0].toLowerCase().indexOf(term) !== -1; })
            : counts;

        const chips = [
            '<button type="button" data-country="" class="chip' + (filterState.country === '' ? ' is-active' : '') + '">' +
            'All countries<em>' + stampsData().length + '</em></button>'
        ];
        visible.forEach(function (entry) {
            chips.push(
                '<button type="button" data-country="' + esc(entry[0]) + '" class="chip' +
                (filterState.country === entry[0] ? ' is-active' : '') + '">' +
                esc(entry[0]) + '<em>' + entry[1] + '</em></button>'
            );
        });
        els.country.innerHTML = chips.join('');

        const meta = document.getElementById('countryAccMeta');
        if (meta) meta.textContent = counts.length;
    }

    function renderThemes() {
        if (!els.theme) return;
        const counts = Array.from(themeCounts().entries())
            .filter(function (entry) { return entry[1] > 0; })
            .sort(function (a, b) { return b[1] - a[1] || a[0].localeCompare(b[0]); });
        const chips = [
            '<button type="button" data-theme="" class="chip' + (filterState.theme === '' ? ' is-active' : '') + '">' +
            'All themes<em>' + stampsData().length + '</em></button>'
        ];
        counts.forEach(function (entry) {
            chips.push(
                '<button type="button" data-theme="' + esc(entry[0]) + '" class="chip' +
                (filterState.theme === entry[0] ? ' is-active' : '') + '">' +
                esc(entry[0]) + '<em>' + entry[1] + '</em></button>'
            );
        });
        els.theme.innerHTML = chips.join('');

        const meta = document.getElementById('themeAccMeta');
        if (meta) meta.textContent = counts.length;
    }

    function render() {
        renderAvailability();
        renderCountries();
        renderThemes();
        updateClearButton();
    }

    /* ---------- filtering (replaces filterStamps with a country/theme-aware one) ---------- */

    function applyFilters() {
        const query = (document.getElementById('stampSearch') || {}).value || '';
        searchInputHandler(query);
    }

    // Wrap the original filterStamps (declared as a global function in script.js)
    const originalFilterStamps = typeof window.filterStamps === 'function' ? window.filterStamps : null;

    function searchInputHandler(query) {
        const term = String(query || '').toLowerCase().trim();
        const statusFilter = activeTabStatus();
        const saleActive = typeof state !== 'undefined' && state && state.saleActive;
        const useBlog = statusFilter === 'blog' && !(saleActive);

        if (useBlog || !originalFilterStamps) {
            if (originalFilterStamps) return originalFilterStamps(query);
        }

        const filtered = stampsData().filter(function (item) {
            // 1. Text search
            const textMatch = !term || (
                String(item.name || '').toLowerCase().includes(term) ||
                String(item.country || '').toLowerCase().includes(term) ||
                (item.desc || '').toLowerCase().includes(term)
            );

            // 2. Status match
            let statusMatch = true;
            if (statusFilter === 'available') statusMatch = !item.isSoldOut;
            if (statusFilter === 'sold') statusMatch = item.isSoldOut;

            // 3. Sale override
            if (saleActive) statusMatch = statusMatch && item.onSale === true;

            // 4. Country filter
            const canonical = typeof canonicalCountry === 'function'
                ? canonicalCountry
                : function (name) { return name; };
            const countryMatch = !filterState.country ||
                canonical(item.country) === filterState.country;

            // 5. Theme filter
            const hay = String(item.name || '') + ' ' + (item.desc || '');
            const realm = activeTheme();
            const themeMatch = !realm || realm.test(hay);

            return textMatch && statusMatch && countryMatch && themeMatch;
        });

        renderGallery(filtered);
    }

    // Expose with the same name so the existing search box / tabs keep calling
    // "filterStamps" and automatically pick up the country/theme filters.
    try {
        Object.defineProperty(window, 'filterStamps', {
            configurable: true,
            get: function () { return searchInputHandler; },
            set: function () { /* script.js reloads are ignored */ }
        });
    } catch (e) {
        window.filterStamps = searchInputHandler;
    }

    if (originalRenderGallery) {
        try {
            Object.defineProperty(window, 'renderGallery', {
                configurable: true,
                get: function () { return renderGalleryWrapper; },
                set: function () { /* ignore re-assignments from script.js */ }
            });
        } catch (e) {
            window.renderGallery = renderGalleryWrapper;
        }
    }

    /* ---------- events ---------- */

    /* After a filter click, bring the stamp grid back into view so the user
     * sees the result immediately (the rail can be long; the grid starts at
     * the top of the content column, right beside the search bar). */
    function scrollToGridTop() {
        const grid = document.getElementById('stampGrid');
        if (!grid) return;
        const header = document.querySelector('.search-sticky-container');
        const offset = header ? header.offsetHeight : 0;
        const top = grid.getBoundingClientRect().top + window.pageYOffset - offset - 8;
        window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    }

    if (els.availability) {
        els.availability.addEventListener('click', function (event) {
            const button = event.target.closest('button[data-status]');
            if (!button) return;
            const value = button.getAttribute('data-status');

            // Mirror the old sticky-tab click handler from script.js
            // (status + sale reset + session storage) so deep links and
            // back-button behaviour survive the tab bar's removal.
            if (typeof state !== 'undefined' && state) {
                if (value === 'sale') {
                    state.statusFilter = 'all';
                    state.saleActive = true;
                } else {
                    state.statusFilter = value;
                    state.saleActive = false;
                }
                sessionStorage.setItem('activeTab', value);
            }
            const saleBell = document.getElementById('saleBell');
            if (saleBell) saleBell.classList.toggle('active', value === 'sale');

            if (typeof resetSaleFlag === 'function') resetSaleFlag(); // no-op if absent
            searchInputHandler((document.getElementById('stampSearch') || {}).value || '');
            renderAvailability();
            updateClearButton();
            syncQuickChips();
            syncRail();
            scrollToGridTop();
        });
    }

    if (els.country) {
        els.country.addEventListener('click', function (event) {
            const button = event.target.closest('button[data-country]');
            if (!button) return;
            const value = button.getAttribute('data-country') || '';
            // Tapping the active chip clears the country again.
            filterState.country = (value && value === filterState.country) ? '' : value;
            renderCountries();
            updateClearButton();
            applyFilters();
            scrollToGridTop();
        });
    }

    if (els.countrySearch) {
        els.countrySearch.addEventListener('input', renderCountries);
    }

    if (els.theme) {
        els.theme.addEventListener('click', function (event) {
            const button = event.target.closest('button[data-theme]');
            if (!button) return;
            const value = button.getAttribute('data-theme') || '';
            // Tapping the active chip clears the theme again.
            filterState.theme = (value && value === filterState.theme) ? '' : value;
            renderThemes();
            updateClearButton();
            syncQuickChips();
            applyFilters();
            scrollToGridTop();
        });
    }

    if (quickChips.length) {
        quickChips.forEach(function (chip) {
            chip.addEventListener('click', function () {
                const type = chip.getAttribute('data-quick-type');
                const value = chip.getAttribute('data-quick-value') || '';
                let target = null;

                if (type === 'status') {
                    target = els.availability
                        ? els.availability.querySelector('button[data-status="' + value + '"]')
                        : null;
                } else {
                    // Tapping the active theme chip clears the theme again.
                    const nextTheme = chip.classList.contains('is-active') ? '' : value;
                    target = els.theme
                        ? els.theme.querySelector('button[data-theme="' + nextTheme + '"]')
                        : null;
                }

                if (target) target.click();
                syncQuickChips();
            });
        });
    }

    if (els.clear) {
        els.clear.addEventListener('click', function () {
            filterState.country = '';
            filterState.theme = '';
            render();
            syncQuickChips();
            applyFilters();
            scrollToGridTop();
        });
    }

    // Keep our Availability card in sync when the sale bell toggles.
    const saleBell = document.getElementById('saleBell');
    if (saleBell) saleBell.addEventListener('click', function () {
        if (typeof state !== 'undefined' && state && state.saleActive) state.statusFilter = 'all';
        renderAvailability();
    });

    // First render
    render();
    syncQuickChips();

    // Hero stats (total items, countries, availability) computed once
    function renderHeroStats() {
        const data = stampsData();
        const countries = countryCounts();
        const set = function (id, text) {
            const el = document.getElementById(id);
            if (el) el.textContent = text;
        };
        set('catalogHeroCount',
            data.length + (data.length === 1 ? ' stamp item' : ' stamp items'));
        set('catalogHeroCountries',
            countries.size + (countries.size === 1 ? ' country' : ' countries'));
        set('catalogHeroAvailable',
            data.filter(function (s) { return !s.isSoldOut; }).length + ' available now');
    }
    renderHeroStats();

    // Blog hero stats: post count + newest post title (blog.js data)
    function renderBlogHeroStats() {
        const posts = (typeof blogPosts !== 'undefined' && Array.isArray(blogPosts)) ? blogPosts : [];
        const set = function (id, text) {
            const el = document.getElementById(id);
            if (el) el.textContent = text;
        };
        set('blogHeroCount', posts.length + (posts.length === 1 ? ' story' : ' stories'));
        const latest = posts.length ? posts[0].name : '';
        if (latest) {
            const latestEl = document.getElementById('blogHeroLatest');
            if (latestEl) {
                latestEl.textContent = 'Latest: ' + (latest.length > 42 ? latest.slice(0, 42) + '\u2026' : latest);
            }
        }
    }
    renderBlogHeroStats();

    // Re-apply the filters once: script.js's init already rendered the grid
    // before this script could patch filterStamps, so statusFilter/sale
    // deep-links (?tab=, ?sale=1) and any sticky-tab state get honoured now,
    // and the rail visibility is restored for the default (promo off) case.
    applyFilters();
    syncRail();

    // script.js applies ?tab=sale / localStorage deep-links inside its own
    // DOMContentLoaded handler (registered before this script), so re-sync the
    // segmented availability + quick chips once the final state is known.
    document.addEventListener('DOMContentLoaded', function () {
        renderAvailability();
        syncQuickChips();
        updateClearButton();
    });
})();

/* ------------------------------------------------------------------
 * Stamp-card hover popout: descriptions are clamped to 3 lines; on
 * hover a floating panel below the card shows the full text without
 * reflowing the grid.
 * ------------------------------------------------------------------ */
(function () {
    'use strict';
    const grid = document.getElementById('stampGrid');
    if (!grid) return;

    grid.addEventListener('mouseover', function (event) {
        const card = event.target.closest('.stamp-card');
        if (!card || card.querySelector(':scope > .desc-popout')) return;
        const desc = card.querySelector('.stamp-desc');
        if (!desc || desc.scrollHeight <= desc.clientHeight + 2) return; /* fully visible already */

        const popout = document.createElement('div');
        popout.className = 'desc-popout';
        popout.innerHTML = desc.innerHTML;
        card.appendChild(popout);
        card.style.overflow = 'visible';
    });

    grid.addEventListener('mouseout', function (event) {
        const card = event.target.closest('.stamp-card');
        if (!card) return;
        if (card.contains(event.relatedTarget)) return; /* moving within card */
        const popout = card.querySelector(':scope > .desc-popout');
        if (popout) popout.remove();
        card.style.overflow = '';
    });
})();
