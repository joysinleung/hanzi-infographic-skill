---
name: hanzi-infographic-skill
description: 生成中文数据密集型信息图（复盘全景图 / 工作台账 / 知识卡 / 文章导读长图 / 项目看板）。采用 HTML+CSS
  确定性渲染为高清 PNG（中文 100% 清晰），融合 baoyu(MIT) 布局×风格模式语言、ian-xiaohei(MIT)
  视觉IP与认知锚点配图法、以及海哥《中文优化设计规范包》（自有）。当用户要"复盘全景图 / 信息图 / 中文长图 / 可视化 / 知识卡 / 工作台账图 /
  公众号文章出图 / 高密度信息大图"时使用。
version: 0.2.1
metadata:
  openclaw:
    homepage: https://github.com/joysinleung/hanzi-infographic-skill
disable: true
---

# 中文数据密集型信息图 Skill（hanzi-infographic-skill）

把"中文长图（数百行 / 多板块 / 海量数据项）"做成 **又全、又准、又有辨识度** 的高清图。专攻 guizang（社交小卡）、baoyu（生图）、小黑（正文单图）都不擅长的空位：**中文数据密集型单页长图**。

## 我们独有的四点（别人没有）

1. **中文长图专精**：为"复盘全景 / 每日台账 / 知识卡 / 文章导读长图 / 项目看板"这类高密度中文内容优化的布局库（见 `references/layouts.md`）。
2. **确定性渲染保中文精度**：HTML+CSS → Playwright → PNG，每个汉字像素级清晰、可复现（同输入同输出），彻底规避生图模型糊字错字。
3. **布局 × 风格可组合但落到可渲染模板**：借 baoyu 的"模式语言"结构，但每个组合都是一份能跑的 HTML 模板，而非一段生图 prompt。
4. **自有视觉 IP（墨方）+ 认知锚点配图（借小黑之道，确定性实现）**：在重点板块（关键决策 / P0 待办）配点睛小插画，非重点纯文字，不平均用力。IP 与点睛图用 **SVG 手绘风**实现（可控、可复现），不走生图。

## 借鉴来源与合规边界（务必遵守）

| 来源 | 授权 | 借鉴什么 | 边界（红线） |
|------|------|----------|--------------|
| baoyu-infographic | **MIT** | "布局×风格双库可组合"模式语言思想 + 21 布局 / 22 风格词汇 | 不复制其生图 prompt；全部用可渲染 HTML 模板实现，描述中文原创重写 |
| ian-xiaohei-illustrations（小黑） | **MIT** | 视觉 IP 体系 + 认知锚点配图策略 + 四色语义 + 美学门控方法论 | **不复用"小黑"形象**，自创"墨方"IP（见 `references/ip-and-anchors.md`） |
| guizang-social-card-skill | **AGPL-3.0** | 只学"HTML 模板 → Playwright → PNG 确定性渲染"工程思想 | 代码 **100% 自写**，不 import、不复制其任何源文件 |
| 《中文优化设计规范包》 | 海哥自有 | 9 配色 + 8 风格 + 中文硬约束 + 100 分门控（地基） | 直接采用，见 `references/styles.md` |

> 已上架 SkillHub（`skillhub.json` 含 credits 声明）；SKILL.md 与 README 已注明："布局×风格模式语言借鉴 baoyu(MIT)、视觉IP/认知锚点借鉴 ian-xiaohei(MIT)、中文规范包为海哥自有"，并附 MIT 版权声明。

## 铁律（不可绕过）

1. **全面、不省内容**：图必须覆盖源文档全部板块，宁可增加高度也不得删减数据（对齐"每日复盘全景图"自动化的硬约束）。验收脚本会比对"板块数"，缺板块直接 FAIL。
2. **中文必须清晰**：正文 ≥ 24px（规范包硬约束），渲染前 `document.fonts.ready` 必须 await；不依赖网盘字体，缺字明确失败而非出缺字图。
3. **不照搬他人 IP 形象**：墨方必须自创，不得画出小黑（黑豆+白点眼+细腿）的样子。
4. **AGPL 只学思想**：guizang 的代码一行不搬。

## 何时用 / 何时不用

**用**：复盘全景图、每日/每周工作台账、知识卡、公众号/技术文章导读长图、项目看板、高密度中文信息大图。
**不用**：社交小卡（用 guizang）、纯正文手绘配图（用 小黑）、PPT 幻灯片（用 slide skill）、需要位图质感的生图海报。

## 工作流程（8 步）

### 1. 收集源（Intake）
拿源文档路径或粘贴内容。确认：主题、日期、板块清单（**用户给的不全要追问，不得自行删减**）、期望风格（默认 `swiss-orange` 瑞士橙）。

### 2. 分析 → 选布局 × 风格
- 看 `references/layouts.md` 选布局：复盘全景用 `daily-review-panorama`；工作台账用 `work-ledger`；知识卡用 `knowledge-card`；公众号/技术文章导读用 `article-digest`；高密度指南用 `dense-modules`（规划中）。
- 看 `references/styles.md` 选风格主题：数据/工程感 → `swiss-orange` / `pop-lab`；温润/人文 → `morandi`。
- 组合自由，但 MVP 已验证：`daily-review-panorama × swiss-orange` 是复盘全景默认组合。

