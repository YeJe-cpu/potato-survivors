# Potato Survivors（暂名）

浏览器 survivors-like：薯仔 + 土豆皮自动开火 + 爬虫潮 + 狗狗队友。换皮占位，不抄 tibo 商标。

对齐目标：tibo.dog **Easy** 前约 5 分钟手感（稀疏升温、具名小 Boss、招募、宝箱、Reroll/Skip 慢解锁）。

## 本地运行

```bash
npm install
npm run dev
```

打开终端提示的本地 URL（通常 `http://localhost:5173`）。

```bash
npm run build
npm run preview   # 默认 4173；占用时可 `npx vite preview --port 4174`
npm run smoke     # 无头冒烟：升级/Boss/招募/宝箱/难度/20:00 胜利续玩
```

## 操作

| 输入 | 作用 |
|------|------|
| WASD / 方向键 | 移动 |
| Space | 冲刺（有冷却） |
| 1 / 2 / 3 或点击 | 升级三选一 |
| R / 点击刷新 | 升级时 Reroll（次数随等级解锁，开局 0） |
| F / 点击跳过 | 升级时 Skip（次数随等级解锁，开局 0） |
| P | 暂停（升级/宝箱时时间同样暂停） |
| 触控按住 | 虚拟摇杆；可点菜单/升级卡/难度 |
| 靠近虚线圈 | 招募狗狗（最多 3） |
| 靠近倒计时结束的宝箱 | 打开奖励（时间暂停） |

浏览器语言 `zh*` → 中文，否则英文。

## 本轮内容（对齐 Easy）

- **刷怪升温**：0–1 分稀疏 → 3–5 分明显更密；爬虫 / 尖牙 / 厚壳 几何怪
- **具名小 Boss**：约每 70s（自 ~0:55 起），顶血条 + 名字；血量阶梯约 300→450→650→850→1100
- **狗狗队友**：场上招募圈，最多 3，自动弱火力
- **宝箱**：地上倒计时 → 打开暂停 → 升级或金币 → 继续
- **Reroll / Skip**：Lv3/5/8/10… 慢慢给次数；BANISH 未做
- **难度**：菜单 Easy / Normal / Hard（刷怪与起步血/XP）
- **胜利**：存活 20:00 出胜利屏，可「继续浪」
- **OG**：`public/og.png`（800×800），meta 指向 `/og.png`

## X Player Card（草稿）

- `index.html`：`twitter:card=player`、`twitter:site=@leaf_sanren`、480×480、`twitter:image`/`og:image` → `/og.png`
- 部署后把 `twitter:player` 改成绝对 HTTPS（可指向整站根路径）
- `public/_headers`：`frame-ancestors` 放行 x.com（Cloudflare Pages 会读）
- **不要**设 `X-Frame-Options`
- 无 form、无 `alert`

自定义域名 / 付费托管需主公另批。

## 结构

```
src/
  main.ts          # 循环、UI 点击
  input.ts         # 键鼠 + 触控摇杆
  i18n.ts          # 中/英
  sim/             # 固定步进模拟
  render/draw.ts   # Canvas 2D
public/
  _headers         # CSP frame-ancestors 草稿
  og.png           # 分享图
```
