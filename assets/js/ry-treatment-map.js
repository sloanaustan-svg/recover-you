(function () {
  'use strict';

  const map = document.querySelector('.ry-alberta-map');
  if (!map) return;

  const popover = map.querySelector('.ry-map-popover');
  const markers = Array.from(map.querySelectorAll('.ry-map-marker'));
  if (!popover || !markers.length) return;

  const city = popover.querySelector('.ry-map-popover__city');
  const count = popover.querySelector('.ry-map-popover__count');
  const list = popover.querySelector('ul');
  let activeMarker = null;
  let armedTouchMarker = null;

  function position(marker) {
    const markerX = marker.offsetLeft;
    const markerY = marker.offsetTop;
    const mapWidth = map.clientWidth;
    const mapHeight = map.clientHeight;
    const cardWidth = popover.offsetWidth;
    const cardHeight = popover.offsetHeight;
    const sideGap = 24;
    const edgeGap = 14;

    const roomRight = mapWidth - markerX - sideGap;
    const roomLeft = markerX - sideGap;
    const openLeft = roomRight < cardWidth + edgeGap && roomLeft > roomRight;

    let popoverY = markerY;
    if (cardHeight + edgeGap * 2 < mapHeight) {
      const halfHeight = cardHeight / 2;
      popoverY = Math.max(halfHeight + edgeGap, Math.min(markerY, mapHeight - halfHeight - edgeGap));
    } else {
      popoverY = mapHeight / 2;
    }

    popover.style.setProperty('--popover-x', markerX + 'px');
    popover.style.setProperty('--popover-y', popoverY + 'px');
    popover.classList.toggle('is-left', openLeft);
  }

  function show(marker) {
    const names = (marker.dataset.centres || '').split('|').filter(Boolean);
    const total = Number(marker.dataset.count || names.length);

    markers.forEach(function (item) {
      item.classList.toggle('is-active', item === marker);
    });

    city.textContent = marker.dataset.city || '';
    count.textContent = total + (total === 1 ? ' centre' : ' centres');
    list.replaceChildren();

    names.forEach(function (name) {
      const item = document.createElement('li');
      item.textContent = name;
      list.appendChild(item);
    });

    position(marker);
    popover.classList.add('is-visible');
    popover.setAttribute('aria-hidden', 'false');
    activeMarker = marker;
  }

  function hide(marker) {
    if (activeMarker !== marker || marker.matches(':focus-visible')) return;
    marker.classList.remove('is-active');
    popover.classList.remove('is-visible');
    popover.setAttribute('aria-hidden', 'true');
    activeMarker = null;
  }

  markers.forEach(function (marker) {
    marker.addEventListener('mouseenter', function () { show(marker); });
    marker.addEventListener('mouseleave', function () { hide(marker); });
    marker.addEventListener('focus', function () { show(marker); });
    marker.addEventListener('blur', function () { hide(marker); });
    marker.addEventListener('click', function (event) {
      if (!window.matchMedia('(hover: none)').matches) return;
      if (armedTouchMarker !== marker) {
        event.preventDefault();
        armedTouchMarker = marker;
        show(marker);
      } else {
        armedTouchMarker = null;
      }
    });
  });

  document.addEventListener('click', function (event) {
    if (!event.target.closest('.ry-map-marker')) armedTouchMarker = null;
  });

  let resizeTimer;
  window.addEventListener('resize', function () {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(function () {
      if (activeMarker) position(activeMarker);
    }, 120);
  });
})();
