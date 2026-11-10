/**
 * theme.js —— 亮暗主题三态（auto / light / dark）
 *
 * 设计稿：blog-modernization/index.html（主题三态规格）
 * - localStorage["yilia.theme"] = auto | light | dark，循环切换：auto → light → dark
 * - html[data-mode] 记用户意图；html[data-dark] 记生效结果（dark 或 auto+系统暗），
 *   供 css/dark.css 使用；head.ejs 里的防闪烁内联脚本在 CSS 解析前先做同样赋值
 * - auto 态监听 prefers-color-scheme 变化实时跟随
 * - 文案：主题 · 跟随系统 / 主题 · 亮色 / 主题 · 暗色（.js-theme-tip 与 .js-theme-label 同步）
 * 绑定目标：.js-theme-toggle（桌面侧栏 s-theme 按钮 + 移动顶栏 m-theme 按钮）。
 * 本文件为直写产物（source/js/），source-src/js/theme.js 为源镜像。ES5 书写。
 */
(function () {
  'use strict';

  var KEY = 'yilia.theme';
  var ORDER = ['auto', 'light', 'dark'];
  var LABEL = { auto: '主题 · 跟随系统', light: '主题 · 亮色', dark: '主题 · 暗色' };

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

  function apply() {
    var mode = storeGet();
    var dark = mode === 'dark' || (mode === 'auto' && sysDark());
    var html = document.documentElement;
    html.setAttribute('data-mode', mode);
    if (dark) {
      html.setAttribute('data-dark', 'dark');
    } else {
      html.removeAttribute('data-dark');
    }
    var word = LABEL[mode];
    var tips = document.querySelectorAll('.js-theme-tip');
    for (var i = 0; i < tips.length; i++) tips[i].textContent = word;
    var labels = document.querySelectorAll('.js-theme-label');
    for (var j = 0; j < labels.length; j++) labels[j].textContent = word;
    var btns = document.querySelectorAll('.js-theme-toggle');
    for (var k = 0; k < btns.length; k++) btns[k].setAttribute('title', word);
  }

  function cycle() {
    var next = ORDER[(ORDER.indexOf(storeGet()) + 1) % ORDER.length];
    storeSet(next);
    apply();
  }

  function init() {
    apply();
    var btns = document.querySelectorAll('.js-theme-toggle');
    for (var i = 0; i < btns.length; i++) {
      (function (btn) {
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          cycle();
        });
      })(btns[i]);
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
