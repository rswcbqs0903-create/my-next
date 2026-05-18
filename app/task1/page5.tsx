"use client";

import { useEffect, useMemo, useState } from "react";
import {
  createPublicClient,
  createWalletClient,
  custom,
  http,
  isAddress,
  parseUnits,
  type EIP1193Provider,
} from "viem";
import { sepolia } from "viem/chains";

declare global {
  interface Window {
    ethereum?: EIP1193Provider;
  }
}

// ERC-20 转账只需要 transfer、decimals、symbol 三个方法。
const erc20TransferAbi = [
  {
    type: "function",
    name: "transfer",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "value", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function",
    name: "decimals",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
  },
  {
    type: "function",
    name: "symbol",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
  },
] as const;

const sepoliaRpcUrl = process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL;
const contractAddress = getAddressFromEnv(
  "NEXT_PUBLIC_TASK1_ERC20_CONTRACT_ADDRESS",
  process.env.NEXT_PUBLIC_TASK1_ERC20_CONTRACT_ADDRESS,
);
const recipientAddress = getAddressFromEnv(
  "NEXT_PUBLIC_TASK5_TOKEN_RECIPIENT_ADDRESS",
  process.env.NEXT_PUBLIC_TASK5_TOKEN_RECIPIENT_ADDRESS,
);
const defaultTokenAmount =
  process.env.NEXT_PUBLIC_TASK5_DEFAULT_TOKEN_AMOUNT ?? "1";

// viem 的 address 参数需要 `0x${string}` 类型，校验后再传给合约调用。
function getAddressFromEnv(
  name: string,
  value: string | undefined,
): `0x${string}` {
  if (!value) {
    throw new Error(`Missing ${name} in environment variables.`);
  }

  if (!isAddress(value)) {
    throw new Error(`${name} must be a valid Ethereum address.`);
  }

  return value;
}

export default function Page5() {
  const [amount, setAmount] = useState(defaultTokenAmount);
  const [account, setAccount] = useState<`0x${string}` | null>(null);
  const [transactionHash, setTransactionHash] = useState<
    `0x${string}` | null
  >(null);
  const [tokenDecimals, setTokenDecimals] = useState<number | null>(null);
  const [tokenSymbol, setTokenSymbol] = useState("TOKEN");
  const [hasWallet, setHasWallet] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState(
    sepoliaRpcUrl
      ? "等待连接钱包"
      : "缺少 NEXT_PUBLIC_SEPOLIA_RPC_URL，无法读取 token 信息。",
  );

  const publicClient = useMemo(() => {
    if (!sepoliaRpcUrl) {
      return null;
    }

    return createPublicClient({
      chain: sepolia,
      transport: http(sepoliaRpcUrl),
    });
  }, []);

  // 等客户端挂载后再读取 window，避免服务端渲染和客户端 hydration 不一致。
  useEffect(() => {
    setHasWallet(Boolean(window.ethereum));
  }, []);

  useEffect(() => {
    if (!publicClient) {
      return;
    }

    const client = publicClient;
    let shouldIgnore = false;

    async function loadTokenMeta() {
      try {
        const [decimals, symbol] = await Promise.all([
          client.readContract({
            address: contractAddress,
            abi: erc20TransferAbi,
            functionName: "decimals",
          }),
          client.readContract({
            address: contractAddress,
            abi: erc20TransferAbi,
            functionName: "symbol",
          }),
        ]);

        if (shouldIgnore) {
          return;
        }

        setTokenDecimals(decimals);
        setTokenSymbol(symbol);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "读取 token 信息失败";
        setStatus(message);
      }
    }

    void loadTokenMeta();

    return () => {
      shouldIgnore = true;
    };
  }, [publicClient]);

  const canTransfer = useMemo(() => {
    if (!hasWallet || tokenDecimals === null) {
      return false;
    }

    try {
      parseUnits(amount, tokenDecimals);
      return true;
    } catch {
      return false;
    }
  }, [amount, hasWallet, tokenDecimals]);

  async function transferToken() {
    if (typeof window === "undefined" || !window.ethereum) {
      setStatus("未检测到浏览器钱包，请先安装或启用 MetaMask。");
      return;
    }

    if (tokenDecimals === null) {
      setStatus("token decimals 尚未读取完成。");
      return;
    }

    setIsSending(true);
    setTransactionHash(null);

    try {
      setStatus("正在请求钱包授权...");

      // WalletClient 通过浏览器钱包签名并发送 ERC-20 transfer 交易。
      const walletClient = createWalletClient({
        chain: sepolia,
        transport: custom(window.ethereum),
      });

      await walletClient.switchChain({ id: sepolia.id });

      const [connectedAccount] = await walletClient.requestAddresses();
      setAccount(connectedAccount);
      setStatus(`请在钱包中确认 ${tokenSymbol} 转账...`);

      const hash = await walletClient.writeContract({
        account: connectedAccount,
        address: contractAddress,
        abi: erc20TransferAbi,
        functionName: "transfer",
        args: [recipientAddress, parseUnits(amount, tokenDecimals)],
      });

      setTransactionHash(hash);
      setStatus("ERC-20 转账交易已发送");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "ERC-20 转账发送失败";
      setStatus(message);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <section className="grid gap-5 rounded-lg border border-zinc-200 bg-white p-5">
      <div className="space-y-3">
        <p className="text-sm font-medium text-zinc-500">Viem Task 1.5</p>
        <h2 className="text-2xl font-semibold text-zinc-950">
          ERC-20 Token 转账
        </h2>
        <p className="text-base leading-7 text-zinc-600">
          使用 WalletClient 调用 ERC-20 合约的 transfer 方法，在 Sepolia
          测试网上把 token 转给指定地址。点击转账后需要在钱包弹窗中确认。
        </p>
      </div>

      <div className="grid gap-4">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-zinc-600">
            ERC-20 合约地址
          </span>
          <span className="break-all rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 font-mono text-sm text-zinc-950">
            {contractAddress}
          </span>
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-zinc-600">接收地址</span>
          <span className="break-all rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 font-mono text-sm text-zinc-950">
            {recipientAddress}
          </span>
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-zinc-600">
            转账数量 {tokenSymbol}
          </span>
          <input
            className="rounded-md border border-zinc-300 px-3 py-2 font-mono text-sm text-zinc-950 outline-none transition focus:border-zinc-900"
            inputMode="decimal"
            min="0"
            step="1"
            type="number"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
          />
        </label>

        <button
          className="w-fit rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
          disabled={!canTransfer || isSending}
          type="button"
          onClick={transferToken}
        >
          {isSending ? "转账中..." : `转账 ${tokenSymbol}`}
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
        <div>
          <p className="font-medium text-zinc-500">Decimals</p>
          <p className="font-mono text-zinc-950">
            {tokenDecimals ?? "读取中..."}
          </p>
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

      <pre className="overflow-x-auto rounded-lg bg-zinc-950 p-5 text-sm leading-6 text-zinc-100">
        <code>{`const hash = await walletClient.writeContract({
  account,
  address: contractAddress,
  abi: erc20TransferAbi,
  functionName: "transfer",
  args: [recipientAddress, parseUnits(amount, decimals)],
});`}</code>
      </pre>
    </section>
  );
}
