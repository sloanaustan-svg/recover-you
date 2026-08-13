/* ====================================================================
   Recover-You — nav dropdown fitting
   --------------------------------------------------------------------
   The DarkStar navbar is right-aligned (ms-auto) and its dropdown
   panels are absolutely positioned at their static position, i.e. they
   open rightward from wherever the parent item happens to sit. For the
   items nearest the right edge — Resources, Contact — that pushes the
   panel past the viewport and part of the menu becomes unreachable.

   This measures each top-level dropdown against the viewport and flips
   the offenders to right-aligned. Nothing else is touched: items with
   room to open normally are left exactly as the theme intended.

   Note the theme's THIRD-level menus (.sk__sub-submenu-ul) are inline
   accordions that expand downward inside the same panel, not flyouts,
   so they add no horizontal width and need no handling here.

   Runs on load, on resize, and again on font load (web fonts change
   panel widths after first paint). Desktop only — below the navbar's
   breakpoint the off-canvas menu takes over and none of this applies.
   ==================================================================== */
(function () {
  'use strict';

  var BREAKPOINT = 992;   // matches navbar-expand-lg
  var EDGE_PAD   = 16;    // keep this much clear of the viewport edge
  var FLIP_CLASS = 'ry-nav-flip';

  function items() {
    return document.querySelectorAll(
      '.sk__navbar .navbar-nav > li.menu-item-has-children'
    );
  }

  function fit() {
    var list = items();
    if (!list.length) return;

    var wide = window.innerWidth >= BREAKPOINT;

    for (var i = 0; i < list.length; i++) {
      var li = list[i];
      var panel = li.querySelector(':scope > .sk__submenu-ul');
      if (!panel) continue;

      // always measure from the un-flipped state
      li.classList.remove(FLIP_CLASS);

      if (!wide) continue;

      // offsetWidth is unaffected by the theme's scaleY(0) collapse,
      // so this is accurate even while the panel is closed
      var panelW = panel.offsetWidth;
      if (!panelW) continue;

      var liLeft = li.getBoundingClientRect().left;

      if (liLeft + panelW > window.innerWidth - EDGE_PAD) {
        li.classList.add(FLIP_CLASS);
      }
    }
  }

  var pending;
  function schedule() {
    cancelAnimationFrame(pending);
    pending = requestAnimationFrame(fit);
  }

  function init() {
    fit();
    window.addEventListener('resize', schedule);
    window.addEventListener('orientationchange', schedule);
    // web fonts land after first paint and change panel widths
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(fit).catch(function () {});
    }
    // one late pass in case the theme finishes wiring the nav after us
    setTimeout(fit, 600);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
