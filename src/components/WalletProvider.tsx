"use client";

import { useState, useCallback, useEffect } from "react";
import { WalletContext } from "@/lib/wallet";
import dynamic from "next/dynamic";

// Dynamically import wallet widget to avoid SSR issues (window is not defined)
const WalletWidgetInner = dynamic(
  () => import("./WalletWidgetInner"),
  { ssr: false, loading: () => null }
);

export default function WalletProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <WalletWidgetInner>{children}</WalletWidgetInner>;
}
