import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import {
  WHITEPANTHER_ABI,
  ERC20_ABI,
  NFT_CONTRACT_ADDRESS,
} from "../config/contract";

interface MintState {
  mintPrice: bigint;
  totalMinted: bigint;
  maxSupply: bigint;
  isPaused: boolean;
  tokenSymbol: string;
  tokenDecimals: number;
  userTokenBalance: bigint;
  userAllowance: bigint;
  userNFTBalance: bigint;
  isLoading: boolean;
  isMinting: boolean;
  isApproving: boolean;
  txHash: string | null;
  error: string | null;
  success: string | null;
}

export function useMint(
  signer: ethers.Signer | null,
  provider: ethers.BrowserProvider | null,
  address: string | null,
) {
  const [state, setState] = useState<MintState>({
    mintPrice: 0n,
    totalMinted: 0n,
    maxSupply: 10000n,
    isPaused: false,
    tokenSymbol: "TOKEN",
    tokenDecimals: 18,
    userTokenBalance: 0n,
    userAllowance: 0n,
    userNFTBalance: 0n,
    isLoading: true,
    isMinting: false,
    isApproving: false,
    txHash: null,
    error: null,
    success: null,
  });

  // -- Load contract data --
  const loadData = useCallback(async () => {
    if (!provider || !address) {
      setState((prev) => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      setState((prev) => ({ ...prev, isLoading: true }));

      const nftContract = new ethers.Contract(
        NFT_CONTRACT_ADDRESS,
        WHITEPANTHER_ABI,
        provider,
      );

      const [mintPrice, totalMinted, maxSupply, isPaused, paymentTokenAddr] =
        await Promise.all([
          nftContract.mintPrice(),
          nftContract.totalMinted(),
          nftContract.MAX_SUPPLY(),
          nftContract.paused(),
          nftContract.paymentToken(),
        ]);

      // Fetch ERC-20 info
      const tokenContract = new ethers.Contract(
        paymentTokenAddr,
        ERC20_ABI,
        provider,
      );

      const [
        tokenSymbol,
        tokenDecimals,
        userTokenBalance,
        userAllowance,
        userNFTBalance,
      ] = await Promise.all([
        tokenContract.symbol(),
        tokenContract.decimals(),
        tokenContract.balanceOf(address),
        tokenContract.allowance(address, NFT_CONTRACT_ADDRESS),
        nftContract.balanceOf(address),
      ]);

      setState((prev) => ({
        ...prev,
        mintPrice,
        totalMinted,
        maxSupply,
        isPaused,
        tokenSymbol,
        tokenDecimals: Number(tokenDecimals),
        userTokenBalance,
        userAllowance,
        userNFTBalance,
        isLoading: false,
      }));
    } catch (err) {
      // Silently fail — contracts may not be deployed yet
      console.warn("Failed to load contract data:", err);
      setState((prev) => ({
        ...prev,
        isLoading: false,
      }));
    }
  }, [provider, address]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // -- Approve ERC-20 --
  const approve = useCallback(
    async (quantity: number) => {
      if (!signer || !provider) return;

      setState((prev) => ({ ...prev, isApproving: true, error: null }));

      try {
        const nftContract = new ethers.Contract(
          NFT_CONTRACT_ADDRESS,
          WHITEPANTHER_ABI,
          provider,
        );
        const paymentTokenAddr = await nftContract.paymentToken();
        const tokenContract = new ethers.Contract(
          paymentTokenAddr,
          ERC20_ABI,
          signer,
        );

        const totalCost = state.mintPrice * BigInt(quantity);
        const tx = await tokenContract.approve(NFT_CONTRACT_ADDRESS, totalCost);
        await tx.wait();

        setState((prev) => ({
          ...prev,
          isApproving: false,
          userAllowance: totalCost,
          success: "Approved successfully! You can now mint.",
        }));
      } catch (err: unknown) {
        const error = err instanceof Error ? err.message : "Approval failed";
        setState((prev) => ({
          ...prev,
          isApproving: false,
          error: error.includes("rejected")
            ? "You rejected the approval transaction"
            : "Approval failed. Please try again.",
        }));
      }
    },
    [signer, provider, state.mintPrice],
  );

  // -- Mint NFT --
  const mint = useCallback(
    async (quantity: number) => {
      if (!signer) return;

      setState((prev) => ({
        ...prev,
        isMinting: true,
        error: null,
        success: null,
        txHash: null,
      }));

      try {
        const nftContract = new ethers.Contract(
          NFT_CONTRACT_ADDRESS,
          WHITEPANTHER_ABI,
          signer,
        );

        const tx = await nftContract.mint(quantity);
        setState((prev) => ({ ...prev, txHash: tx.hash }));

        await tx.wait();

        setState((prev) => ({
          ...prev,
          isMinting: false,
          success: `Successfully minted ${quantity} White Panther NFT(s)!`,
        }));

        // Reload data
        await loadData();
      } catch (err: unknown) {
        const error = err instanceof Error ? err.message : "Mint failed";
        setState((prev) => ({
          ...prev,
          isMinting: false,
          error: error.includes("rejected")
            ? "You rejected the mint transaction"
            : error.includes("ExceedsMaxSupply")
              ? "All NFTs have been minted!"
              : "Mint failed. Please try again.",
        }));
      }
    },
    [signer, loadData],
  );

  // -- Clear messages --
  const clearMessages = useCallback(() => {
    setState((prev) => ({ ...prev, error: null, success: null }));
  }, []);

  return {
    ...state,
    approve,
    mint,
    clearMessages,
    reload: loadData,
  };
}
