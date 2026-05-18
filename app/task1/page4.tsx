"use client";

import { useEffect, useMemo, useState } from "react";
import { createPublicClient, formatUnits, http, isAddress } from "viem";
import { sepolia } from "viem/chains";

// 监听 Transfer 事件只需要事件 ABI，不需要完整 ERC-20 ABI。
const transferEventAbi = [
  {
    type: "event",
    name: "Transfer",
    inputs: [
      { name: "from", type: "address", indexed: true },
      { name: "to", type: "address", indexed: true },
      { name: "value", type: "uint256", indexed: false },
    ],
  },
] as const;

type TransferEvent = {
  from: `0x${string}`;
  to: `0x${string}`;
  value: bigint;
  transactionHash: `0x${string}`;
};

const sepoliaRpcUrl = process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL;
const contractAddress = getContractAddress();

function getContractAddress(): `0x${string}` {
  const address = process.env.NEXT_PUBLIC_TASK1_ERC20_CONTRACT_ADDRESS;

  if (address && isAddress(address)) {
    return address;
  }

  const serverOnlyAddress = process.env.TASK1_ERC20_CONTRACT_ADDRESS;

  if (serverOnlyAddress && isAddress(serverOnlyAddress)) {
    return serverOnlyAddress;
  }

  throw new Error(
    "Missing NEXT_PUBLIC_TASK1_ERC20_CONTRACT_ADDRESS in environment variables.",
  );
}

export default function Page4() {
  const [events, setEvents] = useState<TransferEvent[]>([]);
  const [status, setStatus] = useState(
    sepoliaRpcUrl
      ? "正在监听 Transfer 事件..."
      : "缺少 NEXT_PUBLIC_SEPOLIA_RPC_URL，无法监听事件。",
  );

  const client = useMemo(() => {
    if (!sepoliaRpcUrl) {
      return null;
    }

    return createPublicClient({
      chain: sepolia,
      transport: http(sepoliaRpcUrl),
    });
  }, []);

  useEffect(() => {
    if (!client) {
      return;
    }

    // watchContractEvent 会持续监听新日志；组件卸载时调用 unwatch 停止监听。
    const unwatch = client.watchContractEvent({
      address: contractAddress,
      abi: transferEventAbi,
      eventName: "Transfer",
      onLogs: (logs) => {
        const transferEvents = logs.flatMap((log) => {
          const { from, to, value } = log.args;

          if (!from || !to || value === undefined) {
            return [];
          }

          return [
            {
              from,
              to,
              value,
              transactionHash: log.transactionHash,
            },
          ];
        });

        setEvents((currentEvents) => [
          ...transferEvents,
          ...currentEvents,
        ]);
      },
      onError: (error) => {
        setStatus(error.message);
      },
    });

    return () => {
      unwatch();
    };
  }, [client]);

  return (
    <section className="grid gap-5 rounded-lg border border-zinc-200 bg-white p-5">
      <div className="space-y-3">
        <p className="text-sm font-medium text-zinc-500">Viem Task 1.4</p>
        <h2 className="text-2xl font-semibold text-zinc-950">
          监听 ERC-20 Transfer 事件
        </h2>
        <p className="text-base leading-7 text-zinc-600">
          使用 viem 的 watchContractEvent 监听 Sepolia 测试网上 ERC-20 合约的
          Transfer 事件。发生新的 token 转账时，页面会显示事件日志。
        </p>
      </div>

      <div className="grid gap-3 rounded-md bg-zinc-50 p-4 text-sm">
        <div>
          <p className="font-medium text-zinc-500">ERC-20 合约地址</p>
          <p className="break-all font-mono text-zinc-950">
            {contractAddress}
          </p>
        </div>
        <div>
          <p className="font-medium text-zinc-500">状态</p>
          <p className="break-all text-zinc-950">{status}</p>
        </div>
      </div>

      <div className="grid gap-3">
        {events.length === 0 ? (
          <p className="rounded-md border border-dashed border-zinc-300 p-4 text-sm text-zinc-500">
            暂无 Transfer 事件。你可以先通过 mint 或 transfer 触发一笔 ERC-20
            转账。
          </p>
        ) : (
          events.map((event) => (
            <article
              className="grid gap-3 rounded-md border border-zinc-200 p-4 text-sm"
              key={`${event.transactionHash}-${event.from}-${event.to}-${event.value}`}
            >
              <div>
                <p className="font-medium text-zinc-500">From</p>
                <p className="break-all font-mono text-zinc-950">
                  {event.from}
                </p>
              </div>
              <div>
                <p className="font-medium text-zinc-500">To</p>
                <p className="break-all font-mono text-zinc-950">{event.to}</p>
              </div>
              <div>
                <p className="font-medium text-zinc-500">Value</p>
                <p className="break-all font-mono text-zinc-950">
                  {formatUnits(event.value, 18)}
                </p>
              </div>
              <div>
                <p className="font-medium text-zinc-500">Transaction Hash</p>
                <a
                  className="break-all font-mono text-blue-700 underline"
                  href={`https://sepolia.etherscan.io/tx/${event.transactionHash}`}
                  rel="noreferrer"
                  target="_blank"
                >
                  {event.transactionHash}
                </a>
              </div>
            </article>
          ))
        )}
      </div>

      <pre className="overflow-x-auto rounded-lg bg-zinc-950 p-5 text-sm leading-6 text-zinc-100">
        <code>{`const unwatch = client.watchContractEvent({
  address: contractAddress,
  abi: transferEventAbi,
  eventName: "Transfer",
  onLogs: (logs) => {
    console.log(logs);
  },
});

unwatch();`}</code>
      </pre>
    </section>
  );
}
