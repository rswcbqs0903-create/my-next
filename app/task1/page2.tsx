"use client";

import { useEffect, useMemo, useState } from "react";
import {
  createWalletClient,
  custom,
  isAddress,
  parseEther,
  type EIP1193Provider,
} from "viem";
import { sepolia } from "viem/chains";

declare global {
  interface Window {
    ethereum?: EIP1193Provider;
  }
}

// 客户端组件只能读取 NEXT_PUBLIC_ 开头的环境变量。
const recipientAddress = getRecipientAddress();
const defaultEthAmount =
  process.env.NEXT_PUBLIC_TASK2_DEFAULT_ETH_AMOUNT ?? "0.0001";

// viem 的地址类型是 `0x${string}`，这里先校验再返回，避免传入普通 string。
function getRecipientAddress(): `0x${string}` {
  const address = process.env.NEXT_PUBLIC_TASK2_RECIPIENT_ADDRESS;

  if (!address) {
    throw new Error(
      "Missing NEXT_PUBLIC_TASK2_RECIPIENT_ADDRESS in environment variables.",
    );
  }

  if (!isAddress(address)) {
    throw new Error(
      "NEXT_PUBLIC_TASK2_RECIPIENT_ADDRESS must be a valid Ethereum address.",
    );
  }

  return address;
}

export default function Page2() {
  const [amount, setAmount] = useState(defaultEthAmount);
  const [account, setAccount] = useState<`0x${string}` | null>(null);
  const [transactionHash, setTransactionHash] = useState<
    `0x${string}` | null
  >(null);
  const [status, setStatus] = useState("等待连接钱包");
  const [isSending, setIsSending] = useState(false);
  const [hasWallet, setHasWallet] = useState(false);

  // 等客户端挂载后再读取 window，避免服务端渲染和客户端 hydration 不一致。
  useEffect(() => {
    setHasWallet(Boolean(window.ethereum));
  }, []);

  // 只有检测到钱包且金额能被 parseEther 正确解析时，才允许发送。
  const canSend = useMemo(() => {
    if (!hasWallet) {
      return false;
    }

    try {
      parseEther(amount);
      return true;
    } catch {
      return false;
    }
  }, [amount, hasWallet]);

  async function sendEth() {
    // WalletClient 依赖浏览器钱包注入的 EIP-1193 provider。
    if (typeof window === "undefined" || !window.ethereum) {
      setStatus("未检测到浏览器钱包，请先安装或启用 MetaMask。");
      return;
    }

    setIsSending(true);
    setTransactionHash(null);

    try {
      setStatus("正在请求钱包授权...");

      // 使用 custom(window.ethereum) 让 viem 通过 MetaMask 等钱包签名交易。
      const walletClient = createWalletClient({
        chain: sepolia,
        transport: custom(window.ethereum),
      });

      // 确保钱包当前网络是 Sepolia，避免把测试交易发到其他网络。
      await walletClient.switchChain({ id: sepolia.id });

      // 请求用户授权账户；用户需要在钱包弹窗中确认。
      const [connectedAccount] = await walletClient.requestAddresses();
      setAccount(connectedAccount);
      setStatus("请在钱包中确认 Sepolia ETH 转账...");

      // sendTransaction 会拉起钱包确认弹窗，确认后返回交易 hash。
      const hash = await walletClient.sendTransaction({
        account: connectedAccount,
        to: recipientAddress,
        value: parseEther(amount),
      });

      setTransactionHash(hash);
      setStatus("交易已发送");
    } catch (error) {
      const message = error instanceof Error ? error.message : "交易发送失败";
      setStatus(message);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <section className="grid gap-5 rounded-lg border border-zinc-200 bg-white p-5">
      <div className="space-y-3">
        <p className="text-sm font-medium text-zinc-500">Viem Task 1.2</p>
        <h2 className="text-2xl font-semibold text-zinc-950">
          使用 WalletClient 发送 Sepolia ETH
        </h2>
        <p className="text-base leading-7 text-zinc-600">
          通过浏览器钱包创建 WalletClient，在 Sepolia 测试网上向指定地址发送
          ETH。点击发送后需要在钱包弹窗中确认。
        </p>
      </div>

      <div className="grid gap-4">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-zinc-600">接收地址</span>
          <span className="break-all rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 font-mono text-sm text-zinc-950">
            {recipientAddress}
          </span>
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-zinc-600">
            发送数量 Sepolia ETH
          </span>
          <input
            className="rounded-md border border-zinc-300 px-3 py-2 font-mono text-sm text-zinc-950 outline-none transition focus:border-zinc-900"
            inputMode="decimal"
            min="0"
            step="0.0001"
            type="number"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
          />
        </label>

        <button
          className="w-fit rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
          disabled={!canSend || isSending}
          type="button"
          onClick={sendEth}
        >
          {isSending ? "发送中..." : "发送 ETH"}
        </button>
      </div>

      <div className="grid gap-3 rounded-md bg-zinc-50 p-4 text-sm">
        <div>
          <p className="font-medium text-zinc-500">当前账户</p>
          <p className="break-all font-mono text-zinc-950">
            {account ?? "尚未连接"}
          </p>
        </div>
        <div>
          <p className="font-medium text-zinc-500">状态</p>
          <p className="break-all text-zinc-950">{status}</p>
        </div>
        {transactionHash ? (
          <div>
            <p className="font-medium text-zinc-500">交易 Hash</p>
            <a
              className="break-all font-mono text-sm text-blue-700 underline"
              href={`https://sepolia.etherscan.io/tx/${transactionHash}`}
              rel="noreferrer"
              target="_blank"
            >
              {transactionHash}
            </a>
          </div>
        ) : null}
      </div>
    </section>
  );
}
