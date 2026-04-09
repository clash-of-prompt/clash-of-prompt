"use client";

import { useState, useCallback, useEffect } from "react";
import { WalletContext } from "@/lib/wallet";
import {
  WalletWidgetProvider,
  useAddress,
  useWallet as useInitiaWallet,
} from "@initia/react-wallet-widget";
import { ChainSchema } from "@initia/initia-registry-types/zod";

// Custom layer config for our minitia rollup
const customLayer = ChainSchema.parse({
  chain_id: "clashofprompt-1",
  chain_name: "Clash of Prompt",
  apis: {
    rpc: [{ address: "https://clash-of-prompt-full.fly.dev" }],
    rest: [{ address: "https://clash-of-prompt-full.fly.dev" }],
  },
  fees: {
    fee_tokens: [{ denom: "umin", fixed_min_gas_price: 0 }],
  },
  bech32_prefix: "init",
});

function WalletBridge({ children }: { children: React.ReactNode }) {
  const address = useAddress();
  const { onboard, view, disconnect } = useInitiaWallet();
  const [clashBalance, setClashBalance] = useState(0);

  const fetchBalance = useCallback(async () => {
    if (!address) {
      setClashBalance(0);
      return;
    }
    try {
      const res = await fetch(`/api/clash-balance?address=${address}`);
      const data = await res.json();
      setClashBalance(data.balance || 0);
    } catch {
      setClashBalance(0);
    }
  }, [address]);

  useEffect(() => {
    fetchBalance();
    if (!address) return;
    const interval = setInterval(fetchBalance, 15000);
    return () => clearInterval(interval);
  }, [address, fetchBalance]);

  return (
    <WalletContext.Provider
      value={{
        address: address || null,
        connected: !!address,
        clashBalance,
        connect: onboard,
        disconnect,
        view,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export default function WalletWidgetInner({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WalletWidgetProvider customLayer={customLayer}>
      <WalletBridge>{children}</WalletBridge>
    </WalletWidgetProvider>
  );
}
