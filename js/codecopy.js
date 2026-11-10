/**
 * codecopy —— 代码块头栏 + 一键复制
 *
 * 为每个 figure.highlight 注入 .code-head（语言标签右置大写 + 复制按钮），
 * 复制内容取 td.code pre 的纯文本；成功后按钮闪「已复制」1.2s（.flashed）。
 * 样式见 css/highlight-yilia.css；设计稿 blog-modernization/index.html 视图②。
 * ES5 书写，与主题旧式 JS 风格一致。
 * 本文件为直写产物（source/js/），source-src/js/ 有源镜像。
 */
(function () {
  'use strict';

  function each(sel, fn) {
    var nodes = document.querySelectorAll(sel);
    for (var i = 0; i < nodes.length; i++) fn(nodes[i]);
  }

  function copyText(text, done) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, done);
      return;
    }
    /* 兼容兜底：隐藏 textarea + execCommand */
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
    done();
  }

  function bindCopy(btn, fig) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      var pre = fig.querySelector('td.code pre') || fig.querySelector('pre');
      var text = pre ? (pre.innerText || pre.textContent || '') : '';
      if (!text) return;
      copyText(text, function () {
        btn.classList.add('flashed');
        btn.textContent = '已复制';
        setTimeout(function () {
          btn.classList.remove('flashed');
          btn.textContent = '复制';
        }, 1200);
      });
    });
  }

  function enhance(fig) {
    if (fig.getAttribute('data-codecopy')) return;
    fig.setAttribute('data-codecopy', '1');

    var m = (fig.className || '').match(/highlight[\s-]+([A-Za-z0-9+#_-]+)/);
    var lang = m ? m[1] : '';

    var head = document.createElement('div');
    head.className = 'code-head';

    var btn = document.createElement('button');
    btn.className = 'copy';
    btn.type = 'button';
    btn.textContent = '复制';
    bindCopy(btn, fig);
    head.appendChild(btn);

    var tag = document.createElement('span');
    tag.className = 'lang';
    tag.textContent = lang;
    head.appendChild(tag);

    fig.insertBefore(head, fig.firstChild);
  }

  function init() {
    each('figure.highlight', enhance);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
