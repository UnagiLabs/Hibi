# Sui Contracts

HibiのSui側では、写真やAlbumManifest本体は保存しない。Suiには「誰が家族メンバーか」と「どのWalrus Blobが正しいアルバムか」だけを記録する。

## オブジェクト

| Object | 役割 |
| --- | --- |
| `AdminCap` | FamilyVault作成とMember SBT発行の権限 |
| `FamilyVault` | 家族ごとの共有アーカイブ。AlbumRecordを保持する |
| `FamilyMemberSBT` | 家族メンバー証。譲渡しにくいSBTとして扱う |
| `AlbumRecord` | Walrus上のAlbumManifestへのポインタ |

## 保存するもの

`AlbumRecord` に保存するのは小さい情報だけ。

- `album_type`
- `target_year`
- `target_month`
- `manifest_walrus_blob_id`
- `manifest_sha256`
- `created_at_ms`

写真そのもの、AlbumManifest JSONそのものはWalrusに置く。

## 想定フロー

1. `AdminCap` を持つウォレットが `FamilyVault` を作成する。
2. `FamilyVault` をshared objectにする。
3. 家族メンバーのウォレットに `FamilyMemberSBT` をmintする。
4. Hibi APIが月次AlbumManifestをWalrusに保存する。
5. `FamilyMemberSBT` を提示して `FamilyVault` に `AlbumRecord` を追加する。
6. Webはウォレットが `FamilyMemberSBT` を持っているか確認し、該当FamilyVaultのアルバムを表示する。

## コマンド

```sh
sui move build --path contracts/hibi
sui move test --path contracts/hibi
```

## Testnet deployment

2026-06-06にSui testnetへpublish済み。

| 値 | ID |
| --- | --- |
| Package ID | `0x34078a3d56de04860794853fa9c2ef7af34c491bedf30c29e7eb5a683aedc063` |
| AdminCap ID | `0x033853c0dc8d4db3285cd14b30c9d560ffcf64a7a777b39982f1e94aa807c630` |
| UpgradeCap ID | `0x90793bb909651bdd1777ce9813ef9e60c8869b8322391726f34a899685adc457` |
| Demo FamilyVault ID | `0xb556988e953afbbecee164d4e513ca6b919844b237d6cd0691a14179de3ecb72` |
| Demo FamilyMemberSBT ID | `0xfe79549bdb22d7eb4720c663be792476f5a0d9db638efef261b30edae662b344` |

Transaction:

| 操作 | Digest |
| --- | --- |
| Publish | `3Pa2mz36XwS42x4wrdWcjBwfK6vCwomedFTAg95JWEWA` |
| Create demo FamilyVault | `Gbh19FpobUMwCJ4HqG3ARnVYbzTr12KbwEj6Tfo6axyg` |
| Mint demo FamilyMemberSBT | `J4LwnHZzQcXoMjuGEiNdeb8pawA7eRP9rWgybk9z3e8j` |
| Record demo monthly album | `G1GJmWnz8Zokq21Nk3DMnJ7qt8ii3de4L3bGKbotvso2` |

API接続用env:

```env
HIBI_SUI_PACKAGE_ID=0x34078a3d56de04860794853fa9c2ef7af34c491bedf30c29e7eb5a683aedc063
HIBI_SUI_ADMIN_CAP_ID=0x033853c0dc8d4db3285cd14b30c9d560ffcf64a7a777b39982f1e94aa807c630
HIBI_SUI_FAMILY_VAULT_ID=0xb556988e953afbbecee164d4e513ca6b919844b237d6cd0691a14179de3ecb72
HIBI_SUI_MEMBER_SBT_ID=0xfe79549bdb22d7eb4720c663be792476f5a0d9db638efef261b30edae662b344
```

`GET /api/health` の `sui.status` が `ok` なら、APIからtestnet上のPackage / FamilyVault / MemberSBTを参照できている。

`POST /api/albums/generate` では、WalrusへのAlbumManifest保存が成功した場合のみ、`FamilyVault` に `AlbumRecord` を追加する。
