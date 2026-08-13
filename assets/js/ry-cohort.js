/* ====================================================================
   Recover-You — the Dunedin cohort
   --------------------------------------------------------------------
   Draws 1,037 dots, one per child in the birth cohort, coloured by the
   temperament type each was assigned at age three.

   Why draw it at all: the page states the shares as "~40%, ~28%, ~15%,
   ~10%, ~8%" and those numbers slide off. Drawn, ~10% becomes 103
   individual children you can see and count, and the page's own line —
   "most people recognise themselves somewhere in here" — becomes
   literally true, because there is a field of people to look at.

   Notes on honesty, which matter more here than anywhere else on the
   site:

   * The published proportions total 101%, being approximations. Naive
     rounding would draw 1,048 dots for a cohort of 1,037. The counts
     are apportioned by largest remainder in the builder so the field
     shows exactly 1,037 dots and every one is a real child. The note
     under the legend says so.
   * Dots are laid out in reading order by type, not scattered. A
     random scatter would look livelier and would misrepresent the
     data: it invites the eye to find clusters that are not there.
   * No individual dot corresponds to a named participant. This is a
     proportion made countable, not a record of anyone.

   Progressive enhancement: the legend, the counts and the note are all
   in the HTML. This script only adds the field and the isolate
   controls, so with no JS the section still states everything.
   ==================================================================== */
(function () {
  'use strict';

  if (!document.documentElement.classList.contains('ry-js')) return;

  var root = document.getElementById('ry-cohort');
  if (!root) return;

  var host = root.querySelector('.ry-cohort__field');
  var legend = root.querySelectorAll('.ry-cohort__key');
  var caption = root.querySelector('.ry-cohort__live');
  if (!host || !legend.length) return;

  var types = Array.prototype.map.call(legend, function (el) {
    return {
      key: el.getAttribute('data-type'),
      name: el.getAttribute('data-name'),
      count: parseInt(el.getAttribute('data-count'), 10),
      el: el
    };
  });

  var TOTAL = types.reduce(function (a, t) { return a + t.count; }, 0);

  /* ---- geometry -----------------------------------------------------
     A fixed 40-column grid keeps the block the same shape at every
     width; the SVG scales, the arrangement does not reflow. Rows of 40
     also make the field countable by eye, which is the whole point.
     ------------------------------------------------------------------ */
  var COLS = 40, STEP = 10, R = 3.1;
  var rows = Math.ceil(TOTAL / COLS);
  var W = COLS * STEP, H = rows * STEP;

  var SVGNS = 'http://www.w3.org/2000/svg';
  var svg = document.createElementNS(SVGNS, 'svg');
  svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label',
    TOTAL.toLocaleString() + ' children in the Dunedin birth cohort, grouped by the ' +
    'temperament type assigned at age three: ' +
    types.map(function (t) { return t.count + ' ' + t.name.toLowerCase(); }).join(', ') + '.');

  var i = 0;
  types.forEach(function (t) {
    var g = document.createElementNS(SVGNS, 'g');
    g.setAttribute('class', 'ry-cohort__group');
    g.setAttribute('data-type', t.key);
    for (var n = 0; n < t.count; n++, i++) {
      var c = document.createElementNS(SVGNS, 'circle');
      c.setAttribute('cx', (i % COLS) * STEP + STEP / 2);
      c.setAttribute('cy', Math.floor(i / COLS) * STEP + STEP / 2);
      c.setAttribute('r', R);
      g.appendChild(c);
    }
    t.g = g;
    svg.appendChild(g);
  });

  host.innerHTML = '';
  host.appendChild(svg);

  /* ---- isolate ----------------------------------------------------- */
  var active = null;

  function show(key) {
    active = key;
    root.classList.toggle('is-isolating', !!key);
    types.forEach(function (t) {
      var on = !key || t.key === key;
      t.g.classList.toggle('is-dim', !on);
      t.el.setAttribute('aria-pressed', t.key === key ? 'true' : 'false');
      t.el.classList.toggle('is-active', t.key === key);
    });
    if (!caption) return;
    if (!key) {
      caption.textContent = TOTAL.toLocaleString() + ' children, every temperament type shown.';
    } else {
      var t = types.filter(function (x) { return x.key === key; })[0];
      caption.textContent = t.count.toLocaleString() + ' of ' + TOTAL.toLocaleString() +
        ' children were assessed as ' + t.name.toLowerCase() + '.';
    }
  }

  types.forEach(function (t) {
    t.el.setAttribute('role', 'button');
    t.el.setAttribute('tabindex', '0');
    t.el.setAttribute('aria-pressed', 'false');
    function toggle() { show(active === t.key ? null : t.key); }
    t.el.addEventListener('click', toggle);
    t.el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });
  });

  var reset = root.querySelector('.ry-cohort__reset');
  if (reset) reset.addEventListener('click', function () { show(null); });

  show(null);
})();
