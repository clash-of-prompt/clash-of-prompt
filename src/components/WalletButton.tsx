"use client";

import { useWallet } from "@/lib/wallet";
import { useI18n } from "@/lib/i18n";

function truncateAddress(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export default function WalletButton() {
  const { address, connected, clashBalance, connect, disconnect } = useWallet();
  const { t } = useI18n();

  if (connected && address) {
    return (
      <button
        onClick={disconnect}
        className="flex items-center gap-2 px-2 py-0.5 text-sm border border-[var(--green)] text-green glow-green hover:bg-[var(--green)] hover:bg-opacity-10 transition-colors"
      >
        <span className="text-cyan">{truncateAddress(address)}</span>
        <span className="text-amber glow-amber">{clashBalance} CLASH</span>
      </button>
    );
  }

  return (
    <button
      onClick={connect}
      className="px-2 py-0.5 text-sm border border-[var(--dim)] text-dim hover:text-green hover:border-[var(--green-dim)] transition-colors"
    >
      {t.connect_wallet}
    </button>
  );
}
