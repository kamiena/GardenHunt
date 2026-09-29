/* =========================================================
   Garden Hunt official site
   - 多言語切り替え（日本語は index.html の本文が原文、その他は i18n.js）
   - メニュー / ムービー切り替え / スクリーンショット拡大 など
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
  var prefersReducedMotion = function () {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  };

  /* ---------------- i18n ---------------- */

  var metaDesc = $('meta[name="description"]');
  var ogLocale = $('meta[property="og:locale"]');
  var langHooks = [];

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

  /* 日本語：ゲーム用語の途中で改行されないようにする（「ヌメ／リ道」のような切れ方を防ぐ） */
  var JA_TERMS = [
    'ヌメヌメダッシュ', 'ヌメヌメゲージ', 'ヌメヌメ', 'ヌメリ道', 'ドットイート風', 'ピュアスライム', '寄生スライム',
    'ナメツムリ村', 'ナメツムリ', 'ロリディウム', 'スライム', 'エネミー', 'アジサイ', 'FEVER TIME', 'フルボイス',
    'ハイスコア', 'おにごっこ', 'リトライ', 'ステージ', 'クリア', 'メイナ', 'オババ', 'キャラクター', 'カメラアングル',
    'ストーリーパート', 'ストーリー', 'コントローラー', 'キーボード', 'ポーズメニュー', 'あそびかた', 'ゲーム',
    'マンガ', '庭園迷路', 'インディーゲーム', 'クレアクラン', 'カミエナ', 'ボイスコミック', 'アクション',
    'スピード', 'シーン', '第1話', '実況', '配信者', 'ガーデンハント', '再生リスト', 'ディレクター', 'プロデューサー', 'キャスト', 'スタッフ', 'メディア'
  ].sort(function (a, b) { return b.length - a.length; });
  var JA_RE = new RegExp('(' + JA_TERMS.map(function (s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }).join('|') + ')', 'g');
  var SKIP_SELECTOR = '.ib, .nw, script, style, svg, noscript, .ticker, .wordmark, [lang]:not([lang="ja"]):not(html)';

  function protectJapanese(scope) {
    var walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        if (!node.nodeValue || !JA_RE.test(node.nodeValue)) return NodeFilter.FILTER_REJECT;
        JA_RE.lastIndex = 0;
        var p = node.parentElement;
        if (!p || p.closest(SKIP_SELECTOR)) return NodeFilter.FILTER_REJECT;
        // flex / grid の直下の文字は、分割すると余白（gap）が入ってしまうので対象外
        var display = getComputedStyle(p).display;
        if (display.indexOf('flex') !== -1 || display.indexOf('grid') !== -1) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function (node) {
      var frag = document.createDocumentFragment();
      var parts = node.nodeValue.split(JA_RE);
      parts.forEach(function (part, i) {
        if (!part) return;
        if (i % 2 === 1) {
          var span = document.createElement('span');
          span.className = 'nw';
          span.textContent = part;
          frag.appendChild(span);
        } else {
          frag.appendChild(document.createTextNode(part));
        }
      });
      node.parentNode.replaceChild(frag, node);
    });
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
    $$('[data-footer-langs] [data-lang], [data-menu-langs] [data-lang]').forEach(function (a) {
      if (a.getAttribute('data-lang') === code) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });

    langHooks.forEach(function (fn) { fn(code); });
    if (code === 'ja') protectJapanese(document.body);

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

  function buildLangLists() {
    var menu = $('[data-lang-menu]');
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
      $$('[data-footer-langs], [data-menu-langs]').forEach(function (list) {
        var li = document.createElement('li');
        var a = document.createElement('a');
        a.href = '?lang=' + encodeURIComponent(l.code);
        a.setAttribute('data-lang', l.code);
        a.setAttribute('lang', l.code);
        a.textContent = l.label;
        li.appendChild(a);
        list.appendChild(li);
      });
    });
  }

  function setupLangSwitcher() {
    var wrap = $('[data-lang-switcher]');
    if (wrap) {
      var btn = $('.lang__btn', wrap);
      var menu = $('[data-lang-menu]', wrap);
      var items = function () { return $$('[data-lang]', menu); };
      var open = function () {
        menu.hidden = false;
        btn.setAttribute('aria-expanded', 'true');
        var checked = $('[aria-checked="true"]', menu) || items()[0];
        if (checked) checked.focus();
      };
      var close = function (focusBtn) {
        menu.hidden = true;
        btn.setAttribute('aria-expanded', 'false');
        if (focusBtn) btn.focus();
      };
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
    }

    $$('[data-footer-langs], [data-menu-langs]').forEach(function (list) {
      list.addEventListener('click', function (e) {
        var a = e.target.closest('[data-lang]');
        if (!a) return;
        e.preventDefault();
        applyLang(a.getAttribute('data-lang'), { persist: true, updateUrl: true });
        if (list.hasAttribute('data-footer-langs')) {
          window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
        }
      });
    });
  }

  /* ---------------- ヘッダー ---------------- */

  function setupHeader() {
    var header = $('#site-header');
    var hero = $('[data-hero-visual]');
    var toTop = $('[data-to-top]');
    var onScroll = function () {
      var y = window.scrollY || window.pageYOffset;
      if (header) {
        header.classList.toggle('is-scrolled', y > 4);
        // キービジュアルが画面から外れたらロゴを表示
        var heroGone = hero ? hero.getBoundingClientRect().bottom < header.offsetHeight + 8 : y > 200;
        header.classList.toggle('show-brand', heroGone);
      }
      if (toTop) toTop.classList.toggle('is-visible', y > 900);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
  }

  /* ---------------- メニュー（全画面ポップアップ） ---------------- */

  function setupMenu() {
    var menu = $('[data-menu]');
    var openBtn = $('[data-menu-open]');
    if (!menu || !openBtn) return;
    var closeBtn = $('[data-menu-close]', menu);
    var lastFocus = null;

    var focusables = function () {
      return $$('a[href], button:not([disabled])', menu).filter(function (el) { return el.offsetParent !== null; });
    };
    var open = function () {
      lastFocus = document.activeElement;
      menu.hidden = false;
      openBtn.setAttribute('aria-expanded', 'true');
      root.style.overflow = 'hidden';
      closeBtn.focus();
    };
    var close = function (restoreFocus) {
      menu.hidden = true;
      openBtn.setAttribute('aria-expanded', 'false');
      root.style.overflow = '';
      if (restoreFocus && lastFocus) lastFocus.focus();
    };

    openBtn.addEventListener('click', open);
    closeBtn.addEventListener('click', function () { close(true); });
    menu.addEventListener('click', function (e) {
      if (e.target === menu) { close(true); return; }
      var a = e.target.closest('a');
      if (a && !a.hasAttribute('data-lang')) close(false);
    });
    menu.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.preventDefault(); close(true); return; }
      if (e.key !== 'Tab') return;
      var list = focusables();
      if (!list.length) return;
      var first = list[0], last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  /* ---------------- 流れる告知テキスト ---------------- */

  function setupTicker() {
    var track = $('[data-ticker]');
    if (!track) return;
    var originals = $$('[data-i18n]', track);
    var rebuild = function () {
      $$('[data-clone]', track).forEach(function (n) { n.remove(); });
      for (var i = 0; i < 5; i++) {
        originals.forEach(function (o) {
          var c = document.createElement('span');
          c.textContent = o.textContent;
          c.setAttribute('data-clone', '');
          track.appendChild(c);
        });
      }
      // 1セット分の文字量に合わせて速度を一定に
      var setWidth = track.scrollWidth / 6;
      track.style.animationDuration = Math.max(20, setWidth / 40) * 3 + 's';
    };
    langHooks.push(rebuild);
  }

  /* ---------------- ムービー ---------------- */

  function setupPlayer() {
    var player = $('[data-player]');
    if (!player) return;
    var box = $('[data-video]', player);
    var titleEl = $('[data-player-title]', player);
    var link = $('[data-player-link]', player);
    var tabs = $$('[role="tab"]', player);
    var current = tabs[0];

    var ytId = function (tab) {
      return currentLang !== 'ja' && tab.getAttribute('data-yt-intl') ? tab.getAttribute('data-yt-intl') : tab.getAttribute('data-yt');
    };
    var play = function () {
      var iframe = document.createElement('iframe');
      iframe.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(ytId(current)) +
        '?autoplay=1&rel=0&hl=' + encodeURIComponent(currentLang);
      iframe.title = titleEl.textContent || 'Garden Hunt';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';
      iframe.allowFullscreen = true;
      box.innerHTML = '';
      box.appendChild(iframe);
      iframe.focus();
    };
    var renderPoster = function () {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'video__poster';
      btn.setAttribute('aria-label', t(currentLang, 'ui.play') || 'Play');
      var img = document.createElement('img');
      img.src = current.getAttribute('data-poster');
      img.srcset = current.getAttribute('data-poster') + ' 720w, ' + current.getAttribute('data-poster-full') + ' 1280w';
      img.sizes = '(min-width: 960px) 860px, 92vw';
      img.alt = '';
      img.width = 1280; img.height = 720;
      var icon = document.createElement('span');
      icon.className = 'video__play';
      icon.setAttribute('aria-hidden', 'true');
      icon.innerHTML = '<svg class="icon"><use href="#i-play"/></svg>';
      btn.appendChild(img);
      btn.appendChild(icon);
      btn.addEventListener('click', play);
      box.innerHTML = '';
      box.appendChild(btn);
    };
    var updateMeta = function () {
      var key = current.getAttribute('data-title-key');
      titleEl.setAttribute('data-i18n', key);
      titleEl.textContent = t(currentLang, key);
      link.href = 'https://www.youtube.com/watch?v=' + ytId(current);
      if (currentLang === 'ja') protectJapanese(titleEl);
    };
    var select = function (tab) {
      tabs.forEach(function (x) {
        x.setAttribute('aria-selected', String(x === tab));
        x.tabIndex = x === tab ? 0 : -1;
      });
      current = tab;
      updateMeta();
      renderPoster();
    };

    tabs.forEach(function (tab, i) {
      tab.tabIndex = i === 0 ? 0 : -1;
      tab.addEventListener('click', function () { select(tab); });
      tab.addEventListener('keydown', function (e) {
        var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!d) return;
        e.preventDefault();
        var next = tabs[(i + d + tabs.length) % tabs.length];
        next.focus();
        select(next);
      });
    });
    var firstPoster = $('[data-video-poster]', box);
    if (firstPoster) firstPoster.addEventListener('click', play);

    // 「ボイスコミックを見る」などのボタンからタブを切り替え
    $$('[data-go-video]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var target = tabs.filter(function (x) { return x.getAttribute('data-tab') === btn.getAttribute('data-go-video'); })[0];
        if (target) select(target);
      });
    });

    langHooks.push(function () {
      link.href = 'https://www.youtube.com/watch?v=' + ytId(current);
      titleEl.setAttribute('data-i18n', current.getAttribute('data-title-key'));
      titleEl.textContent = t(currentLang, current.getAttribute('data-title-key'));
    });
  }

  /* ---------------- 掲載メディア・実況動画：もっと見る ---------------- */

  function setupMoreLists() {
    $$('[data-more-list]').forEach(function (list) {
      var wrap = list.nextElementSibling;
      var btn = wrap && $('[data-more-btn]', wrap);
      var count = parseInt(list.getAttribute('data-more-count'), 10) || 6;
      if (!btn || list.children.length <= count) return;
      var key = btn.getAttribute('data-more-key');
      var label = $('[data-i18n]', btn);
      btn.hidden = false;
      btn.addEventListener('click', function () {
        var open = list.classList.toggle('is-open');
        btn.setAttribute('aria-expanded', String(open));
        label.setAttribute('data-i18n', key + (open ? '.less' : '.more'));
        label.textContent = t(currentLang, key + (open ? '.less' : '.more'));
      });
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
      var next = new Image();
      next.src = buttons[(index + 1) % buttons.length].getAttribute('data-full');
    }

    buttons.forEach(function (b, i) {
      b.addEventListener('click', function () { show(i); if (!dialog.open) dialog.showModal(); });
    });
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
    dialog.addEventListener('close', function () { if (buttons[index]) buttons[index].focus(); });

    var startX = null;
    dialog.addEventListener('pointerdown', function (e) { startX = e.clientX; });
    dialog.addEventListener('pointerup', function (e) {
      if (startX == null) return;
      var dx = e.clientX - startX;
      startX = null;
      if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
    });
  }

  /* ---------------- 起動 ---------------- */

  captureJapanese();
  buildLangLists();
  setupTicker();
  setupPlayer();
  var initial = detectLang();
  applyLang(initial.code, { updateUrl: initial.fromQuery });
  setupLangSwitcher();
  setupHeader();
  setupMenu();
  setupMoreLists();
  setupReveal();
  setupLightbox();
})();
