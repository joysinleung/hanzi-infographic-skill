#!/usr/bin/env node
/**
 * batch-render.cjs · hanzi-infographic-skill
 * 批量渲染 + job-state 断点续渲（借鉴 rachel-digital-human-production 的 job-state.json 思路）。
 *
 * 设计要点：
 *  - 只启动一次 Chromium，顺序渲染所有任务（避免逐个启动的重复开销）。
 *  - 全程写 job-state.json：每个任务的状态（pending/rendering/done/failed）、
 *    尝试次数、错误、产物尺寸、渲染时间都留痕 → 失败可精准续渲，不重复付费。
 *  - 支持 --resume：已 done 的跳过，只重跑 pending/failed。
 *  - 任一失败不中断整体，最后按是否有 failed 决定退出码。
 *
 * 用法：
 *   NODE_PATH=/Users/joysinleung/.workbuddy/binaries/node/workspace/node_modules \
 *   /Users/joysinleung/.workbuddy/binaries/node/versions/22.22.2/bin/node \
 *     scripts/batch-render.cjs <manifest.json> [--resume]
 *
 *   manifest.json 结构：
 *   {
 *     "theme": "swiss-orange",            // 全局默认主题（可被每任务 theme 覆盖）
 *     "jobs": [
 *       { "id": "review-0722",            // 必填，作状态键与产物名
 *         "html": "/abs/index.html",      // 必填
 *         "out": "/abs/out.png",          // 必填
 *         "theme": "pop-lab" },           // 可选，覆盖全局
 *       ...
 *     ]
 *   }
 *
 *   --dir 模式（便捷）：把某目录下所有子目录里的 index.html 当作任务
 *     scripts/batch-render.cjs --dir <目录> [--resume]
 *     → 每个子目录渲染为 <子目录>/<子目录名>.png
 *
 * 依赖：playwright（managed node workspace）+ Chromium（PLAYWRIGHT_BROWSERS_PATH 默认已缓存）
 */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const SKILL_VERSION = '0.2.1';

function loadManifest(argv) {
  const args = argv.slice(2);
  let resume = false;
  let manifestPath = null;
  let dir = null;
  for (const a of args) {
    if (a === '--resume') resume = true;
    else if (a.startsWith('--dir=')) dir = a.slice('--dir='.length);
    else if (a.startsWith('--')) continue;
    else if (!manifestPath) manifestPath = a;
  }
  // 处理 --dir <目录> 的位置参数形式
  const dirIdx = args.indexOf('--dir');
  if (dirIdx >= 0 && args[dirIdx + 1] && !args[dirIdx + 1].startsWith('--')) dir = args[dirIdx + 1];

  if (dir) {
    return { resume, dirMode: true, dir, manifest: buildDirManifest(dir) };
  }
  if (!manifestPath) {
    console.error('用法: node batch-render.cjs <manifest.json | --dir <目录>> [--resume]');
    process.exit(2);
  }
  const raw = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  return { resume, dirMode: false, manifestPath, manifest: raw };
}

