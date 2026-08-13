/* ====================================================================
   Recover-You — diagram compare switcher
   --------------------------------------------------------------------
   Progressive enhancement for .ry-compare. Markup contract:

     <div class="ry-compare">
       <div class="ry-compare__tabs" role="tablist">
         <button class="ry-compare__tab" role="tab" data-target="id-a">…</button>
         <button class="ry-compare__tab" role="tab" data-target="id-b">…</button>
       </div>
       <div class="ry-compare__stage">
         <div class="ry-compare__panel" id="id-a" role="tabpanel">…</div>
         <div class="ry-compare__panel" id="id-b" role="tabpanel">…</div>
       </div>
     </div>

   The CSS default shows every panel stacked at full width; the tabs
   only appear once this script adds .is-enhanced. So a JS failure
   degrades to a complete, readable page rather than diagrams hidden
   behind a control that never activates.

   Keyboard: arrow keys move between tabs, Home/End jump to the ends,
   per the WAI-ARIA tabs pattern.

   The unselected tab pulses until first interaction, at which point
   .is-touched is added and the animation stops permanently — the nudge
   is there to answer "where is the other one?", not to keep nagging.
   ==================================================================== */
(function () {
  'use strict';

  function setup(root) {
    var tabs = Array.prototype.slice.call(root.querySelectorAll('.ry-compare__tab'));
    var panels = Array.prototype.slice.call(root.querySelectorAll('.ry-compare__panel'));
    if (tabs.length < 2 || !panels.length) return;

    function select(index, focus) {
      tabs.forEach(function (tab, i) {
        var on = i === index;
        tab.setAttribute('aria-selected', on ? 'true' : 'false');
        tab.setAttribute('tabindex', on ? '0' : '-1');
        if (on && focus) tab.focus();
      });
      panels.forEach(function (panel) {
        var on = panel.id === tabs[index].getAttribute('data-target');
        panel.setAttribute('data-active', on ? 'true' : 'false');
        // keep hidden panels out of the a11y tree and tab order
        if (on) { panel.removeAttribute('hidden'); }
        else { panel.setAttribute('hidden', ''); }
      });
    }

    function touched() { root.classList.add('is-touched'); }

    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { touched(); select(i); });
      tab.addEventListener('keydown', function (e) {
        var next = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (i + 1) % tabs.length;
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (i - 1 + tabs.length) % tabs.length;
        else if (e.key === 'Home') next = 0;
        else if (e.key === 'End') next = tabs.length - 1;
        if (next !== null) { e.preventDefault(); touched(); select(next, true); }
      });
    });

    root.classList.add('is-enhanced');
    select(0);
  }

  function init() {
    var roots = document.querySelectorAll('.ry-compare');
    for (var i = 0; i < roots.length; i++) setup(roots[i]);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
