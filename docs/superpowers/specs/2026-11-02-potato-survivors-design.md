# Potato Survivors（暂名）设计

> 主公已批准默认方案（2026-11-02）。换皮占位，不抄 tibo 商标。

## 目标
浏览器 survivors-like，前 5 分钟对齐 tibo.dog **Easy** 手感；可部署后用 `twitter:card=player` 帖内玩。

## 范围（MVP → Ready）
**MVP：** WASD/触控移动 + Space dash；自动开火；少量怪；XP→升级三选一（时间暂停）；480 与 ~245 预览可玩；中/英。
**对齐：** 刷怪升温；约每 1–2 分钟具名小 Boss；队友上限 3（可简化）；难度 2～3 档；存活约 20 分钟胜利。
**发布：** CF Pages + player meta + CSP frame-ancestors；本地 sandbox 自测；发布清单。不做 10+ 语言、不抄原作美术/角色名。

## 架构
单页 Vite + TypeScript + Canvas 2D。固定步进模拟（逻辑与渲染分离）。状态：`menu | playing | levelup | paused | win | dead`。升级/暂停时模拟时钟停。

## 换皮占位
主角「薯仔」、武器「土豆皮」、敌人「爬虫」、队友「狗狗」——仅占位名，可后改。

## 部署
Cloudflare Pages（`*.pages.dev`）；`_headers` 设 CSP；meta 480×480；`twitter:site=@leaf_sanren`。自定义域另批。

## 风险
Player Card 政策灰区（归档禁 gaming）；保留非嵌入完整页。
