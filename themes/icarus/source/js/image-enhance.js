(function () {
  'use strict';

  // ---- 弱网/省流模式下降级到 640px 小图 ----
  var conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

  function isSlowNetwork() {
    if (!conn) return false;
    if (conn.saveData === true) return true;
    var type = conn.effectiveType || '';
    return type === 'slow-2g' || type === '2g';
  }

  if (isSlowNetwork()) {
    Array.prototype.forEach.call(document.querySelectorAll('img[data-small]'), function (img) {
      img.removeAttribute('srcset');
      img.removeAttribute('sizes');
      img.src = img.getAttribute('data-small');
    });
  }

  // ---- 点击正文图片查看原图 ----
  var overlay = null;
  var currentImg = null;

  function ensureOverlay() {
    if (overlay) return overlay;

    overlay = document.createElement('div');
    overlay.className = 'img-lightbox-overlay';

    var img = document.createElement('img');
    img.alt = '';

    var close = document.createElement('span');
    close.className = 'img-lightbox-close';
    close.setAttribute('aria-label', '关闭');
    close.textContent = '\u00d7';

    var hint = document.createElement('span');
    hint.className = 'img-lightbox-hint';
    hint.textContent = '原图加载中…';

    overlay.appendChild(img);
    overlay.appendChild(close);
    overlay.appendChild(hint);

    overlay.addEventListener('click', function (e) {
      if (e.target === img) return;
      closeLightbox();
    });

    document.body.appendChild(overlay);
    currentImg = img;
    currentImg._hint = hint;
    return overlay;
  }

  function openLightbox(src) {
    ensureOverlay();
    var hint = currentImg._hint;
    var retried = false;

    hint.style.display = '';
    hint.textContent = '原图加载中…';
    currentImg.onload = null;
    currentImg.onerror = null;
    currentImg.removeAttribute('src');

    currentImg.onload = function () {
      hint.style.display = 'none';
    };
    currentImg.onerror = function () {
      // 网络瞬时失败时自动重试一次
      if (!retried) {
        retried = true;
        hint.textContent = '加载失败，正在重试…';
        currentImg.src = src + (src.indexOf('?') === -1 ? '?' : '&') + 'retry=1';
        return;
      }
      hint.textContent = '原图加载失败，请关闭后重试';
    };
    currentImg.src = src;

    overlay.classList.add('is-open');
    document.body.classList.add('img-lightbox-active');
  }

  function closeLightbox() {
    if (!overlay) return;
    overlay.classList.remove('is-open');
    document.body.classList.remove('img-lightbox-active');
    currentImg.removeAttribute('src');
  }

  document.addEventListener('click', function (e) {
    var link = e.target.closest ? e.target.closest('a.img-lightbox') : null;
    if (!link) return;
    e.preventDefault();
    openLightbox(link.getAttribute('href'));
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeLightbox();
  });

  // 滑动手势关闭
  var startY = 0;
  document.addEventListener('touchstart', function (e) {
    if (!overlay || !overlay.classList.contains('is-open')) return;
    startY = e.touches[0].clientY;
  }, { passive: true });

  document.addEventListener('touchend', function (e) {
    if (!overlay || !overlay.classList.contains('is-open')) return;
    var deltaY = e.changedTouches[0].clientY - startY;
    if (Math.abs(deltaY) > 80) closeLightbox();
  }, { passive: true });
})();
