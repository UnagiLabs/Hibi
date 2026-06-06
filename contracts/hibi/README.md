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

## Testnet

Published on Sui testnet:

```text
Package ID: 0x34078a3d56de04860794853fa9c2ef7af34c491bedf30c29e7eb5a683aedc063
AdminCap ID: 0x033853c0dc8d4db3285cd14b30c9d560ffcf64a7a777b39982f1e94aa807c630
Demo FamilyVault ID: 0xb556988e953afbbecee164d4e513ca6b919844b237d6cd0691a14179de3ecb72
Demo FamilyMemberSBT ID: 0xfe79549bdb22d7eb4720c663be792476f5a0d9db638efef261b30edae662b344
```

## Design Notes

- Move 2024 syntax is used.
- `FamilyMemberSBT` intentionally has `key` only, not `store`, so it cannot be freely transferred with `public_transfer`.
- Access control uses a capability-style object, not an address allowlist.
- `FamilyVault` is shared because album records need to be appended over time.
