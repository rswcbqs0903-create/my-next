import { createPublicClient, formatUnits, http, isAddress } from "viem";
import { sepolia } from "viem/chains";

// 只声明本任务需要调用的 ERC-20 方法，避免引入完整 ABI。
const erc20Abi = [
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
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

const sepoliaRpcUrl = process.env.SEPOLIA_RPC_URL;
// 合约地址和查询账户都来自环境变量，方便在不同测试合约之间切换。
const contractAddress = getAddressFromEnv(
  "TASK1_ERC20_CONTRACT_ADDRESS",
  process.env.TASK1_ERC20_CONTRACT_ADDRESS,
);
const accountAddress = getAddressFromEnv(
  "TASK1_BALANCE_ADDRESS",
  process.env.TASK1_BALANCE_ADDRESS,
);

if (!sepoliaRpcUrl) {
  throw new Error("Missing SEPOLIA_RPC_URL in environment variables.");
}

// viem 的 address 参数需要 `0x${string}` 类型，校验后返回可直接传给 readContract。
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

const client = createPublicClient({
  chain: sepolia,
  transport: http(sepoliaRpcUrl),
  batch: {
    multicall: true,
  },
});

export default async function Page3() {
  // readContract 是只读调用，不会发起交易，也不会消耗 gas。
  const [rawBalance, decimals, symbol] = await Promise.all([
    client.readContract({
      address: contractAddress,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [accountAddress],
    }),
    client.readContract({
      address: contractAddress,
      abi: erc20Abi,
      functionName: "decimals",
    }),
    client.readContract({
      address: contractAddress,
      abi: erc20Abi,
      functionName: "symbol",
    }),
  ]);

  // ERC-20 的 balanceOf 返回整数，需要结合 decimals 转成人类可读余额。
  const formattedBalance = formatUnits(rawBalance, decimals);

  return (
    <section className="grid gap-5 rounded-lg border border-zinc-200 bg-white p-5">
      <div className="space-y-3">
        <p className="text-sm font-medium text-zinc-500">Viem Task 1.3</p>
        <h2 className="text-2xl font-semibold text-zinc-950">
          调用 ERC-20 balanceOf
        </h2>
        <p className="text-base leading-7 text-zinc-600">
          使用 viem 的 readContract 调用 Sepolia 测试网上 ERC-20 合约的
          balanceOf 方法，读取指定地址的 token 余额。
        </p>
      </div>

      <div className="grid gap-4 rounded-md bg-zinc-50 p-4">
        <div>
          <p className="text-sm font-medium text-zinc-500">ERC-20 合约地址</p>
          <p className="break-all font-mono text-sm text-zinc-950">
            {contractAddress}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-zinc-500">查询地址</p>
          <p className="break-all font-mono text-sm text-zinc-950">
            {accountAddress}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-zinc-500">Token Symbol</p>
          <p className="font-mono text-lg font-semibold text-zinc-950">
            {symbol}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-zinc-500">格式化余额</p>
          <p className="break-all font-mono text-2xl font-semibold text-zinc-950">
            {formattedBalance} {symbol}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-zinc-500">原始 uint256 余额</p>
          <p className="break-all font-mono text-sm text-zinc-950">
            {rawBalance.toString()}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-zinc-500">Decimals</p>
          <p className="font-mono text-sm text-zinc-950">{decimals}</p>
        </div>
      </div>

      <pre className="overflow-x-auto rounded-lg bg-zinc-950 p-5 text-sm leading-6 text-zinc-100">
        <code>{`const balance = await client.readContract({
  address: contractAddress,
  abi: erc20Abi,
  functionName: "balanceOf",
  args: [accountAddress],
});

const decimals = await client.readContract({
  address: contractAddress,
  abi: erc20Abi,
  functionName: "decimals",
});

console.log(formatUnits(balance, decimals));`}</code>
      </pre>
    </section>
  );
}
