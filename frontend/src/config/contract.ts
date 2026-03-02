// Contract ABI — only includes functions used by the frontend
export const WHITEPANTHER_ABI = [
  // ── Read Functions ──
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function totalMinted() view returns (uint256)",
  "function remainingSupply() view returns (uint256)",
  "function mintPrice() view returns (uint256)",
  "function MAX_SUPPLY() view returns (uint256)",
  "function MAX_PER_TX() view returns (uint256)",
  "function paused() view returns (bool)",
  "function balanceOf(address) view returns (uint256)",
  "function paymentToken() view returns (address)",

  // ── Write Functions ──
  "function mint(uint256 quantity)",

  // ── Events ──
  "event Minted(address indexed to, uint256 quantity, uint256 totalCost)",
] as const;

export const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
] as const;

// ══════════════════════════════════════════════
//  Network & Contract Config
// ══════════════════════════════════════════════

export const ARBITRUM_CHAIN_ID = 42161;
export const ARBITRUM_SEPOLIA_CHAIN_ID = 421614;
export const HARDHAT_CHAIN_ID = 31337;

// Use Arbitrum Sepolia for demo — switch to mainnet chain ID for production
export const TARGET_CHAIN_ID = Number(
  import.meta.env.VITE_TARGET_CHAIN_ID || ARBITRUM_SEPOLIA_CHAIN_ID,
);

export const CHAIN_CONFIG: Record<
  number,
  {
    chainId: string;
    chainName: string;
    nativeCurrency: { name: string; symbol: string; decimals: number };
    rpcUrls: string[];
    blockExplorerUrls: string[];
  }
> = {
  [HARDHAT_CHAIN_ID]: {
    chainId: `0x${HARDHAT_CHAIN_ID.toString(16)}`,
    chainName: "Hardhat Local",
    nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
    rpcUrls: ["http://127.0.0.1:8545"],
    blockExplorerUrls: [],
  },
  [ARBITRUM_SEPOLIA_CHAIN_ID]: {
    chainId: `0x${ARBITRUM_SEPOLIA_CHAIN_ID.toString(16)}`,
    chainName: "Arbitrum Sepolia",
    nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://sepolia-rollup.arbitrum.io/rpc"],
    blockExplorerUrls: ["https://sepolia.arbiscan.io"],
  },
  [ARBITRUM_CHAIN_ID]: {
    chainId: `0x${ARBITRUM_CHAIN_ID.toString(16)}`,
    chainName: "Arbitrum One",
    nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://arb1.arbitrum.io/rpc"],
    blockExplorerUrls: ["https://arbiscan.io"],
  },
};

// ⚠️ Replace with actual contract address after deployment
export const NFT_CONTRACT_ADDRESS =
  import.meta.env.VITE_NFT_CONTRACT_ADDRESS ||
  "0x0000000000000000000000000000000000000000";
