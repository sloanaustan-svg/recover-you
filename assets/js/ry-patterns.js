/* ====================================================================
   Recover-You — C-PTSD pattern finder
   --------------------------------------------------------------------
   Two jobs on a page of 57 patterns and 228 examples:

     1. FIND      live search across every label and example, so a
                  reader chasing one word ("sleep", "anger", "money")
                  isn't made to scan seven domains for it.
     2. KEEP      mark what resonates, and get the marks back at the
                  bottom as a plain list you can copy or print.

   The second one is the point. The page's own closing line asks the
   reader to "pick one pattern that hit closest to home and sit with
   it" — and then, until now, gave them no way to remember which one
   it was by the time they got to the bottom.

   Deliberate choices, consistent with the other tools on this site:

   * Nothing is stored or transmitted. No localStorage, no analytics
     event carrying a selection, no query string. What someone marks
     here is a list of things they recognise about themselves; it stays
     in the page and is gone on reload. The copy button is the export.
   * No score, no threshold, no interpretation. Marking twenty patterns
     does not mean more than marking one. The output is the reader's
     own words back, grouped, and nothing else.
   * Progressive enhancement. Without JavaScript this is a complete,
     readable page: every pattern and example is in the HTML, and the
     search box and mark buttons are injected here rather than sitting
     inert in the markup.
   ==================================================================== */
