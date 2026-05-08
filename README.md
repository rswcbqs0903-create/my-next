# My Next

这是一个基于 Next.js 的 viem 学习项目，用于练习和展示基础链上交互任务。

## 当前功能

- `app/page.tsx`：项目首页，当前直接渲染 viem 任务 1 页面。
- `app/task1/page.tsx`：使用 viem 连接 Sepolia 测试网，查询指定地址的测试 ETH 余额。

## 关键目录结构

```text
app/
  globals.css       全局样式
  layout.tsx        应用根布局
  page.tsx          首页，渲染 viem 任务 1
  task1/
    page.tsx        viem 任务 1：查询 Sepolia 测试网地址余额
.env.local          本地环境变量，包含 Sepolia RPC 地址
package.json        项目依赖和脚本
pnpm-lock.yaml      pnpm 锁文件
README.md           项目说明
```

## 环境变量

```bash
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
TASK1_BALANCE_ADDRESS=0xd1C18624549f755fFb778F19760d8110548937b8
```

`app/task1/page.tsx` 会从环境变量读取 Sepolia RPC 地址和要查询余额的钱包地址。

## 开发命令

```bash
pnpm dev
pnpm lint
pnpm build
```

任务 1 页面地址：

```text
http://localhost:3000/task1
```
