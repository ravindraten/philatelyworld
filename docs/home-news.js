/* Latest-news strip on the catalogue page: reads docs/news.json (the same
 * snapshot the news desk uses) and renders the newest six stories in a
 * compact news-card grid. Server-rendered nothing; fails silently back to
 * skeletons so the catalogue is never blocked by the feed.
 */
(function () {
    'use strict';

    const PAGE = window.location.origin === 'null' ? '.' : '.';
    const grid = document.getElementById('homeNewsGrid');
    if (!grid) return;

    const esc = function (value) {
        return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    };

    const dateFormatter = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' });

    function timeAgo(published) {
        const then = new Date(published).getTime();
        if (Number.isNaN(then)) return '';
        const minutes = Math.round((Date.now() - then) / 60000);
        if (minutes < 60) return minutes <= 1 ? 'just now' : minutes + ' min ago';
        const hours = Math.round(minutes / 60);
        if (hours < 24) return hours === 1 ? '1 hour ago' : hours + ' hours ago';
        const days = Math.round(hours / 24);
        if (days < 14) return days === 1 ? 'yesterday' : days + ' days ago';
        return dateFormatter.format(then);
    }

    function card(item) {
        const url = item.url || 'philatelic-news.html';
        const image = item.image || 'images/news-placeholder.svg';
        const summary = item.description || '';
        return [
            '<article class="news-item">',
            '  <a class="news-thumb" href="' + esc(url) + '" target="_blank" rel="noopener noreferrer" tabindex="-1" aria-hidden="true">',
            '    <img src="' + esc(image) + '" alt="" loading="lazy" decoding="async">',
            '  </a>',
            '  <div class="news-item-body">',
            '    <div class="news-meta">',
            '      <span class="news-source-pill">' + esc(item.source || 'News') + '</span>',
            '      <span class="dot">&bull;</span>',
            '      <time datetime="' + esc(item.published) + '">' + esc(timeAgo(item.published)) + '</time>',
            '    </div>',
            '    <h3><a href="' + esc(url) + '" target="_blank" rel="noopener noreferrer">' + esc(item.title) + '</a></h3>',
            summary ? '    <p class="news-summary">' + esc(summary) + '</p>' : '',
            '    <a class="news-read" href="' + esc(url) + '" target="_blank" rel="noopener noreferrer">Read on ' + esc(item.source || 'the publisher') + ' &rarr;</a>',
            '  </div>',
            '</article>'
        ].filter(Boolean).join('\n');
    }

    function fail() {
        grid.innerHTML = '<p style="grid-column:1/-1;color:var(--text-light);font-size:0.8rem;">The news feed is unavailable right now &mdash; open the <a href="philatelic-news.html" style="color: var(--primary); font-weight:700;">news desk</a> instead.</p>';
    }

    fetch(PAGE + '/news.json', { cache: 'no-store' })
        .then(function (response) {
            if (!response.ok) throw new Error('HTTP ' + response.status);
            return response.json();
        })
        .then(function (data) {
            const items = (data.items || []).filter(function (item) {
                return item && item.title && item.url;
            }).slice(0, 6);
            if (!items.length) throw new Error('empty');
            grid.innerHTML = items.map(card).join('');
        })
        .catch(function () {
            grid.innerHTML =
                '<div class="news-skeleton"><div class="sk-img"></div><div><div class="sk-line w85"></div><div class="sk-line w85"></div><div class="sk-line w60"></div></div></div>' +
                '<p style="grid-column:1/-1;color:var(--text-light);font-size:0.8rem;">News updates a few times a day &mdash; open the <a href="philatelic-news.html" style="color: var(--primary); font-weight:700;">news desk</a> for the full feed.</p>';
        });
})();
