import { useState } from "react";
import { ethers } from "ethers";
import { useWallet } from "./hooks/useWallet";
import { useMint } from "./hooks/useMint";
import { TARGET_CHAIN_ID, ARBITRUM_SEPOLIA_CHAIN_ID } from "./config/contract";

// ── SVG Icons (Lucide-style, replaces emojis per ui-ux-pro-max checklist) ──
const IconWallet = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ width: "1em", height: "1em" }}
  >
    <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
    <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
  </svg>
);

const IconAlert = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="message__icon"
  >
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </svg>
);

const IconCheck = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="message__icon"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const IconLink = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ width: 14, height: 14 }}
  >
    <path d="M15 7h3a5 5 0 0 1 5 5 5 5 0 0 1-5 5h-3m-6 0H6a5 5 0 0 1-5-5 5 5 0 0 1 5-5h3" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);

const IconPanther = () => (
  <img
    src="/panther-logo.png"
    alt="White Panther"
    className="connect-prompt__icon"
  />
);

const IconChain = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="wrong-chain__icon"
  >
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

const IconPause = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="paused__icon"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="10" y1="15" x2="10" y2="9" />
    <line x1="14" y1="15" x2="14" y2="9" />
  </svg>
);

const IconCoins = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="message__icon"
  >
    <circle cx="8" cy="8" r="6" />
    <path d="M18.09 10.37A6 6 0 1 1 10.34 18" />
    <path d="M7 6h1v4" />
    <path d="m16.71 13.88.7.71-2.82 2.82" />
  </svg>
);

const IconDiamond = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="nft-badge__icon"
  >
    <path d="M2.7 10.3a2.41 2.41 0 0 0 0 3.41l7.59 7.59a2.41 2.41 0 0 0 3.41 0l7.59-7.59a2.41 2.41 0 0 0 0-3.41l-7.59-7.59a2.41 2.41 0 0 0-3.41 0Z" />
  </svg>
);

