/* Mobile search launcher: on phones the inline search bar leaves the flow
 * and a floating button opens a focused search sheet. Desktop keeps the
 * existing sticky inline bar, so everything here no-ops above 800px. */
(function () {
    'use strict';

    const toggle = document.getElementById('mobileSearchToggle');
    const sheet = document.querySelector('.search-sticky-container');
    const backdrop = document.getElementById('mobileSearchBackdrop');
    const closeButton = document.getElementById('mobileSearchClose');
    const input = document.getElementById('stampSearch');
    if (!toggle || !sheet || !backdrop || !input) return;

    const mq = window.matchMedia('(max-width: 800px)');
    const viewport = window.visualViewport;

    let pushedHistory = false;
    let ignorePop = false;
    let jumpToResults = false;

    function isOpen() {
        return sheet.classList.contains('is-open');
    }

    function syncSearchParam() {
        const url = new URL(window.location.href);
        const term = input.value.trim();
        if (term) url.searchParams.set('q', term);
        else url.searchParams.delete('q');
        window.history.replaceState(window.history.state, '', url);
    }

    /* iOS keeps the layout viewport at full height when the keyboard opens,
     * so a bottom-anchored sheet would sit behind it. Lift the sheet by the
     * height the visual viewport loses. Android already shrinks the layout
     * viewport in 'resizes-content' mode, which yields a zero inset, while
     * 'resizes-visual' behaves like iOS. */
    function syncSheetBottom() {
        if (!isOpen()) return;
        let bottom = 82;
        if (viewport) {
            const inset = Math.max(
                0,
                window.innerHeight - viewport.height - viewport.offsetTop
            );
            if (inset > 60) bottom = inset + 12;
        }
        sheet.style.setProperty('--search-sheet-bottom', bottom + 'px');
    }

    function releaseScrollRestoration() {
        window.setTimeout(function () {
            if ('scrollRestoration' in window.history) {
                window.history.scrollRestoration = 'auto';
            }
        }, 120);
    }

    /* Runs after the traversal has settled: a scroll started from inside the
     * popstate handler can be swallowed by the browser's own position
     * restoration. Computing an absolute target also keeps the jump correct
     * if the browser already moved the page. */
    function jumpToGrid() {
        const grid = document.getElementById('stampGrid');
        if (!grid) return;
        const top = grid.getBoundingClientRect().top + window.pageYOffset;
        window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    }

    function setOpen(open) {
        sheet.classList.toggle('is-open', open);
        backdrop.classList.toggle('is-open', open);
        document.body.classList.toggle('mobile-search-open', open);
        toggle.setAttribute('aria-expanded', String(open));

        if (open) {
            // Let the Android back gesture dismiss the sheet instead of
            // navigating away from the catalogue.
            if (!pushedHistory) {
                window.history.pushState({ mobileSearch: true }, '');
                pushedHistory = true;
                // Same-document traversal would normally restore the old
                // scroll position; keep the page still while the sheet moves.
                if ('scrollRestoration' in window.history) {
                    window.history.scrollRestoration = 'manual';
                }
            }
            // Must run inside the tap gesture: iOS only raises the keyboard
            // when focus() is called synchronously from the user gesture.
            input.focus({ preventScroll: true });
            syncSheetBottom();
            // Safety net for browsers that ignore focus during the reveal.
            window.requestAnimationFrame(function () {
                if (document.activeElement !== input) {
                    input.focus({ preventScroll: true });
                }
            });
        } else {
            input.blur();
            sheet.style.removeProperty('--search-sheet-bottom');
            if (pushedHistory) {
                pushedHistory = false;
                ignorePop = true;
                window.history.back();
            }
        }
    }

    toggle.addEventListener('click', function () {
        setOpen(!isOpen());
    });

    if (closeButton) {
        closeButton.addEventListener('click', function () {
            setOpen(false);
            toggle.focus();
        });
    }

    backdrop.addEventListener('click', function () {
        setOpen(false);
        toggle.focus();
    });

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && isOpen()) {
            setOpen(false);
            toggle.focus();
        }
    });

    // Hardware/gesture back closes the sheet; the browser entry we pushed
    // above is consumed, leaving the catalogue exactly where it was.
    window.addEventListener('popstate', function () {
        if (ignorePop) {
            ignorePop = false;
            syncSearchParam();
            if (jumpToResults) {
                jumpToResults = false;
                // Wait for the traversal (and any position restore) to settle.
                window.setTimeout(function () {
                    window.requestAnimationFrame(function () {
                        jumpToGrid();
                        releaseScrollRestoration();
                    });
                }, 0);
            } else {
                releaseScrollRestoration();
            }
            return;
        }
        if (!pushedHistory) return;
        pushedHistory = false;
        setOpen(false);
        toggle.focus();
        syncSearchParam();
        releaseScrollRestoration();
    });

    // Enter closes the sheet and jumps to the filtered results once the
    // history entry has been unwound (so scroll restoration cannot undo it).
    input.addEventListener('keydown', function (event) {
        if (event.key !== 'Enter' || !mq.matches) return;
        event.preventDefault();
        jumpToResults = true;
        setOpen(false);
    });

    if (viewport) {
        viewport.addEventListener('resize', syncSheetBottom);
        viewport.addEventListener('scroll', syncSheetBottom);
    }
    window.addEventListener('resize', syncSheetBottom);

    // Returning to desktop must not leave the page locked or the sheet open.
    function handleBreakpoint() {
        if (!mq.matches) setOpen(false);
    }

    if (mq.addEventListener) mq.addEventListener('change', handleBreakpoint);
    else if (mq.addListener) mq.addListener(handleBreakpoint);
})();