(function () {
  'use strict';

  if (!document.documentElement.classList.contains('ry-js')) return;

  var root = document.getElementById('ry-patterns');
  if (!root) return;

  var cards = Array.prototype.slice.call(root.querySelectorAll('.ry-pattern'));
  var domains = Array.prototype.slice.call(root.querySelectorAll('.ry-domain'));
  if (!cards.length) return;

  /* ---- searchable text, captured once before any highlighting ------ */
  cards.forEach(function (card) {
    card.__label = card.querySelector('.ry-pattern__label').textContent;
    card.__hay = card.textContent.toLowerCase();
    card.__nodes = textNodesIn(card);
    card.__orig = card.__nodes.map(function (n) { return n.nodeValue; });
  });

  function textNodesIn(el) {
    var out = [], walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false), n;
    while ((n = walk.nextNode())) if (n.nodeValue.trim()) out.push(n);
    return out;
  }

  /* ================================================================
     TOOLBAR
     ================================================================ */
  var bar = document.createElement('div');
  bar.className = 'ry-tools';
  bar.innerHTML =
    '<div class="container"><div class="ry-tools__inner">' +
      '<div class="ry-tools__search">' +
        '<span class="ry-tools__icon" aria-hidden="true"></span>' +
        '<input type="search" id="ry-pattern-search" autocomplete="off" ' +
               'placeholder="Search ' + cards.length + ' patterns — try “sleep”, “anger”, “money”" ' +
               'aria-label="Search patterns and examples">' +
        '<button class="ry-tools__clear" type="button" aria-label="Clear search">&times;</button>' +
      '</div>' +
      '<p class="ry-tools__count" id="ry-pattern-count" aria-live="polite"></p>' +
      '<a class="ry-tools__jump" id="ry-pattern-jump" href="#your-list">See your list &darr;</a>' +
    '</div></div>';
  root.insertBefore(bar, root.firstChild);

  var input = bar.querySelector('#ry-pattern-search');
  var clearBtn = bar.querySelector('.ry-tools__clear');
  var countEl = bar.querySelector('#ry-pattern-count');
  var jumpEl = bar.querySelector('#ry-pattern-jump');

  var empty = document.createElement('p');
  empty.className = 'ry-tools__empty';
  empty.id = 'ry-pattern-empty';
  root.appendChild(empty);

  /* ================================================================
     MARKING
     ================================================================ */
  var marked = [];   // cards, in the order the reader marked them

  cards.forEach(function (card) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'ry-mark';
    btn.setAttribute('aria-pressed', 'false');
    btn.setAttribute('aria-label', 'Mark “' + card.__label + '” as something you recognise');
    card.appendChild(btn);

    btn.addEventListener('click', function () {
      var on = card.classList.toggle('is-marked');
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      if (on) marked.push(card);
      else marked.splice(marked.indexOf(card), 1);
      renderList();
      updateCount();
    });
  });

  /* ================================================================
     SEARCH
     ================================================================ */
  function clearHighlights(card) {
    card.__nodes.forEach(function (n, i) { n.nodeValue = card.__orig[i]; });
  }

  function highlight(card, term) {
    var re = new RegExp('(' + term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
    card.__nodes.forEach(function (node, i) {
      var text = card.__orig[i];
      if (!re.test(text)) return;
      re.lastIndex = 0;
      var frag = document.createDocumentFragment(), last = 0, m;
      while ((m = re.exec(text))) {
        if (m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)));
        var mark = document.createElement('mark');
        mark.className = 'ry-hit';
        mark.textContent = m[0];
        frag.appendChild(mark);
        last = m.index + m[0].length;
      }
      if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
      node.parentNode.replaceChild(frag, node);
    });
    // the nodes were replaced, so re-capture for the next pass
    card.__nodes = textNodesIn(card);
    card.__orig = card.__nodes.map(function (n) { return n.nodeValue; });
  }

  function resetCard(card) {
    Array.prototype.forEach.call(card.querySelectorAll('mark.ry-hit'), function (m) {
      m.parentNode.replaceChild(document.createTextNode(m.textContent), m);
    });
    card.normalize();
    card.__nodes = textNodesIn(card);
    card.__orig = card.__nodes.map(function (n) { return n.nodeValue; });
  }

  var term = '';

  function applySearch() {
    term = input.value.trim().toLowerCase();
    clearBtn.classList.toggle('is-shown', !!term);

    var shown = 0;
    cards.forEach(function (card) {
      resetCard(card);
      var hit = !term || card.__hay.indexOf(term) !== -1;
      card.classList.toggle('is-hidden', !hit);
      if (hit) {
        shown++;
        if (term) highlight(card, term);
      }
    });

    var liveDomains = 0;
    domains.forEach(function (d) {
      var any = d.querySelector('.ry-pattern:not(.is-hidden)');
      d.classList.toggle('is-empty', !any);
      if (any) liveDomains++;
    });

    empty.classList.toggle('is-shown', shown === 0);
    if (shown === 0) {
      empty.innerHTML = 'Nothing here matches <strong>&ldquo;' + escapeHtml(input.value.trim()) +
                        '&rdquo;</strong>. That doesn&rsquo;t mean it isn&rsquo;t real &mdash; ' +
                        'this list is long but it was never going to be complete.';
    }
    updateCount(shown, liveDomains);
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function updateCount(shown, liveDomains) {
    if (shown === undefined) {
      shown = cards.filter(function (c) { return !c.classList.contains('is-hidden'); }).length;
      liveDomains = domains.filter(function (d) { return !d.classList.contains('is-empty'); }).length;
    }
    var bits = [];
    if (term) {
      bits.push('<strong>' + shown + '</strong> of ' + cards.length + ' patterns in ' +
                liveDomains + ' domain' + (liveDomains === 1 ? '' : 's'));
    } else {
      bits.push('<strong>' + cards.length + '</strong> patterns across ' + domains.length + ' domains');
    }
    if (marked.length) {
      bits.push('<b>' + marked.length + '</b> marked');
    }
    countEl.innerHTML = bits.join(' &middot; ');
    jumpEl.classList.toggle('is-shown', marked.length > 0);
  }

  var timer = null;
  input.addEventListener('input', function () {
    clearTimeout(timer);
    timer = setTimeout(applySearch, 110);
  });
  input.addEventListener('search', applySearch);
  clearBtn.addEventListener('click', function () {
    input.value = '';
    applySearch();
    input.focus();
  });

  /* ================================================================
     YOUR LIST
     ================================================================ */
  var listWrap = document.getElementById('your-list');
  var listBody = document.getElementById('ry-yourlist-body');
  var copyBtn = document.getElementById('ry-yourlist-copy');
  var printBtn = document.getElementById('ry-yourlist-print');
  var clearAll = document.getElementById('ry-yourlist-clear');

  function grouped() {
    // domain order on the page, not the order things were clicked:
    // the list is meant to be handed to someone else and read top down
    var out = [];
    domains.forEach(function (d) {
      var picked = marked.filter(function (c) { return d.contains(c); });
      if (picked.length) {
        out.push({
          title: d.querySelector('.ry-domain__title').textContent.trim(),
          num: d.querySelector('.ry-domain__num').textContent.trim(),
          items: picked.map(function (c) { return c.__label; })
        });
      }
    });
    return out;
  }

  function renderList() {
    if (!listWrap) return;
    var groups = grouped();
    listWrap.classList.toggle('is-shown', groups.length > 0);
    if (!groups.length) { listBody.innerHTML = ''; return; }

    listBody.innerHTML = groups.map(function (g) {
      return '<div class="ry-yourlist__group">' +
             '<h3 class="ry-yourlist__domain">' + g.num + ' &middot; ' + g.title + '</h3><ul>' +
             g.items.map(function (t) { return '<li>' + escapeHtml(t) + '</li>'; }).join('') +
             '</ul></div>';
    }).join('');
  }

  function asText() {
    var lines = ['Patterns I recognised — Recover-You', ''];
    grouped().forEach(function (g) {
      lines.push(g.num + '. ' + g.title.toUpperCase());
      g.items.forEach(function (t) { lines.push('  - ' + t); });
      lines.push('');
    });
    lines.push('From recover-you.ca/cptsd-behaviours');
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
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, fallback);
      } else {
        fallback();
      }
      function fallback() {
        // older browsers, and any context where the async clipboard is
        // unavailable — a textarea and execCommand still works
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.cssText = 'position:absolute;left:-9999px';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); done(); } catch (e) { /* nothing more to try */ }
        document.body.removeChild(ta);
      }
    });
  }

  if (printBtn) printBtn.addEventListener('click', function () { window.print(); });

  if (clearAll) {
    clearAll.addEventListener('click', function () {
      marked.slice().forEach(function (card) {
        card.classList.remove('is-marked');
        var b = card.querySelector('.ry-mark');
        if (b) b.setAttribute('aria-pressed', 'false');
      });
      marked = [];
      renderList();
      updateCount();
    });
  }

  updateCount();
})();
