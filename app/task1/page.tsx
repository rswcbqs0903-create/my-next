import { createPublicClient, formatEther, http, isAddress } from "viem";
import { sepolia } from "viem/chains";
import Page4 from "./Page4";
import Page2 from "./page2";
import Page3 from "./page3";

const sepoliaRpcUrl = process.env.SEPOLIA_RPC_URL;
const address = getTask1BalanceAddress();

if (!sepoliaRpcUrl) {
  throw new Error("Missing SEPOLIA_RPC_URL in environment variables.");
}

function getTask1BalanceAddress(): `0x${string}` {
  const address = process.env.TASK1_BALANCE_ADDRESS;

  if (!address) {
    throw new Error("Missing TASK1_BALANCE_ADDRESS in environment variables.");
  }

  if (!isAddress(address)) {
    throw new Error("TASK1_BALANCE_ADDRESS must be a valid Ethereum address.");
  }

  return address;
}

const client = createPublicClient({
  chain: sepolia,
  transport: http(sepoliaRpcUrl),
  batch: {
    multicall: true,
  },
});

export default async function Task1Page() {
  const balance = await client.getBalance({ address });
  const ethBalance = formatEther(balance);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-8 px-6 py-12">
      <section className="space-y-3">
        <p className="text-sm font-medium text-zinc-500">Viem Task 1</p>
        <h1 className="text-3xl font-semibold text-zinc-950">
          Sepolia 测试网基础交互
        </h1>
        <p className="text-base leading-7 text-zinc-600">
          使用 viem 创建 Public Client 查询测试 ETH 余额，并使用 WalletClient
          通过浏览器钱包发送 Sepolia ETH，同时调用 ERC-20 合约的 balanceOf
          方法读取 token 余额和监听 Transfer 事件。
        </p>
      </section>

      <section className="grid gap-4 rounded-lg border border-zinc-200 bg-white p-5">
        <div>
          <p className="text-sm font-medium text-zinc-500">Address</p>
          <p className="break-all font-mono text-sm text-zinc-950">{address}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-zinc-500">Balance</p>
          <p className="font-mono text-2xl font-semibold text-zinc-950">
            {ethBalance} ETH
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-zinc-500">Wei</p>
          <p className="break-all font-mono text-sm text-zinc-950">
            {balance.toString()}
          </p>
        </div>
      </section>

      <pre className="overflow-x-auto rounded-lg bg-zinc-950 p-5 text-sm leading-6 text-zinc-100">
        <code>{`import { createPublicClient, formatEther, http } from "viem";
import { sepolia } from "viem/chains";

const sepoliaRpcUrl = process.env.SEPOLIA_RPC_URL;
const address = getTask1BalanceAddress();

if (!sepoliaRpcUrl) {
  throw new Error("Missing SEPOLIA_RPC_URL in environment variables.");
}

function getTask1BalanceAddress(): \`0x\${string}\` {
  const address = process.env.TASK1_BALANCE_ADDRESS;

  if (!address) {
    throw new Error("Missing TASK1_BALANCE_ADDRESS in environment variables.");
  }

  if (!isAddress(address)) {
    throw new Error("TASK1_BALANCE_ADDRESS must be a valid Ethereum address.");
  }

  return address;
}

const client = createPublicClient({
  chain: sepolia,
  transport: http(sepoliaRpcUrl),
  batch: {
    multicall: true,
  },
});

const balance = await client.getBalance({
  address,
});

console.log(formatEther(balance));`}</code>
      </pre>

      <Page2 />
      <Page3 />
      <Page4 />
    </main>
  );
}
