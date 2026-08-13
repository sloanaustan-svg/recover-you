/* ry-zoom — open a full-size view of a diagram.
 *
 * Split panels show diagrams with background-size: contain, so nothing is
 * ever cropped. But a diagram scaled into half a column can still have
 * labels too small to read, so anything marked [data-ry-zoom] gets an
 * expand affordance that opens the source file at full size.
 *
 * Uses one delegated listener and one lazily-built <dialog>: no per-image
 * markup, no dependency, and if the script never loads the page is simply
 * a page without a zoom button rather than a page with a dead one.
 */
(function () {
  'use strict';
  var root = document.documentElement;
  if (!root.classList.contains('ry-js')) return;          // same gate as ry-reveal
  if (!window.HTMLDialogElement) return;                  // no <dialog>, no button

  var triggers = document.querySelectorAll('[data-ry-zoom]');
  if (!triggers.length) return;

  var dlg = null;

  function build() {
    dlg = document.createElement('dialog');
    dlg.className = 'ry-zoom-dialog';
    dlg.innerHTML =
      '<button type="button" class="ry-zoom-close" aria-label="Close">&times;</button>' +
      '<img alt="">';
    document.body.appendChild(dlg);

    dlg.querySelector('.ry-zoom-close')
       .addEventListener('click', function () { dlg.close(); });

    // click outside the picture closes, the way a lightbox is expected to
    dlg.addEventListener('click', function (e) {
      if (e.target === dlg) dlg.close();
    });
    return dlg;
  }

  Array.prototype.forEach.call(triggers, function (el) {
    // the affordance itself is injected, so it cannot appear without its handler
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'ry-zoom-btn';
    // the label is per-image: a labelled framework diagram is not
    // "an image" to the reader, it is the thing the section is about
    var label = el.getAttribute('data-ry-zoom-label') || 'View full image';
    btn.innerHTML = '<span aria-hidden="true">&#9713;</span> ' + label;
    btn.setAttribute('aria-label', label);
    el.appendChild(btn);

    btn.addEventListener('click', function () {
      var d = dlg || build();
      var img = d.querySelector('img');
      img.src = el.getAttribute('data-ry-zoom');
      img.alt = el.getAttribute('data-ry-zoom-alt') || '';
      d.showModal();
    });
  });
})();
