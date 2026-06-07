export const hibiSuiContract = {
  network: process.env.NEXT_PUBLIC_SUI_NETWORK ?? "testnet",
  packageId: process.env.NEXT_PUBLIC_HIBI_SUI_PACKAGE_ID ?? "",
  familyVaultId: process.env.NEXT_PUBLIC_HIBI_SUI_FAMILY_VAULT_ID ?? "",
  memberSbtType: buildMemberSbtType(process.env.NEXT_PUBLIC_HIBI_SUI_PACKAGE_ID ?? "")
};

function buildMemberSbtType(packageId: string): string {
  return packageId ? `${packageId}::family::FamilyMemberSBT` : "";
}
