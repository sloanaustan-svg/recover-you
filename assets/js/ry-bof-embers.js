/* Transparent, hero-only embers. Glow sprites are painted once, then reused.
   Pause offscreen, in hidden tabs, and whenever reduced motion is requested. */
(function () {
  'use strict';

  var hero = document.querySelector('.ry-bof-hero');
  if (!hero) return;
  var canvas = hero.querySelector('.ry-bof-embers');
  var toggle = hero.querySelector('.ry-bof-embers-toggle');
  var copy = hero.querySelector('.ry-page-hero__inner .row');
  var ctx = canvas && canvas.getContext && canvas.getContext('2d');
  if (!ctx || !toggle) return;

  var motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var width = 0, height = 0, particles = [], textBounds = null;
  var visible = false, paused = false, raf = null, last = 0, time = 0;

  function random(min, max) { return min + Math.random() * (max - min); }

  // A soft orange halo and a hot gold core; no per-frame shadow blur.
  var sprite = document.createElement('canvas');
  sprite.width = sprite.height = 64;
  var paint = sprite.getContext('2d');
  if (!paint) return;
  var glow = paint.createRadialGradient(32, 32, 0, 32, 32, 32);
  glow.addColorStop(0, 'rgba(255, 244, 190, 1)');
  glow.addColorStop(.12, 'rgba(255, 192, 64, 1)');
  glow.addColorStop(.3, 'rgba(255, 100, 12, .65)');
  glow.addColorStop(.62, 'rgba(230, 47, 2, .15)');
  glow.addColorStop(1, 'rgba(180, 30, 0, 0)');
  paint.fillStyle = glow;
  paint.fillRect(0, 0, 64, 64);

  function makeParticle(seed) {
    var streak = Math.random() < .17;
    var life = random(5, 11);
    return {
      x: random(width * .04, width * 1.02),
      y: random(height * .85, height * 1.12),
      age: seed ? random(0, life) : 0,
      life: life,
      rise: random(24, 55),
      drift: random(-12, 16),
      sway: random(3, 12),
      frequency: random(.7, 1.7),
      phase: random(0, Math.PI * 2),
      size: streak ? random(1.4, 2.4) : random(.65, 1.65),
      stretch: streak ? random(2.5, 4.8) : random(.9, 1.4),
      tilt: random(-.55, .55),
      alpha: streak ? random(.65, .95) : random(.35, .8)
    };
  }

  function resize() {
    width = hero.clientWidth;
    height = hero.clientHeight;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var origin = hero.getBoundingClientRect();
    var text = copy && copy.getBoundingClientRect();
    textBounds = text ? {
      left: text.left - origin.left - 20,
      right: text.right - origin.left + 20,
      top: text.top - origin.top - 20,
      bottom: text.bottom - origin.top + 20
    } : null;
    particles = [];
    if (motion.matches || !width || !height) return;
    var count = Math.max(32, Math.min(width < 768 ? 48 : 110, Math.round(width * height / 6500)));
    for (var i = 0; i < count; i++) particles.push(makeParticle(true));
  }

  function frame(now) {
    raf = null;
    var dt = last ? Math.min((now - last) / 1000, .05) : 0;
    last = now;
    time += dt;
    ctx.clearRect(0, 0, width, height);
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      p.age += dt;
      if (p.age >= p.life) { particles[i] = makeParticle(false); continue; }
      var x = p.x + p.drift * p.age + Math.sin(time * p.frequency + p.phase) * p.sway;
      var y = p.y - p.rise * p.age;
      var fade = Math.min(1, p.age / .7, (p.life - p.age) / 1.8);
      fade *= Math.max(0, Math.min(1, y / (height * .2), (height - y) / (height * .13)));
      // Dim the sparks behind the copy, including its wrapping on phones.
      if (textBounds && x > textBounds.left && x < textBounds.right &&
          y > textBounds.top && y < textBounds.bottom) fade *= .24;
      ctx.globalAlpha = p.alpha * fade * (.87 + Math.sin(time * 3 + p.phase) * .13);
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(p.tilt + Math.sin(time + p.phase) * .15);
      var size = p.size * 5;
      ctx.drawImage(sprite, -size / 2, -size * p.stretch / 2, size, size * p.stretch);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
    raf = window.requestAnimationFrame(frame);
  }

  function sync() {
    var reduced = motion.matches;
    toggle.hidden = reduced;
    toggle.textContent = paused ? 'Resume embers' : 'Pause embers';
    toggle.setAttribute('aria-pressed', String(paused));
    if (reduced || paused || !visible || document.hidden) {
      if (raf !== null) window.cancelAnimationFrame(raf);
      raf = null;
      last = 0;
      if (reduced) ctx.clearRect(0, 0, width, height);
    } else if (raf === null) {
      raf = window.requestAnimationFrame(frame);
    }
  }

  toggle.addEventListener('click', function () { paused = !paused; sync(); });
  document.addEventListener('visibilitychange', sync);
  function motionChanged() { resize(); sync(); }
  if (motion.addEventListener) motion.addEventListener('change', motionChanged);
  else motion.addListener(motionChanged);

  resize();
  sync();
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(hero);
  else window.addEventListener('resize', resize);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(resize);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      sync();
    }).observe(hero);
  } else { visible = true; sync(); }
})();
