# 🐆 White Panther NFT — Báo Trắng Collection

Bộ sưu tập 10,000 NFT "Báo Trắng" trên mạng **Arbitrum** — Mint bằng ERC-20 token, kết nối MetaMask.

## Kiến trúc

```
white-panther-nft/
├── ASSESSMENT.md           # Bài khảo sát năng lực (Phần 1, 2, 3)
├── contracts/              # Smart Contract (Hardhat + Solidity)
│   ├── contracts/
│   │   ├── WhitePanther.sol    # ERC-721 NFT contract chính
│   │   └── MockERC20.sol       # Mock ERC-20 cho testing
│   ├── scripts/deploy.ts       # Deployment script
│   ├── test/WhitePanther.test.ts   # 27 unit tests
│   └── hardhat.config.ts
├── frontend/               # Web3 Frontend (Vite + React + ethers.js v6)
│   ├── src/
│   │   ├── App.tsx             # Main component
│   │   ├── hooks/
│   │   │   ├── useWallet.ts    # MetaMask connection
│   │   │   └── useMint.ts     # Contract interaction
│   │   └── config/contract.ts  # ABI & chain config
│   └── index.html
└── README.md
```

## Công nghệ

| Layer          | Stack                                       |
| -------------- | ------------------------------------------- |
| Smart Contract | Solidity 0.8.28, OpenZeppelin v5, Hardhat 2 |
| Frontend       | React 19, TypeScript, Vite 7, ethers.js v6  |
| Network        | Arbitrum One / Arbitrum Sepolia             |

## Smart Contract Features

- **ERC-721** NFT (ERC721Enumerable) — OZ v5
- **ERC-20 payment** — `safeTransferFrom` qua SafeERC20
- **Bảo mật**: ReentrancyGuard + CEI pattern + Ownable + Pausable
- **Gas optimized**: Custom errors, unchecked blocks, optimizer
- **Owner controls**: set price, set payment token, set base URI, withdraw, pause/unpause

## Chạy Smart Contract

```bash
cd contracts
npm install
npx hardhat compile
npx hardhat test
```

### Deploy (testnet)

```bash
# Set biến môi trường
export PRIVATE_KEY=your_private_key
export ARBITRUM_SEPOLIA_RPC_URL=https://sepolia-rollup.arbitrum.io/rpc

# Deploy
npx hardhat run scripts/deploy.ts --network arbitrumSepolia
```

## Chạy Frontend

```bash
cd frontend
npm install
npm run dev     # Dev server tại http://localhost:3000
npm run build   # Production build
```

### Sau khi deploy contract

Cập nhật `NFT_CONTRACT_ADDRESS` trong `frontend/src/config/contract.ts` với địa chỉ contract thực tế.

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
