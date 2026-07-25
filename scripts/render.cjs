#!/usr/bin/env node
/**
 * render.cjs · hanzi-infographic-skill
 * 确定性渲染：HTML+CSS → Playwright → PNG（中文 100% 清晰，同输入同输出）。
 * 用法：
 *   NODE_PATH=/Users/joysinleung/.workbuddy/binaries/node/workspace/node_modules \
 *   /Users/joysinleung/.workbuddy/binaries/node/versions/22.22.2/bin/node \
 *     scripts/render.cjs <index.html> [output.png] [#cover] [--theme=pop-lab]
 * 依赖：playwright（managed node workspace 已装）+ Chromium（PLAYWRIGHT_BROWSERS_PATH 默认已缓存）
 * --theme：覆盖 <html data-theme>，实现同一份源渲染多套风格（swiss-orange/pop-lab/morandi）
 */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const args = process.argv.slice(2);
  const file = args[0];
  let out = 'output.png';
  let selector = '#cover';
  let theme = null;
  for (let i = 1; i < args.length; i++) {
    const a = args[i];
    if (a.startsWith('--theme=')) theme = a.slice('--theme='.length);
    else if (!a.startsWith('--')) { if (out === 'output.png') out = a; else if (selector === '#cover') selector = a; }
  }
  if (!file) {
    console.error('用法: node render.cjs <html> [out.png] [#cover] [--theme=pop-lab]');
    process.exit(2);
  }
  const fileUrl = 'file://' + path.resolve(file);
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({
      viewport: { width: 1200, height: 800 },
      deviceScaleFactor: 2,
    });
    await page.goto(fileUrl, { waitUntil: 'networkidle' });
    // --theme 注入：覆盖 <html data-theme> 实现多风格渲染
    if (theme) {
      const ok = await page.evaluate((t) => {
        const h = document.documentElement;
        if (!h) return false;
        h.setAttribute('data-theme', t);
        return true;
      }, theme);
      console.log(ok ? '🎨 已切换主题: ' + theme : '⚠️ 未找到 <html>，主题未切换');
      await page.waitForTimeout(120);
    }
    // 确定性：等待字体与布局稳定
    await page.evaluate(async () => {
      if (document.fonts && document.fonts.ready) { try { await document.fonts.ready; } catch (e) {} }
    });
    await page.waitForTimeout(300);
    const el = await page.$(selector);
    if (!el) {
      console.error('❌ 未找到选择器:', selector);
      process.exit(3);
    }
    // 记录实际渲染高度（防内容被截断）
    const box = await el.boundingBox();
    await el.screenshot({ path: out, scale: 'device' });
    const stat = fs.statSync(out);
    console.log('✅ 渲染完成:', out);
    console.log('   源元素尺寸:', Math.round(box.width) + 'x' + Math.round(box.height) + 'px @2x');
    console.log('   文件大小:', (stat.size / 1024).toFixed(1) + ' KB');
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error('❌ 渲染失败:', e.message);
  process.exit(1);
});
