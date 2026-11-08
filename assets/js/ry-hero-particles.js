/* Image-anchored hero effects. Paths trace the current artwork in normalized
   image coordinates, mapped through the cover crop, background position and zoom. */
(function () {
  'use strict';
  var presets = {
    neural: { width: 1170, height: 780, count: 38, mobile: 24 },
    fissure: { width: 1536, height: 1024, count: 68, mobile: 38 },
    dust: { width: 1536, height: 1024, count: 48, mobile: 30 },
    helix: { width: 1536, height: 1024, count: 32, mobile: 22, life: [5, 9] },
    glass: { width: 1672, height: 941, count: 34, mobile: 22, life: [9, 16] },
    clarity: { width: 1536, height: 1024, count: 40, mobile: 24, life: [7, 11] },
    engine: { width: 1536, height: 1024, count: 30, mobile: 18, life: [3, 6] },
    branches: { width: 1536, height: 1024, count: 44, mobile: 28, life: [4, 8] },
    growth: { width: 1536, height: 1024, count: 32, mobile: 20, life: [7, 12], fadeOut: 2.5 },
    balance: { width: 1170, height: 780, count: 100, mobile: 54, life: [4, 8] },
    corridor: { width: 1536, height: 1024, count: 44, mobile: 28, life: [14, 24], fadeOut: 3 },
    morning: { width: 1536, height: 1024, count: 38, mobile: 24, life: [18, 30], fadeOut: 4 },
    bridge: { width: 1536, height: 1024, count: 28, mobile: 18, life: [12, 22], fadeOut: 3 },
    lamplight: { width: 1536, height: 1024, count: 36, mobile: 24, life: [16, 26], fadeOut: 3,
      light: { u: .25, v: .29, rx: .18, ry: .32 } },
    windowlight: { width: 1536, height: 1024, count: 56, mobile: 36, life: [16, 26], fadeOut: 3 },
    connection: { width: 1536, height: 1024, count: 34, mobile: 22, life: [18, 28], fadeOut: 3.5,
      light: { u: .72, v: .32, rx: .23, ry: .34 } },
    calm: { width: 1536, height: 1024, count: 38, mobile: 24, life: [16, 26], fadeOut: 4,
      lights: [{ u: .145, v: .66, rx: .12, ry: .22 }, { u: .862, v: .66, rx: .12, ry: .22 },
        { u: .5, v: .48, rx: .23, ry: .28 }] },
    road: { width: 1536, height: 1024, count: 42, mobile: 26, life: [8, 14], fadeOut: 3 }
  };
  var neuralPaths = [
    [[.477,.352],[.45,.29],[.432,.183],[.421,.12]],
    [[.432,.183],[.471,.141],[.50,.122],[.549,.069]],
    [[.477,.352],[.532,.291],[.579,.249],[.63,.156],[.666,.117]],
    [[.477,.352],[.557,.325],[.631,.308],[.731,.301]],
    [[.731,.301],[.70,.229],[.657,.146]],
    [[.477,.352],[.548,.40],[.588,.442],[.638,.481]],
    [[.638,.481],[.685,.46],[.726,.444]],
    [[.638,.481],[.682,.55],[.722,.578]],
    [[.477,.352],[.484,.467],[.534,.553],[.557,.637]],
    [[.557,.637],[.608,.71],[.682,.745]],
    [[.432,.183],[.374,.224],[.325,.244]],
    [[.325,.244],[.377,.297],[.477,.352]],
    [[.477,.352],[.401,.343],[.346,.324]],
    [[.477,.352],[.521,.228],[.572,.174],[.613,.127]],
    [[.638,.481],[.61,.414],[.612,.34],[.631,.308]],
    [[.731,.301],[.716,.368],[.726,.444]]
  ];
  var fissure = [[.292,.263],[.368,.341],[.425,.438],[.444,.524],
    [.53,.592],[.608,.646],[.689,.678],[.764,.739],[.84,.79]];
  var helixPaths = [
    [[.02,1],[.045,.89],[.09,.80],[.16,.745],[.23,.724],[.30,.74],
      [.40,.80],[.49,.817],[.57,.79],[.63,.71],[.655,.60],[.665,.46],
      [.655,.32],[.66,.20],[.69,.08],[.74,0]],
    [[.27,1],[.30,.88],[.307,.75],[.32,.61],[.35,.49],[.40,.42],
      [.49,.388],[.59,.395],[.69,.422],[.80,.38],[.89,.29],[.94,.17],[.965,0]]
  ];
  var clarityCurve = [[.30,.636],[.335,.652],[.37,.657],[.402,.644],
    [.431,.615],[.45,.575],[.465,.522],[.478,.46],[.49,.412],[.505,.375],[.525,.354],[.55,.343]];
  var clarityPaths = [
    [[.15,.33],[.22,.48]].concat(clarityCurve, [[.61,.32],[.69,.28],[.74,.25]]),
    [[.20,.76],[.26,.68]].concat(clarityCurve, [[.61,.38],[.69,.42],[.74,.45]]),
    [[.24,.43],[.28,.55]].concat(clarityCurve, [[.59,.44],[.64,.51],[.70,.56]]),
    [[.17,.59],[.24,.62]].concat(clarityCurve, [[.62,.30],[.70,.34],[.78,.39]])
  ];
  var shardShapes = [
    [[-.5,-.6],[.4,-.28],[.22,.65],[-.28,.20]],
    [[-.32,-.8],[.38,.15],[-.18,.65]],
    [[-.55,-.2],[.1,-.6],[.5,.4],[-.35,.55]]
  ];
  var enginePaths = [
    [[.51,.365],[.52,.32],[.49,.315],[.475,.28],[.44,.28],[.432,.25],[.458,.18],[.453,.145]],
    [[.51,.365],[.525,.40],[.543,.45],[.56,.50],[.59,.50],[.62,.50]],
    [[.51,.365],[.55,.345],[.56,.34],[.59,.34],[.61,.35],[.61,.39],[.65,.42]],
    [[.51,.365],[.52,.33],[.523,.28],[.532,.23],[.537,.17],[.535,.15],[.565,.125],[.61,.123]],
    [[.51,.365],[.50,.395],[.47,.40],[.46,.425],[.44,.435],[.42,.42],[.40,.415]],
    [[.51,.365],[.50,.395],[.49,.44],[.51,.48],[.53,.52],[.54,.57]],
    [[.51,.365],[.48,.37],[.45,.365],[.42,.37],[.39,.39],[.35,.42]],
    [[.51,.365],[.55,.345],[.585,.33],[.60,.29],[.63,.26],[.65,.23]]
  ];
  // First six branches follow the warm left side, the rest the cool right.
  var therapyPaths = [
    [[.465,.56],[.40,.545],[.35,.51],[.31,.485],[.255,.47],[.20,.47],[.14,.45],[.08,.48],[0,.46]],
    [[.465,.56],[.40,.51],[.36,.46],[.345,.39],[.335,.33],[.31,.30],[.285,.285],[.23,.27],[.18,.23],[.10,.19],[0,.05]],
    [[.465,.56],[.42,.61],[.38,.65],[.345,.70],[.29,.77],[.265,.81],[.25,.86],[.22,.9],[.16,.945]],
    [[.465,.56],[.40,.575],[.34,.58],[.29,.60],[.25,.61],[.21,.58],[.17,.55],[.12,.54],[.07,.56],[0,.59]],
    [[.465,.56],[.43,.62],[.405,.72],[.38,.80],[.365,.89],[.35,1]],
    [[.465,.56],[.455,.44],[.435,.35],[.425,.25],[.415,.15],[.43,.08],[.42,0]],
    [[.465,.56],[.52,.55],[.57,.53],[.62,.52],[.68,.52],[.73,.55],[.78,.54],[.84,.51],[.91,.48],[1,.45]],
    [[.465,.56],[.52,.50],[.555,.44],[.59,.39],[.64,.35],[.68,.33],[.73,.29],[.78,.23],[.82,.18],[.86,.1]],
    [[.465,.56],[.515,.59],[.55,.62],[.58,.68],[.62,.70],[.68,.715],[.71,.76],[.75,.78],[.8,.81],[.86,.83]],
    [[.465,.56],[.50,.65],[.52,.75],[.54,.84],[.59,.91],[.62,1]],
    [[.465,.56],[.49,.46],[.51,.36],[.52,.28],[.54,.20],[.57,.15],[.58,.08],[.60,0]],
    [[.465,.56],[.53,.53],[.59,.49],[.64,.46],[.69,.44],[.75,.44],[.80,.45],[.85,.43],[.91,.415],[1,.38]]
  ];
  var growthSources = [[.53,.23],[.53,.31],[.54,.36],[.565,.425],[.61,.49],[.63,.60],[.64,.72]];
  var effectPaths = { neural: neuralPaths, helix: helixPaths, clarity: clarityPaths,
    engine: enginePaths, branches: therapyPaths };
  var balancePaths = [
    [[.63,.84],[.615,.77],[.60,.70],[.63,.62],[.66,.58],[.72,.55],[.78,.50],[.80,.43],[.81,.34],[.79,.24],[.76,.17],[.71,.12]],
    [[.60,.70],[.65,.63],[.70,.61],[.76,.60],[.82,.58],[.88,.55],[.93,.52]],
    [[.66,.58],[.70,.50],[.72,.43],[.715,.35],[.70,.29],[.68,.22],[.64,.17],[.61,.15]],
    [[.63,.62],[.67,.56],[.72,.55],[.78,.53],[.83,.50],[.86,.44],[.87,.36],[.85,.27],[.81,.18],[.78,.13]],
    [[.63,.77],[.67,.72],[.72,.70],[.78,.68],[.85,.65],[.90,.60]],
    [[.72,.55],[.735,.47],[.73,.39],[.75,.33],[.76,.26],[.74,.21],[.70,.19],[.66,.15]],
    [[.78,.50],[.83,.46],[.87,.43],[.90,.37],[.88,.30],[.85,.24]],
    [[.68,.22],[.72,.20],[.77,.21],[.81,.25],[.83,.31],[.85,.38]]
  ];
  var balanceFire = [[.24,.34],[.245,.46],[.26,.55],[.31,.63],[.40,.70],[.50,.65]];
  var windowSilhouette = [[.256,.17],[.30,.10],[.32,.05],[.37,.06],[.40,.10],[.44,.11],
    [.48,.17],[.51,.29],[.49,.33],[.57,.37],[.62,.45],[.65,.72],[.62,.99],
    [.28,.99],[.28,.76],[.32,.58],[.34,.44],[.32,.40],[.30,.33],[.27,.28]];
  function insidePolygon(u, v, points) {
    var inside = false;
    for (var i = 0, j = points.length - 1; i < points.length; j = i++) {
      var a = points[i], b = points[j];
      if ((a[1] > v) !== (b[1] > v) && u < (b[0] - a[0]) * (v - a[1]) / (b[1] - a[1]) + a[0]) inside = !inside;
    }
    return inside;
  }
  function random(a, b) { return a + Math.random() * (b - a); }
  function clamp(x) { return Math.max(0, Math.min(1, x)); }

  // Distance-based interpolation avoids speed changes at segment boundaries.
  function trace(points) {
    var lengths = [], total = 0;
    for (var i = 1; i < points.length; i++) {
      total += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
      lengths.push(total);
    }
    return { points: points, lengths: lengths, total: total };
  }
  function along(path, t) {
    var distance = clamp(t) * path.total;
    for (var i = 0; i < path.lengths.length; i++) {
      if (distance <= path.lengths[i] || i === path.lengths.length - 1) {
        var start = i ? path.lengths[i - 1] : 0;
        var ratio = (distance - start) / (path.lengths[i] - start || 1);
        var a = path.points[i], b = path.points[i + 1];
        return { x: a.x + (b.x - a.x) * ratio, y: a.y + (b.y - a.y) * ratio };
      }
    }
    return path.points[0];
  }

  function init(hero) {
    var mode = hero.getAttribute('data-hero-particles'), config = presets[mode];
    var canvas = hero.querySelector('.ry-hero-particles');
    var button = hero.querySelector('.ry-hero-particles-toggle');
    var bg = hero.querySelector('.ry-page-hero__bg, .sk__parallax-background-element');
    var ctx = canvas && canvas.getContext && canvas.getContext('2d');
    if (!config || !ctx || !button || !bg) return;
    var motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    var width = 0, height = 0, paths = [], sources = [], particles = [], copyBounds = [];
    var image = { x: 0, y: 0, width: 0, height: 0 };
    var visible = false, paused = false, raf = null, last = null, time = 0;

    // Cache the soft glow once, avoiding per-frame blur or shadow filters.
    var sprite = document.createElement('canvas');
    sprite.width = sprite.height = 64;
    var paint = sprite.getContext('2d');
    if (!paint) return;
    var glow = paint.createRadialGradient(32, 32, 0, 32, 32, 32);
    if (mode === 'dust' || mode === 'corridor' || mode === 'morning' ||
        mode === 'bridge' || mode === 'lamplight' || mode === 'windowlight' ||
        mode === 'connection' || mode === 'calm' || mode === 'road') {
      glow.addColorStop(0, 'rgba(255, 239, 203, .9)');
      glow.addColorStop(.22, 'rgba(235, 209, 158, .5)');
      glow.addColorStop(1, 'rgba(215, 185, 120, 0)');
    } else if (mode === 'clarity') {
      glow.addColorStop(0, 'rgba(255, 241, 250, 1)');
      glow.addColorStop(.14, 'rgba(255, 154, 204, 1)');
      glow.addColorStop(.4, 'rgba(255, 55, 150, .5)');
      glow.addColorStop(1, 'rgba(200, 20, 110, 0)');
    } else if (mode === 'branches') {
      glow.addColorStop(0, 'rgba(255, 246, 220, 1)');
      glow.addColorStop(.14, 'rgba(255, 196, 150, 1)');
      glow.addColorStop(.4, 'rgba(255, 119, 105, .5)');
      glow.addColorStop(1, 'rgba(200, 65, 70, 0)');
    } else {
      glow.addColorStop(0, 'rgba(255, 248, 205, 1)');
      glow.addColorStop(.13, 'rgba(255, 205, 80, 1)');
      glow.addColorStop(.35, mode === 'neural' || mode === 'helix' || mode === 'engine' ? 'rgba(255, 164, 35, .55)' : 'rgba(255, 88, 8, .65)');
      glow.addColorStop(1, 'rgba(200, 65, 0, 0)');
    }
    paint.fillStyle = glow;
    paint.fillRect(0, 0, 64, 64);
    var coolSprite = null;
    if (mode === 'branches' || mode === 'balance') {
      coolSprite = document.createElement('canvas');
      coolSprite.width = coolSprite.height = 64;
      var coolPaint = coolSprite.getContext('2d');
      if (!coolPaint) return;
      var coolGlow = coolPaint.createRadialGradient(32, 32, 0, 32, 32, 32);
      coolGlow.addColorStop(0, 'rgba(235, 255, 255, 1)');
      coolGlow.addColorStop(.14, 'rgba(151, 220, 239, 1)');
      coolGlow.addColorStop(.4, 'rgba(75, 164, 195, .5)');
      coolGlow.addColorStop(1, 'rgba(35, 95, 145, 0)');
      coolPaint.fillStyle = coolGlow;
      coolPaint.fillRect(0, 0, 64, 64);
    }
    function map(point) {
      return { x: image.x + point[0] * image.width, y: image.y + point[1] * image.height };
    }
    function makeParticle(seeded) {
      var life = config.life ? random(config.life[0], config.life[1]) :
        mode === 'neural' ? random(2.8, 5.5) : mode === 'dust' ? random(14, 24) : random(2.2, 4.4);
      var p = { age: seeded ? random(0, life) : 0, life: life, phase: random(0, Math.PI * 2) };
      if (mode === 'balance') {
        p.cool = Math.random() < .52;
        p.size = random(4, 8);
        if (p.cool) {
          p.path = paths[Math.floor(random(0, paths.length))];
          p.reverse = Math.random() < .3;
        } else {
          var fire = balanceFire[Math.floor(random(0, balanceFire.length))];
          p.u = fire[0] + random(-.015, .015);
          p.v = fire[1] + random(-.02, .02);
          p.rise = random(22, 48);
          p.drift = random(-10, 13);
          p.stretch = Math.random() < .18 ? random(2, 3.5) : 1;
        }
      } else if (effectPaths[mode]) {
        var pathIndex = Math.floor(random(0, paths.length));
        p.path = paths[pathIndex];
        p.cool = mode === 'branches' && pathIndex >= 6;
        p.reverse = mode !== 'clarity' && Math.random() < (mode === 'engine' ? .72 : .35);
        p.size = random(5, 9);
      } else if (mode === 'growth') {
        var origin = growthSources[Math.floor(random(0, growthSources.length))];
        p.u = origin[0] + random(-.008, .008);
        p.v = origin[1] + random(-.012, .012);
        p.drift = random(9, 21);
        p.rise = random(4, 14);
        p.size = random(3, width < 768 ? 7 : 10);
        p.rotation = random(-.9, -.2);
        p.spin = random(-.09, .09);
        p.shape = shardShapes[Math.floor(random(0, shardShapes.length))];
        p.alpha = random(.3, .65);
      } else if (mode === 'glass') {
        p.u = random(.08, .93);
        p.v = random(.2, .77);
        p.drift = (p.u - .5) * random(4, 13);
        p.rise = random(-3, 6);
        p.size = random(5, width < 768 ? 11 : 16);
        p.rotation = random(0, Math.PI * 2);
        p.spin = random(-.16, .16);
        p.shape = shardShapes[Math.floor(random(0, shardShapes.length))];
        p.clear = Math.random() < .3;
        p.alpha = random(.35, .75);
      } else if (mode === 'fissure') {
        var source = sources[Math.floor(random(0, sources.length))];
        p.x = source.x + random(-5, 5);
        p.y = source.y + random(-4, 4);
        p.rise = random(23, 59);
        p.drift = random(-15, 18);
        p.size = random(4, 8);
        p.stretch = Math.random() < .18 ? random(2, 3.8) : random(1, 1.4);
        p.alpha = random(.5, .95);
      } else if (mode === 'bridge') {
        // Air above the deck. Perspective carries the lights gently toward
        // the vanishing point without drawing over the bridge itself.
        p.u = random(.08, .92);
        p.v = random(.10, .32);
        p.size = random(3, 6);
        p.alpha = random(.24, .55);
      } else if (config.light || config.lights) {
        var region = config.light || config.lights[Math.floor(random(0, config.lights.length))];
        p.region = region;
        var angle = random(0, Math.PI * 2), radius = Math.sqrt(Math.random());
        p.u = region.u + Math.cos(angle) * radius * region.rx;
        p.v = region.v + Math.sin(angle) * radius * region.ry;
        p.rise = mode === 'calm' ? random(.4, 1.6) : random(.8, 3.2);
        p.drift = mode === 'calm' ? random(-.8, 1.1) : random(-1.5, 2.5);
        p.size = random(2.5, 6);
        p.alpha = random(.20, .48);
      } else if (mode === 'road') {
        p.u = random(.44, .90);
        p.v = random(.36, .74);
        p.rise = random(-1, 1.5);
        p.drift = random(9, 20);
        p.size = random(2.5, 5.5);
        p.alpha = random(.18, .40);
      } else if (mode === 'windowlight') {
        p.u = random(.02, .79);
        p.v = random(.02, .64);
        p.rise = random(1, 3);
        p.drift = random(.5, 2.5);
        p.size = random(2.5, 5.5);
        p.alpha = random(.25, .55);
      } else if (mode === 'morning') {
        p.u = random(.06, .94);
        p.v = random(.12, .78);
        p.rise = random(.4, 2);
        p.drift = random(2, 6);
        p.mist = Math.random() < .16;
        p.size = p.mist ? random(30, 65) : random(2.5, 5);
        p.alpha = p.mist ? random(.02, .04) : random(.14, .32);
      } else if (mode === 'corridor') {
        var a = random(0, Math.PI * 2), r = Math.sqrt(Math.random());
        p.u = .447 + Math.cos(a) * r * .17;
        p.v = .49 + Math.sin(a) * r * .33;
        p.rise = random(1, 5);
        p.drift = random(-2, 3);
        p.size = random(3, 7);
        p.alpha = random(.24, .55);
      } else {
        // Stay over the illuminated panel and wall, left of the dark opening.
        var angle = random(0, Math.PI * 2), radius = Math.sqrt(Math.random());
        p.u = .425 + Math.cos(angle) * radius * .155;
        p.v = .44 + Math.sin(angle) * radius * .39;
        p.rise = random(1.2, 4);
        p.drift = random(-1.5, 2.5);
        p.size = random(3, 7);
        p.alpha = random(.2, .48);
      }
      return p;
    }

    function measureImage() {
      var origin = hero.getBoundingClientRect(), bounds = bg.getBoundingClientRect();
      var style = window.getComputedStyle(bg);
      var cover = Math.max(bg.clientWidth / config.width, bg.clientHeight / config.height);
      var sx = bounds.width / (bg.clientWidth || 1), sy = bounds.height / (bg.clientHeight || 1);
      function offset(value, space) {
        return value.indexOf('%') !== -1 ? space * parseFloat(value) / 100 : parseFloat(value) || 0;
      }
      image = {
        x: bounds.left - origin.left + offset(style.backgroundPositionX, bg.clientWidth - config.width * cover) * sx,
        y: bounds.top - origin.top + offset(style.backgroundPositionY, bg.clientHeight - config.height * cover) * sy,
        width: config.width * cover * sx,
        height: config.height * cover * sy
      };
    }
    function resize() {
      width = hero.clientWidth;
      height = hero.clientHeight;
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (width && height) dpr = Math.min(dpr, Math.sqrt(6000000 / (width * height)));
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      measureImage();
      var origin = hero.getBoundingClientRect();
      copyBounds = [];
      hero.querySelectorAll('.ry-hero-eyebrow, .ry-page-hero__title, .ry-page-hero__sub, .ry-warningcard').forEach(function (el) {
        var b = el.getBoundingClientRect();
        copyBounds.push({ left: b.left - origin.left - 14, right: b.right - origin.left + 14,
          top: b.top - origin.top - 12, bottom: b.bottom - origin.top + 12 });
      });
      var artworkPaths = effectPaths[mode] || neuralPaths;
      paths = artworkPaths.map(function (points) { return trace(points.map(map)); });
      // Store homepage routes in source-image pixels: the image moves during
      // scrolling, so frame() projects them through the current background crop.
      if (mode === 'balance') paths = balancePaths.map(function (points) {
        return trace(points.map(function (p) { return { x: p[0] * config.width, y: p[1] * config.height }; }));
      });
      var crack = trace(fissure.map(map));
      sources = [];
      for (var j = 0; j <= 60; j++) {
        var source = along(crack, j / 60);
        if (source.x > -10 && source.x < width + 10 && source.y > 0 && source.y < height - 8) sources.push(source);
      }
      particles = [];
      if (motion.matches || !width || !height || (mode === 'fissure' && !sources.length)) return;
      var count = width < 768 ? config.mobile : config.count;
      for (var i = 0; i < count; i++) particles.push(makeParticle(true));
    }
    function opacityAt(x, y) {
      var fade = clamp(Math.min(x / 24, (width - x) / 24, y / 28, (height - y) / 48));
      for (var i = 0; i < copyBounds.length; i++) {
        var b = copyBounds[i];
        if (x > b.left && x < b.right && y > b.top && y < b.bottom) return fade * .22;
      }
      return fade;
    }
    function dot(x, y, size, alpha, stretch, tilt, texture) {
      alpha *= opacityAt(x, y);
      if (alpha < .005) return;
      ctx.globalAlpha = alpha;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(tilt || 0);
      ctx.drawImage(texture || sprite, -size / 2, -size * (stretch || 1) / 2, size, size * (stretch || 1));
      ctx.restore();
    }
    function shard(p, fade) {
      var anchor = map([p.u, p.v]);
      var x = anchor.x + p.drift * p.age;
      var y = anchor.y - p.rise * p.age + Math.sin(time * .35 + p.phase) * 5;
      var alpha = fade * p.alpha * opacityAt(x, y);
      if (alpha < .005) return;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(x, y);
      ctx.rotate(p.rotation + p.spin * p.age);
      ctx.beginPath();
      p.shape.forEach(function (point, i) {
        if (i) ctx.lineTo(point[0] * p.size, point[1] * p.size);
        else ctx.moveTo(point[0] * p.size, point[1] * p.size);
      });
      ctx.closePath();
      ctx.fillStyle = mode === 'growth' ? 'rgba(231, 234, 210, .24)' :
        p.clear ? 'rgba(220, 229, 240, .12)' : 'rgba(205, 20, 44, .38)';
      ctx.strokeStyle = mode === 'growth' ? 'rgba(228, 239, 222, .65)' :
        p.clear ? 'rgba(245, 235, 241, .8)' : 'rgba(255, 101, 124, .8)';
      ctx.lineWidth = .65;
      ctx.fill();
      ctx.stroke();
      // One quiet facet highlight; slow rotation, without flashing or bursts.
      ctx.globalAlpha = alpha * (.3 + .2 * Math.sin(time * .65 + p.phase));
      ctx.beginPath();
      ctx.moveTo(p.shape[0][0] * p.size, p.shape[0][1] * p.size);
      ctx.lineTo(p.shape[2][0] * p.size, p.shape[2][1] * p.size);
      ctx.stroke();
      ctx.restore();
    }
    function frame(now) {
      raf = null;
      var dt = last === null ? 0 : Math.min((now - last) / 1000, .05);
      last = now;
      time += dt;
      ctx.clearRect(0, 0, width, height);
      if (mode === 'balance') measureImage();
      if (mode === 'engine') {
        var core = map([.51, .365]);
        dot(core.x, core.y, 38, .18 + Math.sin(time * .7) * .05);
      }
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.age += dt;
        if (p.age >= p.life) { particles[i] = makeParticle(false); continue; }
        var progress = p.age / p.life;
        var fade = clamp(Math.min(p.age / .6, (p.life - p.age) / (config.fadeOut || (mode === 'dust' ? 3 : .9))));
        if (mode === 'balance') {
          if (p.cool) {
            for (var j = 5; j >= 0; j--) {
              var step = progress - j * .009;
              if (step < 0) continue;
              var point = along(p.path, p.reverse ? 1 - step : step);
              var blue = map([point.x / config.width, point.y / config.height]);
              dot(blue.x, blue.y, p.size * (1 - j * .085), fade * (j ? .23 * (1 - j / 6) : .85), 1, 0, coolSprite);
            }
          } else {
            var ember = map([p.u, p.v]);
            dot(ember.x + p.drift * p.age + Math.sin(time + p.phase) * 5,
              ember.y - p.rise * p.age, p.size, fade * .8, p.stretch, p.drift / 50);
          }
        } else if (effectPaths[mode]) {
          for (var k = 5; k >= 0; k--) {
            var t = progress - k * .009;
            if (t < 0) continue;
            var pos = along(p.path, p.reverse ? 1 - t : t);
            if (mode === 'clarity') {
              // Loose movement on the chaotic side settles as particles join
              // the pink curve, then follows orderly paths across the grid.
              var disorder = clamp((.48 - (pos.x - image.x) / image.width) / .3);
              pos.x += Math.sin(time * 1.25 + p.phase) * 18 * disorder;
              pos.y += Math.cos(time * 1.6 + p.phase) * 24 * disorder;
            }
            dot(pos.x, pos.y, p.size * (1 - k * .085), fade * (k ? .25 * (1 - k / 6) : .9), 1, 0, p.cool ? coolSprite : sprite);
          }
        } else if (mode === 'glass' || mode === 'growth') {
          shard(p, fade);
        } else if (mode === 'fissure') {
          var x = p.x + p.drift * p.age + Math.sin(time * 1.6 + p.phase) * 6;
          var y = p.y - p.rise * p.age;
          dot(x, y, p.size, p.alpha * fade, p.stretch, p.drift / 55);
        } else if (mode === 'bridge') {
          var toward = progress * .78;
          var air = map([p.u + (.5 - p.u) * toward, p.v + (.328 - p.v) * toward]);
          dot(air.x + Math.sin(time * .3 + p.phase) * 2, air.y,
            p.size * (1 - progress * .45), p.alpha * fade);
        } else {
          var anchor = map([p.u, p.v]);
          var dx = p.drift * p.age + Math.sin(time * .35 + p.phase) * 7;
          var dy = -p.rise * p.age + Math.cos(time * .25 + p.phase) * 4;
          var u = p.u + dx / image.width, v = p.v + dy / image.height;
          var light = mode === 'morning' ? 1 : mode === 'corridor' ?
            clamp(1 - Math.pow((u - .447) / .20, 2) - Math.pow((v - .49) / .38, 2)) :
            clamp(1 - Math.pow((u - .425) / .17, 2) - Math.pow((v - .44) / .44, 2));
          if (config.light || config.lights) {
            var region = p.region;
            light = clamp(1 - Math.pow((u - region.u) / region.rx, 2) - Math.pow((v - region.v) / region.ry, 2));
          } else if (mode === 'road') {
            // Sideways dust stays in the open road and valley, away from the
            // foreground figure, with soft edges rather than a visible box.
            light = clamp((u - .4) / .12) * clamp((1 - u) / .12) * clamp(1 - Math.abs(v - .55) / .27);
          } else if (mode === 'windowlight') {
            // Match the diagonal light bands cast by the illustrated blinds.
            var band = v + u * .38;
            var distance = Math.min(Math.abs(band - .29), Math.abs(band - .405),
              Math.abs(band - .52), Math.abs(band - .635), Math.abs(band - .75));
            light = clamp(1 - distance / .026);
            if (insidePolygon(u, v, windowSilhouette)) light *= .06;
          }
          dot(anchor.x + dx, anchor.y + dy, p.size, p.alpha * fade * light, p.mist ? 4 : 1, p.mist ? .1 : 0);
        }
      }
      ctx.globalAlpha = 1;
      raf = window.requestAnimationFrame(frame);
    }
    function sync() {
      button.hidden = motion.matches || !particles.length;
      button.textContent = paused ? 'Resume animation' : 'Pause animation';
      if (motion.matches || paused || !visible || document.hidden || !particles.length) {
        if (raf !== null) window.cancelAnimationFrame(raf);
        raf = null;
        last = null;
        if (motion.matches) ctx.clearRect(0, 0, width, height);
      } else if (raf === null) raf = window.requestAnimationFrame(frame);
    }
    function refresh() { resize(); sync(); }
    button.addEventListener('click', function () { paused = !paused; sync(); });
    document.addEventListener('visibilitychange', sync);
    if (motion.addEventListener) motion.addEventListener('change', refresh);
    else motion.addListener(refresh);
    refresh();
    if ('ResizeObserver' in window) new ResizeObserver(refresh).observe(hero);
    window.addEventListener('resize', refresh);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        sync();
      }).observe(hero);
    } else { visible = true; sync(); }
  }
  document.querySelectorAll('[data-hero-particles]').forEach(init);
})();
