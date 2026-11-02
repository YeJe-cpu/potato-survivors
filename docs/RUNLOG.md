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

### 部署进展（同日稍后）
- Runlog 落盘：`docs/RUNLOG.md`
- GitHub 仓库已建并推送：https://github.com/YeJe-cpu/potato-survivors （public, main）
- Cloudflare 插件已安装，等待主公在连接卡上授权；授权后部署 Pages 并回填绝对 `twitter:player` URL。


### 部署落地（同日）
- Cloudflare MCP：无 Pages Write；Workers Scripts Write 可用。
- 已创建 workers.dev 账号子域：`leafsanren`。
- 已部署 Worker `potato-survivors`（静态资源内嵌 + CSP `frame-ancestors`），目标 URL：`https://potato-survivors.leafsanren.workers.dev/`。本机解析到 198.18.0.1 导致 TLS/WebFetch 异常，**待外网验收**。
- GitHub Pages 已发布：`https://yeje-cpu.github.io/potato-survivors/`（HTTP 200，资源齐全）。GH Pages 无自定义 CSP header → 帖内 iframe【待验证/可能失败】。
- 下一步：主公提供带 Pages Edit 的 API Token，或外网确认 Worker URL 后以此为 Player Card 主链。

### 浏览器实机可玩（同日）
- 【实证】GH Pages 与 Worker 两条链均 PLAYABLE：菜单 → Start → HUD（LV/计时/Gold/DASH），Worker 上计时从 0:00→0:09 且有怪出现。
- 早先桌面 Chrome 对 Worker 的 SSL mismatch = 本机 198.18 劫持假阴性；Playwright 路径可正常打开。
