# Potato Survivors（暂名）

浏览器 survivors-like：薯仔 + 土豆皮自动开火 + 狗狗入队。对标 tibo.dog 前 5 分钟手感，准备 X Player Card 帖内可玩。

## 现在可玩
**https://yeje-cpu.github.io/potato-survivors/**

仓库：https://github.com/YeJe-cpu/potato-survivors

## 本地
```bash
npm i
npm run dev
npm run build && npm run smoke
```

## 文档
- `docs/RUNLOG.md` — 实践记录
- `docs/PUBLISH-CHECKLIST.md` — 发帖检查清单
- `docs/superpowers/specs/2026-11-02-potato-survivors-design.md`

## 说明
GitHub Pages 已可玩；`frame-ancestors` 响应头在 GH Pages 上设不了，帖内 iframe 可能被挡。Cloudflare Worker 已部署到 `potato-survivors.leafsanren.workers.dev`（带 CSP），本机代理对 `*.workers.dev` TLS 异常，外网需再验。要稳定帖内 Play，优先补 Cloudflare **Pages Write** API Token 后改 Pages 部署。
