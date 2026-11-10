/**
 * theme.js —— 亮暗主题三态（auto / light / dark）· 图标随态换形 + 释义实时同步
 *
 * 第四波（2026-11-10）语义定版：图形 = 当前所处主题；tooltip / aria-label / title =
 * 点击后将切换到的目标。三态三形（SVG 三组全量内联于按钮，dock.css 按
 * html[data-mode] 显隐）：
 *   auto  → 半日半月（整圆 + 左半填充，经典对比度图标），释义「切换到浅色」
 *   light → 太阳（feather sun：中心圆 + 8 根射线），释义「切换到深色」
 *   dark  → 月亮（新月），释义「切换到跟随系统」
 * 首屏防闪烁：head.ejs 内联脚本在 CSS 解析前先落位 html[data-mode]，
 * 首屏即渲染正确图形，不会「先月亮再换形」；apply() 每次轮转/系统切换
 * 重设 data-mode，CSS 即时换形，桌面钮（.s-theme）与移动钮（.m-theme）
 * 同 class 同步换形。侧栏主题词（.js-theme-label）仍显当前态不变。
 *
 * 工单沿革：第三波实现月亮图标三态轮转 + 释义实时同步（当时释义=当前态，
 * 「主题 · X」）；第四波将按钮释义改为「去向」文案。原「图标换 switch」
 * 改令已于 2026-11-10 14:52 撤回，月亮 path 三态轮转骨架保留至今。
 * - localStorage["yilia.theme"] = auto | light | dark，循环切换：auto → light → dark → auto
 * - html[data-mode] 记用户意图（同时驱动图标换形 CSS）；html[data-dark] 记生效结果
 *   （dark 或 auto+系统暗），head.ejs 防闪烁内联脚本在 CSS 解析前先做同样赋值
 * - auto 态监听 prefers-color-scheme 变化实时跟随
 * 绑定目标：.js-theme-toggle（桌面侧栏 s-theme 按钮 + 移动顶栏 m-theme 按钮）。
 * 本文件为直写产物（source/js/），source-src/js/theme.js 为源镜像。ES5 书写。
 */
(function () {
  'use strict';

  var KEY = 'yilia.theme';
  var ORDER = ['auto', 'light', 'dark'];
  /* 按钮释义 = 点击后将切换到的目标（tooltip / title / aria-label 三处同文） */
  var TIP = { auto: '切换到浅色', light: '切换到深色', dark: '切换到跟随系统' };
  /* 侧栏主题词 = 当前所处主题 */
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

  /* 每次状态落定都全量刷新：data-mode（兼驱动图标换形）/data-dark + 释义四处。
     图形换形本身由 dock.css 按 data-mode 显隐完成，JS 无需操作 SVG。 */
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
    var tip = TIP[mode];
    var word = LABEL[mode];
    var tips = document.querySelectorAll('.js-theme-tip');
    for (var i = 0; i < tips.length; i++) tips[i].textContent = tip;
    var labels = document.querySelectorAll('.js-theme-label');
    for (var j = 0; j < labels.length; j++) labels[j].textContent = word;
    var btns = document.querySelectorAll('.js-theme-toggle');
    for (var k = 0; k < btns.length; k++) {
      btns[k].setAttribute('title', tip);
      btns[k].setAttribute('aria-label', tip);
    }
  }

  /* 三态轮转：auto → light → dark → auto，轮转后图形与释义立即刷新 */
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
