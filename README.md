# 🐆 White Panther NFT Collection

A premium **10,000 NFT** collection on **Arbitrum** — Mint with ERC-20 tokens, connect via MetaMask.

## 🌐 Live Demo

🔗 **[https://test-work-white-panther-nft.tose.sh](https://test-work-white-panther-nft.tose.sh)**

| Contract     | Address                                      | Network          |
| ------------ | -------------------------------------------- | ---------------- |
| WhitePanther | `0x206F431abCEdd9E5022E55BE834CAE9a31d95cC6` | Arbitrum Sepolia |
| MockERC20    | `0x298D88D65B825D01f6A6Ca079de8cc21FbE74928` | Arbitrum Sepolia |

> View on Arbiscan: [WhitePanther Contract](https://sepolia.arbiscan.io/address/0x206F431abCEdd9E5022E55BE834CAE9a31d95cC6)

## 🎬 Video Demo

> _Coming soon — Full minting flow walkthrough_

## Architecture

```
white-panther-nft/
├── contracts/                  # Smart Contracts (Hardhat + Solidity)
│   ├── contracts/
│   │   ├── WhitePanther.sol       # ERC-721 NFT main contract
│   │   └── MockERC20.sol          # Mock ERC-20 for testing
│   ├── scripts/deploy.ts          # Deployment script
│   ├── test/WhitePanther.test.ts  # 27 unit tests
│   └── hardhat.config.ts
├── frontend/                   # Web3 Frontend (Vite + React + ethers.js v6)
│   ├── src/
│   │   ├── App.tsx                # Main component
│   │   ├── hooks/
│   │   │   ├── useWallet.ts       # MetaMask connection
│   │   │   └── useMint.ts        # Contract interaction
│   │   └── config/contract.ts     # ABI & chain config
│   └── index.html
├── Dockerfile                  # Multi-stage Docker build (Node + Nginx)
└── README.md
```

## Tech Stack

| Layer          | Stack                                       |
| -------------- | ------------------------------------------- |
| Smart Contract | Solidity 0.8.28, OpenZeppelin v5, Hardhat 2 |
| Frontend       | React 19, TypeScript, Vite 7, ethers.js v6  |
| Network        | Arbitrum One / Arbitrum Sepolia             |
| Hosting        | TOSE (Kubernetes + Docker + Nginx)          |

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18
- npm
- MetaMask wallet

### 1. Clone & Install

```bash
git clone https://github.com/dovannamdev/white-panther-nft.git
cd white-panther-nft

# Install contract dependencies
cd contracts
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Run Smart Contract Tests

```bash
cd contracts
npm test          # Run all 27 unit tests
npm run compile   # Compile contracts
```

### 3. Deploy Contracts

#### Local (no real ETH needed)

```bash
# Terminal 1: Start local blockchain
cd contracts
npx hardhat node

# Terminal 2: Deploy to local node
cd contracts
npm run deploy:local
```

#### Testnet (Arbitrum Sepolia)

```bash
cd contracts

# 1. Copy .env.example and fill in your private key
cp .env.example .env
# Edit .env → PRIVATE_KEY=your_deployer_private_key

# 2. Deploy
npm run deploy:testnet
```

### 4. Run Frontend

```bash
cd frontend

# Copy env and set contract address
cp .env.example .env
# Edit .env → VITE_NFT_CONTRACT_ADDRESS=your_deployed_address

# Start dev server
npm run dev       # http://localhost:3000

# Production build
npm run build
```

### 5. Deploy to TOSE

```bash
# Install TOSE CLI
npm install -g @tosesh/tose

# Login & deploy
tose login
tose up

# Update env after contract deployment
tose env set VITE_NFT_CONTRACT_ADDRESS=0xYourAddress
tose deploy
```

## Smart Contract Features

- **ERC-721** NFT (ERC721Enumerable) — OpenZeppelin v5
- **ERC-20 payment** — `safeTransferFrom` via SafeERC20
- **Security**: ReentrancyGuard + CEI pattern + Ownable + Pausable
- **Gas optimized**: Custom errors, unchecked blocks, optimizer (200 runs)
- **Owner controls**: set price, set payment token, set base URI, withdraw, pause/unpause

## Available Scripts

### Contracts (`cd contracts`)

| Command                  | Description                  |
| ------------------------ | ---------------------------- |
| `npm test`               | Run 27 unit tests            |
| `npm run compile`        | Compile Solidity contracts   |
| `npm run deploy:local`   | Deploy to local Hardhat node |
| `npm run deploy:testnet` | Deploy to Arbitrum Sepolia   |
| `npm run deploy:mainnet` | Deploy to Arbitrum One       |
| `npm run clean`          | Clear build artifacts        |

### Frontend (`cd frontend`)

| Command         | Description                       |
| --------------- | --------------------------------- |
| `npm run dev`   | Start dev server (localhost:3000) |
| `npm run build` | Production build to `dist/`       |

## Test Results

```
  WhitePanther NFT
    Deployment        ✔ 7 tests
    Minting           ✔ 8 tests
    Owner Functions   ✔ 7 tests
    Access Control    ✔ 3 tests
    View Functions    ✔ 2 tests

  27 passing (3s)
```

## Environment Variables

### Contracts (`contracts/.env`)

| Variable                   | Description                     |
| -------------------------- | ------------------------------- |
| `PRIVATE_KEY`              | Deployer wallet private key     |
| `ARBITRUM_SEPOLIA_RPC_URL` | Arbitrum Sepolia RPC endpoint   |
| `ARBISCAN_API_KEY`         | Arbiscan API key (verification) |

### Frontend (`frontend/.env`)

| Variable                    | Description                                  |
| --------------------------- | -------------------------------------------- |
| `VITE_NFT_CONTRACT_ADDRESS` | Deployed WhitePanther contract address       |
| `VITE_TARGET_CHAIN_ID`      | Target chain (421614=Sepolia, 42161=Mainnet) |

## License

MIT
