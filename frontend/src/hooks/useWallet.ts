import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { TARGET_CHAIN_ID, CHAIN_CONFIG } from "../config/contract";

interface WalletState {
  address: string | null;
  provider: ethers.BrowserProvider | null;
  signer: ethers.Signer | null;
  chainId: number | null;
  isConnecting: boolean;
  isCorrectChain: boolean;
  error: string | null;
}

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    address: null,
    provider: null,
    signer: null,
    chainId: null,
    isConnecting: false,
    isCorrectChain: false,
    error: null,
  });

  // -- Check if MetaMask is installed --
  const hasMetaMask = typeof window !== "undefined" && !!window.ethereum;

  // -- Connect wallet --
  const connect = useCallback(async () => {
    if (!window.ethereum) {
      setState((prev) => ({
        ...prev,
        error: "Please install MetaMask to continue!",
      }));
      return;
    }

    setState((prev) => ({ ...prev, isConnecting: true, error: null }));

    try {
      // ethers.js v6: BrowserProvider instead of Web3Provider
      const provider = new ethers.BrowserProvider(window.ethereum);
      // ethers.js v6: getSigner() returns a Promise (must await)
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);

      setState({
        address,
        provider,
        signer,
        chainId,
        isConnecting: false,
        isCorrectChain: chainId === TARGET_CHAIN_ID,
        error: null,
      });
    } catch (err: unknown) {
      const error =
        err instanceof Error ? err.message : "Unable to connect wallet";
      setState((prev) => ({
        ...prev,
        isConnecting: false,
        error:
          error.includes("rejected") || error.includes("denied")
            ? "You rejected the wallet connection"
            : error,
      }));
    }
  }, []);

  // -- Switch to Arbitrum network --
  const switchChain = useCallback(async () => {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [
          {
            chainId: `0x${TARGET_CHAIN_ID.toString(16)}`,
          },
        ],
      });
    } catch (switchError: unknown) {
      // Chain not added yet -> add it
      const err = switchError as { code: number };
      if (err.code === 4902) {
        try {
          const chainConfig =
            CHAIN_CONFIG[TARGET_CHAIN_ID as keyof typeof CHAIN_CONFIG];
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [chainConfig],
          });
        } catch {
          setState((prev) => ({
            ...prev,
            error: "Unable to add Arbitrum network",
          }));
        }
      }
    }
  }, []);

  // -- Disconnect --
  const disconnect = useCallback(() => {
    setState({
      address: null,
      provider: null,
      signer: null,
      chainId: null,
      isConnecting: false,
      isCorrectChain: false,
      error: null,
    });
  }, []);

  // -- Auto-reconnect on page load --
  useEffect(() => {
    if (!window.ethereum) return;

    // eth_accounts returns already-authorized accounts (no popup)
    window.ethereum
      .request({ method: "eth_accounts" })
      .then((accounts: unknown) => {
        const accs = accounts as string[];
        if (accs.length > 0) {
          connect();
        }
      })
      .catch(() => {});
  }, [connect]);

  // -- Listen for account/chain changes --
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = async (accounts: unknown) => {
      const accs = accounts as string[];
      if (accs.length === 0) {
        disconnect();
      } else if (state.address) {
        // Re-connect to get new signer
        connect();
      }
    };

    const handleChainChanged = () => {
      // Reconnect on chain change
      if (state.address) {
        connect();
      }
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      window.ethereum?.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum?.removeListener("chainChanged", handleChainChanged);
    };
  }, [state.address, connect, disconnect]);

  // -- Format address --
  const shortAddress = state.address
    ? `${state.address.slice(0, 6)}...${state.address.slice(-4)}`
    : null;

  return {
    ...state,
    hasMetaMask,
    shortAddress,
    connect,
    switchChain,
    disconnect,
  };
}
