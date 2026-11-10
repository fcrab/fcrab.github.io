/**
 * theme.js —— 亮暗主题三态（auto / light / dark）· 图标轮转 + 释义实时同步
 *
 * 工单沿革：第三波原令「图标换 switch」已于 2026-11-10 14:52 撤回——月亮图标
 * 三态轮转保留原样；真正要修的是切换后 tooltip/aria-label 释义不随状态更新
 * （写死「跟随系统」）。本版为按新令的实现：
 * - localStorage["yilia.theme"] = auto | light | dark，循环切换：auto → light → dark → auto
 * - 释义（当前态）实时同步四处，每次 apply()（含初始、轮转、系统切换）立即刷新：
 *     .js-theme-tip（dock 图标 tooltip）、.js-theme-label（侧栏底部主题词）、
 *     .js-theme-toggle 的 title 与 aria-label（桌面月亮钮 + 移动顶栏钮）
 * - html[data-mode] 记用户意图；html[data-dark] 记生效结果（dark 或 auto+系统暗），
 *   head.ejs 防闪烁内联脚本在 CSS 解析前先做同样赋值
 * - auto 态监听 prefers-color-scheme 变化实时跟随
 * - 文案：主题 · 跟随系统 / 主题 · 浅色 / 主题 · 深色
 * 绑定目标：.js-theme-toggle（桌面侧栏 s-theme 按钮 + 移动顶栏 m-theme 按钮）。
 * 本文件为直写产物（source/js/），source-src/js/theme.js 为源镜像。ES5 书写。
 */
(function () {
  'use strict';

  var KEY = 'yilia.theme';
  var ORDER = ['auto', 'light', 'dark'];
  var LABEL = { auto: '主题 · 跟随系统', light: '主题 · 浅色', dark: '主题 · 深色' };

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

  /* 生效结果：显式值优先，auto 跟随系统 */
  function effectiveDark() {
    var mode = storeGet();
    return mode === 'dark' || (mode === 'auto' && sysDark());
  }

  /* 每次状态落定都全量刷新：data-mode/data-dark + 四处释义 */
  function apply() {
    var mode = storeGet();
    var dark = effectiveDark();
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
    for (var k = 0; k < btns.length; k++) {
      btns[k].setAttribute('title', word);
      btns[k].setAttribute('aria-label', word);
    }
  }

  /* 三态轮转：auto → light → dark → auto，轮转后释义立即刷新 */
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
