#!/usr/bin/env node
/**
 * verify.cjs · hanzi-infographic-skill
 * 视觉 + 美学双重门控（技术部分自动查，美学部分按 qa-checklist.md 人工过）。
 * 用法：
 *   node scripts/verify.cjs <index.html> <output.png> [--min-sections N] [--min-height PX]
 * 退出码 1 = 未通过（阻止交付）。
 */
const fs = require('fs');

function pngSize(buf) {
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error('不是有效 PNG 文件');
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
}

// 统计所有顶层面板（标题区 + 区块标签 + 区块标题），作为"板块完整性"判据
function countSections(html) {
  const re = /class="(block-title|sec-label|title-area)"/g;
  let n = 0, m;
  while ((m = re.exec(html)) !== null) n++;
  return n;
}

(async () => {
  const htmlPath = process.argv[2];
  const pngPath = process.argv[3];
  const args = process.argv.slice(4);
  let minSections = 0, minHeight = 2400;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--min-sections') minSections = parseInt(args[++i] || '0', 10);
    if (args[i] === '--min-height') minHeight = parseInt(args[++i] || '2400', 10);
  }
  if (!htmlPath || !pngPath) {
    console.error('用法: node verify.cjs <index.html> <output.png> [--min-sections N] [--min-height PX]');
    process.exit(2);
  }

  let fails = 0;

  // 1. 板块数完整（对齐全面性铁律）
  const html = fs.readFileSync(htmlPath, 'utf8');
  const sec = countSections(html);
  console.log('📋 源板块数 (.block-title):', sec);
  if (minSections && sec < minSections) {
    console.error(`❌ FAIL 板块数不足: ${sec} < ${minSections}（全面性铁律）`);
    fails++;
  }

  // 2. PNG 尺寸 + 非纯色/非空图
  let dim;
  try {
    dim = pngSize(fs.readFileSync(pngPath));
  } catch (e) {
    console.error('❌ FAIL', e.message);
    process.exit(1);
  }
  console.log('🖼️  PNG 尺寸:', `${dim.w}x${dim.h}`);
  if (dim.h < minHeight) {
    console.error(`❌ FAIL 高度不足: ${dim.h} < ${minHeight}（内容可能被截断）`);
    fails++;
  }
  if (dim.w < 600) {
    console.error(`❌ FAIL 宽度异常: ${dim.w}`);
    fails++;
  }
  const size = fs.statSync(pngPath).size;
  if (size < 5000) {
    console.error(`❌ FAIL PNG 过小 (${size} bytes) 疑似纯色/空图`);
    fails++;
  }

  if (fails > 0) {
    console.error('\n⛔ 技术门控未通过，阻止交付。修复后重渲染。');
    process.exit(1);
  }
  console.log('\n✅ 技术门控通过。');
  console.log('⚠️  美学门控（不 PPT 化 / 不模板堆砌 / 墨方承担动作非装饰 / 中文清晰）请按 references/qa-checklist.md 人工过一遍。');
})();