function App() {
  const wallet = useWallet();
  const mintData = useMint(wallet.signer, wallet.provider, wallet.address);
  const [quantity, setQuantity] = useState(1);

  const totalCost = mintData.mintPrice * BigInt(quantity);
  const formattedPrice = ethers.formatUnits(
    mintData.mintPrice,
    mintData.tokenDecimals,
  );
  const formattedCost = ethers.formatUnits(totalCost, mintData.tokenDecimals);
  const hasEnoughAllowance = mintData.userAllowance >= totalCost;
  const hasEnoughBalance = mintData.userTokenBalance >= totalCost;
  const progressPercent =
    mintData.maxSupply > 0n
      ? Number((mintData.totalMinted * 10000n) / mintData.maxSupply) / 100
      : 0;
  const chainName =
    TARGET_CHAIN_ID === ARBITRUM_SEPOLIA_CHAIN_ID
      ? "Arbitrum Sepolia"
      : TARGET_CHAIN_ID === 31337
        ? "Hardhat Local"
        : "Arbitrum One";

  return (
    <div className="app">
      <div className="container">
        {/* ── Header ── */}
        <header className="header">
          <img
            src="/panther-logo.png"
            alt="White Panther Logo"
            className="header__logo"
          />
          <div className="header__badge">
            <span className="header__badge-dot" />
            Live on {chainName}
          </div>
          <h1 className="header__title">WHITE PANTHER</h1>
          <p className="header__subtitle">
            White Panther NFT Collection —{" "}
            <span className="header__subtitle-accent">10,000</span> Unique
            Digital Collectibles
          </p>
        </header>

        {/* ── Messages ── */}
        {wallet.error && (
          <div className="message message--error">
            <IconAlert />
            <span>{wallet.error}</span>
          </div>
        )}
        {mintData.error && (
          <div className="message message--error">
            <IconAlert />
            <span>{mintData.error}</span>
            <button
              className="message__close"
              onClick={mintData.clearMessages}
              aria-label="Close error notification"
            >
              ✕
            </button>
          </div>
        )}
        {mintData.success && (
          <div className="message message--success">
            <IconCheck />
            <span>{mintData.success}</span>
            <button
              className="message__close"
              onClick={mintData.clearMessages}
              aria-label="Close notification"
            >
              ✕
            </button>
          </div>
        )}

        {/* ── TX Hash ── */}
        {mintData.txHash && (
          <div className="tx-hash">
            <a
              href={`https://${
                TARGET_CHAIN_ID === ARBITRUM_SEPOLIA_CHAIN_ID ? "sepolia." : ""
              }arbiscan.io/tx/${mintData.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <IconLink /> View Transaction on Arbiscan
            </a>
          </div>
        )}

        {/* ── Not Connected ── */}
        {!wallet.address && (
          <div className="card">
            {!wallet.hasMetaMask ? (
              <div className="no-wallet">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="no-wallet__icon"
                >
                  <rect x="2" y="6" width="20" height="12" rx="2" />
                  <path d="M22 10h-6a2 2 0 0 0 0 4h6" />
                </svg>
                <p className="no-wallet__text">
                  You need to install MetaMask to connect your wallet and mint
                  NFTs.
                </p>
                <a
                  href="https://metamask.io/download/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn--primary"
                  style={{ display: "inline-block", textDecoration: "none" }}
                >
                  Install MetaMask
                </a>
              </div>
            ) : (
              <div className="connect-prompt">
                <p className="connect-prompt__text">
                  Connect your wallet to start minting White Panther NFTs
                </p>
                <button
                  className="btn btn--primary"
                  onClick={wallet.connect}
                  disabled={wallet.isConnecting}
                  id="connect-wallet-btn"
                >
                  {wallet.isConnecting && <span className="btn__spinner" />}
                  {wallet.isConnecting ? (
                    "Connecting..."
                  ) : (
                    <>
                      <IconWallet /> Connect MetaMask
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Connected but wrong chain ── */}
        {wallet.address && !wallet.isCorrectChain && (
          <div className="card">
            <div className="wrong-chain">
              <IconChain />
              <p className="wrong-chain__text">
                Please switch to the {chainName} network
              </p>
              <button
                className="btn btn--primary"
                onClick={wallet.switchChain}
                id="switch-chain-btn"
              >
                Switch to {chainName}
              </button>
            </div>
          </div>
        )}

        {/* ── Connected + Correct chain ── */}
        {wallet.address && wallet.isCorrectChain && (
          <>
            {/* Wallet Info */}
            <div className="wallet">
              <div className="wallet__dot" />
              <span className="wallet__address">{wallet.shortAddress}</span>
              <span className="wallet__chain">{chainName}</span>
            </div>

            {/* NFT Balance */}
            {mintData.userNFTBalance > 0n && (
              <div className="nft-badge">
                <IconDiamond />
                You own{" "}
                <span className="nft-badge__count">
                  {mintData.userNFTBalance.toString()}
                </span>{" "}
                White Panther(s)
              </div>
            )}

            {/* Mint Card */}
            <div className="card">
              <div className="card__title">Mint NFT</div>

              {mintData.isLoading ? (
                <div className="loading">
                  <div className="loading__spinner" />
                  <span>Loading contract data...</span>
                </div>
              ) : mintData.isPaused ? (
                <div className="paused">
                  <IconPause />
                  <p className="paused__text">
                    Minting is currently paused. Please check back later.
                  </p>
                </div>
              ) : (
                <>
                  {/* Stats */}
                  <div className="stats">
                    <div className="stat">
                      <div className="stat__value stat__value--accent">
                        {formattedPrice}
                      </div>
                      <div className="stat__label">
                        {mintData.tokenSymbol} / NFT
                      </div>
                    </div>
                    <div className="stat">
                      <div className="stat__value">
                        {mintData.totalMinted.toString()}
                      </div>
                      <div className="stat__label">Minted</div>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="progress">
                    <div className="progress__bar">
                      <div
                        className="progress__fill"
                        style={{ width: `${progressPercent}%` }}
                        role="progressbar"
                        aria-valuenow={progressPercent}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${progressPercent}% minted`}
                      />
                    </div>
                    <div className="progress__text">
                      <span>
                        {mintData.totalMinted.toString()} /{" "}
                        {mintData.maxSupply.toString()}
                      </span>
                      <span>{progressPercent.toFixed(1)}%</span>
                    </div>
                  </div>

                  {/* Quantity */}
                  <div className="quantity">
                    <button
                      className="quantity__btn"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      id="quantity-minus-btn"
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <div className="quantity__value">{quantity}</div>
                    <button
                      className="quantity__btn"
                      onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                      disabled={quantity >= 10}
                      id="quantity-plus-btn"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                  <div className="quantity__max">
                    Max 10 NFTs per transaction
                  </div>

                  {/* Cost */}
                  <div className="cost">
                    <span className="cost__label">Total Cost</span>
                    <span className="cost__value">
                      {formattedCost} {mintData.tokenSymbol}
                    </span>
                  </div>

                  {/* Insufficient balance */}
                  {!hasEnoughBalance && (
                    <div
                      className="message message--error"
                      style={{ marginBottom: 16 }}
                    >
                      <IconCoins />
                      <span>
                        Insufficient balance. You need {formattedCost}{" "}
                        {mintData.tokenSymbol}.
                      </span>
                    </div>
                  )}

                  {/* Buttons */}
                  {!hasEnoughAllowance ? (
                    <button
                      className="btn btn--primary"
                      onClick={() => mintData.approve(quantity)}
                      disabled={mintData.isApproving || !hasEnoughBalance}
                      id="approve-btn"
                    >
                      {mintData.isApproving && (
                        <span className="btn__spinner" />
                      )}
                      {mintData.isApproving
                        ? "Approving..."
                        : `Approve ${formattedCost} ${mintData.tokenSymbol}`}
                    </button>
                  ) : (
                    <button
                      className="btn btn--primary"
                      onClick={() => mintData.mint(quantity)}
                      disabled={mintData.isMinting || !hasEnoughBalance}
                      id="mint-btn"
                    >
                      {mintData.isMinting && <span className="btn__spinner" />}
                      {mintData.isMinting
                        ? "Minting..."
                        : `Mint ${quantity} White Panther`}
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Disconnect */}
            <button
              className="btn btn--disconnect"
              onClick={wallet.disconnect}
              id="disconnect-btn"
            >
              Disconnect Wallet
            </button>
          </>
        )}

        {/* ── Footer ── */}
        <footer className="footer">
          <p>
            White Panther NFT &copy; 2026 — Built on{" "}
            <a
              href="https://arbitrum.io"
              target="_blank"
              rel="noopener noreferrer"
            >
              Arbitrum
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
