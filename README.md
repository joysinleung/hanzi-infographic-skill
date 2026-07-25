# hanzi-infographic-skill

> 生成**中文数据密集型信息图**（复盘全景图 / 工作台账 / 知识卡 / 项目看板）。
> 采用 HTML+CSS 确定性渲染为高清 PNG（中文 100% 清晰），融合 baoyu(MIT) 布局×风格模式语言、ian-xiaohei(MIT) 视觉 IP 与认知锚点配图法、以及海哥《中文优化设计规范包》（自有）。

## 为什么需要它

guizang（社交小卡）、baoyu（生图）、小黑（正文单图）都不擅长**中文数据密集型单页长图**——成百上千字、十几个板块、海量数据项，还要中文像素级清晰、可复现。本 skill 专攻这个空位。

## 我们独有的四点（别人没有）

1. **中文长图专精**：为"复盘全景 / 每日台账 / 知识卡 / 项目看板"高密度中文内容优化的布局库。
2. **确定性渲染保中文精度**：HTML+CSS → Playwright → PNG，每个汉字像素级清晰、可复现（同输入同输出），彻底规避生图模型糊字错字。
3. **布局 × 风格可组合，且落到可渲染模板**：借 baoyu 的"模式语言"结构，但每个组合都是一份能跑的 HTML 模板，而非一段生图 prompt。
4. **自有视觉 IP「墨方」+ 认知锚点配图**：在重点板块（关键决策 / P0 待办）配点睛小插画，非重点纯文字，不平均用力。IP 用 SVG 手绘风实现（可控、可复现），不走生图。

## 风格可选（同一份源，多套主题）

| 主题 | 观感 | 适用 |
|------|------|------|
| `swiss-orange` | 米白网格 + 高饱和橙 + 硬切 | 复盘全景 / 数据台账（默认） |
| `pop-lab` | 蓝图纸点阵 + 坐标编号 MOD-xx + 荧光粉警示 | 高密度指南 / 工程感 |
| `morandi` | 莫兰迪暖灰 + 手绘感边角 + 低饱和棕橙 | 知识卡 / 人文感想 |

渲染时切换：`node scripts/render.cjs index.html out.png --theme=pop-lab`

## 借鉴来源与合规边界

| 来源 | 授权 | 借鉴什么 | 边界 |
|------|------|----------|------|
| baoyu-infographic | **MIT** | "布局×风格双库可组合"模式语言思想 | 不复制生图 prompt；全部用可渲染 HTML 模板实现，描述中文原创重写 |
| ian-xiaohei-illustrations（小黑） | **MIT** | 视觉 IP 体系 + 认知锚点配图策略 + 四色语义 + 美学门控 | **不复用"小黑"形象**，自创"墨方"IP |
| guizang-social-card-skill | **AGPL-3.0** | 只学"HTML → Playwright → PNG 确定性渲染"工程思想 | 代码 100% 自写，不 import、不复制源文件 |
| 《中文优化设计规范包》 | 海哥自有 | 9 配色 + 8 风格 + 中文硬约束 + 100 分门控 | 直接采用 |

## 铁律

1. **全面、不省内容**：图必须覆盖源文档全部板块，宁增高度不删数据。验收会比对板块数，缺则 FAIL。
2. **中文必须清晰**：正文 ≥ 24px，渲染前 `document.fonts.ready` 必须 await；缺字明确失败而非出缺字图。
3. **不照搬他人 IP 形象**：墨方必须自创，不得画成小黑（黑豆+白点眼+细腿）。
4. **AGPL 只学思想**：guizang 代码一行不搬。

## 用法

```
# 1. 复制布局模板为任务目录 index.html
cp assets/templates/daily-review-panorama.html <task>/index.html
# 2. 填内容（保持 .block-title 与源章节对应，设 <html data-theme> 选风格）
# 3. 渲染
NODE_PATH=/Users/joysinleung/.workbuddy/binaries/node/workspace/node_modules \
/Users/joysinleung/.workbuddy/binaries/node/versions/22.22.2/bin/node \
  scripts/render.cjs <task>/index.html <task>/output.png [--theme=pop-lab]
# 4. 验收
node scripts/verify.cjs <task>/index.html <task>/output.png --min-sections <N> --min-height <px>
```

## 文件结构

```
hanzi-infographic-skill/
├── SKILL.md
├── README.md
├── LICENSE                      # MIT
├── skillhub.json                # 上架元数据
├── assets/
│   ├── templates/
│   │   ├── seed.html            # 通用种子（主题变量+基础类+字体）
│   │   ├── daily-review-panorama.html  # 复盘全景布局（含 07-23 fixture）
│   │   ├── work-ledger.html     # 工作台账布局
│   │   └── knowledge-card.html  # 知识卡布局
│   └── ip/mofang.svg            # 墨方 IP 展示图（基础形+4 动作原子）
├── scripts/
│   ├── render.cjs               # Playwright 确定性渲染
│   └── verify.cjs               # 视觉+美学双门控
└── references/
    ├── layouts.md               # 布局库（自研 4 布局 + baoyu 21 选择器）
    ├── styles.md                # 风格库（9 配色+8 风格+小黑四色+3 落地主题）
    ├── ip-and-anchors.md        # 墨方 IP + 认知锚点策略
    └── qa-checklist.md          # 技术+美学门控
```

## 与「每日复盘全景图」自动化的关系

海哥已建 `automation-1784863985674`（每天 00:10 生成前一天复盘全景图）。本 skill 即该自动化的执行内核——自动化只需调用 `render.cjs` + `verify.cjs`，质量门控由 skill 兜底。

## License

MIT © joysinleung
