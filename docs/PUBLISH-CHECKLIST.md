# 发布就绪检查清单（Potato Survivors）

## A. 发帖前（技术）
- [ ] Cloudflare Pages 已部署，HTTPS 可打开
- [ ] `curl -A Twitterbot/1.0 https://YOUR_HOST/` 能看到 `twitter:card=player` 且 `twitter:player` 为**绝对 HTTPS**（与分享同 URL 或 `/`）
- [ ] 响应头有 `Content-Security-Policy: frame-ancestors … x.com … twitter.com`，**无** `X-Frame-Options`
- [ ] `twitter:image` / og 图可访问，面积 ≥ 68600 像素（现 `og.png` 800×800）
- [ ] `twitter:site` = `@leaf_sanren`
- [ ] 本地用 sandbox iframe 测过：无 form、无 alert；245 / 480 可玩
- [ ] 音频若加了：需先点击解锁

## B. 发帖（内容）
- [ ] 用带 `?v=1` 的 URL（改 meta 后换 `?v=2` 破缓存）
- [ ] 桌面网页版确认出现 **Play**，点开可玩
- [ ] 手机 App 行为记一笔（帖内 / 内置浏览器【待验证】）
- [ ] 文案可提：浏览器 survivors、WASD+冲刺、自动开火、找彩蛋；附完整页链接作兜底

## C. 风险
- Player Card 政策灰区（归档禁 gaming）——完整页始终可玩作兜底
- 卡片缓存：同 URL 不刷新时换 query/路径

## D. 意图发帖草稿（主公可改）
Day N · Potato Survivors（暂名）
用 Grok Bot 复刻的浏览器 survivors-like：薯仔 + 土豆皮自动开火，狗狗入队打爬虫。
点开帖内就能玩（也可用完整页）。WASD 移动，空格冲刺。
https://YOUR_HOST/?v=1