function buildDirManifest(dir) {
  const abs = path.resolve(dir);
  if (!fs.existsSync(abs)) { console.error('❌ 目录不存在:', abs); process.exit(2); }
  const jobs = [];
  for (const entry of fs.readdirSync(abs, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const html = path.join(abs, entry.name, 'index.html');
    if (!fs.existsSync(html)) continue;
    jobs.push({
      id: entry.name,
      html,
      out: path.join(abs, entry.name, entry.name + '.png'),
    });
  }
  return { jobs };
}

function statePath(o) {
  // 状态文件按 manifest 文件名隔离，避免同目录不同 manifest 互相污染 job-state
  if (o.dirMode) return path.join(path.resolve(o.dir), 'job-state.json');
  const base = path.basename(o.manifestPath).replace(/\.json$/i, '');
  return path.join(path.dirname(path.resolve(o.manifestPath)), base + '.job-state.json');
}

function loadState(sp) {
  if (fs.existsSync(sp)) {
    try { return JSON.parse(fs.readFileSync(sp, 'utf8')); } catch (e) { /* corrupt → rebuild */ }
  }
  return null;
}

function initState(manifest) {
  const now = new Date().toISOString();
  return {
    skill: 'hanzi-infographic-skill',
    version: SKILL_VERSION,
    created_at: now,
    updated_at: now,
    global_theme: manifest.theme || 'swiss-orange',
    jobs: (manifest.jobs || []).map((j) => ({
      id: j.id,
      html: path.resolve(j.html),
      out: path.resolve(j.out),
      theme: j.theme || manifest.theme || 'swiss-orange',
      status: 'pending',
      attempts: 0,
      error: null,
      rendered_at: null,
      bytes: null,
      width: null,
      height: null,
    })),
  };
}

function saveState(sp, state) {
  state.updated_at = new Date().toISOString();
  fs.writeFileSync(sp, JSON.stringify(state, null, 2), 'utf8');
}

async function renderOne(browser, job) {
  // 每个任务独立 page：避免某个坏文件触发 chrome-error 后污染后续任务的导航状态
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 }, deviceScaleFactor: 2 });
  try {
    const fileUrl = 'file://' + job.html;
    await page.goto(fileUrl, { waitUntil: 'load' });
    if (job.theme) {
      await page.evaluate((t) => {
        const h = document.documentElement;
        if (h) h.setAttribute('data-theme', t);
      }, job.theme);
      await page.waitForTimeout(120);
    }
    await page.evaluate(async () => {
      if (document.fonts && document.fonts.ready) { try { await document.fonts.ready; } catch (e) {} }
    });
    await page.waitForTimeout(300);
    const el = await page.$('#cover');
    if (!el) throw new Error('未找到 #cover 选择器: ' + job.html);
    const box = await el.boundingBox();
    await el.screenshot({ path: job.out, scale: 'device' });
    const stat = fs.statSync(job.out);
    return {
      bytes: stat.size,
      width: Math.round(box.width * 2),
      height: Math.round(box.height * 2),
    };
  } finally {
    await page.close();
  }
}

(async () => {
  const { resume, manifest, manifestPath, dirMode, dir } = loadManifest(process.argv);
  if (!manifest || !manifest.jobs || !manifest.jobs.length) {
    console.error('❌ manifest 无有效 jobs');
    process.exit(2);
  }
  const sp = statePath({ dirMode, dir, manifestPath });
  const manifestIds = (manifest.jobs || []).map((j) => j.id).sort().join(',');
  let state = loadState(sp);
  const stateIds = state ? state.jobs.map((j) => j.id).sort().join(',') : null;
  if (!state || stateIds !== manifestIds) {
    // 无状态文件 / 任务集变化 → 重建（已 done 且 html/theme 未变者保留，支持续渲）
    const fresh = initState(manifest);
    if (state) {
      const oldById = Object.fromEntries(state.jobs.map((j) => [j.id, j]));
      for (const j of fresh.jobs) {
        const old = oldById[j.id];
        if (old && old.status === 'done' && old.html === j.html && old.theme === j.theme) {
          j.status = 'done'; j.rendered_at = old.rendered_at; j.bytes = old.bytes;
          j.width = old.width; j.height = old.height; j.attempts = old.attempts || 1;
        }
      }
    }
    state = fresh;
  }
  saveState(sp, state);

  const browser = await chromium.launch();
  let rendered = 0, skipped = 0, failed = 0;

  try {
    for (const job of state.jobs) {
      if (resume && job.status === 'done') { skipped++; console.log('⏭️  跳过(已done):', job.id); continue; }
      job.status = 'rendering';
      job.attempts = (job.attempts || 0) + 1;
      saveState(sp, state);
      console.log('🔄 渲染中 [' + job.attempts + ']:', job.id, '→', job.out);
      try {
        const info = await renderOne(browser, job);
        job.status = 'done';
        job.error = null;
        job.rendered_at = new Date().toISOString();
        job.bytes = info.bytes;
        job.width = info.width;
        job.height = info.height;
        job.theme = job.theme; // keep
        saveState(sp, state);
        rendered++;
        console.log('   ✅ done:', (info.bytes / 1024).toFixed(1) + ' KB', info.width + 'x' + info.height);
      } catch (e) {
        job.status = 'failed';
        job.error = e.message;
        saveState(sp, state);
        failed++;
        console.error('   ❌ failed:', job.id, '|', e.message);
        // 不中断，继续下一个
      }
    }
  } finally {
    await browser.close();
  }

  console.log('\n=== 批量渲染汇总 ===');
  console.log('  完成:', rendered, '| 跳过(done):', skipped, '| 失败:', failed);
  console.log('  状态文件:', sp);
  if (failed > 0) {
    console.log('⚠️  有失败任务，运行同一命令（可加 --resume）续渲。');
    process.exit(1);
  }
  console.log('🎉 全部完成。');
})().catch((e) => {
  console.error('❌ 批量渲染崩溃:', e.message);
  process.exit(1);
});
