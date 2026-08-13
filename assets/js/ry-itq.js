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
   * No score, no threshold, no pass/fail. The output is a landscape.
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
      desc: 'The past breaking into the present: dreams and memories that feel current rather than past.',
      items: ['Having upsetting dreams that replay part of the experience, or that are clearly related to it.',
              'Powerful images or memories that come into your mind in which it feels like the experience is happening again, here and now.'] },
    { key: 'avoid', label: 'Avoidance', group: 'ptsd',
      axis: ['Avoidance'],
      desc: 'Steering away from the reminders, inside and out, that bring the experience back.',
      items: ['Avoiding internal reminders of the experience (for example, thoughts, feelings, or physical sensations).',
              'Avoiding external reminders of the experience (for example, people, places, conversations, objects, activities, or situations).'] },
    { key: 'threat', label: 'Sense of Current Threat', group: 'ptsd',
      axis: ['Sense of', 'Current Threat'],
      desc: 'A nervous system braced for danger: watchful, on guard, easily startled.',
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
      'When a flashback or intrusive memory hits, ground before you analyze: feet on the floor, name five things you can see, and say out loud where you are and what year it is. The full skill set is in <a href="regulation-tools">Regulation Tools</a>. <span class="ry-alsoeases">also eases: current threat</span>',
      'Build a "that was then" anchor: one phrase or one object that reminds your body the danger already happened and already ended. Reach for it the moment the past shows up.',
      'This is the domain where trauma-focused therapy (EMDR and other processing work) earns its reputation. <a href="types-of-therapy">Therapy Types</a> breaks down what actually fits. <span class="ry-alsoeases">also eases: avoidance</span>'
    ],
    avoid: [
      'Name the thing you’re avoiding, out loud or on paper. Avoidance runs on vagueness, and it starts shrinking the moment it has a name. <a href="chart-your-life">Chart Your Life</a> was built for that kind of honest inventory.',
      'Try opposite action in miniature: shrink the avoided thing to a step so small you’d actually do it this week. One street, one song, one sentence of the conversation. The skill lives in <a href="dbt">DBT</a>. <span class="ry-alsoeases">also eases: re-experiencing</span>',
      'Notice the trade: avoidance buys short-term relief and quietly bills you your life back. When you’re ready to face things with support, <a href="types-of-therapy">Therapy Types</a> shows the paced ways to do it.'
    ],
    threat: [
      'Go body first. A vigilant nervous system doesn’t answer to logic, it answers to signals: long slow exhales, cold water on the face, a walk where your eyes get to scan the horizon. Start with <a href="regulation-tools">Regulation Tools</a>. <span class="ry-alsoeases">also eases: affect</span>',
      'Orient on purpose: a few times a day, stop and slowly look around until your body registers that nothing in the room is a threat. It feels silly. It works.',
      'Reality-test the alarm instead of obeying it: "Am I in danger right now, or does it just feel that way?" That exact skill is <a href="reality-test">Reality Testing</a>. <span class="ry-alsoeases">also eases: re-experiencing</span>'
    ],
    affect: [
      'Learn two or three distress-tolerance skills now, while you’re calm, so they exist when you’re not. TIPP and paced breathing in <a href="dbt">DBT</a> are the workhorses. <span class="ry-alsoeases">also eases: current threat</span>',
      'Name the feeling precisely. "I’m angry that I wasn’t protected" moves through you differently than a wall of bad. Naming it turns the volume down.',
      'If you swing to numb, don’t force feeling. Build safety first with <a href="regulation-tools">Regulation Tools</a>. Feelings come back when your body trusts it can survive them.'
    ],
    self: [
      'Start treating the inner critic as evidence, not truth. That voice has a history and a handwriting, and it’s usually someone else’s. I take it apart in <a href="shame-grief-false-self">Shame, Grief &amp; The False Self</a>. <span class="ry-alsoeases">also eases: relationships</span>',
      '"I’m worthless" is a thought, not a fact, and thoughts can be audited. <a href="distorted-thinking">Distorted Thinking</a> gives you the checklist.',
      'Find the blueprint underneath the belief. If the same self-story keeps repeating, <a href="life-traps">Life Traps</a> will probably show you where it was drawn. <span class="ry-alsoeases">also eases: affect</span>'
    ],
    relate: [
      'Dose connection instead of demanding it of yourself: one safe, low-stakes interaction, then retreat and recover. That still counts. Why it matters is in <a href="connection">Connection</a>. <span class="ry-alsoeases">also eases: self-concept</span>',
      'Learn your attachment pattern. Most relationship "flaws" are old survival strategies still running. Start with <a href="attachment">Attachment Styles</a>.',
      'Practice saying one true thing to one safe person. Closeness after complex trauma is rebuilt in centimetres, and <a href="relationships">Relationships in Recovery</a> maps the terrain.'
    ]
  };

  function band(pct) {
    if (pct >= 75) return 'High resonance';
    if (pct >= 50) return 'Notable resonance';
    if (pct >= 25) return 'Some resonance';
    return 'Minimal resonance';
  }

  var SVGNS = 'http://www.w3.org/2000/svg';
  function svg(name, attrs) {
    var el = document.createElementNS(SVGNS, name);
    for (var k in attrs) if (attrs.hasOwnProperty(k)) el.setAttribute(k, attrs[k]);
    return el;
  }

  /* ---- the radar ----------------------------------------------------
     Six axes at 60° apart, first axis pointing straight up. Rings at
     25/50/75/100 give the reader something to read the shape against;
     without them a polygon is just a shape.
     ------------------------------------------------------------------ */
  function drawRadar(host, perDomain) {
    var SIZE = 460, C = SIZE / 2, R = 150, N = perDomain.length;

    var s = svg('svg', {
      viewBox: '0 0 ' + SIZE + ' ' + SIZE,
      role: 'img',
      'aria-label': 'Radar chart showing intensity across the six domains of Complex PTSD'
    });

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
      t.textContent = lvl;
      s.appendChild(t);
    });

    for (var i = 0; i < N; i++) {
      var p = pt(i, R);
      s.appendChild(svg('line', { x1: C, y1: C, x2: p[0], y2: p[1], 'class': 'ry-radar__axis' }));
    }

    // axis labels, pushed outside the outer ring and anchored by side so
    // long two-word labels never cross the shape
    perDomain.forEach(function (d, i) {
      var p = pt(i, R + 26), x = p[0], y = p[1];
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
      title.textContent = d.label + ': ' + d.pct + '% · ' + band(d.pct);
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
          '<div class="ry-itq__q" data-q="' + id + '"><p class="ry-itq__q-text">' + text + '</p>' +
          '<div class="ry-itq__scale" role="radiogroup" aria-label="' + SCALE[0] + ' to ' + SCALE[4] + '">' +
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
    });

    resetBtn.addEventListener('click', function () {
      form.reset();
      answers = {};
      Array.prototype.forEach.call(form.querySelectorAll('.ry-itq__q.is-answered'),
        function (c) { c.classList.remove('is-answered'); });
      setProgress();
      mapEl.classList.remove('is-shown');
      emptyEl.style.display = '';
    });

    submitBtn.addEventListener('click', function () {
      var perDomain = DOMAINS.map(function (d) {
        var raw = 0, endorsed = false;
        Object.keys(answers).forEach(function (id) {
          if (id.indexOf(d.key + '_') !== 0) return;
          var v = answers[id] || 0;
          raw += v;
          if (v >= 2) endorsed = true;          // ITQ endorsement threshold
        });
        return { key: d.key, label: d.label, axis: d.axis, desc: d.desc, group: d.group,
                 raw: raw, pct: Math.round((raw / 8) * 100), endorsed: endorsed };
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
      var lit = perDomain.filter(function (d) { return d.endorsed; });
      var quiet = perDomain.filter(function (d) { return !d.endorsed; });
      var litNames = lit.map(function (d) { return d.label; });
      var quietNames = quiet.map(function (d) { return d.label; });

      var html = '';
      if (lit.length === 0) {
        html = '<p>Across these six domains, nothing is showing up strongly for you right now, and that is worth noting. Whatever brought you to this page, this reflection is one small data point, not the whole story of your inner life. If something still feels off, trust that, and consider talking it through with someone you trust or a professional.</p>';
      } else {
        html = '<p>Reading this as a landscape rather than a label: <strong>' + lit.length + ' of the six domains</strong> are showing up meaningfully for you' +
               (litNames.length ? ': ' + litNames.join(', ') : '') + '. ' +
               (quietNames.length ? 'The quieter areas right now are ' + quietNames.join(', ') + '.' : 'All six are lit up to some degree.') + '</p>';
        if (lit.length >= 4 && quiet.length >= 1) {
          html += '<p>Notice the pull to focus on what <em>doesn’t</em> reach the top of the scale and conclude "so it doesn’t apply to me." Many people land exactly here, recognizing themselves in most domains but one, and quietly close the door. Try resisting that. ' + lit.length + ' meaningful areas is ' + lit.length + ' real places where healing work is available to you, starting now.</p>';
        }
      }
      html += '<p>Remember: this is not a score and not a diagnosis. It’s a mirror. Wherever your map sits today, the approaches that help (regulation, safe relationships, trauma-focused support) are available to you regardless of whether any threshold is met. The section below on <a href="#beyond">why diagnosis isn’t the finish line</a> picks this up, and <a href="#healing">where healing begins</a> shows you where to take a first step.</p>';
      document.getElementById('ry-map-summary').innerHTML = html;

      // ---- where to start ----
      var sorted = perDomain.slice().sort(function (a, b) { return b.pct - a.pct; });
      function planCard(d) {
        return '<div class="ry-plan__card"><p class="ry-plan__card-head">' +
               '<span class="ry-readout__name">' + d.label + '</span>' +
               '<span class="ry-readout__band">' + band(d.pct) + '</span></p><ul>' +
               PLAN[d.key].map(function (t) { return '<li>' + t + '</li>'; }).join('') +
               '</ul></div>';
      }
      var planEl = document.getElementById('ry-plan');
      if (sorted[0].pct < 25) {
        planEl.innerHTML = '<p class="ry-plan__head">The toolkit, by domain</p>' +
          '<p class="ry-plan__sub">Nothing on your map is especially loud right now, so instead of a targeted starting point, here’s the whole toolkit. None of it requires a diagnosis, a referral, or anyone’s permission. Take what’s useful.</p>' +
          sorted.map(planCard).join('');
      } else {
        var featured = sorted.filter(function (d) { return d.pct >= 50; });
        if (featured.length < 2) featured = sorted.slice(0, 2);
        if (featured.length > 3) featured = featured.slice(0, 3);
        var rest = sorted.filter(function (d) { return featured.indexOf(d) === -1; });
        planEl.innerHTML = '<p class="ry-plan__head">Where to start, based on your map</p>' +
          '<p class="ry-plan__sub">These aren’t prescriptions. They’re the practices people with complex trauma most consistently find helpful, matched to the domains that are loudest for you right now. None of them require a diagnosis, a referral, or anyone’s permission. Pick one. Small and done beats perfect and postponed.</p>' +
          featured.map(planCard).join('') +
          (rest.length ? '<details class="ry-plan__rest"><summary>+ Show ideas for your quieter domains (' +
            rest.map(function (d) { return d.label; }).join(' · ') + ')</summary>' +
            rest.map(planCard).join('') + '</details>' : '');
      }

      // animate the bars after paint, so the transition has a start state
      requestAnimationFrame(function () {
        setTimeout(function () {
          Array.prototype.forEach.call(readout.querySelectorAll('.ry-readout__bar > i'),
            function (el) { el.style.width = (el.getAttribute('data-w') || 0) + '%'; });
        }, 60);
      });

      mapEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    setProgress();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
