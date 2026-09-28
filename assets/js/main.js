/* =========================================================
   Garden Hunt official site
   - 多言語切り替え（日本語は index.html の本文が原文、その他は i18n.js）
   - スマホメニュー / スクリーンショット拡大 / YouTube 遅延読み込み など
   ========================================================= */
(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.add('js');

  var DATA = window.GH_I18N || { languages: [], strings: {} };
  var LANGS = DATA.languages;
  var STRINGS = DATA.strings;
  var DEFAULT_LANG = 'ja';
  var STORE_KEY = 'gardenhunt:lang';
  var STEAM_URL = 'https://store.steampowered.com/app/3820430/';

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* ---------------- i18n ---------------- */

  var metaDesc = $('meta[name="description"]');
  var ogLocale = $('meta[property="og:locale"]');

  function attrPairs(el) {
    return el.getAttribute('data-i18n-attr').split(';').map(function (pair) {
      var i = pair.indexOf(':');
      return [pair.slice(0, i).trim(), pair.slice(i + 1).trim()];
    }).filter(function (p) { return p[0] && p[1]; });
  }

  // HTML に書かれている日本語を「ja」の原文として取り込む
  function captureJapanese() {
    var ja = STRINGS.ja = STRINGS.ja || {};
    var put = function (key, value) { if (!(key in ja)) ja[key] = value; };
    $$('[data-i18n]').forEach(function (el) { put(el.getAttribute('data-i18n'), el.textContent); });
    $$('[data-i18n-html]').forEach(function (el) { put(el.getAttribute('data-i18n-html'), el.innerHTML); });
    $$('[data-i18n-attr]').forEach(function (el) {
      attrPairs(el).forEach(function (p) { put(p[1], el.getAttribute(p[0])); });
    });
    put('meta.title', document.title);
    if (metaDesc) put('meta.description', metaDesc.getAttribute('content'));
  }

  function langInfo(code) {
    for (var i = 0; i < LANGS.length; i++) if (LANGS[i].code === code) return LANGS[i];
    return null;
  }

  function t(lang, key) {
    var chain = [lang, 'en', DEFAULT_LANG];
    for (var i = 0; i < chain.length; i++) {
      var dict = STRINGS[chain[i]];
      if (dict && dict[key] != null) return dict[key];
    }
    return null;
  }

  var ALIASES = {
    jp: 'ja', japanese: 'ja', english: 'en', kr: 'ko', koreana: 'ko', korean: 'ko',
    cn: 'zh-Hans', sc: 'zh-Hans', schinese: 'zh-Hans', tw: 'zh-Hant', tc: 'zh-Hant', tchinese: 'zh-Hant',
    french: 'fr', german: 'de', spanish: 'es', italian: 'it'
  };

  function normalize(code) {
    if (!code) return null;
    var lower = String(code).trim().toLowerCase();
    for (var i = 0; i < LANGS.length; i++) if (LANGS[i].code.toLowerCase() === lower) return LANGS[i].code;
    if (ALIASES[lower]) return ALIASES[lower];
    if (lower.indexOf('zh') === 0) return /hant|tw|hk|mo/.test(lower) ? 'zh-Hant' : 'zh-Hans';
    var base = lower.split(/[-_]/)[0];
    return langInfo(base) ? base : null;
  }

  function detectLang() {
    var fromQuery = normalize(new URLSearchParams(location.search).get('lang'));
    if (fromQuery) return { code: fromQuery, fromQuery: true };
    try {
      var saved = normalize(localStorage.getItem(STORE_KEY));
      if (saved) return { code: saved };
    } catch (e) { /* storage unavailable */ }
    var prefs = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language];
    for (var i = 0; i < prefs.length; i++) {
      var n = normalize(prefs[i]);
      if (n) return { code: n };
    }
    return { code: DEFAULT_LANG };
  }

  var loadedFonts = {};
  function loadFont(info) {
    if (!info.font || loadedFonts[info.code]) return;
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=' + info.font + '&display=swap';
    document.head.appendChild(link);
    loadedFonts[info.code] = true;
  }

  function format(str, vars) {
    return String(str).replace(/\{(\w+)\}/g, function (m, k) { return vars[k] != null ? vars[k] : m; });
  }

  var currentLang = DEFAULT_LANG;

  function applyLang(code, opts) {
    opts = opts || {};
    var info = langInfo(code) || langInfo(DEFAULT_LANG);
    code = info.code;
    currentLang = code;
    loadFont(info);
    root.lang = code;

    $$('[data-i18n]').forEach(function (el) {
      var v = t(code, el.getAttribute('data-i18n'));
      if (v != null) el.textContent = v;
    });
    $$('[data-i18n-html]').forEach(function (el) {
      var v = t(code, el.getAttribute('data-i18n-html'));
      if (v != null) el.innerHTML = v;
    });
    $$('[data-i18n-attr]').forEach(function (el) {
      attrPairs(el).forEach(function (p) {
        var v = t(code, p[1]);
        if (v != null) el.setAttribute(p[0], v);
      });
    });

    var shotLabel = t(code, 'ui.screenshot') || 'Screenshot {n}';
    $$('[data-gallery] img').forEach(function (img, i) { img.alt = format(shotLabel, { n: i + 1 }); });

    document.title = t(code, 'meta.title');
    if (metaDesc) metaDesc.setAttribute('content', t(code, 'meta.description'));
    if (ogLocale && info.og) ogLocale.setAttribute('content', info.og);

    $$('.js-steam-link').forEach(function (a) { a.href = STEAM_URL + '?l=' + info.steam; });

    var current = $('[data-lang-current]');
    if (current) current.textContent = info.label;
    $$('[data-lang-menu] [data-lang]').forEach(function (b) {
      b.setAttribute('aria-checked', String(b.getAttribute('data-lang') === code));
    });
    $$('[data-footer-langs] [data-lang]').forEach(function (a) {
      if (a.getAttribute('data-lang') === code) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });

    if (opts.persist) {
      try { localStorage.setItem(STORE_KEY, code); } catch (e) { /* ignore */ }
    }
    if (opts.updateUrl && window.history && history.replaceState) {
      var url = new URL(location.href);
      if (code === DEFAULT_LANG) url.searchParams.delete('lang');
      else url.searchParams.set('lang', code);
      history.replaceState(null, '', url.pathname + url.search + url.hash);
    }
    root.classList.remove('i18n-pending');
  }

  /* ---------------- 言語メニュー ---------------- */

  function buildLangMenus() {
    var menu = $('[data-lang-menu]');
    var footer = $('[data-footer-langs]');
    LANGS.forEach(function (l) {
      if (menu) {
        var li = document.createElement('li');
        li.setAttribute('role', 'none');
        var b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('role', 'menuitemradio');
        b.setAttribute('data-lang', l.code);
        b.setAttribute('lang', l.code);
        b.setAttribute('aria-checked', 'false');
        b.textContent = l.label;
        li.appendChild(b);
        menu.appendChild(li);
      }
      if (footer) {
        var fli = document.createElement('li');
        var a = document.createElement('a');
        a.href = '?lang=' + encodeURIComponent(l.code);
        a.setAttribute('data-lang', l.code);
        a.setAttribute('lang', l.code);
        a.textContent = l.label;
        fli.appendChild(a);
        footer.appendChild(fli);
      }
    });
  }

  function setupLangSwitcher() {
    var wrap = $('[data-lang-switcher]');
    if (!wrap) return;
    var btn = $('.lang__btn', wrap);
    var menu = $('[data-lang-menu]', wrap);
    var items = function () { return $$('[data-lang]', menu); };

    function open() {
      menu.hidden = false;
      btn.setAttribute('aria-expanded', 'true');
      var checked = $('[aria-checked="true"]', menu) || items()[0];
      if (checked) checked.focus();
    }
    function close(focusBtn) {
      menu.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
      if (focusBtn) btn.focus();
    }

    btn.addEventListener('click', function () { menu.hidden ? open() : close(); });
    menu.addEventListener('click', function (e) {
      var b = e.target.closest('[data-lang]');
      if (!b) return;
      applyLang(b.getAttribute('data-lang'), { persist: true, updateUrl: true });
      close(true);
    });
    menu.addEventListener('keydown', function (e) {
      var list = items();
      var i = list.indexOf(document.activeElement);
      if (e.key === 'ArrowDown') { e.preventDefault(); list[(i + 1) % list.length].focus(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); list[(i - 1 + list.length) % list.length].focus(); }
      else if (e.key === 'Home') { e.preventDefault(); list[0].focus(); }
      else if (e.key === 'End') { e.preventDefault(); list[list.length - 1].focus(); }
      else if (e.key === 'Escape') { e.preventDefault(); close(true); }
      else if (e.key === 'Tab') { close(false); }
    });
    document.addEventListener('click', function (e) {
      if (!menu.hidden && !wrap.contains(e.target)) close(false);
    });

    var footer = $('[data-footer-langs]');
    if (footer) {
      footer.addEventListener('click', function (e) {
        var a = e.target.closest('[data-lang]');
        if (!a) return;
        e.preventDefault();
        applyLang(a.getAttribute('data-lang'), { persist: true, updateUrl: true });
        window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
      });
    }
  }

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /* ---------------- ヘッダー / スマホメニュー ---------------- */

  function setupHeader() {
    var header = $('#site-header');
    var toTop = $('[data-to-top]');
    var onScroll = function () {
      var y = window.scrollY || window.pageYOffset;
      if (header) header.classList.toggle('is-scrolled', y > 8);
      if (toTop) toTop.classList.toggle('is-visible', y > 900);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    var menuBtn = $('[data-menu-btn]');
    var drawer = $('[data-drawer]');
    if (!menuBtn || !drawer) return;
    var setOpen = function (open) {
      drawer.hidden = !open;
      menuBtn.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    };
    menuBtn.addEventListener('click', function () { setOpen(drawer.hidden); });
    drawer.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !drawer.hidden) { setOpen(false); menuBtn.focus(); }
    });
    window.addEventListener('resize', function () { if (window.innerWidth >= 1240 && !drawer.hidden) setOpen(false); });
  }

  function setupActiveNav() {
    if (!('IntersectionObserver' in window)) return;
    var links = $$('.gnav__list a');
    var byId = {};
    links.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (a) { a.classList.remove('is-active'); });
        var a = byId[entry.target.id];
        if (a) a.classList.add('is-active');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(byId).forEach(function (id) {
      var sec = document.getElementById(id);
      if (sec) io.observe(sec);
    });
  }

  /* ---------------- スクロール演出 ---------------- */

  function setupReveal() {
    var els = $$('.reveal');
    if (!('IntersectionObserver' in window) || prefersReducedMotion()) {
      els.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------------- スクリーンショット拡大 ---------------- */

  function setupLightbox() {
    var dialog = $('[data-lightbox]');
    var buttons = $$('[data-gallery] button');
    if (!buttons.length) return;
    if (!dialog || typeof dialog.showModal !== 'function') {
      buttons.forEach(function (b) {
        b.addEventListener('click', function () { window.open(b.getAttribute('data-full'), '_blank', 'noopener'); });
      });
      return;
    }
    var img = $('[data-lightbox-img]', dialog);
    var count = $('[data-lightbox-count]', dialog);
    var index = 0;

    function show(i) {
      index = (i + buttons.length) % buttons.length;
      var b = buttons[index];
      img.src = b.getAttribute('data-full');
      img.alt = $('img', b).alt;
      count.textContent = (index + 1) + ' / ' + buttons.length;
      // 次の画像を先読み
      var next = new Image();
      next.src = buttons[(index + 1) % buttons.length].getAttribute('data-full');
    }
    function open(i) {
      show(i);
      if (!dialog.open) dialog.showModal();
    }

    buttons.forEach(function (b, i) { b.addEventListener('click', function () { open(i); }); });
    $('[data-lightbox-prev]', dialog).addEventListener('click', function () { show(index - 1); });
    $('[data-lightbox-next]', dialog).addEventListener('click', function () { show(index + 1); });
    $('[data-lightbox-close]', dialog).addEventListener('click', function () { dialog.close(); });
    dialog.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); show(index - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); show(index + 1); }
    });
    dialog.addEventListener('click', function (e) {
      if (e.target === dialog || e.target.classList.contains('lightbox__inner')) dialog.close();
    });
    dialog.addEventListener('close', function () {
      if (buttons[index]) buttons[index].focus();
    });

    var startX = null;
    dialog.addEventListener('pointerdown', function (e) { startX = e.clientX; });
    dialog.addEventListener('pointerup', function (e) {
      if (startX == null) return;
      var dx = e.clientX - startX;
      startX = null;
      if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
    });
  }

  /* ---------------- YouTube（クリックで読み込み） ---------------- */

  function setupVideos() {
    $$('[data-youtube]').forEach(function (box) {
      var poster = $('.video__poster', box);
      if (!poster) return;
      poster.addEventListener('click', function () {
        var iframe = document.createElement('iframe');
        iframe.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(box.getAttribute('data-youtube')) +
          '?autoplay=1&rel=0&hl=' + encodeURIComponent(currentLang);
        iframe.title = t(currentLang, 'movie.caption') || 'Garden Hunt';
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
        iframe.referrerPolicy = 'strict-origin-when-cross-origin';
        iframe.allowFullscreen = true;
        box.replaceChild(iframe, poster);
        iframe.focus();
      });
    });
  }

  /* ---------------- 起動 ---------------- */

  captureJapanese();
  buildLangMenus();
  var initial = detectLang();
  applyLang(initial.code, { updateUrl: initial.fromQuery });
  setupLangSwitcher();
  setupHeader();
  setupActiveNav();
  setupReveal();
  setupLightbox();
  setupVideos();
})();
