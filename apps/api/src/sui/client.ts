import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { getJsonRpcFullnodeUrl, SuiJsonRpcClient } from "@mysten/sui/jsonRpc";
import { Transaction } from "@mysten/sui/transactions";

import { config } from "../config.js";

type SuiContractHealth =
  | {
      status: "disabled";
      reason: "missing_contract_config";
      network: string;
      missing: string[];
    }
  | {
      status: "ok";
      network: string;
      packageId: string;
      adminCapId?: string;
      familyVaultId: string;
      memberSbtId: string;
      objects: SuiObjectCheck[];
    }
  | {
      status: "failed";
      network: string;
      error: string;
    };

type SuiObjectCheck = {
  label: string;
  objectId: string;
  status: "ok" | "missing";
  type?: string;
  owner?: unknown;
  error?: string;
};

type SuiAlbumRecordOutcome =
  | {
      status: "disabled";
      reason: "missing_contract_config" | "missing_sui_private_key";
      missing?: string[];
    }
  | {
      status: "done";
      digest: string;
      packageId: string;
      familyVaultId: string;
      memberSbtId: string;
      explorerUrl: string;
    }
  | {
      status: "failed";
      error: string;
      packageId?: string;
      familyVaultId?: string;
      memberSbtId?: string;
    };

type AlbumRecordInput = {
  albumType: string;
  targetYear: number;
  targetMonth: number;
  manifestWalrusBlobId: string;
  manifestSha256: string;
  createdAtMs: number;
};

const CONTRACT_CONFIG_KEYS = [
  "HIBI_SUI_PACKAGE_ID",
  "HIBI_SUI_FAMILY_VAULT_ID",
  "HIBI_SUI_MEMBER_SBT_ID"
] as const;

export async function checkSuiContract(): Promise<SuiContractHealth> {
  const missing = getMissingContractConfig();

  if (missing.length > 0) {
    return {
      status: "disabled",
      reason: "missing_contract_config",
      network: config.sui.network,
      missing
    };
  }

  try {
    const client = createSuiClient();
    const objectInputs = [
      { label: "package", objectId: config.sui.packageId },
      { label: "adminCap", objectId: config.sui.adminCapId },
      { label: "familyVault", objectId: config.sui.familyVaultId },
      { label: "memberSbt", objectId: config.sui.memberSbtId }
    ].filter((item): item is { label: string; objectId: string } => Boolean(item.objectId));
    const responses = await client.multiGetObjects({
      ids: objectInputs.map((item) => item.objectId),
      options: {
        showOwner: true,
        showType: true
      }
    });

    return {
      status: "ok",
      network: config.sui.network,
      packageId: config.sui.packageId!,
      adminCapId: config.sui.adminCapId,
      familyVaultId: config.sui.familyVaultId!,
      memberSbtId: config.sui.memberSbtId!,
      objects: responses.map((response, index) => {
        const input = objectInputs[index];
        if (!response || "error" in response && response.error) {
          return {
            label: input.label,
            objectId: input.objectId,
            status: "missing",
            error: response?.error ? JSON.stringify(response.error) : "Object not found"
          };
        }

        return {
          label: input.label,
          objectId: input.objectId,
          status: "ok",
          type: response.data?.type ?? undefined,
          owner: response.data?.owner
        };
      })
    };
  } catch (error) {
    return {
      status: "failed",
      network: config.sui.network,
      error: error instanceof Error ? error.message : "Unknown Sui contract health error"
    };
  }
}

export async function recordAlbumOnSui(input: AlbumRecordInput): Promise<SuiAlbumRecordOutcome> {
  const missing = getMissingContractConfig();

  if (missing.length > 0) {
    return {
      status: "disabled",
      reason: "missing_contract_config",
      missing
    };
  }

  if (!config.sui.privateKey) {
    return {
      status: "disabled",
      reason: "missing_sui_private_key"
    };
  }

  try {
    const client = createSuiClient();
    const signer = Ed25519Keypair.fromSecretKey(config.sui.privateKey);
    const tx = new Transaction();

    tx.moveCall({
      target: `${config.sui.packageId}::family::add_album_record`,
      arguments: [
        tx.object(config.sui.familyVaultId!),
        tx.object(config.sui.memberSbtId!),
        tx.pure.string(input.albumType),
        tx.pure.u64(input.targetYear),
        tx.pure.u8(input.targetMonth),
        tx.pure.string(input.manifestWalrusBlobId),
        tx.pure.string(input.manifestSha256),
        tx.pure.u64(input.createdAtMs)
      ]
    });

    const response = await client.signAndExecuteTransaction({
      signer,
      transaction: tx,
      options: {
        showEffects: true,
        showEvents: true
      }
    });
    const status = response.effects?.status.status;

    if (status !== "success") {
      return {
        status: "failed",
        error: response.effects?.status.error ?? "Sui transaction failed",
        packageId: config.sui.packageId,
        familyVaultId: config.sui.familyVaultId,
        memberSbtId: config.sui.memberSbtId
      };
    }

    return {
      status: "done",
      digest: response.digest,
      packageId: config.sui.packageId!,
      familyVaultId: config.sui.familyVaultId!,
      memberSbtId: config.sui.memberSbtId!,
      explorerUrl: buildExplorerTransactionUrl(response.digest)
    };
  } catch (error) {
    return {
      status: "failed",
      error: error instanceof Error ? error.message : "Unknown Sui album record error",
      packageId: config.sui.packageId,
      familyVaultId: config.sui.familyVaultId,
      memberSbtId: config.sui.memberSbtId
    };
  }
}

function createSuiClient() {
  return new SuiJsonRpcClient({
    network: normalizeNetwork(config.sui.network),
    url: getJsonRpcFullnodeUrl(normalizeNetwork(config.sui.network))
  });
}

function getMissingContractConfig(): string[] {
  const configByKey = {
    HIBI_SUI_PACKAGE_ID: config.sui.packageId,
    HIBI_SUI_FAMILY_VAULT_ID: config.sui.familyVaultId,
    HIBI_SUI_MEMBER_SBT_ID: config.sui.memberSbtId
  };

  return CONTRACT_CONFIG_KEYS.filter((key) => !configByKey[key]);
}

function normalizeNetwork(network: string): "mainnet" | "testnet" | "devnet" | "localnet" {
  if (network === "mainnet" || network === "devnet" || network === "localnet") {
    return network;
  }

  return "testnet";
}

function buildExplorerTransactionUrl(digest: string): string {
  const networkQuery = config.sui.network === "mainnet" ? "" : `?network=${config.sui.network}`;
  return `https://suivision.xyz/txblock/${digest}${networkQuery}`;
}
