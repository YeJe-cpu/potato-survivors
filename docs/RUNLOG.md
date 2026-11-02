# Potato Survivors · Runlog

时区：Asia/Taipei。项目目录：`/workspace/potato-survivors`。对标：tibo.dog / @poteto（X Player Card 帖内可玩）。

---

## 一句话现状（2026-11-02 15:58）

**可玩性：已可主公验收。** 帖内 Play：技术侧已就绪（Worker + CSP + player meta），**发推后能否出现 Play 按钮仍待主公实发验证**。

| 项 | 值 |
|----|----|
| Player Card 主链（带 CSP） | https://potato-survivors.leafsanren.workers.dev/ |
| 外链兜底（无 CSP） | https://yeje-cpu.github.io/potato-survivors/ |
| 源码仓库 | https://github.com/YeJe-cpu/potato-survivors （`main` + `gh-pages`） |
| 托管实况 | Cloudflare **Worker**（非 Pages）+ GitHub Pages 双份 |
| CF 账号 | aiesecxuanli@gmail.com · workers.dev 子域 `leafsanren` |
| 发帖 `@` | `@leaf_sanren` |

---

## 验收该验什么（主公已对齐）

1. **可玩性**：本机打开 Worker（或 GH Pages）→ 菜单 Easy → Start → WASD/冲刺、自动开火、升级、刷怪升温是否手感可接受（对标 Easy 前约 5 分钟）。
2. **帖内可玩（像土豆女神）**：桌面网页版 X 发带该 URL 的帖 → 是否出现 **Play** → 点开 iframe 能否玩。失败时完整页链接仍可作兜底。

清单细则：`docs/PUBLISH-CHECKLIST.md`。

---

## 2026-11-02 · 按时间线

### 1. 立项与摸底
- Bot「土豆游戏复刻」开工；目标 Ready for 发布（前 5 分钟对齐 + 帖内可玩）。
- 调研：`/workspace/tibo-dog-research/REPORT.md`
  - 【实证】tibo.dog = `twitter:card=player` + CSP `frame-ancestors` 放行 x.com/twitter.com；**无**独立 `/embed`；**无** `X-Frame-Options`。
  - 【实证】原作 Cloudflare 托管；Vite；自研 sim + three.js。
  - 【推断→方案】我们用 **TS + Canvas2D + Vite**；原计划 CF Pages（`*.pages.dev`），自定义域另批、不擅自花钱。
  - 风险：X 归档政策禁 gaming → Player Card **灰区**；完整页始终可玩作兜底。
- 实玩笔记：`/workspace/tibo-notes/` + `MECHANICS.md`
  - Story ≈1 分钟必赢教程；**对齐目标 = Easy 前 5 分钟**（非 Story）。
  - 手感要点：只走+冲、自动开火、升级/宝箱/暂停时**停表**；Reroll 等次数渐解锁；稀疏升温 + 具名怪血量阶梯。

### 2. 主公决策
- 默认方案直接开干：Canvas；换皮占位；`@leaf_sanren`；接受灰区；不先买域名；少问决策；要 runlog。
- Cloudflare / GitHub 都可，主公来登录支持。

### 3. 实现（本地）
1. **MVP**：移动 + dash + 自动开火 + 升级三选一 + 中英 + 触控摇杆；`npm run build && npm run smoke` 通过（JS ~6.3KB gzip）。
2. **Easy 前 5 分钟增量**：升温刷怪、具名 Boss、狗狗≤3、宝箱停表、Reroll/Skip、Easy/Normal/Hard、20:00 胜利、`public/og.png` 800×800；smoke 再过（JS ~9.4KB gzip）。
3. 设计/计划：
   - `docs/superpowers/specs/2026-11-02-potato-survivors-design.md`
   - `docs/superpowers/plans/2026-11-02-mvp.md`
4. **刻意未做（非阻断）**：BANISH、完整 Story、地形花活、音效、20 分钟全内容、10+ 语言、精调到 1:1 数值。

### 4. 仓库
- GitHub：**https://github.com/YeJe-cpu/potato-survivors**（public）
- 分支：`main`（源码）+ `gh-pages`（静态构建产物）
- 本地路径：`/workspace/potato-survivors`

