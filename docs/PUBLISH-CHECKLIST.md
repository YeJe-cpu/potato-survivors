## 当前线上（2026-11-02 15:50 Asia/Taipei）

| 用途 | URL | 状态 |
|------|-----|------|
| **Player Card 主链（带 CSP）** | https://potato-survivors.leafsanren.workers.dev/ | 【实证】公网 HTTP 200 + LE 证书 `*.leafsanren.workers.dev` + `frame-ancestors` 含 x.com/twitter.com；本机浏览器因 DNS→198.18 会假阴性 SSL |
| **外链兜底可玩** | https://yeje-cpu.github.io/potato-survivors/ | 【实证】HTTP 200，资源齐全；**无**自定义 CSP → 帖内 iframe 可能被挡 |
| 仓库 | https://github.com/YeJe-cpu/potato-survivors | main + gh-pages |

# 发布就绪检查清单（Potato Survivors）

## A. 发帖前（技术）
- [x] Worker 已部署 HTTPS 可打开（公网 curl/DoH 实测）
- [x] `twitter:card=player`，`twitter:player` = `https://potato-survivors.leafsanren.workers.dev/`（绝对 HTTPS）
- [x] 响应头 `Content-Security-Policy: frame-ancestors 'self' https://x.com https://*.x.com https://twitter.com https://*.twitter.com https://mobile.twitter.com`，**无** `X-Frame-Options`
- [x] `twitter:image` / og.png 可访问（800×800）
- [x] `twitter:site` = `@leaf_sanren`
- [ ] 主公本机点开 Worker URL 确认菜单/Easy 可玩（云盒浏览器对 workers.dev SSL 不可信）
- [ ] 桌面网页版 X 发帖后确认出现 **Play**，点开可玩
- [ ] 音频若加了：需先点击解锁（当前可无音）

## B. 发帖（内容）
- [ ] 用带 `?v=1` 的 URL（改 meta 后换 `?v=2` 破缓存）
- [ ] 手机 App 行为记一笔（帖内 / 内置浏览器）
- [ ] 文案可提：浏览器 survivors、WASD+冲刺、自动开火；附 GH Pages 完整页作兜底

## C. 风险
- Player Card 政策灰区（归档禁 gaming）——完整页始终可玩作兜底
- 卡片缓存：同 URL 不刷新时换 query
- Cloudflare MCP **仍无 Pages Write**；要 Pages 需主公重连并勾选 `page.write`，或另开带 Pages Edit 的 API Token
- 云盒/本机代理把 `*.workers.dev` 解析到 198.18 → 勿据此判断线上挂了

## D. 意图发帖草稿（主公可改）

Day N · Potato Survivors（暂名）
用 Grok Bot 复刻的浏览器 survivors-like：薯仔 + 土豆皮自动开火，狗狗入队打爬虫。
点开帖内就能玩（也可用完整页）。WASD 移动，空格冲刺。
https://potato-survivors.leafsanren.workers.dev/?v=1

兜底：https://yeje-cpu.github.io/potato-survivors/
