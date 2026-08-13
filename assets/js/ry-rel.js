/* ====================================================================
   Recover-You — Relationship Readiness Inventory
   --------------------------------------------------------------------
   Five markers, and one job: let a reader mark the ones they want to
   sit with, then hand those back at the bottom of the set in the
   reader's own reading order.

   WHAT THIS DELIBERATELY DOES NOT DO
   ----------------------------------
   It does not score. It does not total. It does not say "4 of 5" and
   it does not say "you're ready" or "you're not". That restraint is
   not caution for its own sake — it is the argument of the page. The
   whole essay exists to say that readiness is not a number and that a
   rule handed down without context becomes a cage. A widget that
   answered the question with a tally would reproduce the exact error
   the page spends three thousand words dismantling, and it would do it
   with more authority than the prose, because people believe a number.

   Nobody should learn from a stranger's checkbox whether it is safe
   for them to date. So the output here is only ever the reader's own
   questions, restated.

   THE REST OF THE CONTRACT — the same one every tool on this site
   keeps:

   * Nothing is stored or transmitted. No localStorage, no analytics
     event carrying a selection, no query string. Marks live in the
     page and are gone on reload.
   * Progressive enhancement. Every question and prompt is in the HTML.
     The buttons and the recap are injected here, so a reader without
     JavaScript gets a complete, readable inventory rather than dead
     controls.
   * The marks are announced politely, not shouted — aria-live is set
     to "polite" so a screen reader finishes the current sentence
     first.
   ==================================================================== */
(function () {
  'use strict';

  if (!document.documentElement.classList.contains('ry-js')) return;

  var list = document.getElementById('ry-inventory');
  if (!list) return;

  var items = Array.prototype.slice.call(list.querySelectorAll('.ry-inv__item'));
  if (!items.length) return;

  /* ---- the recap panel, in the reader's marking order --------------- */
  var recap = document.createElement('div');
  recap.className = 'ry-inv__recap';
  recap.hidden = true;
  recap.setAttribute('aria-live', 'polite');
  recap.innerHTML =
    '<span class="ry-inv__recap-label">Marked to sit with</span>' +
    '<ol></ol>' +
    '<p class="ry-inv__recap-note">This is your list, not a result. ' +
    'Nothing here is scored, saved, or sent anywhere &mdash; it clears ' +
    'when you reload the page.</p>';
  list.parentNode.insertBefore(recap, list.nextSibling);

  var out = recap.querySelector('ol');
  var marked = [];   // items, in the order the reader marked them

  function redraw() {
    out.innerHTML = '';
    marked.forEach(function (item) {
      var li = document.createElement('li');
      li.textContent = item.__question;
      out.appendChild(li);
    });
    recap.hidden = marked.length === 0;
  }

  items.forEach(function (item) {
    var q = item.querySelector('.ry-inv__q');
    if (!q) return;
    item.__question = q.textContent.replace(/\s+/g, ' ').trim();

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'ry-inv__mark';
    btn.textContent = 'Sit with this';
    btn.setAttribute('aria-pressed', 'false');
    btn.setAttribute('aria-label', 'Mark to sit with: ' + item.__question);

    btn.addEventListener('click', function () {
      var on = item.classList.toggle('is-marked');
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      btn.textContent = on ? 'Marked' : 'Sit with this';
      if (on) marked.push(item);
      else marked.splice(marked.indexOf(item), 1);
      redraw();
    });

    item.insertBefore(btn, item.firstChild);
  });
})();
