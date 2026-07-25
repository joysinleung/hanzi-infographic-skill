# 布局库（Layouts）

> 我们独有：为**中文数据密集长图**优化的布局。自研 4 个主力布局 + 借鉴 baoyu(MIT) 的 21 布局词汇表作为扩展选择器（描述为中文原创重写，不复制 baoyu 生图 prompt）。

## 一、自研主力布局（MVP 已落地）

### L1 · `daily-review-panorama`（复盘全景）
- **适用**：每日/每周复盘全景图（海哥每日复盘自动化专用）。
- **结构**（自上而下，板块可增不可减）：
  1. 标题区（kicker + 主标题 + 副标题：日期·时段·一句话定性）
  2. 三条主线（sec-grid 3 列卡片）
  3. 全天时间线（timeline，左时间右描述）
  4. 关键产出（skill-grid 编号列表）
  5. 内容/体系产出（tag-row 标签流）
  6. 公司工作 & 个人项目（two-col 双栏卡片，完成态绿色 `✅`）
  7. 研究/专项（tag-row）
  8. 灵感墙（tag-row 多行）
  9. 关键决策/认知（hl2 双栏编号列表）
  10. 复盘感想（feel 圆点列表，含 ⚠️ 注意项）
  11. 后续建议（prio 三栏 P0/P1/P2）
  12. 结语 quote + 页脚
- **铁律**：板块数须 = 源复盘记录的章节数，缺则验收 FAIL。

### L2 · `work-ledger`（工作台账）
- **适用**：每日/每周工作记录长图、运维台账。
- **结构**：日期头 + 按"公司工作 / 个人项目 / 研究"分组的两栏卡片（沿用 L1 的 `.two-col` + `.card`），完成态 `.c-done` 绿色。
- **差异**：比复盘更偏"条目清单"，弱化时间线，强化"状态标记"（✅ 完成 / 🔄 进行 / ⏳ 待办）。

### L3 · `knowledge-card`（知识卡）
- **适用**：单概念/单方法论讲解图（如"什么是纵深防御""Skill 工程范式"）。
- **结构**：大标题 + 一句话定义 + 3-5 个要点模块（每个模块 = 概念 + 解释 + 数据/例子）+ 1 个墨方点睛图（在核心概念处）。
- **差异**：板块少（4-6 个）、留白可多于 L1/L2，但仍用中文规范包字号下限。

### L4 · `dense-modules`（高密度模块，自写版）
- **适用**：购买指南、避坑大全、多维度对比、参数速查（高密度信息大图）。
- **结构**：6-7 个带坐标编号（MOD-01…MOD-07）的模块网格，每模块含具体数据（数字/参数/品牌名），模块边界用粗线/虚框/坐标网格。
- **借鉴**：baoyu `dense-modules` 的"模块原型"思想（Brand/Selection Array、Spec Scale、Deep Dive、Scenario Comparison、ID Tips、Warning Zone、Quick Ref），但模板自写、可渲染。

## 二、扩展布局选择器（baoyu 21 布局词汇 · MIT 借鉴，仅作选词参考）

| 布局 | 最佳场景 | 备注 |
|------|----------|------|
| `linear-progression` | 时间线/流程/教程 | 对应 L1 时间线 |
| `binary-comparison` | A vs B / 前后对比 | |
| `comparison-matrix` | 多因素对比表 | |
| `hierarchical-layers` | 金字塔/优先级层级 | |
| `tree-branching` | 分类/ taxonomy | |
| `hub-spoke` | 中心概念 + 周边 | |
| `structural-breakdown` | 爆炸图/剖面 | |
| `bento-grid` | 多主题概览（baoyu 默认） | |
| `iceberg` | 表面 vs 隐藏 | |
| `bridge` | 问题—方案 | |
| `funnel` | 转化/过滤 | |
| `isometric-map` | 空间关系 | |
| `dashboard` | 指标/KPI | |
| `periodic-table` | 分类集合 | |
| `comic-strip` | 叙事/分镜 | |
| `story-mountain` | 情节弧 | |
| `jigsaw` | 互连部件 | |
| `venn-diagram` | 概念重叠 | |
| `winding-roadmap` | 旅程/里程碑 | |
| `circular-flow` | 循环/周期 | |
| `dense-modules` | 高密度模块（见 L4） | |

> 选用上述任一布局时，请新建一份可渲染 HTML 模板（`assets/templates/<layout>.html`），不要调用 baoyu 的生图 prompt。
