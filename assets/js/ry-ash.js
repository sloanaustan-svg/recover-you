/* ====================================================================
   Recover-You — ash field
   --------------------------------------------------------------------
   Greyscale debris drifting upward behind a section. Markup contract:

       <div class="ry-ashfield">
         <canvas class="ry-ash-canvas" aria-hidden="true"></canvas>
         <section> ... </section>
         <section> ... </section>   <- optional, any number
       </div>

   Every .ry-ashfield on the page is picked up automatically, so a page
   can have more than one. Canvas rather than DOM nodes: ~120 animated
   elements as divs would thrash layout every frame; one canvas is a
   single composited layer.

   Guards: each field pauses entirely when scrolled out of view, all
   fields pause when the tab is hidden, nothing runs at all under
   prefers-reduced-motion, DPR is capped at 2, and particle count
   scales to the area so phones do less work.

   Tuning: DENSITY (lower = more particles), CAP_*, ALPHA_*, RISE_*.
   ==================================================================== */
(function () {
  'use strict';

  var DENSITY    = 13000;   // one particle per N css pixels of area
  var CAP_MOBILE = 58;
  var CAP_DESK   = 122;
  var FLOOR      = 36;
  var ALPHA_MIN  = 0.05, ALPHA_MAX = 0.30;
  var RISE_MIN   = -0.26, RISE_MAX = -0.075;   // px per frame at 60fps
  var FLAKE_RATIO = 0.34;                      // share drawn as angular debris
  var MAX_CANVAS_PX = 10e6;                    // backing-store ceiling, see resize()

  if (typeof window === 'undefined' || !window.document) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  function rand(a, b) { return a + Math.random() * (b - a); }

  function AshField(wrap) {
    var canvas = wrap.querySelector('.ry-ash-canvas');
    if (!canvas || !canvas.getContext) return null;

    var ctx = canvas.getContext('2d');
    var W = 0, H = 0;
    var bits = [];
    var running = false, visible = false, rafId = null, last = 0;

    function makeBit(seeded) {
      return {
        x: rand(0, W),
        // seeded particles scatter through the whole field on first paint
        // so the top isn't empty when the user arrives mid-section
        y: seeded ? rand(0, H) : H + rand(10, 120),
        r: rand(0.5, 2.1),
        vy: rand(RISE_MIN, RISE_MAX),
        sway: rand(0.15, 0.55),
        freq: rand(0.0004, 0.0013),
        phase: rand(0, Math.PI * 2),
        spin: rand(-0.01, 0.01),
        rot: rand(0, Math.PI * 2),
        alpha: rand(ALPHA_MIN, ALPHA_MAX),
        flake: Math.random() < FLAKE_RATIO
      };
    }

    function resize() {
      W = wrap.offsetWidth;
      H = wrap.offsetHeight;
      if (!W || !H) return;

      // Cap the backing store. A field spanning several tall sections can
      // easily exceed a browser's maximum canvas area at DPR 2 — iOS
      // Safari tops out around 16.7M pixels and simply renders nothing
      // past it. Trading sharpness for existence is the right call here:
      // the particles are 0.5-2px blurs, so nobody can see the
      // difference, and a blank canvas would be very visible indeed.
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (W * H * dpr * dpr > MAX_CANVAS_PX) {
        dpr = Math.max(1, Math.sqrt(MAX_CANVAS_PX / (W * H)));
      }
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      var target = Math.round((W * H) / DENSITY);
      target = Math.max(FLOOR, Math.min(target, W < 768 ? CAP_MOBILE : CAP_DESK));
      if (bits.length > target) bits.length = target;
      while (bits.length < target) bits.push(makeBit(true));
    }

    function frame(now) {
      if (!running) return;
      var dt = last ? Math.min((now - last) / 16.667, 3) : 1;
      last = now;
      ctx.clearRect(0, 0, W, H);

      for (var i = 0; i < bits.length; i++) {
        var b = bits[i];
        b.y += b.vy * dt;
        b.x += Math.sin(now * b.freq + b.phase) * b.sway * dt * 0.35;
        b.rot += b.spin * dt;

        if (b.y < -20) { bits[i] = makeBit(false); continue; }
        if (b.x < -20) b.x = W + 10;
        if (b.x > W + 20) b.x = -10;

        // fade across the top third so nothing pops out of existence
        var fade = b.y < H * 0.34 ? Math.max(0, b.y / (H * 0.34)) : 1;
        ctx.globalAlpha = b.alpha * fade;
        ctx.fillStyle = '#ffffff';

        if (b.flake) {
          ctx.save();
          ctx.translate(b.x, b.y);
          ctx.rotate(b.rot);
          ctx.fillRect(-b.r, -b.r * 0.45, b.r * 2, b.r * 0.9);
          ctx.restore();
        } else {
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
      rafId = window.requestAnimationFrame(frame);
    }

    function start() {
      if (running || !visible || document.hidden) return;
      running = true; last = 0;
      rafId = window.requestAnimationFrame(frame);
    }
    function stop() {
      running = false;
      if (rafId) window.cancelAnimationFrame(rafId);
      rafId = null;
    }

    resize();

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (visible) { start(); } else { stop(); }
      }, { rootMargin: '120px 0px' }).observe(wrap);
    } else {
      visible = true;
      start();
    }

    var rt;
    function onResize() { clearTimeout(rt); rt = setTimeout(resize, 160); }
    window.addEventListener('resize', onResize);
    if ('ResizeObserver' in window) new ResizeObserver(onResize).observe(wrap);

    return { start: start, stop: stop };
  }

  function init() {
    var fields = [];
    var nodes = document.querySelectorAll('.ry-ashfield');
    for (var i = 0; i < nodes.length; i++) {
      var f = AshField(nodes[i]);
      if (f) fields.push(f);
    }
    if (!fields.length) return;

    document.addEventListener('visibilitychange', function () {
      for (var i = 0; i < fields.length; i++) {
        if (document.hidden) { fields[i].stop(); } else { fields[i].start(); }
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
