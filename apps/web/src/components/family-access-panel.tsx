"use client";

import { useCurrentAccount, useCurrentClient } from "@mysten/dapp-kit-react";
import { CheckCircle2, CircleAlert, ShieldCheck, Wallet } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { hibiSuiContract } from "@/lib/sui-contract";
import { getDictionary, type Locale } from "@/lib/i18n";

type SbtCheckState =
  | { status: "not_connected" }
  | { status: "not_configured" }
  | { status: "checking" }
  | { status: "verified"; memberSbtId: string }
  | { status: "missing" }
  | { status: "failed"; error: string };

export function FamilyAccessPanel({ locale }: { locale: Locale }) {
  const account = useCurrentAccount();
  const client = useCurrentClient();
  const dictionary = getDictionary(locale);
  const [state, setState] = useState<SbtCheckState>({ status: "not_connected" });
  const copy = useMemo(() => buildAccessCopy(state, locale), [state, locale]);

  useEffect(() => {
    let ignore = false;

    if (!account) {
      setState({ status: "not_connected" });
      return;
    }

    if (!hibiSuiContract.memberSbtType || !hibiSuiContract.familyVaultId) {
      setState({ status: "not_configured" });
      return;
    }

    setState({ status: "checking" });

    client
      .listOwnedObjects({
        owner: account.address,
        type: hibiSuiContract.memberSbtType,
        limit: 10,
        include: {
          json: true
        }
      })
      .then((response) => {
        if (ignore) {
          return;
        }

        const member = response.objects.find((object) => {
          const vaultId = readJsonField(object.json, "vault_id");
          return vaultId === hibiSuiContract.familyVaultId;
        });

        setState(
          member
            ? { status: "verified", memberSbtId: member.objectId }
            : { status: "missing" }
        );
      })
      .catch((error: unknown) => {
        if (ignore) {
          return;
        }

        setState({
          status: "failed",
          error: error instanceof Error ? error.message : "Unknown Sui query error"
        });
      });

    return () => {
      ignore = true;
    };
  }, [account, client]);

  const Icon = state.status === "verified"
    ? CheckCircle2
    : state.status === "missing" || state.status === "failed"
      ? CircleAlert
      : account
        ? ShieldCheck
        : Wallet;

  return (
    <section className={`family-access-panel ${state.status}`} aria-label={dictionary.familyAccess}>
      <div className="access-icon">
        <Icon size={22} aria-hidden="true" />
      </div>
      <div className="access-copy">
        <p className="eyebrow">{dictionary.wallet}</p>
        <h2>{copy.title}</h2>
        <p>{copy.body}</p>
        <div className="access-meta">
          <span>{hibiSuiContract.network}</span>
          {account ? <span>{shortenAddress(account.address)}</span> : null}
          {state.status === "verified" ? <span>{shortenAddress(state.memberSbtId)}</span> : null}
        </div>
      </div>
    </section>
  );
}

function buildAccessCopy(state: SbtCheckState, locale: Locale) {
  const copy = {
    en: {
      not_connected: {
        title: "Connect a wallet to unlock family access",
        body: "Hibi checks your Sui wallet for a FamilyMemberSBT before showing verified family archive access."
      },
      not_configured: {
        title: "Sui contract settings are missing",
        body: "The web app needs the Hibi testnet package and FamilyVault IDs."
      },
      checking: {
        title: "Checking your Family Pass",
        body: "Looking for a Hibi FamilyMemberSBT owned by this wallet."
      },
      verified: {
        title: "Family access verified",
        body: "This wallet owns the Hibi FamilyMemberSBT for the sample FamilyVault."
      },
      missing: {
        title: "No Hibi Family Pass found",
        body: "This wallet is connected, but it does not own the FamilyMemberSBT for this FamilyVault."
      },
      failed: {
        title: "Could not check Sui access",
        body: state.status === "failed" ? state.error : "Please try again."
      }
    },
    ja: {
      not_connected: {
        title: "ウォレットを接続すると家族アクセスを確認できます",
        body: "HibiはSuiウォレット内のFamilyMemberSBTを確認して、家族アーカイブの閲覧権限を判定します。"
      },
      not_configured: {
        title: "Sui契約設定が不足しています",
        body: "WebアプリにHibi testnet packageとFamilyVault IDの設定が必要です。"
      },
      checking: {
        title: "Family Passを確認中",
        body: "このウォレットがHibi FamilyMemberSBTを持っているか確認しています。"
      },
      verified: {
        title: "家族アクセスを確認しました",
        body: "このウォレットはサンプルFamilyVaultのHibi FamilyMemberSBTを持っています。"
      },
      missing: {
        title: "Hibi Family Passが見つかりません",
        body: "ウォレットは接続されていますが、このFamilyVaultのFamilyMemberSBTを持っていません。"
      },
      failed: {
        title: "Suiアクセスを確認できませんでした",
        body: state.status === "failed" ? state.error : "もう一度試してください。"
      }
    }
  };

  return copy[locale][state.status];
}

function readJsonField(json: unknown, field: string): string | null {
  if (!json || typeof json !== "object") {
    return null;
  }

  const value = (json as Record<string, unknown>)[field];
  return typeof value === "string" ? value : null;
}

function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
