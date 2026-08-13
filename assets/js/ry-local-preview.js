/* ====================================================================
   Recover-You — local file:// preview shim
   --------------------------------------------------------------------
   Internal links across the site are extensionless (href="epigenetics"),
   which is the production convention and matches the current live site.
   Netlify serves /epigenetics from epigenetics.html automatically, so
   this is correct once deployed.

   Opening the files directly from disk is the exception: file:// has no
   server to do that mapping, so Windows looks for a file literally named
   "epigenetics" with no extension and fails.

   This intercepts clicks ONLY under the file:// protocol and appends
   .html. On a real server it returns immediately and does nothing, so
   there is no production cost and no behaviour to keep in sync.

   Load this before the other custom scripts. It can be deleted whenever
   local preview stops being useful.
   ==================================================================== */
(function () {
  'use strict';
  if (window.location.protocol !== 'file:') return;

  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;

    var href = a.getAttribute('href');
    if (!href) return;

    // leave anchors, absolute URLs and other schemes alone
    if (/^(#|\/\/|https?:|mailto:|tel:|javascript:|data:)/i.test(href)) return;
    // leave anything that already has a file extension (.html, .pdf, .webp…)
    if (/\.[a-z0-9]{2,5}([?#]|$)/i.test(href)) return;
    // leave explicit downloads alone
    if (a.hasAttribute('download')) return;

    var hash = '';
    var i = href.indexOf('#');
    if (i >= 0) { hash = href.slice(i); href = href.slice(0, i); }
    if (!href) return;

    e.preventDefault();
    window.location.href = href + '.html' + hash;
  }, true);
})();
