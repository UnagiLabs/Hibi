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
