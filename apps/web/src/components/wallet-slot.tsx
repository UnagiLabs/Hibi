"use client";

import dynamic from "next/dynamic";

import type { Locale } from "@/lib/i18n";

const WalletStatus = dynamic(
  () => import("./wallet-status").then((mod) => mod.WalletStatus),
  {
    ssr: false,
    loading: () => <div className="wallet-panel skeleton" />
  }
);

export function WalletSlot({ locale }: { locale: Locale }) {
  return <WalletStatus locale={locale} />;
}