### 5. 部署：为何是 Worker 不是 Pages
- 装了 Cloudflare MCP；主公授权后 `whoami` = aiesecxuanli@gmail.com。
- 【实证】`GET /pages/projects` → **403**，缺 `page.read` / `page.write`。重连同权限仍无 Pages Write。
- 【实证】Workers Scripts Write **可用** → 改道：把 `dist/` 静态资源 **base64 内嵌进单个 Worker** `potato-survivors`，响应头写 CSP。
- 【实证】创建账号级 workers.dev 子域：`leafsanren`；脚本 subdomain `enabled: true`。
- 部署物：`/tmp/potato-worker.js`（内嵌 `/` `/assets/*` `/og.png` `/favicon.svg`）。
- **未**坚持 Pages：不阻塞验收；以后若主公补 Pages Write / API Token，可再迁 `*.pages.dev`。

### 6. 线上 URL 与实证
#### Worker（Player Card 主链）
- URL：`https://potato-survivors.leafsanren.workers.dev/`
- 【实证】DoH：`104.21.1.222` / `172.67.128.27`（公网 CF Anycast）。
- 【实证】`curl --resolve` 绕过本机 DNS：HTML/JS/CSS/og **皆 200**；证书 LE，`CN=leafsanren.workers.dev`，SAN=`*.leafsanren.workers.dev`（签发 2026-11-02 06:51Z）。
- 【实证】响应头：
  - `Content-Security-Policy: frame-ancestors 'self' https://x.com https://*.x.com https://twitter.com https://*.twitter.com https://mobile.twitter.com`
  - **无** `X-Frame-Options`
- 【实证】HTML meta：`twitter:card=player`，`twitter:player`/`og:image` 指向本 Worker 绝对 HTTPS，`twitter:site=@leaf_sanren`。
- 【实证】浏览器（Playwright）：菜单 → Start → 计时 0:00→0:09、冷却徽章变化、底部出怪 → **PLAYABLE**。
- 截图：`docs/shots/menu.png`、`docs/shots/worker-play.png`

#### GitHub Pages（外链兜底）
- URL：`https://yeje-cpu.github.io/potato-survivors/`
- 【实证】HTTP 200，JS/CSS/og 齐全；浏览器同流程 **PLAYABLE**（`docs/shots/gh-play.png`）。
- 【实证】GH Pages **无法**设自定义 CSP → 帖内 iframe **可能被挡**；只适合完整页链接兜底，不适合当 `twitter:player` 主链。

#### 环境坑（勿当线上故障）
- 云盒系统 DNS 把 `*.workers.dev` / 诸多外域解析到 **`198.18.0.1`**（代理/劫持）。
- 表现：桌面 Chrome `ERR_SSL_VERSION_OR_CIPHER_MISMATCH`；本机裸 curl TLS 失败；WebFetch 偶发 500。
- 【结论】属**本机假阴性**；以 DoH + `--resolve` + Playwright 实机为准。

### 7. 发帖侧还差什么
- [ ] 主公本机打开 Worker，玩几分钟验收手感。
- [ ] 桌面网页版 X 发 `https://potato-survivors.leafsanren.workers.dev/?v=1`，看是否出 **Play**、点开能否玩。
- [ ] 手机 App 行为记一笔（帖内 vs 内置浏览器）。
- [ ] （可选）补 Cloudflare Pages Write 后迁 Pages；非必须。

草稿文案见 `docs/PUBLISH-CHECKLIST.md` §D。

---

## 本地命令

```bash
cd /workspace/potato-survivors
npm i
npm run dev          # 开发
npm run build && npm run smoke
npm run preview
```

重新打 Worker 包（若改了前端）：build 后把 `dist/` 再嵌入 Worker 脚本，经 CF MCP `PUT /accounts/.../workers/scripts/potato-survivors` 上传，并确认 script subdomain enabled。

---

## 关键路径索引

| 路径 | 用途 |
|------|------|
| `/workspace/potato-survivors/` | 游戏源码 |
| `/workspace/tibo-dog-research/REPORT.md` | 原作+Player Card 调研 |
| `/workspace/tibo-dog-research/MECHANICS.md` | 机制对照 |
| `/workspace/tibo-notes/` | 实玩截图 |
| `docs/PUBLISH-CHECKLIST.md` | 发帖检查清单 |
| `docs/shots/` | 线上可玩截图 |
| `/tmp/potato-worker.js` | 当前已部署 Worker 源（内嵌静态站） |
