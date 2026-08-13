/* ====================================================================
   Recover-You — scroll reveal + anchor nav
   --------------------------------------------------------------------
   Two small behaviours that belong together because both key off scroll
   position, and both must fail safe.

   1. .ry-reveal  — directional entrance animations
      Adds html.ry-js immediately, which is what actually arms the
      hidden state in CSS. If this file fails to load or throws, the
      class is never added and everything renders plainly visible.
      Elements reveal once and are then unobserved.

   2. .ry-anchornav — sticky section bar on long pages
      Appears once the hero has scrolled away, highlights the section
      currently in view, and fades its right edge while the link strip
      can still be scrolled further.

   Both no-op under prefers-reduced-motion for the animation parts,
   while still keeping the nav functional.
   ==================================================================== */
(function () {
  'use strict';

  var reduced = window.matchMedia &&
                window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------- */
  /* 1. reveal                                                        */
  /* ---------------------------------------------------------------- */
  function initReveal() {
    var nodes = document.querySelectorAll('.ry-reveal, .ry-barchart');
    if (!nodes.length) return;

    if (!('IntersectionObserver' in window)) {
      for (var j = 0; j < nodes.length; j++) nodes[j].classList.add('is-in');
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    for (var i = 0; i < nodes.length; i++) io.observe(nodes[i]);
  }

  /* ---------------------------------------------------------------- */
  /* 2. anchor nav                                                    */
  /* ---------------------------------------------------------------- */
  function initAnchorNav() {
    var nav = document.querySelector('.ry-anchornav');
    if (!nav) return;

    var links = Array.prototype.slice.call(nav.querySelectorAll('a[data-section]'));
    var strip = nav.querySelector('.ry-anchornav ul');
    var fade  = nav.querySelector('.ry-anchornav__fade');
    var hero  = document.querySelector('.ry-page-hero');

    var targets = links
      .map(function (a) {
        return { link: a, el: document.getElementById(a.getAttribute('data-section')) };
      })
      .filter(function (t) { return t.el; });

    /* show/hide once the hero is behind us */
    function onScroll() {
      var y = window.pageYOffset || document.documentElement.scrollTop || 0;
      var trigger = hero ? hero.offsetHeight * 0.8 : 400;
      nav.classList.toggle('is-visible', y > trigger);
    }

    /* which section are we in? pick the last one whose top is above
       the fold line — simpler and steadier than an observer here,
       because these sections are tall and often overlap the viewport */
    function onSpy() {
      var line = (window.pageYOffset || 0) + window.innerHeight * 0.32;
      var current = null;
      targets.forEach(function (t) {
        if (t.el.offsetTop <= line) current = t;
      });
      links.forEach(function (a) { a.classList.remove('is-active'); });
      if (current) {
        current.link.classList.add('is-active');
        // keep the active chip in view within the scrolling strip
        if (strip && strip.scrollWidth > strip.clientWidth) {
          var l = current.link;
          var want = l.offsetLeft - (strip.clientWidth / 2) + (l.offsetWidth / 2);
          strip.scrollTo({ left: want, behavior: reduced ? 'auto' : 'smooth' });
        }
      }
    }

    function onStripScroll() {
      if (!fade || !strip) return;
      var atEnd = strip.scrollLeft + strip.clientWidth >= strip.scrollWidth - 4;
      fade.classList.toggle('is-hidden', atEnd);
    }

    var ticking = false;
    function tick() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        onScroll();
        onSpy();
        ticking = false;
      });
    }

    window.addEventListener('scroll', tick, { passive: true });
    window.addEventListener('resize', tick);
    if (strip) strip.addEventListener('scroll', onStripScroll, { passive: true });

    tick();
    onStripScroll();
  }

  function init() {
    initReveal();
    initAnchorNav();
  }

  // arm the CSS hidden state only now that we know scripting works
  document.documentElement.classList.add('ry-js');

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
