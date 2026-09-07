/* ====================================================================
   Recover-You — ITQ self-reflection
   --------------------------------------------------------------------
   Twelve items across the six ICD-11 domains, rated 0–4, rendered as a
   radar map plus a per-domain readout and a tailored starting plan.

   Deliberate choices, carried over from the ACE test on aces-high:

   * Nothing is stored or transmitted. No localStorage, no analytics
     event carrying an answer, no query string. The reflection exists
     only in this page and vanishes on reload. Given what is being
     asked, that matters more than any convenience saved state buys.
   * No diagnostic score, cutoff, or pass/fail. The output is a landscape.
     The page argues at length that falling one domain short of a
     diagnostic cutoff changes a checkbox and nothing else, so the tool
     must not contradict that by producing a number to clear.
   * The radar is drawn natively in SVG rather than pulled from a chart
     library. Six axes and one polygon do not justify 200KB of
     dependency, a CDN request, or a "the chart failed to load"
     fallback branch that has to be written and never tested.
   ==================================================================== */
(function () {
  'use strict';

  /* ---- data ---------------------------------------------------------
     Item wording is faithful to the ITQ (Cloitre et al., 2018), adapted
     for self-reflection. Two items per domain, matching the instrument.
     ------------------------------------------------------------------ */
  var DOMAINS = [
    { key: 'reexp', label: 'Re-experiencing', group: 'ptsd',
      axis: ['Re-experiencing'],
      desc: 'Dreams or memories that make the past feel as though it is happening again.',
      items: ['Having upsetting dreams that replay part of the experience, or that are clearly related to it.',
              'Powerful images or memories that come into your mind in which it feels like the experience is happening again, here and now.'] },
    { key: 'avoid', label: 'Avoidance', group: 'ptsd',
      axis: ['Avoidance'],
      desc: 'Steering away from the reminders, inside and out, that bring the experience back.',
      items: ['Avoiding internal reminders of the experience (for example, thoughts, feelings, or physical sensations).',
              'Avoiding external reminders of the experience (for example, people, places, conversations, objects, activities, or situations).'] },
    { key: 'threat', label: 'Sense of Current Threat', group: 'ptsd',
      axis: ['Sense of', 'Current Threat'],
      desc: 'Feeling on guard or easily startled, even when the danger may have passed.',
      items: ['Being "super-alert", watchful, or on guard.',
              'Feeling jumpy or easily startled.'] },
    { key: 'affect', label: 'Affect Dysregulation', group: 'dso',
      axis: ['Affect', 'Dysregulation'],
      desc: 'How easily emotions surge or shut down, and how long it takes to settle.',
      items: ['When I am upset, it takes me a long time to calm down.',
              'I feel numb or emotionally shut down.'] },
    { key: 'self', label: 'Negative Self-Concept', group: 'dso',
      axis: ['Negative', 'Self-Concept'],
      desc: 'The beliefs trauma can write about your own worth and value.',
      items: ['I feel like a failure.',
              'I feel worthless.'] },
    { key: 'relate', label: 'Disturbances in Relationships', group: 'dso',
      axis: ['Disturbances in', 'Relationships'],
      desc: 'How close, connected, and safe it feels to be near other people.',
      items: ['I feel distant or cut off from people.',
              'I find it hard to stay emotionally close to people.'] }
  ];

  var SCALE = ['Not at all', 'A little', 'Moderately', 'Quite a bit', 'Extremely'];
  var TOTAL = 12;

  var PLAN = {
    reexp: [
      '<strong>Come back to the room.</strong> Try naming where you are, today’s date, and three things you can see. Notice the surface beneath your feet. You don’t have to unpack the memory while you’re inside it.',
      '<strong>Keep one reminder within reach.</strong> A familiar object or a note with your location and someone you can call may help you reconnect with the present. Choose something that actually feels grounding to you.',
      '<strong>Get support with the memories.</strong> If they keep interrupting your life, ask a clinician about trauma-focused treatment. My <a href="types-of-therapy">guide to therapy approaches</a> can help you prepare for that conversation.'
    ],
    avoid: [
      '<strong>Notice what your life is getting smaller around.</strong> Write down one thing you avoid, the relief it gives you, and what you miss because of it. This is information. You don’t need to turn it into another reason to attack yourself.',
      '<strong>Choose a small return to something you value.</strong> If the situation is safe, that might be replying to a trusted friend or spending a few minutes on a hobby. You don’t need to confront traumatic memories or unsafe people to make progress.',
      '<strong>Bring the stuck point to someone who can help.</strong> If reminders feel overwhelming, a trauma-trained clinician can help you work at a manageable pace. <a href="chart-your-life">Chart Your Life</a> can help you notice patterns without forcing the whole story at once.'
    ],
    threat: [
      '<strong>Check what is happening around you.</strong> Is there a current danger, a reminder, or something you’re unsure about? If there is danger, focus on getting safer and reaching support. You don’t owe an unsafe situation a calmer response.',
      '<strong>Give yourself a moment to orient.</strong> When you are safe enough, look around slowly and notice a few ordinary details. Try gentle movement or comfortable, unforced breathing. If either ramps up the alarm, leave it.',
      '<strong>Separate the alarm from the evidence.</strong> Write down what you fear and what you can observe right now. <a href="reality-test">Reality Testing</a> walks through that distinction, and <a href="regulation-tools">Regulation Tools</a> offers ways to practise settling.'
    ],
    affect: [
      '<strong>Notice which direction you go.</strong> Overwhelmed and shut down can sit under the same heading. Name what is happening now, even if all you have is “too much” or “nothing.” The next step may be different for each.',
      '<strong>Try one small adjustment.</strong> If you’re flooded, reduce noise or pause a difficult conversation. If you’re numb, try a familiar texture or a little gentle movement. Notice whether it helps, does nothing, or makes things harder.',
      '<strong>Practise before the next hard moment.</strong> Pick one skill from <a href="dbt">DBT</a> or <a href="regulation-tools">Regulation Tools</a> while things are manageable. If shutting down or losing control keeps disrupting your life, bring that pattern to a clinician.'
    ],
    self: [
      '<strong>Put a little space around the verdict.</strong> Try “I’m having the thought that I’m worthless.” You don’t have to leap from self-hatred to self-love. Start by noticing the thought without treating it as a settled fact.',
      '<strong>Write a fairer sentence.</strong> What happened? What did you need? What would you say to someone you care about in the same position? “I’m struggling and I still deserve help” is a place to start if it fits.',
      '<strong>Look at where the belief came from.</strong> <a href="shame-grief-false-self">Shame, Grief &amp; The False Self</a> explores how survival can shape identity. <a href="distorted-thinking">Distorted Thinking</a> offers a way to examine the conclusions you keep reaching about yourself.'
    ],
    relate: [
      '<strong>Make connection small enough to try.</strong> Send a short message to someone who respects your boundaries, or share a quiet activity. You don’t have to tell your trauma story to spend time with someone.',
      '<strong>Practise one honest boundary.</strong> “I’d like to see you, but I only have half an hour.” Notice how the person responds. Being able to say no matters as much as being able to get close.',
      '<strong>Notice what happens around closeness.</strong> Do you pull away, over-give, or expect rejection? <a href="attachment">Attachment Styles</a> can help you explore the pattern. <a href="relationships">Relationships in Recovery</a> looks at rebuilding trust without abandoning yourself.'
    ]
  };

  function band(pct) {
    if (pct >= 75) return 'Strongly present';
    if (pct >= 50) return 'Moderately present';
    if (pct >= 25) return 'A little present';
    return 'Little or none';
  }

  var SVGNS = 'http://www.w3.org/2000/svg';
  function svg(name, attrs) {
    var el = document.createElementNS(SVGNS, name);
    for (var k in attrs) if (attrs.hasOwnProperty(k)) el.setAttribute(k, attrs[k]);
    return el;
  }

  /* ---- the radar ----------------------------------------------------
     Six axes at 60° apart, first axis pointing straight up. Rings show
     average responses of 1/2/3/4 on the original answer scale;
     without them a polygon is just a shape.
     ------------------------------------------------------------------ */
  function drawRadar(host, perDomain) {
    var SIZE = 460, C = SIZE / 2, R = 144, N = perDomain.length;

    var s = svg('svg', {
      viewBox: '0 0 ' + SIZE + ' ' + SIZE,
      role: 'img',
      'aria-label': 'Your six-domain reflection. ' + perDomain.map(function (d) { return d.label + ', ' + band(d.pct); }).join('. ')
    });
    var defs = svg('defs');
    var gradient = svg('linearGradient', { id: 'ry-radar-fill', x1: '0%', y1: '0%', x2: '100%', y2: '100%' });
    gradient.appendChild(svg('stop', { offset: '0%', 'stop-color': '#ff2020', 'stop-opacity': '.34' }));
    gradient.appendChild(svg('stop', { offset: '100%', 'stop-color': '#9c0000', 'stop-opacity': '.08' }));
    defs.appendChild(gradient);
    s.appendChild(defs);

    function pt(i, r) {
      var a = (Math.PI * 2 * i / N) - Math.PI / 2;
      return [C + Math.cos(a) * r, C + Math.sin(a) * r];
    }
    function poly(r) {
      var d = [];
      for (var i = 0; i < N; i++) { var p = pt(i, r); d.push(p[0].toFixed(1) + ',' + p[1].toFixed(1)); }
      return d.join(' ');
    }

    [25, 50, 75, 100].forEach(function (lvl) {
      s.appendChild(svg('polygon', { points: poly(R * lvl / 100), 'class': 'ry-radar__web' }));
      var t = svg('text', { x: C + 5, y: C - R * lvl / 100 + 3, 'class': 'ry-radar__tick' });
      t.textContent = lvl / 25;
      s.appendChild(t);
    });

    for (var i = 0; i < N; i++) {
      var p = pt(i, R);
      s.appendChild(svg('line', { x1: C, y1: C, x2: p[0], y2: p[1], 'class': 'ry-radar__axis' }));
    }

    // axis labels, pushed outside the outer ring and anchored by side so
    // long two-word labels never cross the shape
    perDomain.forEach(function (d, i) {
      var p = pt(i, R + 15), x = p[0], y = p[1];
      var anchor = 'middle';
      if (x > C + 6) anchor = 'start';
      else if (x < C - 6) anchor = 'end';
      var lines = d.axis;
      var t = svg('text', { x: x, y: y - (lines.length - 1) * 6, 'text-anchor': anchor, 'class': 'ry-radar__label' });
      lines.forEach(function (ln, k) {
        var ts = svg('tspan', { x: x, dy: k === 0 ? 0 : 13 });
        ts.textContent = ln;
        t.appendChild(ts);
      });
      s.appendChild(t);
    });

    var area = svg('polygon', {
      points: perDomain.map(function (d, k) {
        var q = pt(k, R * d.pct / 100);
        return q[0].toFixed(1) + ',' + q[1].toFixed(1);
      }).join(' '),
      'class': 'ry-radar__area is-collapsed'
    });
    s.appendChild(area);

    perDomain.forEach(function (d, k) {
      var q = pt(k, R * d.pct / 100);
      var dot = svg('circle', { cx: q[0].toFixed(1), cy: q[1].toFixed(1), r: 4, 'class': 'ry-radar__dot' });
      var title = svg('title');
      title.textContent = d.label + ' · Average response ' + (d.raw / 2) + ' of 4 · ' + band(d.pct);
      dot.appendChild(title);
      s.appendChild(dot);
    });

    host.innerHTML = '';
    host.appendChild(s);

    // grow from the centre once the browser has the collapsed state
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { area.classList.remove('is-collapsed'); });
    });
  }

  function init() {
    var form = document.getElementById('ry-itq-form');
    if (!form) return;

    var ptsdWrap = document.getElementById('ry-itq-ptsd');
    var dsoWrap = document.getElementById('ry-itq-dso');
    if (!ptsdWrap || !dsoWrap) return;

    var answers = {};
    var qIndex = 0;

    DOMAINS.forEach(function (d) {
      var target = d.group === 'ptsd' ? ptsdWrap : dsoWrap;
      d.items.forEach(function (text) {
        var id = d.key + '_' + (qIndex++);
        var scale = SCALE.map(function (lbl, n) {
          return '<label><input type="radio" name="' + id + '" value="' + n + '">' +
                 '<span><span class="ry-itq__num">' + n + '</span>' + lbl + '</span></label>';
        }).join('');
        target.insertAdjacentHTML('beforeend',
          '<div class="ry-itq__q" data-q="' + id + '"><p class="ry-itq__q-text" id="' + id + '-label"><span class="ry-itq__q-index" aria-hidden="true">' + (qIndex < 10 ? '0' : '') + qIndex + '</span>' + text + '</p>' +
          '<div class="ry-itq__scale" role="radiogroup" aria-labelledby="' + id + '-label">' +
          scale + '</div></div>');
      });
    });

    var submitBtn = document.getElementById('ry-itq-submit');
    var resetBtn = document.getElementById('ry-itq-reset');
    var progressEl = document.getElementById('ry-itq-progress');
    var emptyEl = document.getElementById('ry-map-empty');
    var mapEl = document.getElementById('ry-map');

    function setProgress() {
      var n = Object.keys(answers).length;
      progressEl.innerHTML = '<strong>' + n + '</strong> of ' + TOTAL + ' answered';
      submitBtn.disabled = n < TOTAL;
    }

    form.addEventListener('change', function (e) {
      if (!e.target || e.target.type !== 'radio') return;
      answers[e.target.name] = parseInt(e.target.value, 10);
      var card = e.target.closest('.ry-itq__q');
      if (card) card.classList.add('is-answered');
      setProgress();
      if (mapEl.classList.contains('is-shown')) {
        mapEl.classList.remove('is-shown');
        emptyEl.style.display = '';
        emptyEl.textContent = 'Your answers have changed. Select “Show my map” to update your reflection.';
      }
    });

    resetBtn.addEventListener('click', function () {
      form.reset();
      answers = {};
      Array.prototype.forEach.call(form.querySelectorAll('.ry-itq__q.is-answered'),
        function (c) { c.classList.remove('is-answered'); });
      setProgress();
      mapEl.classList.remove('is-shown');
      emptyEl.style.display = '';
      emptyEl.textContent = 'Your map will appear here once you complete the reflection above.';
      ['ry-radar', 'ry-readout', 'ry-map-summary', 'ry-plan'].forEach(function (id) {
        document.getElementById(id).innerHTML = '';
      });
    });

    submitBtn.addEventListener('click', function () {
      if (Object.keys(answers).length < TOTAL) return;
      var perDomain = DOMAINS.map(function (d) {
        var raw = 0;
        Object.keys(answers).forEach(function (id) {
          if (id.indexOf(d.key + '_') !== 0) return;
          var v = answers[id] || 0;
          raw += v;
        });
        return { key: d.key, label: d.label, axis: d.axis, desc: d.desc, group: d.group,
                 raw: raw, pct: Math.round((raw / 8) * 100) };
      });

      // reveal first, so the radar host has real dimensions to draw into
      emptyEl.style.display = 'none';
      mapEl.classList.add('is-shown');

      drawRadar(document.getElementById('ry-radar'), perDomain);

      // ---- readout bars ----
      var readout = document.getElementById('ry-readout');
      readout.innerHTML = perDomain.map(function (d) {
        return '<div class="ry-readout__row">' +
               '<p class="ry-readout__head"><span class="ry-readout__name">' + d.label + '</span>' +
               '<span class="ry-readout__band">' + band(d.pct) + '</span></p>' +
               '<div class="ry-readout__bar"><i data-w="' + d.pct + '"></i></div>' +
               '<p class="ry-readout__desc">' + d.desc + '</p></div>';
      }).join('');

      // ---- narrative summary (dimensional; no diagnosis language) ----
      var sorted = perDomain.slice().sort(function (a, b) { return b.pct - a.pct; });
      var strongest = sorted.filter(function (d) { return d.raw === sorted[0].raw; });
      var html = '';
      if (sorted[0].pct < 25) {
        html = '<p>Your answers sit toward the lower end of this reflection. That doesn’t erase what happened to you or explain everything you may be dealing with. If something is making daily life hard, it deserves attention even if this map doesn’t capture it.</p>';
      } else if (strongest.length === 6) {
        html = '<p>Your responses are at the same level across all six domains. There isn’t one obvious starting point in the shape alone. Start with what is costing you the most in daily life, or what feels manageable to work on.</p>';
      } else {
        html = '<p>Your strongest responses are in <strong>' + strongest.map(function (d) { return d.label; }).join(', ') + '</strong>. Notice where that meets your actual life. Lost sleep? Plans cancelled? Feeling far away from people you care about? That everyday cost matters more than the shape on the screen.</p>';
      }
      html += '<p><strong>Pick one thing you want a little more room around.</strong> Write down when it happens, what it interrupts, and what helps even slightly. Keep that note for yourself or bring it to someone who can help. You don’t have to wait for a label to take your experience seriously.</p>';
      document.getElementById('ry-map-summary').innerHTML = html;

      // ---- where to start ----
      function planCard(d) {
        return '<div class="ry-plan__card"><p class="ry-plan__card-head">' +
               '<span class="ry-readout__name">' + d.label + '</span>' +
               '<span class="ry-readout__band">' + band(d.pct) + '</span></p><ul>' +
               PLAN[d.key].map(function (t) { return '<li>' + t + '</li>'; }).join('') +
               '</ul></div>';
      }
      var planEl = document.getElementById('ry-plan');
      if (sorted[0].pct < 25) {
        planEl.innerHTML = '<h3 class="ry-plan__head">Take what is useful to you</h3>' +
          '<p class="ry-plan__sub">There’s no need to make a project out of every domain. If something here fits your experience, open the ideas and choose one small step.</p>' +
          '<details class="ry-plan__rest"><summary>Explore ideas for the six domains</summary>' + sorted.map(planCard).join('') + '</details>';
      } else {
        var featured = sorted.filter(function (d) { return d.pct >= 25; }).slice(0, 2);
        var rest = sorted.filter(function (d) { return featured.indexOf(d) === -1; });
        var tied = rest.some(function (d) { return d.raw === featured[featured.length - 1].raw; });
        planEl.innerHTML = '<h3 class="ry-plan__head">A place to begin</h3>' +
          '<p class="ry-plan__sub">' + (tied ? 'Several areas are tied, so the first ideas follow domain order. All the others are below. ' : 'These ideas start with your stronger responses. ') + 'Choose what fits your life. Try one small step and notice what changes. You can leave the rest for another day.</p>' +
          featured.map(planCard).join('') +
          (rest.length ? '<details class="ry-plan__rest"><summary>Explore the other ' + rest.length + ' domains</summary>' +
            rest.map(planCard).join('') + '</details>' : '');
      }

      // animate the bars after paint, so the transition has a start state
      requestAnimationFrame(function () {
        setTimeout(function () {
          Array.prototype.forEach.call(readout.querySelectorAll('.ry-readout__bar > i'),
            function (el) { el.style.width = (el.getAttribute('data-w') || 0) + '%'; });
        }, 60);
      });

      document.getElementById('ry-map-title').focus({ preventScroll: true });
      mapEl.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    });

    setProgress();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
