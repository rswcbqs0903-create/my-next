`app/task1/page.tsx` 会从环境变量读取 Sepolia RPC 地址和要查询余额的钱包地址。
`app/task1/page2.tsx` 运行在浏览器端，会从 `NEXT_PUBLIC_TASK2_RECIPIENT_ADDRESS` 和 `NEXT_PUBLIC_TASK2_DEFAULT_ETH_AMOUNT` 读取发送交易的默认参数。

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
