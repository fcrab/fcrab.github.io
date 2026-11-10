/**
 * theme.js —— 深浅色显式开关（两点位 light / dark）
 *
 * 第三波改造：原「主题 · 跟随系统」三态循环文案与交互废弃。
 * - localStorage["yilia.theme"] = auto | light | dark：访客未动过 = auto（跟随系统，
 *   保留为初始态）；访客任何一次切换立即写入显式 light|dark 并持久化
 * - html[data-mode] 记用户意图；html[data-dark] 记生效结果（显式值或 auto+系统暗），
 *   head.ejs 防闪烁内联脚本在 CSS 解析前先做同样赋值
 * - auto 态监听 prefers-color-scheme 变化实时跟随
 * - 控件两形态：
 *   1) .js-theme-toggle（dock 社交行月亮钮 + 移动顶栏钮）：点击深浅互切
 *   2) .js-theme-switch（展开侧栏底部 iOS 式开关，dock.css 渲染）：checked=深色
 * - 文案：深浅色 · 当前深色 / 深浅色 · 当前浅色（tooltip 与 aria 同步）
 * 本文件为直写产物（source/js/），source-src/js/theme.js 为源镜像。ES5 书写。
 */
(function () {
  'use strict';

  var KEY = 'yilia.theme';

  function storeGet() {
    try {
      var v = localStorage.getItem(KEY);
      return (v === 'light' || v === 'dark') ? v : 'auto';
    } catch (e) { return 'auto'; }
  }
  function storeSet(v) {
    try { localStorage.setItem(KEY, v); } catch (e) {}
  }

  function sysDark() {
    return !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  }

  /* 生效主题：显式值优先，auto 跟随系统 */
  function effective() {
    var mode = storeGet();
    return (mode === 'dark' || (mode === 'auto' && sysDark())) ? 'dark' : 'light';
  }

  function apply() {
    var mode = storeGet();
    var dark = effective() === 'dark';
    var html = document.documentElement;
    html.setAttribute('data-mode', mode);
    if (dark) {
      html.setAttribute('data-dark', 'dark');
    } else {
      html.removeAttribute('data-dark');
    }
    var word = '深浅色 · 当前' + (dark ? '深色' : '浅色');
    var tips = document.querySelectorAll('.js-theme-tip');
    for (var i = 0; i < tips.length; i++) tips[i].textContent = word;
    var btns = document.querySelectorAll('.js-theme-toggle');
    for (var j = 0; j < btns.length; j++) {
      btns[j].setAttribute('title', word);
      btns[j].setAttribute('aria-label', word);
      btns[j].setAttribute('aria-pressed', dark ? 'true' : 'false');
    }
    var sws = document.querySelectorAll('.js-theme-switch');
    for (var k = 0; k < sws.length; k++) {
      sws[k].checked = dark;
      sws[k].setAttribute('aria-label', word);
    }
  }

  /* 显式写入：任何一次人工切换都脱离 auto，落为 light|dark */
  function setExplicit(v) {
    storeSet(v);
    apply();
  }
  function toggle() {
    setExplicit(effective() === 'dark' ? 'light' : 'dark');
  }

  function init() {
    apply();
    var btns = document.querySelectorAll('.js-theme-toggle');
    for (var i = 0; i < btns.length; i++) {
      (function (btn) {
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          toggle();
        });
      })(btns[i]);
    }
    var sws = document.querySelectorAll('.js-theme-switch');
    for (var n = 0; n < sws.length; n++) {
      (function (sw) {
        sw.addEventListener('change', function () {
          setExplicit(sw.checked ? 'dark' : 'light');
        });
      })(sws[n]);
    }
    if (window.matchMedia) {
      var mq = window.matchMedia('(prefers-color-scheme: dark)');
      var onChange = function () { if (storeGet() === 'auto') apply(); };
      if (mq.addEventListener) mq.addEventListener('change', onChange);
      else if (mq.addListener) mq.addListener(onChange);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
