/* ====================================================================
   Recover-You — PDF page preview
   --------------------------------------------------------------------
   Steps through a small set of preview pages.

   This replaces a CSS-only version that swapped pages on :hover and
   :active. That approach had no affordance, did nothing at all on
   touch (no hover state exists), and could not be reached by keyboard.
   A preview nobody can discover or operate is decoration, not a
   preview.

   Implemented as a WAI-ARIA tablist: the dots are the tabs, the pages
   are the panels, arrow keys move between them. Progressive
   enhancement follows the same rule as ry-compare — the markup shows
   page one on its own, and this script only takes over once
   html.ry-js confirms it is running.
   ==================================================================== */
(function () {
  'use strict';

  if (!document.documentElement.classList.contains('ry-js')) return;

  Array.prototype.forEach.call(document.querySelectorAll('.ry-preview'), function (root) {
    var pages = root.querySelectorAll('.ry-preview__page');
    var dots = root.querySelectorAll('.ry-preview__dot');
    if (pages.length < 2 || pages.length !== dots.length) return;

    function show(i) {
      Array.prototype.forEach.call(pages, function (p, k) {
        p.classList.toggle('is-active', k === i);
      });
      Array.prototype.forEach.call(dots, function (d, k) {
        var on = k === i;
        d.setAttribute('aria-selected', on ? 'true' : 'false');
        // only the selected tab stays in the tab order; arrow keys do the rest
        d.tabIndex = on ? 0 : -1;
      });
    }

    Array.prototype.forEach.call(dots, function (d, i) {
      d.addEventListener('click', function () { show(i); });
      d.addEventListener('keydown', function (e) {
        var next = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (i + 1) % dots.length;
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (i - 1 + dots.length) % dots.length;
        else if (e.key === 'Home') next = 0;
        else if (e.key === 'End') next = dots.length - 1;
        if (next === null) return;
        e.preventDefault();
        show(next);
        dots[next].focus();
      });
    });

    show(0);
  });
})();
