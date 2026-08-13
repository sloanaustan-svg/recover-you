/* ====================================================================
   Recover-You — ACE self-test
   --------------------------------------------------------------------
   Ten yes/no toggles, a live running score, and a results panel.

   Deliberate choices:
   * Nothing is stored or transmitted. No localStorage, no analytics
     event carrying the score, no query string. Answers exist only in
     the page and vanish on reload. Given what is being asked, that
     matters more than any convenience a saved state would buy.
   * The score updates live as toggles change, so the number is never a
     surprise reveal — the reader watches it move and can stop at any
     point.
   * The result text leads with the standing caveat that this is a
     screening tool, not a diagnosis, before it says anything about
     tiers.
   ==================================================================== */
(function () {
  'use strict';

  var TOTAL = 10;

  function tierFor(score) {
    if (score === 0) {
      return {
        tier: 'Score 0',
        head: 'No ACE categories reported',
        body: 'A score of zero does not mean nothing difficult happened to you. The ' +
              'questionnaire covers ten specific categories and misses a great deal &mdash; ' +
              'bullying, poverty, racism, medical trauma, community violence, loss, and more. ' +
              'If your life has felt heavy, that experience is real whether or not it fits ' +
              'inside these ten questions.'
      };
    }
    if (score <= 3) {
      return {
        tier: 'Score 1&ndash;3',
        head: 'Lower to intermediate risk, depending on symptoms',
        body: 'ACEs Aware places adults with 1&ndash;3 ACEs and no ACE-associated health ' +
              'condition in the lower-risk group, and those with at least one such condition ' +
              'in the intermediate group. Severity, timing, and whether anyone helped you ' +
              'recover all matter more than the number itself.'
      };
    }
    return {
      tier: 'Score 4 or higher',
      head: 'High risk for toxic stress physiology',
      body: 'ACEs Aware classifies adult scores of 4+ as high risk for toxic stress ' +
            'physiology, even without a current ACE-associated health condition. This is a ' +
            'population-level risk gradient, not a prediction about you. The response is not ' +
            'panic &mdash; it is education, protective factors, and support.'
    };
  }

  function init() {
    var form = document.getElementById('ry-ace-form');
    if (!form) return;

    var boxes  = Array.prototype.slice.call(form.querySelectorAll('input[type="checkbox"]'));
    var scoreEl = document.getElementById('ry-ace-score');
    var barEl   = document.getElementById('ry-ace-bar');
    var meterEl = form.querySelector('.ry-ace__meter');
    var resultEl = document.getElementById('ry-ace-result');
    var clearBtn = document.getElementById('ry-ace-clear');

    function score() {
      var n = 0;
      boxes.forEach(function (b) { if (b.checked) n++; });
      return n;
    }

    function paint() {
      var n = score();
      if (scoreEl) scoreEl.textContent = String(n);
      if (barEl) barEl.style.width = (n / TOTAL * 100) + '%';
      if (meterEl) meterEl.setAttribute('aria-valuenow', String(n));
      // each toggle's own Yes/No label
      boxes.forEach(function (b) {
        var state = b.parentNode.querySelector('.ry-ace__state');
        if (state) state.textContent = b.checked ? 'Yes' : 'No';
      });
    }

    function reveal() {
      if (!resultEl) return;
      var n = score();
      var t = tierFor(n);
      resultEl.innerHTML =
        '<p class="ry-ace__result-tier">' + t.tier + '</p>' +
        '<h3>' + t.head + '</h3>' +
        '<p>' + t.body + '</p>' +
        '<p>Read the note below before you take this number anywhere. ' +
        'A score cannot hold your history.</p>';
      resultEl.hidden = false;
      resultEl.setAttribute('tabindex', '-1');
      resultEl.focus({ preventScroll: true });
      resultEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    boxes.forEach(function (b) { b.addEventListener('change', paint); });

    form.addEventListener('submit', function (e) {
      e.preventDefault();      // nothing is ever sent anywhere
      reveal();
    });

    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        boxes.forEach(function (b) { b.checked = false; });
        paint();
        if (resultEl) { resultEl.hidden = true; resultEl.innerHTML = ''; }
      });
    }

    paint();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
