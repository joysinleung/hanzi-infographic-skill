# Evals · hanzi-infographic-skill

中文信息图渲染流水线的发布前门禁（确定性渲染保中文精度）。

## 渲染门禁
- `scripts/render.cjs` 能将示例 HTML 经 Playwright 渲染为高清 PNG，每个汉字像素级清晰、可复现（同输入同输出）。
- `scripts/verify.cjs` 校验输出图中文无糊字/错字、版式无溢出。

## 质量门禁
- `scripts/aesthetic-radar.cjs` 能对产出打审美分（布局/配色/信息密度），分数可解释。
- `references/qa-checklist.md` 所列项（中文清晰 / 锚点配图准位 / 不平均用力）逐条通过。
- `references/layouts.md` 布局库、`references/styles.md` 风格模式可被模板组合调用。

## 合规门禁
- `references/ip-and-anchors.md` 视觉 IP（墨方）与认知锚点配图仅用 SVG 手绘风确定性实现，不走生图（规避糊字）。
- 借鉴来源（baoyu / ian-xiaohei）合规边界在 SKILL.md 已声明，不得越界搬运他人受保护资产。

## 回归红线
- 不得引入生图模型替代确定性渲染（会糊中文）。
- 不得让锚点配图在非重点板块平均用力。
