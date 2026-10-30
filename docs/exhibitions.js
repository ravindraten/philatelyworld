(function () {
    'use strict';

    const PLACEHOLDER = 'images/news-placeholder.svg';
    const PAGE_SIZE = 18;
    const LOGO = 'https://filedn.eu/lbu0dswNxxUBjQKg0kNdmLu/philatelyworld-images/images/logo.jpg';

    const state = {
        items: [],
        generatedAt: '',
        source: 'all',
        query: '',
        limit: PAGE_SIZE
    };

    const els = {
        list: document.getElementById('newsList'),
        status: document.getElementById('newsStatus'),
        search: document.getElementById('newsSearch'),
        source: document.getElementById('newsSource'),
        refresh: document.getElementById('newsRefresh'),
        loadMore: document.getElementById('newsLoadMore'),
        sources: document.getElementById('newsSources'),
        blogPicks: document.getElementById('blogPicks'),
        count: document.getElementById('newsCount'),
        updated: document.getElementById('newsUpdated'),
        sourceCount: document.getElementById('newsSourceCount')
    };

    const dateFormatter = new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
    const relativeFormatter = typeof Intl.RelativeTimeFormat === 'function'
        ? new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
        : null;
    const dayFormatter = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' });

    const HTML_ESCAPES = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    };

    function esc(value) {
        return String(value == null ? '' : value).replace(/[&<>"']/g, function (character) {
            return HTML_ESCAPES[character];
        });
    }

    function timeAgo(value) {
        if (!value) return '';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return '';

        const seconds = Math.max(0, (Date.now() - date.getTime()) / 1000);
        if (seconds < 60) return 'just now';
        if (seconds < 3600) {
            const minutes = Math.round(seconds / 60);
            return relativeFormatter ? relativeFormatter.format(-minutes, 'minute') : minutes + ' min ago';
        }
        if (seconds < 86400) {
            const hours = Math.round(seconds / 3600);
            return relativeFormatter ? relativeFormatter.format(-hours, 'hour') : hours + ' hr ago';
        }
        if (seconds < 604800) {
            const days = Math.round(seconds / 86400);
            return relativeFormatter ? relativeFormatter.format(-days, 'day') : days + ' days ago';
        }
        return dateFormatter.format(date);
    }

    function exhibitionWindow(event) {
        const start = event.start ? new Date(event.start) : null;
        const end = event.end ? new Date(event.end)
            : (start ? new Date(start.getTime() + 86400000) : null);
        return { start: start, end: end };
    }

    function exhibitionDateLabel(event) {
        const win = exhibitionWindow(event);
        if (!win.start || Number.isNaN(win.start.getTime())) return '';
        const endLabel = win.end && !Number.isNaN(win.end.getTime())
            && win.end.getTime() !== win.start.getTime()
            ? ' \u2013 ' + (win.start.getFullYear() === win.end.getFullYear()
                ? dayFormatter.format(win.end)
                : dateFormatter.format(win.end))
            : '';
        return dateFormatter.format(win.start) + endLabel;
    }

    function exhibitionStatus(event) {
        const win = exhibitionWindow(event);
        if (!win.start || Number.isNaN(win.start.getTime())) return '';
        const now = Date.now();
        const end = win.end ? win.end.getTime() : win.start.getTime() + 86400000;
        if (end < now) return 'Past event';
        if (win.start.getTime() <= now) return 'Happening now';
        const days = Math.round((win.start.getTime() - now) / 86400000);
        if (days <= 1) return 'Tomorrow';
        if (days <= 30) return 'In ' + days + ' days';
        return 'Upcoming';
    }

    function sourceCounts() {
        const counts = new Map();
        state.items.forEach(function (item) {
            counts.set(item.source, (counts.get(item.source) || 0) + 1);
        });
        return Array.from(counts.entries())
            .sort(function (a, b) {
                return a[0].localeCompare(b[0]);
            });
    }

    function filteredItems() {
        const query = state.query.trim().toLowerCase();
        return state.items.filter(function (item) {
            if (!query) return true;
            const haystack = [item.title, item.venue, item.description, item.source].join(' ').toLowerCase();
            return haystack.indexOf(query) !== -1;
        });
    }

    function renderCard(item, index) {
        const url = item.url || '#';
        const image = item.image || PLACEHOLDER;
        const summary = item.description || (item.venue ? 'Venue: ' + item.venue : '');
        const status = exhibitionStatus(item);
        const dateLabel = exhibitionDateLabel(item);
        return [
            '<article class="news-item" style="--i:' + index + '">',
            '  <a class="news-thumb" href="' + esc(url) + '" target="_blank" rel="noopener noreferrer" tabindex="-1" aria-hidden="true">',
            '    <img src="' + esc(image) + '" alt="" loading="lazy" decoding="async">',
            '  </a>',
            '  <div class="news-item-body">',
            '    <div class="news-meta">',
            '      <span class="news-source-pill">' + esc(item.source || 'Exhibition') + '</span>',
            dateLabel ? '      <span class="dot">&bull;</span>' : '',
            dateLabel ? '      <time datetime="' + esc(item.start) + '">' + esc(dateLabel) + '</time>' : '',
            status ? '      <span class="dot">&bull;</span>' : '',
            status ? '      <span class="exhibition-status">' + esc(status) + '</span>' : '',
            '    </div>',
            '    <h2><a href="' + esc(url) + '" target="_blank" rel="noopener noreferrer">' + esc(item.title) + '</a></h2>',
            summary ? '    <p class="news-summary">' + esc(summary) + '</p>' : '',
            '    <a class="news-read" href="' + esc(url) + '" target="_blank" rel="noopener noreferrer">View on ' + esc(item.source || 'the organiser') + ' &rarr;</a>',
            '  </div>',
            '</article>'
        ].filter(Boolean).join('\n');
    }

    function renderSources() {
        const counts = sourceCounts();
        const total = state.items.length;

        if (els.sourceCount) {
            els.sourceCount.textContent = counts.length + (counts.length === 1 ? ' source' : ' sources');
        }

        if (els.source) {
            const options = ['<option value="all">All sources (' + total + ')</option>'];
            counts.forEach(function (entry) {
                options.push('<option value="' + esc(entry[0]) + '">' + esc(entry[0]) + ' (' + entry[1] + ')</option>');
            });
            els.source.innerHTML = options.join('');
            els.source.value = state.source;
        }

        if (!els.sources) return;
        const buttons = [
            '<li><button type="button" data-source="all" class="' + (state.source === 'all' ? 'is-active' : '') + '">',
            '<span>All sources</span><span class="source-count">' + total + '</span>',
            '</button></li>'
        ];
        counts.forEach(function (entry) {
            const active = state.source === entry[0] ? ' is-active' : '';
            buttons.push(
                '<li><button type="button" data-source="' + esc(entry[0]) + '" class="' + active.trim() + '">' +
                '<span>' + esc(entry[0]) + '</span><span class="source-count">' + entry[1] + '</span>' +
                '</button></li>'
            );
        });
        els.sources.innerHTML = buttons.join('');
    }

    function render() {
        if (!els.list) return;
        const filtered = filteredItems();
        const visible = filtered.slice(0, state.limit);

        if (!visible.length) {
            els.list.innerHTML = [
                '<div class="aside-card" style="text-align:center;padding:40px 24px;">',
                '<h2 style="margin-bottom:8px;">No exhibitions found</h2>',
                '<p>Try a different search term.</p>',
                '</div>'
            ].join('');
        } else {
            els.list.innerHTML = visible.map(renderCard).join('\n');
        }

        els.list.querySelectorAll('img').forEach(function (image) {
            image.addEventListener('error', function () {
                if (image.src.indexOf(PLACEHOLDER) === -1) image.src = PLACEHOLDER;
            }, { once: true });
        });

        if (els.loadMore) {
            els.loadMore.hidden = filtered.length <= state.limit;
            els.loadMore.textContent = 'Show more exhibitions (' + Math.max(0, filtered.length - state.limit) + ' more)';
        }

        if (els.status) {
            els.status.classList.remove('is-error');
            const upcoming = state.items.filter(function (item) {
                return exhibitionStatus(item) !== 'Past event';
            }).length;
            const bits = [filtered.length + (filtered.length === 1 ? ' exhibition' : ' exhibitions'),
                upcoming + ' upcoming/ongoing'];
            if (state.source !== 'all') bits.push('from ' + state.source);
            if (state.query.trim()) bits.push('matching \u201c' + state.query.trim() + '\u201d');
            els.status.textContent = bits.join(' \u2022 ');
        }
    }

    function renderBlogPicks() {
        if (!els.blogPicks) return;
        const posts = (typeof blogPosts !== 'undefined' && Array.isArray(blogPosts)) ? blogPosts.slice(0, 4) : [];
        if (!posts.length) {
            els.blogPicks.innerHTML = '<p>Our latest stamp stories are on the <a href="index.html?tab=blog">blog</a>.</p>';
            return;
        }
        els.blogPicks.innerHTML = posts.map(function (post) {
            return [
                '<a class="blog-pick" href="' + esc(post.url) + '">',
                '<img src="' + esc(post.customImage || LOGO) + '" alt="" loading="lazy" decoding="async">',
                '<span>' + esc(post.name) + '</span>',
                '</a>'
            ].join('');
        }).join('');
    }

    function setSource(value) {
        state.source = value || 'all';
        state.limit = PAGE_SIZE;
        if (els.source) els.source.value = state.source;
        renderSources();
        render();
    }

    async function loadNews(isRefresh) {
        if (els.refresh) {
            els.refresh.classList.add('is-loading');
            els.refresh.disabled = true;
        }
        if (els.status) {
            els.status.classList.remove('is-error');
            els.status.textContent = isRefresh ? 'Refreshing exhibitions\u2026' : 'Loading exhibitions\u2026';
        }

        try {
            const url = isRefresh ? 'exhibitions.json?t=' + Date.now() : 'exhibitions.json';
            const response = await fetch(url, { cache: 'no-store' });
            if (!response.ok) throw new Error('HTTP ' + response.status);

            const data = await response.json();
            const items = Array.isArray(data.items) ? data.items : [];
            if (!items.length) throw new Error('No exhibitions in feed');

            state.items = items.filter(function (item) {
                return item && item.title && item.url && item.start;
            }).sort(function (a, b) {
                return String(a.start).localeCompare(String(b.start));
            });
            state.generatedAt = data.generated_at || '';
            state.limit = Math.min(state.limit, Math.max(PAGE_SIZE, state.items.length));

            if (state.source !== 'all' && !state.items.some(function (item) {
                return item.source === state.source;
            })) {
                state.source = 'all';
            }

            if (els.count) {
                els.count.textContent = state.items.length + (state.items.length === 1 ? ' event' : ' events');
            }
            if (els.updated) {
                els.updated.textContent = state.generatedAt
                    ? 'Updated ' + timeAgo(state.generatedAt)
                    : 'Updated recently';
            }

            renderSources();
            render();
        } catch (error) {
            if (els.status) {
                els.status.classList.add('is-error');
                els.status.textContent = state.items.length
                    ? 'Could not refresh exhibitions. Showing the events already loaded.'
                    : 'Exhibitions are temporarily unavailable. Please try again in a moment.';
            }
            if (!state.items.length && els.list) {
                els.list.innerHTML = '';
            }
        } finally {
            if (els.refresh) {
                els.refresh.classList.remove('is-loading');
                els.refresh.disabled = false;
            }
        }
    }

    let searchTimer = null;
    if (els.search) {
        els.search.addEventListener('input', function () {
            clearTimeout(searchTimer);
            searchTimer = setTimeout(function () {
                state.query = els.search.value;
                state.limit = PAGE_SIZE;
                render();
            }, 140);
        });
    }

    if (els.source) {
        els.source.addEventListener('change', function () {
            setSource(els.source.value);
        });
    }

    if (els.sources) {
        els.sources.addEventListener('click', function (event) {
            const button = event.target.closest('button[data-source]');
            if (!button) return;
            setSource(button.getAttribute('data-source'));
        });
    }

    if (els.loadMore) {
        els.loadMore.addEventListener('click', function () {
            state.limit += PAGE_SIZE;
            render();
        });
    }

    if (els.refresh) {
        els.refresh.addEventListener('click', function () {
            loadNews(true);
        });
    }

    renderBlogPicks();
    loadNews(false);
})();
