# My Next

这是一个基于 Next.js 的 viem 学习项目，用于练习和展示基础链上交互任务。

## 当前功能

- `app/page.tsx`：项目首页，当前直接渲染 viem 任务 1 页面。
- `app/task1/page.tsx`：使用 viem 连接 Sepolia 测试网，查询指定地址的测试 ETH 余额，并展示发送 ETH 和 ERC-20 查询子任务。
- `app/task1/page2.tsx`：使用 WalletClient 通过浏览器钱包发送 Sepolia ETH。
- `app/task1/page3.tsx`：调用 ERC-20 合约的 `balanceOf` 方法，查询指定地址的 token 余额。

## 关键目录结构

```text
app/
  globals.css       全局样式
  layout.tsx        应用根布局
  page.tsx          首页，渲染 viem 任务 1
  task1/
    page.tsx        viem 任务 1：Sepolia 测试网基础交互
    page2.tsx       viem 任务 1 子任务：WalletClient 发送 ETH
    page3.tsx       viem 任务 1 子任务：ERC-20 balanceOf 查询
.env.local          本地环境变量，包含 Sepolia RPC 地址和任务参数
package.json        项目依赖和脚本
pnpm-lock.yaml      pnpm 锁文件
README.md           项目说明
```

## 环境变量

```bash
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
TASK1_BALANCE_ADDRESS=0xd1C18624549f755fFb778F19760d8110548937b8
NEXT_PUBLIC_TASK2_RECIPIENT_ADDRESS=0xd1C18624549f755fFb778F19760d8110548937b8
NEXT_PUBLIC_TASK2_DEFAULT_ETH_AMOUNT=0.0001
TASK1_ERC20_CONTRACT_ADDRESS=0x9727B8991A6B9BFDB2ae736FD80e367221F8f1BC
```

`app/task1/page.tsx` 会从环境变量读取 Sepolia RPC 地址和要查询余额的钱包地址。
`app/task1/page2.tsx` 运行在浏览器端，会从 `NEXT_PUBLIC_TASK2_RECIPIENT_ADDRESS` 和 `NEXT_PUBLIC_TASK2_DEFAULT_ETH_AMOUNT` 读取发送交易的默认参数。
`app/task1/page3.tsx` 会从 `TASK1_ERC20_CONTRACT_ADDRESS` 读取 ERC-20 合约地址，并复用 `TASK1_BALANCE_ADDRESS` 查询 token 余额。

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
