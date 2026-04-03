"use client";

import { useState, useCallback, useEffect } from "react";
import { WalletContext } from "@/lib/wallet";

const MOCK_ADDRESS = "0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18";
const MOCK_CHAIN_ID = 1;

export default function WalletProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState(0);
  const [clashBalance, setClashBalance] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem("clash-of-prompt-wallet");
    if (saved) {
      setAddress(saved);
      setChainId(MOCK_CHAIN_ID);
      setClashBalance(0);
    }
  }, []);

  const getClashBalance = useCallback(async (): Promise<number> => {
    // Mock: will connect to chain later
    return 0;
  }, []);

  const connect = useCallback(async () => {
    // Mock connection - real InterwovenKit integration later
    setAddress(MOCK_ADDRESS);
    setChainId(MOCK_CHAIN_ID);
    const balance = await getClashBalance();
    setClashBalance(balance);
    localStorage.setItem("clash-of-prompt-wallet", MOCK_ADDRESS);
  }, [getClashBalance]);

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
