/* ====================================================================
   Recover-You: "Name what you've lost" (Grief & the Unlived Life)
   --------------------------------------------------------------------
   A smaller sibling of ry-patterns.js. No search: there are only a
   couple of dozen losses here, and the point is to read them slowly,
   not to hunt for a keyword.

     MARK   tap a loss to say "this is mine"
     KEEP   the marked losses gather at the bottom as a plain list
            you can copy or print, grouped the way the page groups them

   Same rules as the other tools on this site:

   * Nothing is stored or transmitted. No localStorage, no analytics
     event carrying a selection, no query string. A list of someone's
     losses is about as private as it gets. Reload and it is gone.
   * No score, no interpretation. Marking ten losses does not mean you
     are grieving "more" than someone who marked one.
   * Progressive enhancement. Without JavaScript every loss is still on
     the page as readable text; the mark buttons are injected here.
   ==================================================================== */
(function () {
  'use strict';

  if (!document.documentElement.classList.contains('ry-js')) return;

  var root = document.getElementById('ry-losses');
  if (!root) return;

  var groups = Array.prototype.slice.call(root.querySelectorAll('.ry-lossgroup'));
  var cards = Array.prototype.slice.call(root.querySelectorAll('.ry-loss'));
  if (!cards.length) return;

  var marked = [];

  cards.forEach(function (card) {
    card.__label = card.querySelector('.ry-loss__label').textContent.trim();

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'ry-mark';
    btn.setAttribute('aria-pressed', 'false');
    btn.setAttribute('aria-label', 'Mark “' + card.__label + '” as a loss you carry');
    card.appendChild(btn);

    function toggle() {
      var on = card.classList.toggle('is-marked');
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      if (on) marked.push(card);
      else marked.splice(marked.indexOf(card), 1);
      render();
    }

    btn.addEventListener('click', function (e) { e.stopPropagation(); toggle(); });
    // the whole card is the target on touch screens; the button stays the
    // keyboard and screen-reader control so nothing is announced twice
    card.addEventListener('click', toggle);
  });

  var wrap = document.getElementById('loss-list');
  var body = document.getElementById('ry-losslist-body');
  var copyBtn = document.getElementById('ry-losslist-copy');
  var printBtn = document.getElementById('ry-losslist-print');
  var clearBtn = document.getElementById('ry-losslist-clear');
  var countEl = document.getElementById('ry-loss-count');

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // page order, not click order: the list reads top down
  function grouped() {
    var out = [];
    groups.forEach(function (g) {
      var picked = marked.filter(function (c) { return g.contains(c); });
      picked.sort(function (a, b) { return cards.indexOf(a) - cards.indexOf(b); });
      if (picked.length) {
        out.push({
          title: g.querySelector('.ry-lossgroup__title').textContent.trim(),
          items: picked.map(function (c) { return c.__label; })
        });
      }
    });
    return out;
  }

  function render() {
    if (countEl) {
      countEl.innerHTML = marked.length
        ? '<strong>' + marked.length + '</strong> named &middot; <a href="#loss-list">see your list &darr;</a>'
        : '';
    }
    if (!wrap) return;
    var g = grouped();
    wrap.classList.toggle('is-shown', g.length > 0);
    body.innerHTML = g.map(function (grp) {
      return '<div class="ry-yourlist__group">' +
             '<h3 class="ry-yourlist__domain">' + escapeHtml(grp.title) + '</h3><ul>' +
             grp.items.map(function (t) { return '<li>' + escapeHtml(t) + '</li>'; }).join('') +
             '</ul></div>';
    }).join('');
  }

  function asText() {
    var lines = ['What I have lost (Recover-You)', ''];
    grouped().forEach(function (g) {
      lines.push(g.title.toUpperCase());
      g.items.forEach(function (t) { lines.push('  - ' + t); });
      lines.push('');
    });
    lines.push('From recover-you.ca/grief-unlived-life');
    lines.push('Not a diagnosis. A starting point for a conversation.');
    return lines.join('\n');
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      var text = asText();
      var done = function () {
        var was = copyBtn.textContent;
        copyBtn.textContent = 'Copied ✓';
        setTimeout(function () { copyBtn.textContent = was; }, 2000);
      };
      function fallback() {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.cssText = 'position:absolute;left:-9999px';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); done(); } catch (e) { /* nothing more to try */ }
        document.body.removeChild(ta);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, fallback);
      } else {
        fallback();
      }
    });
  }

  if (printBtn) printBtn.addEventListener('click', function () { window.print(); });

  if (clearBtn) {
    clearBtn.addEventListener('click', function () {
      marked.slice().forEach(function (card) {
        card.classList.remove('is-marked');
        var b = card.querySelector('.ry-mark');
        if (b) b.setAttribute('aria-pressed', 'false');
      });
      marked = [];
      render();
    });
  }

  render();
})();
