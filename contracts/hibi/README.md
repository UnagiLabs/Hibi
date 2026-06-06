# Hibi Move Contracts

This package defines the first on-chain ownership layer for Hibi.

## Model

| Object | Role |
| --- | --- |
| `AdminCap` | Package admin capability. Used to create family vaults and mint member SBTs. |
| `FamilyVault` | Shared family archive object. Stores small album proof records. |
| `FamilyMemberSBT` | Soulbound family membership object. Used as the proof required to append album records. |
| `AlbumRecord` | Small pointer to a Walrus `AlbumManifest`: album type, target month, Walrus blob ID, sha256, timestamp. |

Large data stays off-chain:

- Photos: Walrus blobs
- AlbumManifest JSON: Walrus blob
- Search memory: MemWal

Sui stores only membership and verifiable pointers.

## Commands

```sh
sui move build --path contracts/hibi
sui move test --path contracts/hibi
```

## Design Notes

- Move 2024 syntax is used.
- `FamilyMemberSBT` intentionally has `key` only, not `store`, so it cannot be freely transferred with `public_transfer`.
- Access control uses a capability-style object, not an address allowlist.
- `FamilyVault` is shared because album records need to be appended over time.
