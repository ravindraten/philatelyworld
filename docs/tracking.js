/* Worldwide registered post & parcel tracking hub.
 *
 * Reads the tracking-number format, identifies the issuing postal service and
 * shows live scans where the carrier allows cross-site reads. Poczta Polska's
 * public widget API is CORS-enabled, so inbound Polish items (CP…PL) can be
 * shown inline; other carriers hand off to their official tracker. Every
 * carrier entry is a small adapter, so a new country is one object.
 */
(function () {
    'use strict';

    var UNIVERSAL_URL = 'https://t.17track.net/en#nums=';
    var RECENT_KEY = 'pw_tracking_recent';
    var POSTCODE_KEY = 'pw_tracking_postcode';
    var RECENT_LIMIT = 8;

    /* PostNL blocks direct cross-site reads. Its public tracking API is
     * fetched through Jina Reader, which reflects CORS headers and returns
     * the JSON as plain text. */
    var JINA_READER = 'https://r.jina.ai/';
    var POSTNL_API = 'https://jouw.postnl.nl/track-and-trace/api/trackAndTrace/';

    /* Public API used by the Poczta Polska tracking widget. It is CORS-enabled
     * and returns English scans when language is "X2". */
    var POCZTA_TRACK_URL = 'https://uss.poczta-polska.pl/uss/v2.0/tracking/checkmailex';
    var POCZTA_API_KEY = 'BiGwVG2XHvXY+kPwJVPA8gnKchOFsyy39Thkyb1wAiWcKLQ1ICyLiCrxj1+vVGC+kQk3k0b74qkmt5/qVIzo7lTfXhfgJ72Iyzz05wH2XZI6AgXVDciX7G2jLCdoOEM6XegPsMJChiouWS2RZuf3eOXpK5RPl8Sy4pWj+b07MLg=.Mjg0Q0NFNzM0RTBERTIwOTNFOUYxNkYxMUY1NDZGMTA0NDMwQUIyRjg4REUxMjk5NDAyMkQ0N0VCNDgwNTc1NA==.b24415d1b30a456cb8ba187b34cb6a86';

    /* Public API used by POST Luxembourg's Track & Trace app (its client ID is
     * shipped in the public conf.prod.json). CORS is enabled. */
    var LUX_TRACK_URL = 'https://api.post.lu/services/trackandtrace-api/items';
    var LUX_CLIENT_ID = '5ef1cb63-37b8-4a30-8215-57fc3bc722b9';

    /* La Poste's public tracking endpoint (used by its own website). It is
     * attempted directly; when a network/Akamai/CORS block occurs the page
     * falls back to the official tracker. */
    var LAPOSTE_TRACK_URL = 'https://www.laposte.fr/ssu/sun/back/suivi-unifie/';

    var SERVICE_LABELS = {
        R: 'Registered mail',
        E: 'EMS / Express',
        C: 'Parcel post',
        V: 'Insured mail',
        L: 'Express mail',
        U: 'Unregistered mail',
        D: 'SAL parcel',
        A: 'Air mail'
    };

    /* Country names used for inbound-labelled scans. */
    var COUNTRY_NAMES = {
        PL: 'Poland',
        LU: 'Luxembourg'
    };

    var CARRIERS = [
        {
            id: 'postnl',
            name: 'PostNL',
            country: 'Netherlands',
            countryCode: 'NL',
            flag: '🇳🇱',
            accent: '#e35205',
            service: 'Registered mail & parcels',
            examples: ['RR123456789NL', '3SABCD12345678'],
            patterns: [
                /^[A-Z]{2}\d{9}NL$/,
                /^3S[A-Z0-9]{10,18}$/
            ],
            official: 'https://postnl.nl/tracktrace/',
            trackUrl: function (number, postcode) {
                return 'https://jouw.postnl.nl/track-and-trace/' +
                    encodeURIComponent(number) + '-NL-' + encodeURIComponent(postcode || '');
            },
            prefill: true,
            note: 'PostNL needs the recipient\'s postcode to show the scans for items delivered in the Netherlands.'
        },
        {
            id: 'poczta',
            name: 'Poczta Polska',
            country: 'Poland',
            countryCode: 'PL',
            flag: '🇵🇱',
            accent: '#d22630',
            service: 'Registered mail & parcels',
            examples: ['CP920673969PL', 'RR123456789PL'],
            patterns: [
                /^[A-Z]{2}\d{9}PL$/
            ],
            official: 'https://emonitoring.poczta-polska.pl/',
            trackUrl: function (number) {
                return 'https://emonitoring.poczta-polska.pl/?numer=' + encodeURIComponent(number);
            },
            prefill: true,
            note: 'Poczta Polska shows the origin scans. For delivery in the Netherlands, add the recipient\'s postcode to load the PostNL scans.'
        },
        {
            id: 'indiapost',
            name: 'India Post',
            country: 'India',
            countryCode: 'IN',
            flag: '🇮🇳',
            accent: '#a6192e',
            service: 'Registered mail, Speed Post & parcels',
            examples: ['EE123456789IN', 'RX123456789IN'],
            patterns: [
                /^[A-Z]{2}\d{9}IN$/
            ],
            official: 'https://www.indiapost.gov.in/track-and-trace',
            trackUrl: function () {
                return 'https://www.indiapost.gov.in/track-and-trace';
            },
            prefill: false,
            preferUniversal: true,
            note: 'The official India Post site asks for a captcha and can be unavailable outside India (a VPN set to India may be needed). For items delivered in the Netherlands, add the recipient\'s postcode to load the PostNL delivery scans. The universal tracker works from anywhere.'
        },
        {
            id: 'austria',
            name: 'Austrian Post',
            country: 'Austria',
            countryCode: 'AT',
            flag: '🇦🇹',
            accent: '#a16207',
            service: 'Registered mail & parcels',
            examples: ['RR123456789AT', '1011236513864670170531'],
            patterns: [
                /^[A-Z]{2}\d{9}AT$/,
                /^\d{16,22}$/
            ],
            official: 'https://www.post.at/en/s/track-and-trace-search',
            trackUrl: function (number) {
                return 'https://www.post.at/en/s/track-and-trace-search?snr=' + encodeURIComponent(number);
            },
            prefill: true,
            note: 'Austrian Post shows the full scan history for registered items and parcels on its Track & Trace page.'
        },
        {
            id: 'germany',
            name: 'Deutsche Post / DHL',
            country: 'Germany',
            countryCode: 'DE',
            flag: '🇩🇪',
            accent: '#d40511',
            service: 'Registered mail & DHL parcels',
            examples: ['RR123456789DE', '00340434161094000000', 'JJD0099999999'],
            patterns: [
                /^[A-Z]{2}\d{9}DE$/,
                /^(JJD|JD|JVGL)[A-Z0-9]{8,22}$/,
                /^\d{10}$/,
                /^\d{12}$/,
                /^\d{14}$/,
                /^\d{20}$/
            ],
            official: 'https://www.dhl.de/en/privatkunden/pakete-empfangen/verfolgen.html',
            trackUrl: function (number) {
                return 'https://www.dhl.de/en/privatkunden/pakete-empfangen/verfolgen.html?piececode=' + encodeURIComponent(number);
            },
            prefill: true,
            note: 'DHL tracks parcels and many international registered items here. For a Deutsche Post letter, use the same number on the DHL page.'
        },
        {
            id: 'luxembourg',
            name: 'POST Luxembourg',
            country: 'Luxembourg',
            countryCode: 'LU',
            flag: '🇱🇺',
            accent: '#1d4ed8',
            service: 'Registered mail & parcels',
            examples: ['RR123456789LU', 'CP107762203LU'],
            patterns: [
                /^[A-Z]{2}\d{9}LU$/
            ],
            official: 'https://www.post.lu/en/particuliers/colis-courrier/track-and-trace',
            trackUrl: function (number) {
                return 'https://www.post.lu/en/particuliers/colis-courrier/track-and-trace?numero=' + encodeURIComponent(number);
            },
            prefill: true,
            note: 'POST Luxembourg opens the number directly in its Track & Trace app.'
        },
        {
            id: 'laposte',
            name: 'La Poste',
            country: 'France',
            countryCode: 'FR',
            flag: '🇫🇷',
            accent: '#003da5',
            service: 'Colissimo, letters & parcels',
            examples: ['CB529109541FR', 'RR123456789FR'],
            patterns: [
                /^[A-Z]{2}\d{9}FR$/
            ],
            official: 'https://www.laposte.fr/outils/suivre-vos-envois',
            trackUrl: function (number) {
                return 'https://www.laposte.fr/outils/suivre-vos-envois?code=' + encodeURIComponent(number);
            },
            prefill: true,
            note: 'La Poste tracks Colissimo, Chronopost and international registered items.'
        },
        {
            id: 'usps',
            name: 'USPS',
            country: 'United States',
            countryCode: 'US',
            flag: '🇺🇸',
            accent: '#0b3d91',
            service: 'Registered mail & parcels',
            examples: ['9400111899223197428490', 'EC123456789US'],
            patterns: [
                /^[A-Z]{2}\d{9}US$/,
                /^9\d{19,21}$/
            ],
            official: 'https://tools.usps.com/go/TrackConfirmAction_input',
            trackUrl: function (number) {
                return 'https://tools.usps.com/go/TrackConfirmAction?tLabels=' + encodeURIComponent(number);
            },
            prefill: true,
            note: 'USPS shows tracking for domestic packages and inbound registered mail. International scans can take a few days to appear.'
        }
    ];

    var byId = {};
    CARRIERS.forEach(function (carrier) {
        byId[carrier.id] = carrier;
    });

    var els = {
        form: document.getElementById('trackForm'),
        input: document.getElementById('trackInput'),
        select: document.getElementById('carrierSelect'),
        postcode: document.getElementById('postcodeInput'),
        result: document.getElementById('trackResult'),
        carrierGrid: document.getElementById('carrierGrid'),
        recentSection: document.getElementById('recentSection'),
        recentList: document.getElementById('recentList'),
        clearRecent: document.getElementById('clearRecent'),
        liveSection: document.getElementById('liveTracking'),
        liveSubtitle: document.getElementById('liveSubtitle'),
        liveCard: document.getElementById('liveCard'),
        refreshTracking: document.getElementById('refreshTracking'),
        toast: null
    };

    if (!els.form || !els.input || !els.result) return;

    var lastLiveRequest = null;

    function normalize(value) {
        return String(value || '').replace(/[\s\-]/g, '').toUpperCase();
    }

    function normalizePostcode(value) {
        return String(value || '').replace(/[\s\-]/g, '').toUpperCase();
    }

    function postcodeFromForm() {
        return els.postcode ? normalizePostcode(els.postcode.value) : '';
    }

    function getUpuNumber(number) {
        return /^([A-Z]{2})(\d{9})([A-Z]{2})$/.exec(number);
    }

    function detectCarrier(number) {
        var upu = getUpuNumber(number);
        if (upu) {
            var code = upu[3];
            for (var i = 0; i < CARRIERS.length; i += 1) {
                if (CARRIERS[i].countryCode === code) return CARRIERS[i];
            }
        }

        /* Numeric formats overlap between carriers, so try the most specific
         * shapes first. 20–22 digit numbers beginning with 9 are USPS; other
         * 20-digit prefixes belong to DHL; the remaining long numerics are
         * Austrian Post. Everything else falls back to the carrier patterns
         * above (3S barcodes, JJD/JD references). */
        var numericRules = [
            { id: 'usps', test: /^9\d{19,21}$/ },
            { id: 'postnl', test: /^3S[A-Z0-9]{10,18}$/ },
            { id: 'germany', test: /^(JJD|JD|JVGL)[A-Z0-9]{8,22}$/ },
            { id: 'germany', test: /^\d{10}$/ },
            { id: 'germany', test: /^\d{12}$/ },
            { id: 'germany', test: /^\d{14}$/ },
            { id: 'germany', test: /^\d{20}$/ },
            { id: 'austria', test: /^\d{16,22}$/ }
        ];

        for (var j = 0; j < numericRules.length; j += 1) {
            if (numericRules[j].test.test(number)) return byId[numericRules[j].id];
        }

        for (var k = 0; k < CARRIERS.length; k += 1) {
            var carrier = CARRIERS[k];
            for (var l = 0; l < carrier.patterns.length; l += 1) {
                if (carrier.patterns[l].test(number)) return carrier;
            }
        }
        return null;
    }

    function serviceLabel(number, carrier) {
        var upu = getUpuNumber(number);
        var prefix = upu ? upu[1].charAt(0) : '';
        if (prefix && SERVICE_LABELS[prefix]) return SERVICE_LABELS[prefix];
        return carrier.service;
    }

    function originCountry(number) {
        var upu = getUpuNumber(number);
        if (!upu) return '';
        var code = upu[3];
        if (!COUNTRY_NAMES[code]) return '';
        return COUNTRY_NAMES[code];
    }

    function isIndiaUser() {
        try {
            var zone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
            if (/^Asia\/(Kolkata|Calcutta)$/i.test(zone)) return true;
            var lang = (navigator.language || '').toLowerCase();
            return lang === 'en-in' || lang === 'hi' || lang.indexOf('hi-') === 0;
        } catch (error) {
            return false;
        }
    }

    function universalUrl(number) {
        return UNIVERSAL_URL + encodeURIComponent(number);
    }

    function showToast(message) {
        if (!els.toast) {
            els.toast = document.createElement('div');
            els.toast.className = 'track-toast';
            els.toast.setAttribute('role', 'status');
            els.toast.setAttribute('aria-live', 'polite');
            document.body.appendChild(els.toast);
        }
        els.toast.textContent = message;
        els.toast.classList.add('visible');
        window.clearTimeout(showToast.timer);
        showToast.timer = window.setTimeout(function () {
            els.toast.classList.remove('visible');
        }, 3200);
    }

    function copyText(text, message) {
        function done() {
            showToast(message || 'Copied to clipboard');
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(done, function () {
                fallbackCopy(text, done);
            });
            return;
        }
        fallbackCopy(text, done);
    }

    function fallbackCopy(text, done) {
        var area = document.createElement('textarea');
        area.value = text;
        area.setAttribute('readonly', '');
        area.style.position = 'fixed';
        area.style.opacity = '0';
        document.body.appendChild(area);
        area.select();
        try {
            document.execCommand('copy');
            done();
        } catch (error) {
            showToast('Could not copy — please select the number manually');
        }
        document.body.removeChild(area);
    }

    function svgIcon(path) {
        return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
            'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + path + '</svg>';
    }

    var ICONS = {
        external: svgIcon('<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line>'),
        globe: svgIcon('<circle cx="12" cy="12" r="9"></circle><line x1="3" y1="12" x2="21" y2="12"></line><path d="M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18Z"></path>'),
        copy: svgIcon('<rect x="9" y="9" width="11" height="11" rx="2"></rect><path d="M5 15V5a2 2 0 0 1 2-2h8"></path>'),
        share: svgIcon('<circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.6" y1="10.7" x2="15.4" y2="6.3"></line><line x1="8.6" y1="13.3" x2="15.4" y2="17.7"></line>'),
        info: svgIcon('<circle cx="12" cy="12" r="9"></circle><line x1="12" y1="11" x2="12" y2="16"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>')
    };

    function renderResult(number, carrier, manual, postcode) {
        els.result.innerHTML = '';
        var card = document.createElement('div');
        card.className = 'track-result-card';

        if (!carrier) {
            card.innerHTML =
                '<div class="track-result-top">' +
                    '<div class="track-result-flag">🔎</div>' +
                    '<div class="track-result-heading">' +
                        '<h2>We could not identify this number</h2>' +
                        '<p>No supported postal service matched the format.</p>' +
                        '<span class="track-number"></span>' +
                        '<div class="track-badge-row">' +
                            '<span class="track-badge track-badge-soft">Choose a carrier above for a direct link</span>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                '<div class="track-actions">' +
                    '<a class="track-btn track-btn-primary" target="_blank" rel="noopener">' +
                        ICONS.globe + 'Search with the universal tracker</a>' +
                    '<button type="button" class="track-btn track-btn-secondary" data-action="copy">' +
                        ICONS.copy + 'Copy number</button>' +
                '</div>' +
                '<div class="track-note">' + ICONS.info +
                    '<span>The universal tracker checks the number against hundreds of postal services and couriers.</span>' +
                '</div>';
            card.querySelector('.track-number').textContent = number;
            card.querySelector('.track-btn-primary').href = universalUrl(number);
            card.querySelector('[data-action="copy"]').addEventListener('click', function () {
                copyText(number, 'Tracking number copied');
            });
            els.result.appendChild(card);
            return;
        }

        card.style.setProperty('--carrier-accent', carrier.accent);
        var trackedUrl = carrier.trackUrl(number, postcode);
        var origin = carrier.id === 'postnl' && originCountry(number) === 'Poland' ? 'Poland' : '';
        card.innerHTML =
            '<div class="track-result-top">' +
                '<div class="track-result-flag"></div>' +
                '<div class="track-result-heading">' +
                    '<h2></h2>' +
                    '<p></p>' +
                    '<span class="track-number"></span>' +
                    '<div class="track-badge-row">' +
                        '<span class="track-badge"></span>' +
                        '<span class="track-badge track-badge-soft"></span>' +
                    '</div>' +
                '</div>' +
            '</div>' +
            '<div class="track-actions">' +
                '<a class="track-btn track-btn-primary" target="_blank" rel="noopener">' +
                    ICONS.external + '<span></span></a>' +
                '<a class="track-btn track-btn-secondary" target="_blank" rel="noopener">' +
                    ICONS.globe + 'Universal tracker</a>' +
                '<button type="button" class="track-btn track-btn-secondary" data-action="copy">' +
                    ICONS.copy + 'Copy number</button>' +
                '<button type="button" class="track-btn track-btn-secondary" data-action="share">' +
                    ICONS.share + 'Share</button>' +
            '</div>' +
            '<div class="track-note">' + ICONS.info + '<span></span></div>';

        card.querySelector('.track-result-flag').textContent = carrier.flag;
        card.querySelector('h2').textContent = carrier.name;
        card.querySelector('.track-result-heading p').textContent =
            carrier.country + ' • ' + serviceLabel(number, carrier) +
            (origin ? ' • Inbound from ' + origin : '') +
            (postcode ? ' • Postcode ' + postcode : '');
        card.querySelector('.track-number').textContent = number;
        card.querySelector('.track-badge').textContent = serviceLabel(number, carrier);
        card.querySelector('.track-badge-soft').textContent =
            manual ? 'Carrier selected manually' : 'Detected automatically';
        var primary = card.querySelector('.track-btn-primary');
        var secondary = card.querySelector('.track-btn-secondary');
        primary.querySelector('span').textContent = 'Track on ' + carrier.name;
        primary.href = trackedUrl;
        secondary.href = universalUrl(number);

        if (carrier.preferUniversal) {
            primary.href = universalUrl(number);
            primary.querySelector('span').textContent = 'Track with universal tracker';
            secondary.href = trackedUrl;
            secondary.innerHTML = ICONS.external + 'Open ' + carrier.name;
        }

        if (carrier.id === 'indiapost' && isIndiaUser()) {
            primary.href = trackedUrl;
            primary.querySelector('span').textContent = 'Open India Post tracker';
            secondary.href = universalUrl(number);
            secondary.innerHTML = ICONS.globe + 'Universal tracker';
        }

        if (carrier.id === 'poczta') {
            var postnlButton = document.createElement('a');
            postnlButton.className = 'track-btn track-btn-secondary';
            postnlButton.target = '_blank';
            postnlButton.rel = 'noopener';
            postnlButton.href = byId.postnl.trackUrl(number, postcode);
            postnlButton.innerHTML = ICONS.external + 'Track with PostNL';
            var copyAction = card.querySelector('[data-action="copy"]');
            copyAction.parentNode.insertBefore(postnlButton, copyAction);
        }

        var note = card.querySelector('.track-note');
        if (carrier.id === 'postnl' && !postcode) {
            note.classList.add('track-note-warn');
            card.querySelector('.track-note span').textContent = origin ?
                'This barcode was issued in ' + origin + '. PostNL needs the recipient\'s postcode to show the tracking scans — add it in the Postcode field above and press Track again.' :
                'PostNL needs the recipient\'s postcode to show the tracking scans. Add it in the Postcode field above and press Track again.';
        } else if (carrier.id === 'indiapost') {
            card.querySelector('.track-note span').textContent = isIndiaUser() ?
                'Open the official India Post tracker, enter this number and solve the captcha. If the item is being delivered in the Netherlands, add the postcode above to load PostNL scans here.' :
                'The India Post site may require a VPN outside India. If the item is being delivered in the Netherlands, add the postcode above to load PostNL scans here. The universal tracker works from anywhere.';
        } else if (carrier.id === 'poczta') {
            card.querySelector('.track-note span').textContent = postcode ?
                'Poczta Polska shows the origin scans below. Use “Track with PostNL” for the delivery scans in the Netherlands.' :
                'This barcode was issued in Poland. Poczta Polska shows the origin scans. Add the recipient\'s postcode above to load the PostNL delivery scans.';
        } else {
            card.querySelector('.track-note span').textContent = origin ?
                'This barcode was issued in ' + origin + '. PostNL shows the delivery scans once the item enters the Netherlands; the universal tracker also shows the ' + origin + ' scans. If the destination is not the Netherlands, use the universal tracker.' :
                carrier.note;
        }

        card.querySelector('[data-action="copy"]').addEventListener('click', function () {
            copyText(number, 'Tracking number copied');
        });
        card.querySelector('[data-action="share"]').addEventListener('click', function () {
            shareLookup(number, carrier.id, postcode);
        });

        els.result.appendChild(card);
    }

    function formatDateTime(value) {
        var date = new Date(value);
        if (isNaN(date.getTime())) return value || '';
        try {
            return date.toLocaleString(undefined, {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return date.toISOString();
        }
    }

    function formatDate(value) {
        if (!value) return '';
        var match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value));
        if (!match) return formatDateTime(value);
        var date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
        try {
            return date.toLocaleDateString(undefined, {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
        } catch (error) {
            return match[0];
        }
    }

    function renderLiveMessage(message) {
        if (!els.liveCard) return;
        els.liveCard.innerHTML = '<div class="track-live-card"><div class="track-live-empty"></div></div>';
        els.liveCard.querySelector('.track-live-empty').textContent = message;
    }

    function renderLiveLoading() {
        if (!els.liveCard) return;
        els.liveCard.innerHTML =
            '<div class="track-live-card">' +
                '<div class="track-live-loading">' +
                    '<span class="track-spinner" aria-hidden="true"></span>' +
                    '<span>Fetching live scans&hellip;</span>' +
                '</div>' +
            '</div>';
    }

    function fetchPocztaTracking(number) {
        return fetch(POCZTA_TRACK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'API_KEY': POCZTA_API_KEY
            },
            body: JSON.stringify({
                language: 'X2',
                number: number,
                addPostOfficeInfo: false
            })
        }).then(function (response) {
            if (!response.ok) throw new Error('HTTP ' + response.status);
            return response.json();
        }).then(function (data) {
            if (!data || !data.mailInfo) throw new Error('No mail info');
            return data.mailInfo;
        });
    }

    function renderPocztaTracking(mailInfo, carrier) {
        var events = Array.isArray(mailInfo.events) ? mailInfo.events.slice() : [];
        if (!events.length) {
            renderLiveMessage('No scans have been recorded for this number yet.');
            return;
        }

        events.sort(function (a, b) {
            return new Date(b.time) - new Date(a.time);
        });
        var latest = events[0];

        var card = document.createElement('div');
        card.className = 'track-live-card';
        if (carrier) card.style.setProperty('--carrier-accent', carrier.accent);
        card.innerHTML =
            '<div class="track-live-summary">' +
                '<span class="track-live-status"></span>' +
                '<span class="track-live-meta"></span>' +
            '</div>' +
            '<ol class="track-timeline"></ol>' +
            '<p class="track-live-source"></p>';

        var status = card.querySelector('.track-live-status');
        status.textContent = latest.name || 'Tracking update';
        if (mailInfo.finished) status.classList.add('is-delivered');

        var metaParts = ['Updated ' + formatDateTime(latest.time)];
        if (mailInfo.typeOfMailName) metaParts.push(mailInfo.typeOfMailName);
        if (mailInfo.recipientCountryName) {
            metaParts.push('To ' + mailInfo.recipientCountryName +
                (mailInfo.recipientCountryCode ? ' (' + mailInfo.recipientCountryCode + ')' : ''));
        }
        if (mailInfo.weight) metaParts.push(mailInfo.weight + ' kg');
        card.querySelector('.track-live-meta').textContent = metaParts.join(' • ');

        var list = card.querySelector('.track-timeline');
        events.forEach(function (event, index) {
            var item = document.createElement('li');
            if (index === 0) item.className = 'is-latest';
            item.innerHTML =
                '<div class="track-event-name"></div>' +
                '<div class="track-event-time"></div>' +
                '<div class="track-event-place"></div>';
            item.querySelector('.track-event-name').textContent = event.name || 'Scan';
            item.querySelector('.track-event-time').textContent = formatDateTime(event.time);
            var place = event.postOffice && event.postOffice.name;
            if (place) item.querySelector('.track-event-place').textContent = place;
            list.appendChild(item);
        });

        var source = 'Live scans from Poczta Polska (Poland).';
        if (mailInfo.recipientCountryCode === 'NL') {
            source += ' Delivery in the Netherlands is handled by PostNL.';
        }
        card.querySelector('.track-live-source').textContent = source;

        els.liveCard.innerHTML = '';
        els.liveCard.appendChild(card);
    }

    function fetchLuxembourgTracking(number) {
        return fetch(LUX_TRACK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept-Language': 'en',
                'X-IBM-Client-Id': LUX_CLIENT_ID
            },
            body: JSON.stringify({ ids: [number] })
        }).then(function (response) {
            if (!response.ok) throw new Error('HTTP ' + response.status);
            return response.json();
        }).then(function (data) {
            var item = data && data.items && data.items[0];
            if (!item) throw new Error('No item');
            if (item.error) throw new Error(item.error);
            return item;
        });
    }

    function renderLuxembourgTracking(item, carrier) {
        var events = Array.isArray(item.trackedEvents) ? item.trackedEvents.slice() : [];
        events.sort(function (a, b) {
            var orderA = a.displayOrder == null ? 999 : a.displayOrder;
            var orderB = b.displayOrder == null ? 999 : b.displayOrder;
            return orderA - orderB;
        });

        if (!events.length) {
            renderLiveMessage('No scans have been recorded for this number yet.');
            return;
        }

        var latest = item.lastEvent || events[0];
        var card = document.createElement('div');
        card.className = 'track-live-card';
        if (carrier) card.style.setProperty('--carrier-accent', carrier.accent);
        card.innerHTML =
            '<div class="track-live-summary">' +
                '<span class="track-live-status"></span>' +
                '<span class="track-live-meta"></span>' +
            '</div>' +
            '<ol class="track-timeline"></ol>' +
            '<p class="track-live-source"></p>';

        var status = card.querySelector('.track-live-status');
        status.textContent = latest.label || 'Tracking update';
        if (item.activeStep === 5 || latest.category === 5) {
            status.classList.add('is-delivered');
        }

        card.querySelector('.track-live-meta').textContent =
            'Updated ' + formatDate(latest.eventDate) + ' • Origin Luxembourg';

        var list = card.querySelector('.track-timeline');
        events.forEach(function (event, index) {
            var row = document.createElement('li');
            if (index === 0) row.className = 'is-latest';
            row.innerHTML =
                '<div class="track-event-name"></div>' +
                '<div class="track-event-time"></div>' +
                '<div class="track-event-place"></div>';
            row.querySelector('.track-event-name').textContent = event.label || 'Scan';
            row.querySelector('.track-event-time').textContent = formatDate(event.eventDate);
            if (event.place) row.querySelector('.track-event-place').textContent = event.place;
            list.appendChild(row);
        });

        card.querySelector('.track-live-source').textContent = 'Live scans from POST Luxembourg.';
        els.liveCard.innerHTML = '';
        els.liveCard.appendChild(card);
    }

    function fetchPostNLTracking(number, postcode) {
        var target = POSTNL_API + encodeURIComponent(number) + '-NL-' +
            encodeURIComponent(postcode) + '?language=en';

        return fetch(JINA_READER + target).then(function (response) {
            if (!response.ok) throw new Error('HTTP ' + response.status);
            return response.text();
        }).then(function (text) {
            var marker = text.indexOf('Markdown Content:');
            var jsonText = (marker >= 0 ? text.slice(marker + 'Markdown Content:'.length) : text).trim();
            var start = jsonText.indexOf('{');
            var end = jsonText.lastIndexOf('}');
            if (start >= 0 && end > start) jsonText = jsonText.slice(start, end + 1);

            var data;
            try {
                data = JSON.parse(jsonText);
            } catch (error) {
                throw new Error('Invalid response');
            }

            var colli = data && data.colli;
            if (!colli) throw new Error('No item');
            var item = colli[number];
            if (!item) {
                var keys = Object.keys(colli);
                if (keys.length) item = colli[keys[0]];
            }
            if (!item) throw new Error('No item');
            return item;
        });
    }

    function renderPostNLTracking(item, carrier, context) {
        var observations = Array.isArray(item.observations) ? item.observations.slice() : [];
        if (!observations.length) {
            renderLiveMessage('No PostNL scans have been recorded for this number yet.');
            return;
        }

        var latest = observations[0];
        var card = document.createElement('div');
        card.className = 'track-live-card';
        if (carrier) card.style.setProperty('--carrier-accent', carrier.accent);
        card.innerHTML =
            '<div class="track-live-summary">' +
                '<span class="track-live-status"></span>' +
                '<span class="track-live-meta"></span>' +
            '</div>' +
            '<ol class="track-timeline"></ol>' +
            '<p class="track-live-source"></p>';

        var status = card.querySelector('.track-live-status');
        status.textContent = (item.statusPhase && item.statusPhase.message) ||
            (item.isDelivered ? 'Delivered' : latest.description) ||
            'Tracking update';
        if (item.isDelivered) status.classList.add('is-delivered');

        var metaParts = ['Updated ' + formatDateTime(item.lastObservation || latest.observationDate)];
        var town = item.recipient && item.recipient.address && item.recipient.address.town;
        if (town) metaParts.push(town);
        metaParts.push('PostNL');
        card.querySelector('.track-live-meta').textContent = metaParts.join(' • ');

        var timelineEvents = observations.slice();
        if (item.isDelivered && item.lastObservation &&
                new Date(item.lastObservation) > new Date(latest.observationDate)) {
            timelineEvents.unshift({
                description: (item.statusPhase && item.statusPhase.message) || 'Delivered',
                observationDate: item.lastObservation
            });
        }

        var list = card.querySelector('.track-timeline');
        timelineEvents.forEach(function (event, index) {
            var row = document.createElement('li');
            if (index === 0) row.className = 'is-latest';
            row.innerHTML =
                '<div class="track-event-name"></div>' +
                '<div class="track-event-time"></div>';
            row.querySelector('.track-event-name').textContent = event.description || 'Scan';
            row.querySelector('.track-event-time').textContent = formatDateTime(event.observationDate);
            list.appendChild(row);
        });

        card.querySelector('.track-live-source').textContent = context === 'india' ?
            'Live delivery scans from PostNL (via r.jina.ai reader). India Post\'s own tracker requires a captcha and may need a VPN.' :
            'Live scans from PostNL (via r.jina.ai reader).';

        els.liveCard.innerHTML = '';
        els.liveCard.appendChild(card);
    }

    function fetchLaPosteTracking(number) {
        return fetch(LAPOSTE_TRACK_URL + encodeURIComponent(number) + '?lang=en', {
            headers: { 'Accept': 'application/json' }
        }).then(function (response) {
            if (!response.ok) throw new Error('HTTP ' + response.status);
            return response.json();
        }).then(function (data) {
            var entry = Array.isArray(data) ? data[0] : data;
            var shipment = entry && (entry.shipment || entry);
            if (!shipment || !shipment.idShip) throw new Error('No shipment');
            return shipment;
        });
    }

    function renderLaPosteTracking(shipment, carrier) {
        var events = Array.isArray(shipment.event) ? shipment.event.slice() : [];
        events.sort(function (a, b) {
            return new Date(b.date || 0) - new Date(a.date || 0);
        });

        if (!events.length && Array.isArray(shipment.timeline)) {
            events = shipment.timeline.filter(function (step) {
                return step && step.date;
            }).map(function (step) {
                return {
                    label: step.shortLabel || step.longLabel,
                    date: step.date,
                    country: step.country
                };
            });
        }

        if (!events.length) {
            renderLiveMessage('No scans have been recorded for this number yet.');
            return;
        }

        var latest = events[0];
        var card = document.createElement('div');
        card.className = 'track-live-card';
        if (carrier) card.style.setProperty('--carrier-accent', carrier.accent);
        card.innerHTML =
            '<div class="track-live-summary">' +
                '<span class="track-live-status"></span>' +
                '<span class="track-live-meta"></span>' +
            '</div>' +
            '<ol class="track-timeline"></ol>' +
            '<p class="track-live-source"></p>';

        var status = card.querySelector('.track-live-status');
        status.textContent = latest.label || (shipment.isFinal ? 'Delivered' : 'Tracking update');
        if (shipment.isFinal || /livr|deliver/i.test(status.textContent)) {
            status.classList.add('is-delivered');
        }

        var metaParts = ['Updated ' + formatDateTime(latest.date || shipment.deliveryDate)];
        if (shipment.product) metaParts.push(shipment.product);
        if (latest.country) metaParts.push(latest.country);
        card.querySelector('.track-live-meta').textContent = metaParts.join(' • ');

        var list = card.querySelector('.track-timeline');
        events.forEach(function (event, index) {
            var row = document.createElement('li');
            if (index === 0) row.className = 'is-latest';
            row.innerHTML =
                '<div class="track-event-name"></div>' +
                '<div class="track-event-time"></div>' +
                '<div class="track-event-place"></div>';
            row.querySelector('.track-event-name').textContent = event.label || 'Scan';
            row.querySelector('.track-event-time').textContent = formatDateTime(event.date);
            if (event.country) row.querySelector('.track-event-place').textContent = event.country;
            list.appendChild(row);
        });

        card.querySelector('.track-live-source').textContent = 'Live scans from La Poste.';
        els.liveCard.innerHTML = '';
        els.liveCard.appendChild(card);
    }

    function loadLiveTracking(number, carrier, postcode) {
        if (!els.liveSection || !els.liveCard) return;
        lastLiveRequest = { number: number, carrier: carrier, postcode: postcode };

        var origin = originCountry(number);
        var isLuxembourg = origin === 'Luxembourg' || (carrier && carrier.id === 'luxembourg');

        function showLiveSection(subtitle, showRefresh) {
            els.liveSection.hidden = false;
            if (els.liveSubtitle) els.liveSubtitle.textContent = subtitle;
            if (els.refreshTracking) els.refreshTracking.hidden = !showRefresh;
            if (carrier) els.liveCard.style.setProperty('--carrier-accent', carrier.accent);
        }

        function showLiveError() {
            if (!lastLiveRequest || lastLiveRequest.number !== number) return;
            renderLiveMessage('Live scans are not available right now. Please try again in a moment, or use the universal tracker above.');
        }

        if (origin === 'Poland') {
            showLiveSection(
                'Origin scans from Poczta Polska (Poland)' +
                (carrier && carrier.id === 'postnl' ? ' — delivery in the Netherlands is handled by PostNL.' :
                    postcode ? ' — use the PostNL button for delivery scans.' :
                        ' — add the recipient\'s postcode to load PostNL delivery scans.'),
                true
            );
            renderLiveLoading();
            fetchPocztaTracking(number).then(function (mailInfo) {
                if (!lastLiveRequest || lastLiveRequest.number !== number) return;
                renderPocztaTracking(mailInfo, carrier);
            }).catch(showLiveError);
            return;
        }

        if (isLuxembourg) {
            showLiveSection('Live scans from POST Luxembourg (Luxembourg).', true);
            renderLiveLoading();
            fetchLuxembourgTracking(number).then(function (item) {
                if (!lastLiveRequest || lastLiveRequest.number !== number) return;
                renderLuxembourgTracking(item, carrier);
            }).catch(showLiveError);
            return;
        }

        if (carrier && carrier.id === 'laposte') {
            showLiveSection('Live scans from La Poste.', true);
            renderLiveLoading();
            fetchLaPosteTracking(number).then(function (shipment) {
                if (!lastLiveRequest || lastLiveRequest.number !== number) return;
                renderLaPosteTracking(shipment, carrier);
            }).catch(function () {
                if (!lastLiveRequest || lastLiveRequest.number !== number) return;
                renderLiveMessage('La Poste did not allow the scan request from this browser. Use the official La Poste button above, or the universal tracker.');
            });
            return;
        }

        if (carrier && carrier.id === 'postnl') {
            if (postcode) {
                showLiveSection('Live scans from PostNL.', true);
                renderLiveLoading();
                fetchPostNLTracking(number, postcode).then(function (item) {
                    if (!lastLiveRequest || lastLiveRequest.number !== number) return;
                    renderPostNLTracking(item, carrier, 'postnl');
                }).catch(function () {
                    if (!lastLiveRequest || lastLiveRequest.number !== number) return;
                    renderLiveMessage('No PostNL scans were found for this number and postcode. Check the postcode, or use the official PostNL tracker above.');
                });
            } else {
                showLiveSection('PostNL needs the recipient\'s postcode to load the delivery scans.', false);
                renderLiveMessage('Add the recipient\'s postcode above and press Track again to load the PostNL timeline here.');
            }
            return;
        }

        if (carrier && carrier.id === 'indiapost') {
            if (postcode) {
                showLiveSection('Inbound to the Netherlands — live delivery scans from PostNL.', true);
                renderLiveLoading();
                fetchPostNLTracking(number, postcode).then(function (item) {
                    if (!lastLiveRequest || lastLiveRequest.number !== number) return;
                    renderPostNLTracking(item, carrier, 'india');
                }).catch(function () {
                    if (!lastLiveRequest || lastLiveRequest.number !== number) return;
                    renderLiveMessage('No PostNL delivery scans were found for this number and postcode. India Post\'s own tracker requires a captcha and may need a VPN — use the universal tracker above.');
                });
            } else {
                showLiveSection(
                    isIndiaUser() ?
                        'India Post tracking opens with a captcha.' :
                        'India Post requires a captcha and may need a VPN outside India.',
                    false
                );
                renderLiveMessage(isIndiaUser() ?
                    'Open the official India Post tracker, enter this number and solve the captcha. If this item is being delivered in the Netherlands, add the recipient\'s postcode above to load the PostNL delivery scans here.' :
                    'If this item is being delivered in the Netherlands, add the recipient\'s postcode above and press Track again to load the PostNL delivery scans here. Otherwise use the universal tracker.');
            }
            return;
        }

        if (carrier && (carrier.id === 'germany' || carrier.id === 'austria' || carrier.id === 'usps')) {
            showLiveSection('Official tracker only.', false);
            renderLiveMessage('Live scans for ' + carrier.name + ' cannot be loaded inside this page because ' +
                carrier.name + ' blocks cross-site requests. Use the ' + carrier.name +
                ' button above (the number is pre-filled), or the universal tracker.');
            return;
        }

        els.liveSection.hidden = true;
        els.liveCard.innerHTML = '';
    }

    function shareLookup(number, carrierId, postcode) {
        var url = new URL(window.location.href);
        url.search = '';
        url.searchParams.set('num', number);
        if (carrierId) url.searchParams.set('carrier', carrierId);
        if (postcode) url.searchParams.set('pc', postcode);
        var shareUrl = url.toString();

        if (navigator.share) {
            navigator.share({
                title: 'Track ' + number,
                text: 'Track this registered post or parcel',
                url: shareUrl
            }).catch(function () {
                copyText(shareUrl, 'Tracking link copied');
            });
            return;
        }
        copyText(shareUrl, 'Tracking link copied');
    }

    function saveRecent(number, carrier, postcode) {
        var recent = readRecent().filter(function (item) {
            return item.n !== number;
        });
        recent.unshift({
            n: number,
            c: carrier ? carrier.id : '',
            p: postcode || '',
            t: Date.now()
        });
        recent = recent.slice(0, RECENT_LIMIT);
        try {
            localStorage.setItem(RECENT_KEY, JSON.stringify(recent));
        } catch (error) {
            /* localStorage can be disabled; the page still works. */
        }
        savePostcode(postcode);
        renderRecent();
    }

    function readSavedPostcode() {
        try {
            return normalizePostcode(localStorage.getItem(POSTCODE_KEY) || '');
        } catch (error) {
            return '';
        }
    }

    function savePostcode(postcode) {
        if (!postcode) return;
        try {
            localStorage.setItem(POSTCODE_KEY, postcode);
        } catch (error) {
            /* ignore */
        }
    }

    function readRecent() {
        try {
            var raw = localStorage.getItem(RECENT_KEY);
            var parsed = raw ? JSON.parse(raw) : [];
            return Array.isArray(parsed) ? parsed.filter(function (item) {
                return item && typeof item.n === 'string';
            }) : [];
        } catch (error) {
            return [];
        }
    }

    function renderRecent() {
        var recent = readRecent();
        if (!els.recentSection || !els.recentList) return;
        els.recentSection.hidden = recent.length === 0;
        els.recentList.innerHTML = '';

        recent.forEach(function (item) {
            var carrier = byId[item.c] || detectCarrier(item.n);
            var button = document.createElement('button');
            button.type = 'button';
            button.className = 'track-recent-item';
            button.innerHTML =
                '<span class="track-recent-flag"></span>' +
                '<span class="track-recent-text">' +
                    '<span class="track-recent-number"></span>' +
                    '<span class="track-recent-carrier"></span>' +
                '</span>' +
                '<span class="track-recent-arrow" aria-hidden="true">→</span>';
            button.querySelector('.track-recent-flag').textContent = carrier ? carrier.flag : '🔎';
            button.querySelector('.track-recent-number').textContent = item.n;
            button.querySelector('.track-recent-carrier').textContent =
                carrier ? carrier.name + ' • ' + carrier.country : 'Carrier not identified';
            button.addEventListener('click', function () {
                els.input.value = item.n;
                els.select.value = carrier ? carrier.id : '';
                if (els.postcode) els.postcode.value = item.p || '';
                runSearch(numberFromForm(), carrier || null, !!carrier, item.p || '');
                els.input.focus();
            });
            els.recentList.appendChild(button);
        });
    }

    function renderCarrierGrid() {
        if (!els.carrierGrid) return;
        var noscript = els.carrierGrid.querySelector('noscript');
        els.carrierGrid.innerHTML = '';
        if (noscript) els.carrierGrid.appendChild(noscript);

        CARRIERS.forEach(function (carrier) {
            var link = document.createElement('a');
            link.className = 'carrier-card';
            link.href = carrier.official;
            link.target = '_blank';
            link.rel = 'noopener';
            link.style.setProperty('--carrier-accent', carrier.accent);
            link.innerHTML =
                '<div class="carrier-card-top">' +
                    '<span class="carrier-card-flag"></span>' +
                    '<div>' +
                        '<h3></h3>' +
                        '<p class="carrier-card-country"></p>' +
                    '</div>' +
                '</div>' +
                '<p class="carrier-card-examples"></p>' +
                '<span class="carrier-card-link">Open official tracker <span aria-hidden="true">→</span></span>';
            link.querySelector('.carrier-card-flag').textContent = carrier.flag;
            link.querySelector('h3').textContent = carrier.name;
            link.querySelector('.carrier-card-country').textContent = carrier.country;
            link.querySelector('.carrier-card-examples').textContent = 'e.g. ' + carrier.examples.join(' · ');
            els.carrierGrid.appendChild(link);
        });
    }

    function renderCarrierOptions() {
        if (!els.select) return;
        CARRIERS.forEach(function (carrier) {
            var option = document.createElement('option');
            option.value = carrier.id;
            option.textContent = carrier.flag + ' ' + carrier.name + ' — ' + carrier.country;
            els.select.appendChild(option);
        });
    }

    function numberFromForm() {
        return normalize(els.input.value);
    }

    function updateQuery(number, carrier, postcode) {
        if (!window.history || !window.history.pushState) return;
        try {
            var url = new URL(window.location.href);
            url.searchParams.set('num', number);
            if (carrier) {
                url.searchParams.set('carrier', carrier.id);
            } else {
                url.searchParams.delete('carrier');
            }
            if (postcode) {
                url.searchParams.set('pc', postcode);
            } else {
                url.searchParams.delete('pc');
            }
            window.history.pushState({}, '', url.toString());
        } catch (error) {
            /* file:// and some embedded browsers reject pushState. */
        }
    }

    function runSearch(number, carrier, manual, postcode) {
        renderResult(number, carrier, manual, postcode);
        saveRecent(number, carrier, postcode);
        updateQuery(number, carrier, postcode);
        els.result.scrollIntoView({ behavior: 'smooth', block: 'start' });
        loadLiveTracking(number, carrier, postcode);

        if (!carrier) return;

        if (!carrier.prefill) {
            copyText(number, 'Number copied — paste it on ' + carrier.name);
        }

        if (carrier.id === 'postnl' && !postcode) {
            if (els.postcode) els.postcode.focus();
            showToast('Add the recipient postcode for PostNL delivery scans');
        }
    }

    function handleSubmit(event) {
        event.preventDefault();

        var number = numberFromForm();
        if (!number) {
            els.input.focus();
            showToast('Enter a tracking number first');
            return;
        }
        if (number.length < 6) {
            showToast('That number looks too short — please check it');
            els.input.focus();
            return;
        }

        var manualCarrier = els.select.value ? byId[els.select.value] : null;
        var carrier = manualCarrier || detectCarrier(number);
        runSearch(number, carrier, !!manualCarrier, postcodeFromForm());
    }

    function initFromQuery() {
        var params = new URLSearchParams(window.location.search);
        var number = normalize(params.get('num') || '');
        var postcode = normalizePostcode(params.get('pc') || '') || readSavedPostcode();
        if (!number) return;
        var requestedCarrier = params.get('carrier') ? byId[params.get('carrier')] : null;
        var carrier = requestedCarrier || detectCarrier(number);
        els.input.value = number;
        if (requestedCarrier) els.select.value = requestedCarrier.id;
        if (els.postcode) els.postcode.value = postcode;
        renderResult(number, carrier, !!params.get('carrier'), postcode);
        saveRecent(number, carrier, postcode);
        loadLiveTracking(number, carrier, postcode);
    }

    els.form.addEventListener('submit', handleSubmit);

    if (els.refreshTracking) {
        els.refreshTracking.addEventListener('click', function () {
            if (!lastLiveRequest) return;
            loadLiveTracking(lastLiveRequest.number, lastLiveRequest.carrier, lastLiveRequest.postcode);
        });
    }

    if (els.clearRecent) {
        els.clearRecent.addEventListener('click', function () {
            try {
                localStorage.removeItem(RECENT_KEY);
            } catch (error) {
                /* ignore */
            }
            renderRecent();
            showToast('Recent lookups cleared');
        });
    }

    document.querySelectorAll('[data-example]').forEach(function (button) {
        button.addEventListener('click', function () {
            els.input.value = button.getAttribute('data-example');
            els.select.value = '';
            els.input.focus();
            handleSubmit(new Event('submit', { cancelable: true }));
        });
    });

    renderCarrierOptions();
    renderCarrierGrid();
    renderRecent();
    if (els.postcode && !els.postcode.value) {
        els.postcode.value = readSavedPostcode();
    }
    initFromQuery();
})();
