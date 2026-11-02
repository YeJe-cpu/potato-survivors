# Potato Survivors · Runlog

时区：Asia/Taipei。项目：`/workspace/potato-survivors`。对标：tibo.dog / @poteto Player Card。

## 2026-11-02

### 立项与摸底
- Bot「土豆游戏复刻」创建；目标 Ready for 主公发布（前 5 分钟对齐 + 帖内可玩）。
- 调研简报：`/workspace/tibo-dog-research/REPORT.md`
  - 【实证】tibo.dog 用 `twitter:card=player` + CSP `frame-ancestors` 放行 x.com；无独立 `/embed`；无 X-Frame-Options。
  - 【实证】托管 Cloudflare；Vite；自研 sim + three.js 绘制。
  - 推荐：我们用 TS + Canvas2D + Vite → CF Pages（`*.pages.dev`）；自定义域另批。
  - 风险：归档政策禁 gaming（灰区）。
- 浏览器实玩：`/workspace/tibo-notes/` + `MECHANICS.md`
  - Story ≈1 分钟必赢教程；**对齐目标是 Easy** 前 5 分钟。
  - 手感：只走+冲、自动开火、升级/宝箱/暂停时计时停；Reroll 等次数渐解锁。

### 主公决策
- 批准默认方案：CF Pages + Canvas；换皮占位；`@leaf_sanren`；接受灰区；不先买域名。
- 明确：少问决策，直接搞到可验收发布。

### 实现
1. **MVP**：移动+dash+自动开火+升级三选一+中英+触控摇杆；build/smoke 通过（JS ~6.3KB gzip）。
2. **前 5 分钟对齐增量**：升温刷怪、具名 Boss、狗狗≤3、宝箱停表、Reroll/Skip、Easy/Normal/Hard、20:00 胜利、`public/og.png` 800×800；build/smoke 通过（JS ~9.4KB gzip）。
3. **发布清单草稿**：`docs/PUBLISH-CHECKLIST.md`（待填真实部署 URL）。

### 设计/计划文档
- `docs/superpowers/specs/2026-11-02-potato-survivors-design.md`
- `docs/superpowers/plans/2026-11-02-mvp.md`

### 当前缺口（部署前）
- 尚未上线 HTTPS；`twitter:player` 仍为相对 `/`，部署后改绝对 URL。
- BANISH、Story、地形、音效、精调数值未做。
- Cloudflare 连接待装；备选 GitHub 仓库 + Pages（CSP header 需额外处理）。

### 本地命令
```bash
cd /workspace/potato-survivors
npm i && npm run build && npm run smoke
npm run preview   # 或 dev
```
