/* Optional article summaries: explicit jumps open the disclosure; reading past it does not. */
(function () {
  'use strict';
  var summary = document.querySelector('details.ry-summary');
  if (!summary) return;

  function refresh() {
    if (window.ScrollTrigger) window.ScrollTrigger.refresh();
  }

  function visit(target, focusTarget) {
    window.requestAnimationFrame(function () {
      refresh();
      var smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      var smoother = window.ScrollSmoother && window.ScrollSmoother.get();
      if (focusTarget) focusTarget.focus({ preventScroll: true });
      if (smoother) {
        smoother.scrollTo(target, smooth, 'top 100px');
      } else {
        window.scrollTo({ top: Math.max(0, window.scrollY + target.getBoundingClientRect().top - 100), behavior: smooth ? 'smooth' : 'auto' });
      }
    });
  }

  // Capture these two navigation actions before the theme's generic anchor scroller.
  document.addEventListener('click', function (event) {
    var link = event.target.closest('a[data-ry-summary-jump], a[data-ry-back-top]');
    if (!link || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    var target = document.getElementById(link.hash.slice(1));
    if (!target) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (target === summary) summary.open = true;
    window.history.replaceState(null, '', link.hash);
    visit(target, target === summary ? summary.querySelector('summary') : target);
  }, true);

  document.querySelectorAll('.ry-faq details, details.ry-summary').forEach(function (detail) {
    detail.addEventListener('toggle', refresh);
  });

  function openHash() {
    if (window.location.hash === '#' + summary.id) {
      summary.open = true;
      visit(summary, summary.querySelector('summary'));
    }
  }
  window.addEventListener('hashchange', openHash);
  if (document.readyState === 'complete') openHash();
  else window.addEventListener('load', openHash);
})();
