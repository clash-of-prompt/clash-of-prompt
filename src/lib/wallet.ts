"use client";

import { createContext, useContext } from "react";

export interface WalletState {
  address: string | null;
  chainId: number;
  connected: boolean;
  clashBalance: number;
  connect: () => Promise<void>;
  disconnect: () => void;
  getClashBalance: () => Promise<number>;
}

const defaultWalletState: WalletState = {
  address: null,
  chainId: 0,
  connected: false,
  clashBalance: 0,
  connect: async () => {},
  disconnect: () => {},
  getClashBalance: async () => 0,
};

export const WalletContext = createContext<WalletState>(defaultWalletState);

export function useWallet() {
  return useContext(WalletContext);
}
