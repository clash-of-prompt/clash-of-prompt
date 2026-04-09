"use client";

import { createContext, useContext } from "react";

export interface WalletState {
  address: string | null;
  connected: boolean;
  clashBalance: number;
  connect: () => void;
  disconnect: () => Promise<void>;
  view: (e: React.MouseEvent) => void;
}

const defaultWalletState: WalletState = {
  address: null,
  connected: false,
  clashBalance: 0,
  connect: () => {},
  disconnect: async () => {},
  view: () => {},
};

export const WalletContext = createContext<WalletState>(defaultWalletState);

export function useWallet() {
  return useContext(WalletContext);
}
