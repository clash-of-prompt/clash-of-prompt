"use client";

import { useState, useCallback, useEffect } from "react";
import { WalletContext } from "@/lib/wallet";

// Use real gas station address for testing (will be replaced by InterwovenKit)
const MOCK_ADDRESS = "init1zcz8p65y8c60l8kgy65l5y2um223qms95kayp3";

export default function WalletProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState(0);
  const [clashBalance, setClashBalance] = useState(0);

  const getClashBalance = useCallback(async (): Promise<number> => {
    if (!address) return 0;
    try {
      const res = await fetch(`/api/clash-balance?address=${address}`);
      const data = await res.json();
      return data.balance || 0;
    } catch {
      return 0;
    }
  }, [address]);

  // Refresh balance periodically
  useEffect(() => {
    if (!address) return;
    const refresh = async () => {
      const bal = await getClashBalance();
      setClashBalance(bal);
    };
    refresh();
    const interval = setInterval(refresh, 10000); // every 10s
    return () => clearInterval(interval);
  }, [address, getClashBalance]);

  useEffect(() => {
    const saved = localStorage.getItem("clash-of-prompt-wallet");
    if (saved) {
      setAddress(saved);
      setChainId(1);
    }
  }, []);

  const connect = useCallback(async () => {
    setAddress(MOCK_ADDRESS);
    setChainId(1);
    localStorage.setItem("clash-of-prompt-wallet", MOCK_ADDRESS);
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    setChainId(0);
    setClashBalance(0);
    localStorage.removeItem("clash-of-prompt-wallet");
  }, []);

  return (
    <WalletContext.Provider
      value={{
        address,
        chainId,
        connected: address !== null,
        clashBalance,
        connect,
        disconnect,
        getClashBalance,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}
