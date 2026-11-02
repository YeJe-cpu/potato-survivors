# Potato Survivors（暂名）

浏览器 survivors-like：薯仔 + 土豆皮自动开火 + 狗狗入队。对标 tibo.dog Easy 前约 5 分钟，目标 X Player Card 帖内可玩。

## 现在可玩
- **Player Card 主链（CSP）**：https://potato-survivors.leafsanren.workers.dev/
- **外链兜底**：https://yeje-cpu.github.io/potato-survivors/
- 仓库：https://github.com/YeJe-cpu/potato-survivors

## 本地
```bash
npm i
npm run dev
npm run build && npm run smoke
```

## 文档
- `docs/RUNLOG.md` — 全部实践与进度（真源）
- `docs/PUBLISH-CHECKLIST.md` — 发帖验收清单
- `docs/superpowers/specs/2026-11-02-potato-survivors-design.md`

## 说明
托管实况：Cloudflare **Worker**（因 MCP 无 Pages Write）+ GitHub Pages 双份。帖内 Play 以 Worker 为准；GH Pages 无 `frame-ancestors`，只作完整页兜底。实践细节见 RUNLOG。
