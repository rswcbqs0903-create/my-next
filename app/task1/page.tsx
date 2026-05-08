import { createPublicClient, formatEther, http, isAddress } from "viem";
import { sepolia } from "viem/chains";

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
          查询 Sepolia 测试网地址余额
        </h1>
        <p className="text-base leading-7 text-zinc-600">
          使用 viem 创建 Public Client，连接 Sepolia 测试网，并调用 getBalance
          查询指定地址的 ETH 余额。
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
    </main>
  );
}