### 3. 认知锚点标注（借小黑之道）
读 `references/ip-and-anchors.md`：在 **2-4 个重点板块**（关键决策 / P0 待办 / 风险警示）标注配墨方点睛 SVG，非重点纯文字。点睛图只落重点，不堆砌。

### 4. 复制种子模板
- 基础骨架：`assets/templates/seed.html`（字体、主题变量、基础工具类，100% 自写）。
- 布局模板：`assets/templates/<layout>.html`，复制为任务目录 `index.html`，按注释填内容。任务目录默认 `local-tests/<slug>/`，禁止在 skill 根生成产物。

### 5. 填内容
只改 `<!-- CONTENT -->` 区域与主题属性（`<html data-theme="...">`）。保持 `.block-title` 区块一一对应源章节（全面性铁律）。完成态用 `.c-done`（绿色 `✅`）。

### 6. 渲染（确定性）
```
NODE_PATH=/Users/joysinleung/.workbuddy/binaries/node/workspace/node_modules \
/Users/joysinleung/.workbuddy/binaries/node/versions/22.22.2/bin/node \
  scripts/render.cjs <task>/index.html <task>/output.png
```
脚本自动 await 字体、截图 `#cover` 节点、打印尺寸。

**批量出图 + 断点续渲**（借鉴 rachel-digital-human-production 的 job-state 思路）：多张图一次性渲染，失败不中断、可续渲。
```
# 清单模式：manifest.json 描述 jobs（id/html/out/theme?）
node scripts/batch-render.cjs <manifest.json>            # 全量渲染
node scripts/batch-render.cjs <manifest.json> --resume   # 只跑 pending/failed，跳过 done
# 目录模式：某目录下每个 */index.html 渲染为 <子目录名>.png
node scripts/batch-render.cjs --dir <目录> [--resume]
```
- 只启动一次 Chromium 顺序渲染（省开销）；状态写入 `<manifest名>.job-state.json`（按 manifest 文件名隔离，避免同目录不同清单互相污染）。
- 每任务独立 page，避免单个坏文件触发 chrome-error 后污染后续任务。
- 状态含 `status(pending/rendering/done/failed)` / `attempts` / `error` / `bytes` / `width` / `height` / `rendered_at`；html 或 theme 变更会自动重置该任务为 pending（保证续渲命中最新源）。
- 任一失败不阻断整体，最后按是否有 failed 决定退出码（全成功 0，有失败 1）。

### 7. 验收（技术 + 美学 + 人工 三重门控）
```
node scripts/verify.cjs <task>/index.html <task>/output.png --min-sections <N> --min-height <px>
node scripts/aesthetic-radar.cjs <task>/index.html [--json <task>/radar.json]
```
- 技术门控（`verify.cjs`）：尺寸合理、非纯色/非黑屏、板块数 = 源章节数（缺则 FAIL）。
- 美学门控（`aesthetic-radar.cjs`，源自 huashu-design 5 维评审）：hierarchy/density/whitespace/consistency/readability 五维各 20 分，**总分 < 90 阻止交付**。详见 `references/aesthetic-radar.md`。
- 人工终检：按 `references/qa-checklist.md` 失败信号过一遍（不 PPT 化、不模板堆砌、墨方承担动作非装饰）。
- **< 90 分阻止交付**（100 分门控速记见 qa-checklist）。

### 8. 交付
输出 PNG 路径 + 一句话说明（布局×风格×板块数）。如自动化的执行内核，则此步由自动化调用完成。

## 自带资产

- `assets/templates/seed.html` — 通用种子（CSS 变量 + 基础类 + 字体声明）
- `assets/templates/daily-review-panorama.html` — 复盘全景模板（含 07-23 完整 fixture）
- `assets/templates/work-ledger.html` — 工作台账模板（概览+分组任务+待跟进，含 07-24 fixture）
- `assets/templates/knowledge-card.html` — 知识卡模板（定义+要点+类比+来源，含 agent-security-check fixture）
- `assets/templates/article-digest.html` — 文章导读长图模板（来源kicker+标题+定调+逻辑链flow+关键数据+金句quote+footer，含仓颉蒸馏术公众号fixture）
- `assets/ip/mofang.svg` — 墨方 IP（基础形 + 动作原子：搬运/警示/守门/记录）
- `scripts/render.cjs` — Playwright 确定性渲染（单图）
- `scripts/batch-render.cjs` — 批量渲染 + job-state 断点续渲（借鉴 rachel-digital-human-production）
- `scripts/verify.cjs` — 视觉 + 美学验收（技术门控）
- `scripts/aesthetic-radar.cjs` — 5 维美学评审雷达（源自 huashu-design，美学门控自动化，<90 阻止交付）
- `references/layouts.md` / `styles.md` / `ip-and-anchors.md` / `qa-checklist.md` / `aesthetic-radar.md`

## 与"每日复盘全景图"自动化的关系

海哥已建 `automation-1784863985674`（每天 00:10 生成前一天复盘全景图）。**本 skill 已接入为该自动化的执行内核**——自动化 prompt 已改为复制 `daily-review-panorama.html` 模板、填真实复盘、调用 `render.cjs`+`verify.cjs`，质量门控由 skill 兜底（全面性铁律防回归）。
