/* dock.js —— Dock 化侧栏 + 移动端左滑抽屉（第 1 项改造）
   直写编译产物（主题 webpack 链损坏；源镜像见 source-src/js/dock.js）
   职责：
   1. 桌面 Dock：.dock-handle 点击 / 快捷键 [ 切换；html[data-dock] 同步；localStorage yilia.dock
   2. 移动抽屉：html[data-drawer] 开合；遮罩/关闭钮/菜单项点击关闭；Esc 关闭
   无依赖（不依赖 Q.js / jQuery） */
(function () {
  'use strict';

  var DOCK_KEY = 'yilia.dock';

  /* ---------- localStorage 安全读写 ---------- */
  function dockGet() {
    try {
      var v = localStorage.getItem(DOCK_KEY);
      return v === 'collapsed' ? 'collapsed' : 'expanded';
    } catch (e) { return 'expanded'; }
  }
  function dockSet(v) {
    try { localStorage.setItem(DOCK_KEY, v); } catch (e) {}
  }

  /* ---------- 桌面 Dock 状态 → html[data-dock] + 把手可访问性 ---------- */
  function dockApply() {
    var state = dockGet();
    var h = document.documentElement;
    h.setAttribute('data-dock', state);
    var btn = document.querySelector('.dock-handle');
    if (btn) {
      var expanded = state !== 'collapsed';
      btn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
      btn.setAttribute('title', expanded ? '收起侧栏' : '展开侧栏');
      var tip = btn.querySelector('.tip');
      if (tip) { tip.textContent = expanded ? '收起成 Dock（快捷键 [）' : '展开侧栏（快捷键 [）'; }
    }
  }
  function dockToggle() {
    dockSet(dockGet() === 'collapsed' ? 'expanded' : 'collapsed');
    dockApply();
  }

  /* ---------- 焦点在输入控件时不抢快捷键 ---------- */
  function isTyping(e) {
    var t = e.target;
    if (!t) { return false; }
    var tag = (t.tagName || '').toUpperCase();
    return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || t.isContentEditable === true;
  }

  /* ---------- 移动抽屉 ---------- */
  function drawerOpen() {
    document.documentElement.setAttribute('data-drawer', 'open');
  }
  function drawerClose() {
    document.documentElement.setAttribute('data-drawer', 'closed');
  }
  function bindAll(selector, fn) {
    var list = document.querySelectorAll(selector);
    for (var i = 0; i < list.length; i++) {
      list[i].addEventListener('click', fn);
    }
  }

  function init() {
    /* 恢复 Dock 状态（head 防闪烁脚本已先行设置 data-dock，这里补齐把手可访问性） */
    dockApply();

    bindAll('.dock-handle', function (e) {
      e.preventDefault();
      dockToggle();
    });

    document.addEventListener('keydown', function (e) {
      /* 快捷键 [：Dock 开合 */
      if (e.key === '[' && !e.metaKey && !e.ctrlKey && !e.altKey && !isTyping(e)) {
        dockToggle();
        return;
      }
      /* Esc：关抽屉 */
      if (e.key === 'Escape') { drawerClose(); }
    });

    /* 移动抽屉 */
    bindAll('.js-drawer-open', function (e) { e.preventDefault(); drawerOpen(); });
    bindAll('.js-drawer-close', function (e) { e.preventDefault(); drawerClose(); });
    /* 抽屉内点菜单项：先关抽屉再跳转 */
    bindAll('#mobile-nav .m-menu li a', function () { drawerClose(); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
