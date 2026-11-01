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
})();
