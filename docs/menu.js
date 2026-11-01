/* Mobile hamburger navigation for the shared masthead.
 * The `.nav-toggle` button and the existing `.news-nav` links are enough:
 * toggling `.nav-open` on `.news-masthead` reveals the nav as a vertical
 * panel below the brand. Desktop shows the full row, so the button is
 * hidden above 800px and the panel state is reset on resize.
 */
(function () {
    'use strict';

    const masts = document.querySelectorAll('.news-masthead');
    if (!masts.length) return;

    const MOBILE = 800;

    // Social icons: on desktop they sit in the catalogue's filter rail (below
    // currency) or in the masthead on the other pages. On phones the rail and
    // masthead row give way to the hamburger panel, so move the row inside it
    // (it only shows while the menu is open) and put it back on resize.
    const socialRow = document.querySelector('.nav-social-row');
    const railCurrency = document.querySelector('#catalogFilters .rail-currency');
    const mastNav = document.querySelector('.news-masthead .news-nav');
    const mastRight = document.querySelector('.news-masthead .masthead-right');

    function placeSocialRow() {
        if (!socialRow || !mastNav) return;
        const inMenu = mastNav.contains(socialRow);
        if (window.innerWidth <= MOBILE) {
            if (!inMenu) mastNav.appendChild(socialRow);
        } else if (inMenu) {
            if (railCurrency) {
                railCurrency.insertAdjacentElement('afterend', socialRow);
            } else if (mastRight) {
                mastRight.appendChild(socialRow);
            }
        }
    }

    placeSocialRow();
    window.addEventListener('resize', placeSocialRow);

    masts.forEach(function (mast) {
        const toggle = mast.querySelector('.nav-toggle');
        const nav = mast.querySelector('.news-nav');
        if (!toggle || !nav) return;

        function setOpen(open) {
            mast.classList.toggle('nav-open', open);
            toggle.setAttribute('aria-expanded', String(open));
            toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        }

        toggle.addEventListener('click', function (event) {
            event.stopPropagation();
            setOpen(!mast.classList.contains('nav-open'));
        });

        // Close after choosing a destination.
        nav.addEventListener('click', function (event) {
            if (event.target.closest('a')) setOpen(false);
        });

        // Close when tapping elsewhere.
        document.addEventListener('click', function (event) {
            if (!mast.classList.contains('nav-open')) return;
            if (!mast.contains(event.target)) setOpen(false);
        });

        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape' && mast.classList.contains('nav-open')) {
                setOpen(false);
                toggle.focus();
            }
        });

        // Back to the desktop row: drop the panel state.
        window.addEventListener('resize', function () {
            if (window.innerWidth > MOBILE && mast.classList.contains('nav-open')) {
                setOpen(false);
            }
        });
    });

    /* Back to top: every page that ships the shared #backToTop button gets
     * show/hide + smooth scroll here. The catalogue page's script.js also
     * runs this behaviour; the dataset flag keeps it bound once. */
    const backToTop = document.getElementById('backToTop');
    if (backToTop && !backToTop.dataset.bttBound) {
        backToTop.dataset.bttBound = 'true';

        const searchFab = document.getElementById('mobileSearchToggle');
        const mobileMQ = window.matchMedia('(max-width: 800px)');
        let countdownTimer = null;
        let expired = false;
        let lastY = window.scrollY;

        function nudgeFab(on) {
            if (searchFab) searchFab.classList.toggle('search-fab-nudged', on);
        }

        function release() {
            expired = false;
            if (countdownTimer) {
                window.clearTimeout(countdownTimer);
                countdownTimer = null;
            }
        }

        function syncVisible() {
            if (window.scrollY <= 400) {
                release();
                backToTop.classList.remove('visible');
                nudgeFab(false);
                return;
            }

            // Without the FAB (desktop, and pages without floating search)
            // the button stays visible for as long as the user is scrolled.
            if (!searchFab || !mobileMQ.matches) {
                release();
                backToTop.classList.add('visible');
                return;
            }

            // Timed hint: once per scroll-down. The FAB slides left of the
            // corner, back-to-top shows, and after a few idle seconds both
            // fall back to just the corner FAB. Deliberate scrolling in
            // either direction (more than 20px since the last scroll event)
            // re-arms it, so the hint isn't ever a one-shot per visit.
            if (expired) {
                if (Math.abs(window.scrollY - lastY) > 20) {
                    expired = false;
                } else {
                    lastY = window.scrollY;
                    backToTop.classList.remove('visible');
                    nudgeFab(false);
                    return;
                }
            }
            lastY = window.scrollY;
            if (!countdownTimer) {
                backToTop.classList.add('visible');
                nudgeFab(true);
                countdownTimer = window.setTimeout(function () {
                    countdownTimer = null;
                    expired = true;
                    backToTop.classList.remove('visible');
                    nudgeFab(false);
                }, 4000);
            }
        }

        window.addEventListener('scroll', syncVisible, { passive: true });
        syncVisible();

        backToTop.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
})();
