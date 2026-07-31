# Tiny Being

一款轻量电子宠物养成 H5 游戏。玩家照顾一只会随现实时间持续生活的小生命，并在短暂而反复的互动中逐渐对它产生关心。

当前版本：`V0.1 MVP`

## 已实现

- 首次孵化与宠物命名
- 饱食、心情、清洁、精力四项状态
- 喂食、玩耍、清洁、睡觉和抚摸互动
- 不同需求对应的表情、动作与文字反馈
- 基于现实时间的状态变化
- 最多结算 24 小时的离线变化
- `localStorage` 本地存档与重新开始
- 手机优先的响应式界面

## 本地运行

需要 Node.js 20.19+ 或 22.12+。

```bash
npm install
npm run dev
```

构建生产版本：

```bash
npm run build
```

运行规则测试：

```bash
node --test
```

## 项目结构

```text
src/main.js       页面渲染、交互与存档
src/game.js       状态结算与游戏规则
src/style.css     房间、宠物与响应式视觉
test/game.test.js 核心规则测试
docs/             策划案和开发路线
```

项目范围与后续版本见 [MVP 路线](docs/mvp-roadmap.md)。完整设计见 [基础版策划案](docs/game-design-v0.1.md)。
