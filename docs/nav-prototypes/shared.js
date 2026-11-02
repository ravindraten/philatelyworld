/* ==========================================================================
   Nav prototypes — shared behaviour
   Prototype A: global minimal + local subnav + collection index
   Prototype B: search-first + explore slide-over
   ========================================================================== */

(function () {
    'use strict';

    var CDN = 'https://filedn.eu/lbu0dswNxxUBjQKg0kNdmLu/philatelyworld-images/images';

    /* ---------------------------------------------------------------------
       Demo data — 12 sample lots from the real 149-item catalogue, plus the
       real country/theme counts used by the filter panels.
       --------------------------------------------------------------------- */

    var LOTS = [
        {
            id: 'D148',
            name: '8 different postcards from India with cancelled stamps — Puppets of India',
            country: 'India',
            year: '2026',
            price: 860,
            theme: 'Postcards',
            format: 'Postcards',
            era: 'Modern',
            tag: 'New',
            sold: false
        },
        {
            id: 'D146',
            name: 'World classic super collection 1840–1900',
            country: 'Worldwide',
            year: '1840–1900',
            price: null,
            theme: 'Rarities',
            format: 'Collections',
            era: 'Classic',
            tag: 'Rare',
            sold: false
        },
        {
            id: 'D145',
            name: 'Stamp sheetlets on the theme of cartoons — 15 sheets',
            country: 'Germany',
            year: '2022–2026',
            price: 18000,
            theme: 'Cartoons',
            format: 'Sheets',
            era: 'Modern',
            tag: 'New',
            sold: false
        },
        {
            id: 'D144',
            name: 'Postal stationery from Indian States 1891–1947',
            country: 'India',
            year: '1891–1947',
            price: 126500,
            theme: 'Postal history',
            format: 'Collections',
            era: 'Golden Age',
            tag: 'Rare',
            sold: false
        },
        {
            id: 'D143',
            name: '245 different stamps from Germany Bundespost',
            country: 'Germany',
            year: 'Various',
            price: 1250,
            theme: 'Country lots',
            format: 'Sets',
            era: 'Post-war',
            tag: '',
            sold: false
        },
        {
            id: 'D142',
            name: 'Albania, North Ingria and Georgia collection in stockbook',
            country: 'Albania',
            year: 'Various',
            price: 69000,
            theme: 'Rarities',
            format: 'Collections',
            era: 'Classic',
            tag: 'Rare',
            sold: false
        },
        {
            id: 'D141',
            name: 'Two albums of Russia, 1954–1965 & 1965–1976',
            country: 'Russia',
            year: '1954–1976',
            price: 40000,
            theme: 'Country lots',
            format: 'Collections',
            era: 'Post-war',
            tag: '',
            sold: false
        },
        {
            id: 'D140',
            name: 'India, Commonwealth and old states collection in album',
            country: 'India',
            year: 'Various',
            price: 27000,
            theme: 'Country lots',
            format: 'Collections',
            era: 'Mixed',
            tag: '',
            sold: true
        },
        {
            id: 'D139',
            name: 'First day covers of the Netherlands, 1960s',
            country: 'Netherlands',
            year: '1960s',
            price: 2400,
            theme: 'FDCs',
            format: 'Covers & FDCs',
            era: 'Post-war',
            tag: '',
            sold: false
        },
        {
            id: 'D138',
            name: 'Birds of the world — mint commemorative set',
            country: 'Worldwide',
            year: '2024',
            price: 3200,
            theme: 'Birds',
            format: 'Sets',
            era: 'Modern',
            tag: '',
            sold: false
        },
        {
            id: 'D137',
            name: 'Red Cross centenary miniature sheet',
            country: 'Montenegro',
            year: '2025',
            price: 800,
            theme: 'Red Cross',
            format: 'Sheets',
            era: 'Modern',
            tag: '',
            sold: false
        },
        {
            id: 'D136',
            name: 'Space exploration commemoratives',
            country: 'Russia',
            year: '1970s',
            price: 4500,
            theme: 'Space & Astronomy',
            format: 'Sets',
            era: 'Post-war',
            tag: '',
            sold: false
        }
    ];

    var COUNTRIES = [
        ['Netherlands', 18], ['Germany', 16], ['Various Countries', 14], ['India', 13],
        ['German Empire', 8], ['France', 7], ['German Reich', 5], ['Great Britain', 4],
        ['World', 4], ['Worldwide', 4], ['Belgium', 3], ['Czechoslovakia', 3],
        ['International', 3], ['Germany Bayern', 2], ['Italy', 2], ['Albania', 1],
        ['Australia', 1], ['Austria', 1], ['Belgian Congo', 1], ['Bhutan', 1],
        ['Commonwealth', 1], ['Dutch Antilles', 1], ['Europe', 1], ['Hungary', 1],
        ['Iceland', 1], ['Iraq', 1], ['Israel', 1], ['Liechtenstein', 1],
        ['Montenegro', 1], ['Romania', 1], ['Russia', 1], ['Spain', 1],
        ['Suriname', 1], ['Sweden', 1], ['Switzerland', 1], ['Tunisia', 1],
        ['Ukraine', 1], ['United Nations', 1], ['West Germany', 1]
    ].map(function (pair) {
        return { name: pair[0], count: pair[1] };
    });

    var THEMES = [
        ['FDCs', 15], ['Miniature sheets & sheetlets', 14], ['Birds', 13],
        ['Postcards', 11], ['Ships & Nautical', 10], ['Butterflies & Nature', 5],
        ['Europa CEPT', 5], ['WWII & Third Reich', 4], ['Red Cross', 3],
        ['Royalty', 2], ['Space & Astronomy', 2], ['Cartoons', 1],
        ['Masks & Folk', 1]
    ].map(function (pair) {
        return { name: pair[0], count: pair[1] };
    });

    var ERAS = [
        { name: 'Classic', range: '1840–1900', count: 28 },
        { name: 'Golden Age', range: '1900–1945', count: 34 },
        { name: 'Post-war', range: '1946–1979', count: 41 },
        { name: 'Modern', range: '1980–now', count: 38 },
        { name: 'Mixed', range: 'Multi-era', count: 8 }
    ];

    var FORMATS = [
        { name: 'Singles', count: 52 },
        { name: 'Sets', count: 31 },
        { name: 'Sheets', count: 22 },
        { name: 'Covers & FDCs', count: 18 },
        { name: 'Postcards', count: 11 },
        { name: 'Collections', count: 15 }
    ];

    var PAGES = [
        { name: 'Philatelic News', meta: 'Journal', href: '../philatelic-news.html' },
        { name: 'Exhibitions', meta: 'Events', href: '../philatelic-exhibitions.html' },
        { name: 'Album Designer', meta: 'Tool', href: '../AlbumDesigner/albumeasy.html' },
        { name: 'Blog', meta: 'Journal', href: '../index.html?tab=blog' }
    ];

    var ANNOUNCEMENTS = [
        { text: 'Free tracked shipping on orders over €150', href: '#', link: 'Shipping details' },
        { text: 'New arrivals: autumn 2026 selections just added', href: '#', link: 'Browse new lots' },
        { text: 'Visiting Philatelic Exhibition 2026? Say hello at stand B12', href: '#', link: 'Exhibition details' },
        { text: 'Support the gallery — every purchase helps the collection grow', href: '#', link: 'About us' }
    ];

    /* ---------------------------------------------------------------------
       Helpers
       --------------------------------------------------------------------- */

    function $(selector, root) {
        return (root || document).querySelector(selector);
    }

    function $$(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function esc(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    var currency = 'INR';
    var EUR_RATE = 90;

    function money(inr) {
        if (inr == null) return 'Ask for price';
        if (currency === 'EUR') {
            var eur = inr / EUR_RATE;
            return '€' + new Intl.NumberFormat('en-GB', {
                maximumFractionDigits: eur < 100 ? 1 : 0
            }).format(eur);
        }
        return '₹' + new Intl.NumberFormat('en-IN', {
            maximumFractionDigits: 0
        }).format(inr);
    }

    function applyCurrency() {
        $$('.js-price').forEach(function (el) {
            var inr = el.getAttribute('data-inr');
            el.textContent = inr === '' ? 'Ask for price' : money(Number(inr));
        });
        $$('[data-currency-label]').forEach(function (el) {
            el.textContent = currency;
        });
        $$('[data-currency-symbol]').forEach(function (el) {
            el.textContent = currency === 'INR' ? '₹' : '€';
        });
    }

    function lotCard(lot) {
        var price = lot.price == null
            ? 'Ask for price'
            : '<span class="js-price" data-inr="' + lot.price + '">' + money(lot.price) + '</span>';
        var tag = lot.sold
            ? '<span class="lot-tag sold">Sold</span>'
            : lot.tag
                ? '<span class="lot-tag ' + (lot.tag === 'New' ? 'new' : '') + '">' + esc(lot.tag) + '</span>'
                : '';

        return [
            '<article class="lot-card">',
            '  <div class="lot-media">',
            '    <img src="' + CDN + '/' + esc(lot.id) + '/1.jpg" alt="' + esc(lot.name) + '" loading="lazy" width="400" height="300">',
            '    ' + tag,
            '  </div>',
            '  <div class="lot-body">',
            '    <span class="lot-country">' + esc(lot.country) + '</span>',
            '    <h3 class="lot-name">' + esc(lot.name) + '</h3>',
            '    <div class="lot-foot">',
            '      <span class="lot-price">' + price + '</span>',
            '      <span class="lot-year">' + esc(lot.year) + '</span>',
            '    </div>',
            '  </div>',
            '</article>'
        ].join('');
    }

    function emptyState(message) {
        return [
            '<div class="empty-state">',
            '  <h3>No lots match those filters</h3>',
            '  <p>' + esc(message || 'Try removing a filter, or clear everything and start again.') + '</p>',
            '  <p style="margin-top:14px"><button type="button" class="btn btn-ghost" data-clear-all>Clear all filters</button></p>',
            '</div>'
        ].join('');
    }

    function renderLots(container, lots) {
        if (!container) return;
        container.innerHTML = lots.length
            ? lots.map(lotCard).join('')
            : emptyState('Nothing in the 12-lot sample matches this combination. The full catalogue has 149 lots.');
        applyCurrency();
    }

    function matches(lot, state) {
        if (state.countries && state.countries.size && !state.countries.has(lot.country)) return false;
        if (state.country && lot.country !== state.country) return false;
        if (state.themes && state.themes.size && !state.themes.has(lot.theme)) return false;
        if (state.theme && lot.theme !== state.theme) return false;
        if (state.era && lot.era !== state.era) return false;
        if (state.format && lot.format !== state.format) return false;
        if (state.availability === 'available' && lot.sold) return false;
        if (state.availability === 'sold' && !lot.sold) return false;
        if (state.maxPrice && lot.price != null && lot.price > state.maxPrice) return false;
        if (state.query) {
            var hay = [lot.name, lot.country, lot.theme, lot.format, lot.era, lot.year]
                .join(' ').toLowerCase();
            if (hay.indexOf(state.query.toLowerCase()) === -1) return false;
        }
        return true;
    }

    function describe(state) {
        var bits = [];
        if (state.query) bits.push('“' + state.query + '”');
        if (state.country) bits.push(state.country);
        if (state.countries && state.countries.size) bits.push(Array.from(state.countries).join(', '));
        if (state.theme) bits.push(state.theme);
        if (state.themes && state.themes.size) bits.push(Array.from(state.themes).join(', '));
        if (state.era) bits.push(state.era);
        if (state.format) bits.push(state.format);
        if (state.availability) bits.push(state.availability === 'available' ? 'Available now' : 'Sold');
        if (state.maxPrice) bits.push('up to ' + money(state.maxPrice));
        return bits.length ? bits.join(' · ') : 'All sample lots';
    }

    function renderActive(el, state, onRemove) {
        if (!el) return;
        var chips = [];
        if (state.query) chips.push(['query', '“' + state.query + '”']);
        if (state.country) chips.push(['country:' + state.country, state.country]);
        if (state.countries) state.countries.forEach(function (c) { chips.push(['country:' + c, c]); });
        if (state.theme) chips.push(['theme:' + state.theme, state.theme]);
        if (state.themes) state.themes.forEach(function (t) { chips.push(['theme:' + t, t]); });
        if (state.era) chips.push(['era', state.era]);
        if (state.format) chips.push(['format', state.format]);
        if (state.availability) chips.push(['availability', state.availability === 'available' ? 'Available now' : 'Sold']);
        if (state.maxPrice) chips.push(['price', 'Up to ' + money(state.maxPrice)]);

        el.innerHTML = chips.map(function (chip) {
            return '<span class="active-chip">' + esc(chip[1]) +
                '<button type="button" data-remove="' + esc(chip[0]) + '" aria-label="Remove ' + esc(chip[1]) + '">&times;</button></span>';
        }).join('');

        if (!el.dataset.bound) {
            el.dataset.bound = 'true';
            el.addEventListener('click', function (event) {
                var button = event.target.closest('[data-remove]');
                if (button) onRemove(button.getAttribute('data-remove'));
            });
        }
    }

    function clearState(state) {
        Object.keys(state).forEach(function (key) {
            if (key === 'countries' || key === 'themes') state[key].clear();
            else if (key === 'sort') state.sort = 'newest';
            else if (key === 'maxPrice') state.maxPrice = 0;
            else state[key] = '';
        });
    }

    /* ---------------------------------------------------------------------
       Shared: announcement strip
       --------------------------------------------------------------------- */

    function initAnnounce() {
        var textEl = $('#announceText');
        var dotsEl = $('#announceDots');
        var linkEl = $('#announceLink');
        if (!textEl) return;

        var index = 0;
        var timer = null;

        if (dotsEl) {
            dotsEl.innerHTML = ANNOUNCEMENTS.map(function (_, i) {
                return '<button type="button" aria-label="Announcement ' + (i + 1) + '"' +
                    (i === 0 ? ' class="is-active"' : '') + '></button>';
            }).join('');
            dotsEl.addEventListener('click', function (event) {
                var button = event.target.closest('button');
                if (!button) return;
                var i = Array.prototype.indexOf.call(dotsEl.children, button);
                show(i, true);
            });
        }

        function show(i, manual) {
            index = (i + ANNOUNCEMENTS.length) % ANNOUNCEMENTS.length;
            textEl.classList.add('is-fading');
            window.setTimeout(function () {
                var item = ANNOUNCEMENTS[index];
                textEl.textContent = item.text;
                if (linkEl) {
                    linkEl.textContent = item.link;
                    linkEl.href = item.href;
                }
                textEl.classList.remove('is-fading');
            }, 160);
            if (dotsEl) {
                Array.prototype.forEach.call(dotsEl.children, function (dot, di) {
                    dot.classList.toggle('is-active', di === index);
                });
            }
            if (manual) restart();
        }

        function restart() {
            if (timer) window.clearInterval(timer);
            timer = window.setInterval(function () { show(index + 1); }, 5500);
        }

        restart();
    }

    function initCurrency() {
        $$('[data-currency-toggle]').forEach(function (button) {
            button.addEventListener('click', function () {
                currency = currency === 'INR' ? 'EUR' : 'INR';
                button.setAttribute('aria-label', 'Switch currency, currently ' + currency);
                applyCurrency();
                document.dispatchEvent(new CustomEvent('currencychange'));
            });
        });
        applyCurrency();
    }

    /* ---------------------------------------------------------------------
       PROTOTYPE A
       --------------------------------------------------------------------- */

    function initA() {
        var state = {
            country: '',
            theme: '',
            era: '',
            format: '',
            availability: '',
            query: ''
        };

        var grid = $('#lotGrid');
        var countEl = $('#resultCount');
        var summaryEl = $('#catalogSummary');
        var activeEl = $('#activeFiltersA');

        function render() {
            var lots = LOTS.filter(function (lot) { return matches(lot, state); });
            renderLots(grid, lots);
            if (countEl) countEl.innerHTML = '<strong>' + lots.length + '</strong> sample lots';
            if (summaryEl) summaryEl.textContent = describe(state);
            renderActive(activeEl, state, removeFilter);
            syncChips();

            var allBtn = $('#allLotsBtn');
            if (allBtn) {
                allBtn.classList.toggle('is-active',
                    !state.country && !state.theme && !state.era &&
                    !state.format && !state.query && !state.availability);
            }
        }

        function removeFilter(key) {
            var parts = key.split(':');
            var field = parts[0];
            var value = parts.slice(1).join(':');
            if (field === 'country' && state.country === value) state.country = '';
            else if (field === 'theme' && state.theme === value) state.theme = '';
            else if (field === 'query') state.query = '';
            else if (field === 'era') state.era = '';
            else if (field === 'format') state.format = '';
            else if (field === 'availability') state.availability = '';
            render();
        }

        function syncChips() {
            $$('[data-country]').forEach(function (chip) {
                chip.classList.toggle('is-active', chip.getAttribute('data-country') === state.country);
            });
            $$('[data-theme]').forEach(function (chip) {
                chip.classList.toggle('is-active', chip.getAttribute('data-theme') === state.theme);
            });
            $$('[data-era]').forEach(function (chip) {
                chip.classList.toggle('is-active', chip.getAttribute('data-era') === state.era);
            });
            $$('[data-format]').forEach(function (chip) {
                chip.classList.toggle('is-active', chip.getAttribute('data-format') === state.format);
            });
        }

        function clearAll() {
            clearState(state);
            render();
        }

        /* --- mega menu --- */
        var browseToggle = $('#browseToggle');
        var mega = $('#mega-browse');

        function setMega(open) {
            if (!browseToggle || !mega) return;
            browseToggle.setAttribute('aria-expanded', String(open));
            mega.hidden = !open;
        }

        if (browseToggle) {
            browseToggle.addEventListener('click', function (event) {
                event.stopPropagation();
                setMega(mega.hidden);
            });
            document.addEventListener('click', function (event) {
                if (!mega.hidden && !event.target.closest('.masthead')) setMega(false);
            });
        }

        /* --- mobile menu --- */
        var menuToggle = $('#menuToggle');
        var masthead = $('.masthead');
        if (menuToggle) {
            menuToggle.addEventListener('click', function (event) {
                event.stopPropagation();
                var open = masthead.classList.toggle('nav-open');
                menuToggle.setAttribute('aria-expanded', String(open));
                menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
            });
            $$('.primary a, .primary .nav-link').forEach(function (link) {
                if (link === browseToggle) return;
                link.addEventListener('click', function () {
                    masthead.classList.remove('nav-open');
                    menuToggle.setAttribute('aria-expanded', 'false');
                });
            });
            document.addEventListener('click', function (event) {
                if (!masthead.classList.contains('nav-open')) return;
                if (!masthead.contains(event.target)) {
                    masthead.classList.remove('nav-open');
                    menuToggle.setAttribute('aria-expanded', 'false');
                }
            });
        }

        /* --- search overlay --- */
        var overlay = $('#searchOverlay');
        var searchInput = $('#overlaySearchInput');

        function openSearch() {
            if (!overlay) return;
            overlay.hidden = false;
            document.body.classList.add('is-locked');
            window.setTimeout(function () { if (searchInput) searchInput.focus(); }, 20);
        }

        function closeSearch() {
            if (!overlay) return;
            overlay.hidden = true;
            document.body.classList.remove('is-locked');
        }

        $$('[data-open-search]').forEach(function (button) {
            button.addEventListener('click', openSearch);
        });
        $$('[data-close-search]').forEach(function (button) {
            button.addEventListener('click', closeSearch);
        });
        if (overlay) {
            overlay.addEventListener('click', function (event) {
                if (event.target === overlay) closeSearch();
            });
        }

        var searchForm = $('#overlaySearchForm');
        if (searchForm) {
            searchForm.addEventListener('submit', function (event) {
                event.preventDefault();
                state.query = searchInput.value.trim();
                closeSearch();
                render();
                scrollToResults();
            });
        }

        $$('[data-search-term]').forEach(function (button) {
            button.addEventListener('click', function () {
                state.query = button.getAttribute('data-search-term');
                if (searchInput) searchInput.value = state.query;
                closeSearch();
                render();
                scrollToResults();
            });
        });

        function scrollToResults() {
            var target = $('#catalogResults');
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        /* --- local subnav panels --- */
        var panelButtons = $$('.subnav-link[data-panel]');
        var panels = $$('.subnav-panel');

        function closePanels(except) {
            panels.forEach(function (panel) {
                if (panel === except) return;
                panel.hidden = true;
            });
            panelButtons.forEach(function (button) {
                if (button.getAttribute('data-panel') === (except ? except.id.replace('panel-', '') : '')) return;
                button.setAttribute('aria-expanded', 'false');
            });
        }

        panelButtons.forEach(function (button) {
            button.addEventListener('click', function (event) {
                event.stopPropagation();
                var panel = $('#panel-' + button.getAttribute('data-panel'));
                if (!panel) return;
                var open = panel.hidden;
                closePanels(open ? panel : null);
                panel.hidden = !open;
                button.setAttribute('aria-expanded', String(open));
            });
        });

        document.addEventListener('click', function (event) {
            if (!event.target.closest('.subnav')) closePanels(null);
        });

        /* --- filter clicks (subnav, mega menu, quick links) --- */
        document.addEventListener('click', function (event) {
            var country = event.target.closest('[data-country]');
            var theme = event.target.closest('[data-theme]');
            var era = event.target.closest('[data-era]');
            var format = event.target.closest('[data-format]');

            if (country && country.closest('.subnav-panel, .mega, .subnav, .search-card')) {
                event.preventDefault();
                state.country = state.country === country.getAttribute('data-country') ? '' : country.getAttribute('data-country');
                state.query = '';
                closePanels(null);
                setMega(false);
                render();
                scrollToResults();
                return;
            }
            if (theme && theme.closest('.subnav-panel, .mega, .subnav')) {
                event.preventDefault();
                state.theme = state.theme === theme.getAttribute('data-theme') ? '' : theme.getAttribute('data-theme');
                state.query = '';
                closePanels(null);
                setMega(false);
                render();
                scrollToResults();
                return;
            }
            if (era && era.closest('.subnav-panel')) {
                event.preventDefault();
                state.era = state.era === era.getAttribute('data-era') ? '' : era.getAttribute('data-era');
                closePanels(null);
                render();
                scrollToResults();
                return;
            }
            if (format && format.closest('.subnav-panel')) {
                event.preventDefault();
                state.format = state.format === format.getAttribute('data-format') ? '' : format.getAttribute('data-format');
                closePanels(null);
                render();
                scrollToResults();
                return;
            }
            if (event.target.closest('[data-clear-all]')) {
                event.preventDefault();
                closePanels(null);
                setMega(false);
                clearAll();
            }
        });

        /* --- build panels + mega menu --- */
        var countryChips = $('#countryChips');
        if (countryChips) {
            countryChips.innerHTML = COUNTRIES.map(function (country) {
                return '<button type="button" class="filter-chip" data-country="' + esc(country.name) + '">' +
                    esc(country.name) + '<span class="n">' + country.count + '</span></button>';
            }).join('');
        }

        var countrySearch = $('#countryPanelSearch');
        if (countrySearch) {
            countrySearch.addEventListener('input', function () {
                var term = countrySearch.value.trim().toLowerCase();
                $$('#countryChips .filter-chip').forEach(function (chip) {
                    chip.style.display = chip.getAttribute('data-country').toLowerCase().indexOf(term) === -1 ? 'none' : '';
                });
            });
        }

        var themeChips = $('#themeChips');
        if (themeChips) {
            themeChips.innerHTML = THEMES.map(function (theme) {
                return '<button type="button" class="filter-chip" data-theme="' + esc(theme.name) + '">' +
                    esc(theme.name) + '<span class="n">' + theme.count + '</span></button>';
            }).join('');
        }

        var eraCards = $('#eraCards');
        if (eraCards) {
            eraCards.innerHTML = ERAS.map(function (era) {
                return '<button type="button" class="era-card" data-era="' + esc(era.name) + '">' +
                    '<span>' + esc(era.range) + '</span>' +
                    '<strong>' + esc(era.name) + '</strong>' +
                    '<small>' + era.count + ' lots</small></button>';
            }).join('');
        }

        var formatChips = $('#formatChips');
        if (formatChips) {
            formatChips.innerHTML = FORMATS.map(function (format) {
                return '<button type="button" class="filter-chip" data-format="' + esc(format.name) + '">' +
                    esc(format.name) + '<span class="n">' + format.count + '</span></button>';
            }).join('');
        }

        var megaCountries = $('#megaCountries');
        if (megaCountries) {
            megaCountries.innerHTML = COUNTRIES.slice(0, 15).map(function (country) {
                return '<button type="button" class="mega-link" data-country="' + esc(country.name) + '">' +
                    '<span>' + esc(country.name) + '</span><span class="count">' + country.count + '</span></button>';
            }).join('');
        }

        var megaThemes = $('#megaThemes');
        if (megaThemes) {
            megaThemes.innerHTML = THEMES.slice(0, 8).map(function (theme) {
                return '<button type="button" class="mega-link" data-theme="' + esc(theme.name) + '">' +
                    '<span>' + esc(theme.name) + '</span><span class="count">' + theme.count + '</span></button>';
            }).join('');
        }

        /* --- escape closes everything --- */
        document.addEventListener('keydown', function (event) {
            if (event.key !== 'Escape') return;
            if (overlay && !overlay.hidden) {
                closeSearch();
                return;
            }
            closePanels(null);
            setMega(false);
            if (masthead) {
                masthead.classList.remove('nav-open');
                if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
            }
        });

        document.addEventListener('currencychange', render);
        render();
    }

    /* ---------------------------------------------------------------------
       PROTOTYPE B
       --------------------------------------------------------------------- */

    function initB() {
        var applied = {
            countries: new Set(),
            themes: new Set(),
            era: '',
            format: '',
            availability: '',
            maxPrice: 0,
            query: '',
            sort: 'newest'
        };

        var draft = {
            countries: new Set(),
            themes: new Set(),
            era: '',
            format: '',
            availability: '',
            maxPrice: 0
        };

        var grid = $('#lotGrid');
        var countEl = $('#resultCount');
        var summaryEl = $('#resultsSummary');
        var activeEl = $('#activeFiltersB');

        function sortLots(lots) {
            var copy = lots.slice();
            if (applied.sort === 'price-asc') {
                copy.sort(function (a, b) { return (a.price || Infinity) - (b.price || Infinity); });
            } else if (applied.sort === 'price-desc') {
                copy.sort(function (a, b) { return (b.price || 0) - (a.price || 0); });
            } else if (applied.sort === 'country') {
                copy.sort(function (a, b) { return a.country.localeCompare(b.country); });
            } else {
                copy.sort(function (a, b) { return LOTS.indexOf(a) - LOTS.indexOf(b); });
            }
            return copy;
        }

        function render() {
            var lots = sortLots(LOTS.filter(function (lot) { return matches(lot, applied); }));
            renderLots(grid, lots);
            if (countEl) countEl.innerHTML = '<strong>' + lots.length + '</strong> sample lots';
            if (summaryEl) summaryEl.textContent = describe(applied);
            renderActive(activeEl, applied, removeFilter);
            applyCurrency();
        }

        function removeFilter(key) {
            var parts = key.split(':');
            var field = parts[0];
            var value = parts.slice(1).join(':');
            if (field === 'country') applied.countries.delete(value);
            else if (field === 'theme') applied.themes.delete(value);
            else if (field === 'query') applied.query = '';
            else if (field === 'era') applied.era = '';
            else if (field === 'format') applied.format = '';
            else if (field === 'availability') applied.availability = '';
            else if (field === 'price') applied.maxPrice = 0;
            render();
        }

        function runSearch(term) {
            applied.query = (term || '').trim();
            /* A new global search starts fresh: facets from the previous
               browse are cleared so the result is never an empty surprise. */
            applied.countries.clear();
            applied.themes.clear();
            applied.era = '';
            applied.format = '';
            applied.availability = '';
            applied.maxPrice = 0;
            if (heroInput) heroInput.value = applied.query;
            render();
            closeOmni();
            scrollToResults();
        }

        function scrollToResults() {
            var target = $('#results');
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        /* --- omnibox --- */
        var omniInput = $('#omniInput');
        var omniResults = $('#omniResults');
        var omniFocus = -1;

        function suggestionGroups(term) {
            var q = term.trim().toLowerCase();
            var groups = [];

            var countries = COUNTRIES.filter(function (c) {
                return !q || c.name.toLowerCase().indexOf(q) !== -1;
            }).slice(0, q ? 6 : 5).map(function (c) {
                return { type: 'country', label: c.name, meta: c.count + ' lots', icon: 'CO' };
            });

            var themes = THEMES.filter(function (t) {
                return !q || t.name.toLowerCase().indexOf(q) !== -1;
            }).slice(0, q ? 5 : 4).map(function (t) {
                return { type: 'theme', label: t.name, meta: t.count + ' lots', icon: 'TH' };
            });

            var lots = LOTS.filter(function (lot) {
                if (!q) return false;
                return [lot.name, lot.country, lot.theme, lot.year].join(' ').toLowerCase().indexOf(q) !== -1;
            }).slice(0, 4).map(function (lot) {
                return { type: 'lot', label: lot.name, meta: lot.country, icon: 'ST', lot: lot };
            });

            var pages = PAGES.filter(function (p) {
                return !q || p.name.toLowerCase().indexOf(q) !== -1 || p.meta.toLowerCase().indexOf(q) !== -1;
            }).slice(0, q ? 4 : 2).map(function (p) {
                return { type: 'page', label: p.name, meta: p.meta, icon: 'PG', href: p.href };
            });

            if (countries.length) groups.push({ title: 'Countries', items: countries });
            if (themes.length) groups.push({ title: 'Themes', items: themes });
            if (lots.length) groups.push({ title: 'Lots', items: lots });
            if (pages.length) groups.push({ title: 'Pages', items: pages });
            return groups;
        }

        function renderOmni(term) {
            if (!omniResults) return;
            var groups = suggestionGroups(term);
            if (!groups.length) {
                omniResults.innerHTML = '<div class="omni-empty">No matches for “' + esc(term) + '”. Try a country, theme or year.</div>';
            } else {
                omniResults.innerHTML = groups.map(function (group) {
                    return '<div class="omni-group"><h3>' + esc(group.title) + '</h3>' +
                        group.items.map(function (item) {
                            return '<button type="button" class="omni-option" role="option" data-type="' + item.type + '"' +
                                ' data-label="' + esc(item.label) + '"' +
                                (item.href ? ' data-href="' + esc(item.href) + '"' : '') + '>' +
                                '<span class="oi">' + esc(item.icon) + '</span>' +
                                '<span class="label">' + esc(item.label) + '</span>' +
                                '<span class="meta">' + esc(item.meta) + '</span></button>';
                        }).join('') + '</div>';
                }).join('');
            }
            omniResults.hidden = false;
            if (omniInput) omniInput.setAttribute('aria-expanded', 'true');
            omniFocus = -1;
        }

        function closeOmni() {
            if (omniResults) omniResults.hidden = true;
            if (omniInput) omniInput.setAttribute('aria-expanded', 'false');
            omniFocus = -1;
        }

        function chooseOmni(option) {
            if (!option) return;
            var type = option.getAttribute('data-type');
            var label = option.getAttribute('data-label');
            if (type === 'country') {
                applied.countries = new Set([label]);
                applied.themes.clear();
                applied.query = '';
                render();
                closeOmni();
                scrollToResults();
            } else if (type === 'theme') {
                applied.themes = new Set([label]);
                applied.countries.clear();
                applied.query = '';
                render();
                closeOmni();
                scrollToResults();
            } else if (type === 'lot') {
                applied.query = label;
                render();
                closeOmni();
                scrollToResults();
            } else if (type === 'page') {
                var href = option.getAttribute('data-href');
                if (href) window.location.href = href;
            }
        }

        if (omniInput) {
            omniInput.addEventListener('input', function () { renderOmni(omniInput.value); });
            omniInput.addEventListener('focus', function () { renderOmni(omniInput.value); });
            omniInput.addEventListener('keydown', function (event) {
                var options = $$('.omni-option', omniResults);
                if (event.key === 'ArrowDown') {
                    event.preventDefault();
                    omniFocus = Math.min(omniFocus + 1, options.length - 1);
                    options.forEach(function (o, i) { o.classList.toggle('is-focused', i === omniFocus); });
                } else if (event.key === 'ArrowUp') {
                    event.preventDefault();
                    omniFocus = Math.max(omniFocus - 1, 0);
                    options.forEach(function (o, i) { o.classList.toggle('is-focused', i === omniFocus); });
                } else if (event.key === 'Enter') {
                    event.preventDefault();
                    if (omniFocus >= 0 && options[omniFocus]) chooseOmni(options[omniFocus]);
                    else runSearch(omniInput.value);
                } else if (event.key === 'Escape') {
                    closeOmni();
                    omniInput.blur();
                }
            });
        }

        if (omniResults) {
            omniResults.addEventListener('click', function (event) {
                var option = event.target.closest('.omni-option');
                if (option) chooseOmni(option);
            });
        }

        document.addEventListener('click', function (event) {
            if (!event.target.closest('.omni')) closeOmni();
        });

        document.addEventListener('keydown', function (event) {
            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
                event.preventDefault();
                if (omniInput) {
                    omniInput.focus();
                    omniInput.select();
                    renderOmni(omniInput.value);
                }
            }
        });

        /* --- hero search --- */
        var heroForm = $('#heroSearchForm');
        var heroInput = $('#heroSearchInput');
        if (heroForm) {
            heroForm.addEventListener('submit', function (event) {
                event.preventDefault();
                runSearch(heroInput.value);
            });
        }
        $$('[data-hero-term]').forEach(function (button) {
            button.addEventListener('click', function () {
                var term = button.getAttribute('data-hero-term');
                if (heroInput) heroInput.value = term;
                runSearch(term);
            });
        });

        /* --- explore drawer --- */
        var drawer = $('#exploreDrawer');
        var backdrop = $('#drawerBackdrop');
        var lastFocus = null;
        var drawerCount = $('#drawerCount');
        var drawerCountryList = $('#drawerCountryList');
        var drawerCountrySearch = $('#drawerCountrySearch');
        var drawerThemes = $('#drawerThemes');
        var drawerEras = $('#drawerEras');
        var drawerFormats = $('#drawerFormats');
        var drawerAvailability = $('#drawerAvailability');
        var priceRange = $('#priceRange');
        var priceOutput = $('#priceOutput');

        function copyToDraft() {
            draft.countries = new Set(applied.countries);
            draft.themes = new Set(applied.themes);
            draft.era = applied.era;
            draft.format = applied.format;
            draft.availability = applied.availability;
            draft.maxPrice = applied.maxPrice;
        }

        function draftCount() {
            return LOTS.filter(function (lot) { return matches(lot, draft); }).length;
        }

        function renderDrawer() {
            if (drawerCount) drawerCount.textContent = draftCount();

            if (drawerCountryList) {
                var term = drawerCountrySearch ? drawerCountrySearch.value.trim().toLowerCase() : '';
                drawerCountryList.innerHTML = COUNTRIES.filter(function (c) {
                    return !term || c.name.toLowerCase().indexOf(term) !== -1;
                }).map(function (c) {
                    return '<label class="country-check"><input type="checkbox" value="' + esc(c.name) + '"' +
                        (draft.countries.has(c.name) ? ' checked' : '') + '>' +
                        '<span>' + esc(c.name) + '</span><span class="n">' + c.count + '</span></label>';
                }).join('');
            }

            if (drawerThemes) {
                drawerThemes.innerHTML = THEMES.map(function (t) {
                    return '<button type="button" class="filter-chip' + (draft.themes.has(t.name) ? ' is-active' : '') +
                        '" data-drawer-theme="' + esc(t.name) + '">' + esc(t.name) +
                        '<span class="n">' + t.count + '</span></button>';
                }).join('');
            }

            if (drawerEras) {
                drawerEras.innerHTML = ERAS.map(function (e) {
                    return '<button type="button" class="filter-chip' + (draft.era === e.name ? ' is-active' : '') +
                        '" data-drawer-era="' + esc(e.name) + '">' + esc(e.name) +
                        '<span class="n">' + e.count + '</span></button>';
                }).join('');
            }

            if (drawerFormats) {
                drawerFormats.innerHTML = FORMATS.map(function (f) {
                    return '<button type="button" class="filter-chip' + (draft.format === f.name ? ' is-active' : '') +
                        '" data-drawer-format="' + esc(f.name) + '">' + esc(f.name) +
                        '<span class="n">' + f.count + '</span></button>';
                }).join('');
            }

            if (drawerAvailability) {
                drawerAvailability.innerHTML = [
                    { key: '', label: 'All lots' },
                    { key: 'available', label: 'Available now' },
                    { key: 'sold', label: 'Sold' }
                ].map(function (option) {
                    return '<button type="button" class="filter-chip' + (draft.availability === option.key ? ' is-active' : '') +
                        '" data-drawer-availability="' + option.key + '">' + option.label + '</button>';
                }).join('');
            }

            if (priceRange) {
                priceRange.value = draft.maxPrice;
                if (priceOutput) priceOutput.textContent = draft.maxPrice ? money(draft.maxPrice) : 'Any';
            }
        }

        function setExploreTriggers(open) {
            $$('[data-open-explore]').forEach(function (button) {
                button.setAttribute('aria-expanded', String(open));
            });
        }

        function openDrawer() {
            if (!drawer) return;
            lastFocus = document.activeElement;
            copyToDraft();
            if (drawerCountrySearch) drawerCountrySearch.value = '';
            renderDrawer();
            drawer.classList.add('is-open');
            drawer.setAttribute('aria-hidden', 'false');
            setExploreTriggers(true);
            backdrop.hidden = false;
            window.requestAnimationFrame(function () { backdrop.classList.add('is-open'); });
            document.body.classList.add('is-locked');
            window.setTimeout(function () {
                var close = $('[data-close-explore]', drawer);
                if (close) close.focus();
            }, 30);
        }

        function closeDrawer() {
            if (!drawer) return;
            drawer.classList.remove('is-open');
            drawer.setAttribute('aria-hidden', 'true');
            setExploreTriggers(false);
            backdrop.classList.remove('is-open');
            window.setTimeout(function () {
                if (!drawer.classList.contains('is-open')) backdrop.hidden = true;
            }, 260);
            document.body.classList.remove('is-locked');
            if (lastFocus) lastFocus.focus();
        }

        /* Keep Tab inside the drawer while it is open. */
        if (drawer) {
            drawer.addEventListener('keydown', function (event) {
                if (event.key !== 'Tab') return;
                var focusable = $$('button, input, select, textarea, a[href]', drawer).filter(function (el) {
                    return !el.disabled && el.offsetParent !== null;
                });
                if (!focusable.length) return;
                var first = focusable[0];
                var last = focusable[focusable.length - 1];
                if (event.shiftKey && document.activeElement === first) {
                    event.preventDefault();
                    last.focus();
                } else if (!event.shiftKey && document.activeElement === last) {
                    event.preventDefault();
                    first.focus();
                }
            });
        }

        $$('[data-open-explore]').forEach(function (button) {
            button.addEventListener('click', openDrawer);
        });
        $$('[data-close-explore]').forEach(function (button) {
            button.addEventListener('click', closeDrawer);
        });
        if (backdrop) backdrop.addEventListener('click', closeDrawer);

        if (drawerCountryList) {
            drawerCountryList.addEventListener('change', function (event) {
                var input = event.target.closest('input[type="checkbox"]');
                if (!input) return;
                if (input.checked) draft.countries.add(input.value);
                else draft.countries.delete(input.value);
                if (drawerCount) drawerCount.textContent = draftCount();
            });
        }

        if (drawerCountrySearch) {
            drawerCountrySearch.addEventListener('input', renderDrawer);
        }

        if (drawer) {
            drawer.addEventListener('click', function (event) {
                var theme = event.target.closest('[data-drawer-theme]');
                var era = event.target.closest('[data-drawer-era]');
                var format = event.target.closest('[data-drawer-format]');
                var availability = event.target.closest('[data-drawer-availability]');

                if (theme) {
                    var tv = theme.getAttribute('data-drawer-theme');
                    if (draft.themes.has(tv)) draft.themes.delete(tv);
                    else draft.themes.add(tv);
                } else if (era) {
                    var ev = era.getAttribute('data-drawer-era');
                    draft.era = draft.era === ev ? '' : ev;
                } else if (format) {
                    var fv = format.getAttribute('data-drawer-format');
                    draft.format = draft.format === fv ? '' : fv;
                } else if (availability) {
                    draft.availability = availability.getAttribute('data-drawer-availability');
                } else {
                    return;
                }
                renderDrawer();
            });
        }

        if (priceRange) {
            priceRange.addEventListener('input', function () {
                draft.maxPrice = Number(priceRange.value);
                if (priceOutput) priceOutput.textContent = draft.maxPrice ? money(draft.maxPrice) : 'Any';
                if (drawerCount) drawerCount.textContent = draftCount();
            });
        }

        var clearDrawer = $('#clearDrawer');
        if (clearDrawer) {
            clearDrawer.addEventListener('click', function () {
                draft.countries.clear();
                draft.themes.clear();
                draft.era = '';
                draft.format = '';
                draft.availability = '';
                draft.maxPrice = 0;
                if (drawerCountrySearch) drawerCountrySearch.value = '';
                renderDrawer();
            });
        }

        var applyDrawer = $('#applyDrawer');
        if (applyDrawer) {
            applyDrawer.addEventListener('click', function () {
                applied.countries = new Set(draft.countries);
                applied.themes = new Set(draft.themes);
                applied.era = draft.era;
                applied.format = draft.format;
                applied.availability = draft.availability;
                applied.maxPrice = draft.maxPrice;
                closeDrawer();
                render();
                scrollToResults();
            });
        }

        /* --- sort --- */
        var sortSelect = $('#sortSelect');
        if (sortSelect) {
            sortSelect.addEventListener('change', function () {
                applied.sort = sortSelect.value;
                render();
            });
        }

        /* --- keyboard / outside --- */
        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape' && drawer && drawer.classList.contains('is-open')) {
                closeDrawer();
            }
        });

        document.addEventListener('click', function (event) {
            if (event.target.closest('[data-clear-all]')) {
                event.preventDefault();
                clearState(applied);
                if (sortSelect) sortSelect.value = 'newest';
                render();
            }
        });

        document.addEventListener('currencychange', function () {
            render();
            if (drawer && drawer.classList.contains('is-open')) renderDrawer();
        });
        render();
    }

    /* ---------------------------------------------------------------------
       Boot
       --------------------------------------------------------------------- */

    initAnnounce();
    initCurrency();

    var page = document.body.getAttribute('data-page');
    if (page === 'a') initA();
    if (page === 'b') initB();
})();
