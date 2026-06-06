# Walrus AlbumManifest Setup

Hibiでは、月次アルバムを生成するときに `AlbumManifest` というJSONを作る。

このJSONには、アルバムのタイトル、対象月、MemWalから見つけたハイライト、育児ログの要約が入る。写真そのものは次の段階で追加する。

## 保存の役割

| 保存先 | 役割 |
| --- | --- |
| SQLite / Postgres | アプリが検索・表示しやすい通常のDB |
| MemWal | 「最近できるようになったことは？」のような意味検索 |
| Walrus | アルバムManifestなど、長く残したい成果物の保存 |

## 現在の動き

`POST /api/albums/generate` を呼ぶと次の順で動く。

1. 月次AlbumをDBに作成または再利用する。
2. MemWalから月次ハイライトを取得する。
3. 対象月のCareLogをDBから取得する。
4. `AlbumManifest` JSONを生成する。
5. JSONのsha256 hashを計算する。
6. `SUI_PRIVATE_KEY` があればWalrus testnetへ保存する。
7. DBの `Album.manifestSha256` と `Album.manifestWalrusBlobId` を更新する。

`SUI_PRIVATE_KEY` がない場合、Walrus保存は `disabled` になる。ただしManifest生成とhash保存は行われる。

## 必要なenv

```env
SUI_NETWORK=testnet
SUI_PRIVATE_KEY=
WALRUS_EPOCHS=3
WALRUS_UPLOAD_RELAY_URL=https://upload-relay.testnet.walrus.space
```

`SUI_PRIVATE_KEY` は絶対にGitへコミットしない。ローカルの `apps/api/.env` にだけ入れる。

## 実アップロードに必要なもの

- Sui testnetの秘密鍵
- そのアドレスにあるtestnet SUI
- Walrus保存に必要なtestnet WAL

残高が足りない場合、Manifest生成は成功するが、Walrusアップロードは `failed` になる。

## 動作確認

APIを起動する。

```sh
pnpm dev:api
```

月次アルバムを生成する。

```sh
curl -X POST http://127.0.0.1:4000/api/albums/generate \
  -H 'content-type: application/json' \
  -d '{"targetYear":2026,"targetMonth":6}'
```

レスポンスの見方:

- `manifestSha256`: Manifest JSONのhash。鍵がなくても入る。
- `walrusArtifact.status: "disabled"`: `SUI_PRIVATE_KEY` が未設定。
- `walrusArtifact.status: "done"`: Walrus保存成功。
- `manifestWalrusBlobId`: Walrusに保存されたBlob ID。

Webの月次アルバム画面でも、Walrus保存済みまたはManifest生成済みの状態を確認できる。
