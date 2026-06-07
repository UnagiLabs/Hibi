"use client";

import { ConnectButton } from "@mysten/dapp-kit-react/ui";
import { useCurrentAccount } from "@mysten/dapp-kit-react";
import { ShieldCheck, Wallet } from "lucide-react";

import { getDictionary, type Locale } from "@/lib/i18n";

export function WalletStatus({ locale }: { locale: Locale }) {
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
