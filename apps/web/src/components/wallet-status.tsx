"use client";

import { ConnectButton } from "@mysten/dapp-kit-react/ui";
import { DAppKitProvider, useCurrentAccount } from "@mysten/dapp-kit-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ShieldCheck, Wallet } from "lucide-react";
import { useState } from "react";

import { dAppKit } from "@/lib/dapp-kit";
import { getDictionary, type Locale } from "@/lib/i18n";

export function WalletStatus({ locale }: { locale: Locale }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <DAppKitProvider dAppKit={dAppKit}>
        <WalletStatusContent locale={locale} />
      </DAppKitProvider>
    </QueryClientProvider>
  );
}

function WalletStatusContent({ locale }: { locale: Locale }) {
  const account = useCurrentAccount();
  const dictionary = getDictionary(locale);

  return (
    <section className="wallet-panel" aria-label={dictionary.wallet}>
      <div className="wallet-copy">
        <div className="wallet-icon">
          {account ? <ShieldCheck size={18} aria-hidden="true" /> : <Wallet size={18} aria-hidden="true" />}
        </div>
        <div>
          <strong>{account ? dictionary.walletConnected : dictionary.walletPrompt}</strong>
          <span>{account ? shortenAddress(account.address) : dictionary.walletDemoMode}</span>
        </div>
      </div>
      <ConnectButton />
    </section>
  );
}

function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
