#!/usr/bin/env node
/**
 * aesthetic-radar.cjs · hanzi-infographic-skill
 * 把 huashu-design 的「5 维专家评审」范式搬进 hanzi 美学门控自动化。
 * 对渲染前的 HTML 做结构性启发式打分（5 维 × 20 分 = 100 分），
 * 把"美不美"变成"5 维打分过不过"，补齐咱们产线质量量化短板。
 *
 * 用法：
 *   node scripts/aesthetic-radar.cjs <index.html> [--json out.json]
 * 退出码 1 = 总分 < 90（阻止交付，对齐 qa-checklist 100 分门控）。
 *
 * 5 维（适配信息图场景，非 huashu 原 5 维直译）：
 *   1. hierarchy   视觉层级：标题够大 + 字号层级丰富
 *   2. density     信息密度：板块有内容、不空洞、不堆砌装饰
 *   3. whitespace  留白呼吸：容器/区块有合理内边距，不触边
 *   4. consistency 一致性：语义色使用克制、无内联 slop 杂色（调色板色不算）
 *   5. readability 中文可读性：lang=zh、字体栈、无 <12px 极小字滥用、含中文字形
 */
const fs = require('fs');

function collectFontSizes(html) {
  const set = new Set();
  const re = /font-size\s*:\s*(\d+(?:\.\d+)?)px/gi;
  let m;
  while ((m = re.exec(html)) !== null) set.add(parseFloat(m[1]));
  return [...set].sort((a, b) => a - b);
}

// 只统计「内联 style 里的 hex」——这才是 slop 信号（临时硬编码杂色）
function collectInlineHex(html) {
  const set = new Set();
  const re = /style="[^"]*#([0-9a-fA-F]{3,8})[^"]*"/g;
  let m;
  while ((m = re.exec(html)) !== null) set.add(m[1].toLowerCase());
  return [...set].filter((c) => !['000', '000000', 'fff', 'ffffff', 'transparent'].includes(c));
}

function countClass(html, cls) {
  const re = new RegExp(`class="[^"]*\\b${cls}\\b[^"]*"`, 'g');
  return (html.match(re) || []).length;
}

function hasDecl(html, prop, minPx) {
  const re = new RegExp(`${prop}\\s*:\\s*(\\d+(?:\\.\\d+)?)px`, 'gi');
  let m, ok = false;
  while ((m = re.exec(html)) !== null) if (parseFloat(m[1]) >= minPx) ok = true;
  return ok;
}

function hasFontFamily(html) {
  return /font-family\s*:/i.test(html);
}

(function main() {
  const htmlPath = process.argv[2];
  const args = process.argv.slice(3);
  let jsonOut = null;
  for (let i = 0; i < args.length; i++) if (args[i] === '--json') jsonOut = args[++i];
  if (!htmlPath) {
    console.error('用法: node aesthetic-radar.cjs <index.html> [--json out.json]');
    process.exit(2);
  }
  const html = fs.readFileSync(htmlPath, 'utf8');
  const scores = {};

  // ---- 1. 视觉层级 hierarchy（看重标题够大 + 字号层级数，不罚小标签）----
  {
    const sizes = collectFontSizes(html);
    let s = 0;
    if (sizes.length) {
      const max = sizes[sizes.length - 1];
      const tiers = sizes.length; // 不同字号档位数 = 层级丰富度
      if (max >= 40) s += 12;       // 有标题级大字
      if (max >= 64) s += 4;        // 主标题够大（hero）
      if (tiers >= 3) s += 4;       // 字号梯度清晰
    }
    scores.hierarchy = Math.min(20, s);
  }

  // ---- 2. 信息密度 density ----
  {
    const blocks = countClass(html, 'block-title');
    const anchors = countClass(html, 'mofang') + (html.match(/ip-and-anchors|anchor-|点睛/g) || []).length;
    let s = 6;
    if (blocks >= 3) s += 6;        // 多板块
    if (blocks >= 6) s += 2;
    if (blocks > 0) {
      const ratio = anchors / blocks;
      if (ratio <= 0.6) s += 6;     // 点睛图只在重点板块(铁律 2-4个)
      else if (ratio <= 1) s += 2;
      else s -= 4;                  // 装饰堆砌(失败信号)
    }
    scores.density = Math.max(0, Math.min(20, s));
  }

  // ---- 3. 留白呼吸 whitespace ----
  {
    let s = 4;
    if (hasDecl(html, 'padding', 16)) s += 6;
    if (hasDecl(html, 'padding', 24)) s += 3;
    if (hasDecl(html, 'margin', 12)) s += 4;
    if (hasDecl(html, 'gap', 12) || hasDecl(html, 'margin', 20)) s += 3;
    scores.whitespace = Math.min(20, s);
  }

  // ---- 4. 一致性 consistency（只罚内联 slop 杂色，调色板色不算）----
  {
    const inlineHex = collectInlineHex(html);
    let s = 6;
    const sem = ['c-problem', 'c-main', 'c-supplement', 'c-done'].filter((c) => countClass(html, c) > 0).length;
    s += Math.min(6, sem * 2);       // 语义色类使用
    if (inlineHex.length === 0) s += 8;     // 无内联硬编码杂色（最佳）
    else if (inlineHex.length <= 4) s += 4;
    else if (inlineHex.length <= 8) s += 0;
    else s -= 6;                     // 大量内联杂色 = slop
    scores.consistency = Math.max(0, Math.min(20, s));
  }

  // ---- 5. 中文可读性 readability（lang + 字体栈 + 无极小字滥用 + 含中文）----
  {
    let s = 0;
    if (/lang\s*=\s*["']?zh/i.test(html)) s += 6;        // lang=zh / zh-CN
    if (hasFontFamily(html)) s += 6;                      // 声明了字体栈
    if (/[一-龥]/.test(html)) s += 4;                     // 文件含中文字形
    const sizes = collectFontSizes(html);
    const minSize = sizes.length ? sizes[0] : 99;
    if (minSize >= 12) s += 4;        // 无 <12px 极小字滥用（标签允许到 12）
    scores.readability = Math.min(20, s);
  }

  const total = Object.values(scores).reduce((a, b) => a + b, 0);
  const passed = total >= 90;

  console.log('🎨 美学评审雷达（5 维 × 20 = 100）');
  console.log('────────────────────────────────');
  for (const [k, v] of Object.entries(scores)) {
    const bar = '█'.repeat(Math.round(v / 2)) + '░'.repeat(10 - Math.round(v / 2));
    console.log(`  ${k.padEnd(11)} ${String(v).padStart(2)}/20  ${bar}`);
  }
  console.log('────────────────────────────────');
  console.log(`  总分: ${total}/100  ${passed ? '✅ 过门控(≥90)' : '⛔ 未过门控(<90,阻止交付)'}`);

  const report = { version: 1, file: htmlPath, scores, total, passed, gate: 90 };
  if (jsonOut) {
    fs.mkdirSync(require('path').dirname(jsonOut), { recursive: true });
    fs.writeFileSync(jsonOut, JSON.stringify(report, null, 2) + '\n');
  }
  process.exit(passed ? 0 : 1);
})();
