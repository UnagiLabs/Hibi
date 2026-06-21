# Integration Verification

HibiのMemWal / Walrus / Sui / Web統合が動いているかを確認する手順。

TelegramからOpenClaw経由でHibiを操作する確認は `openclaw-telegram-setup.md` も併用する。

## 前提

`apps/api/.env` に以下が入っていること。

```env
MEMWAL_ACCOUNT_ID=...
MEMWAL_PRIVATE_KEY=...
MEMWAL_SERVER_URL=https://relayer.memory.walrus.xyz
SUI_NETWORK=testnet
SUI_PRIVATE_KEY=...
HIBI_SUI_PACKAGE_ID=0x34078a3d56de04860794853fa9c2ef7af34c491bedf30c29e7eb5a683aedc063
HIBI_SUI_FAMILY_VAULT_ID=0xb556988e953afbbecee164d4e513ca6b919844b237d6cd0691a14179de3ecb72
HIBI_SUI_MEMBER_SBT_ID=0xfe79549bdb22d7eb4720c663be792476f5a0d9db638efef261b30edae662b344
```

`apps/web/.env` に以下が入っていること。

```env
HIBI_API_URL=http://127.0.0.1:4000
NEXT_PUBLIC_SUI_NETWORK=testnet
NEXT_PUBLIC_HIBI_SUI_PACKAGE_ID=0x34078a3d56de04860794853fa9c2ef7af34c491bedf30c29e7eb5a683aedc063
NEXT_PUBLIC_HIBI_SUI_FAMILY_VAULT_ID=0xb556988e953afbbecee164d4e513ca6b919844b237d6cd0691a14179de3ecb72
```

秘密鍵は `.env.example` やGit管理ファイルに入れない。

## 0. 古いAPIプロセスを再起動する

4000番に古いAPIプロセスが残っていると、最新のSui設定を読めない。

確認:

```sh
lsof -nP -iTCP:4000 -sTCP:LISTEN
```

古いプロセスがある場合は停止してから起動し直す。

```sh
pnpm dev:api
```

検証用に既存プロセスを触りたくない場合は、一時的に別ポートで起動する。

```sh
PORT=4001 pnpm --filter @hibi/api dev
```

以下の例では `4000` を使う。別ポートで起動した場合はURLを読み替える。

## 1. Health

```sh
curl http://127.0.0.1:4000/api/health
```

合格条件:

- `db` が `ok`
- `memwal.status` が `ok`
- `sui.status` が `ok`
- `sui.objects[]` の `package` / `familyVault` / `memberSbt` が `ok`

## 2. MemWal remember

```sh
curl -X POST http://127.0.0.1:4000/api/messages \
  -H 'content-type: application/json' \
  -d '{"text":"今日は積み木を3つ重ねられた"}'
```

合格条件:

- `ok` が `true`
- `memwal.status` が `done`
- `memwal.blobId` が返る

## 3. MemWal recall

```sh
curl -X POST http://127.0.0.1:4000/api/recall \
  -H 'content-type: application/json' \
  -d '{"query":"最近できるようになったことは？"}'
```

合格条件:

- `recall.status` が `ok`
- `recall.results[]` に直近でrememberした思い出が含まれる

## 4. Walrus AlbumManifest + Sui AlbumRecord

```sh
curl -X POST http://127.0.0.1:4000/api/albums/generate \
  -H 'content-type: application/json' \
  -d '{"targetYear":2026,"targetMonth":6}'
```

合格条件:

- `walrusArtifact.status` が `done`
- `walrusArtifact.blobId` が返る
- `manifestWalrusBlobId` が返る
- `suiRecord.status` が `done`
- `suiRecord.digest` が返る

## 5. Sui FamilyVaultを直接確認

```sh
sui client object 0xb556988e953afbbecee164d4e513ca6b919844b237d6cd0691a14179de3ecb72 --json
```

合格条件:

- object typeが `family::FamilyVault`
- `content.fields.album_count` が増えている
- `content.fields.albums[]` の最後に `manifest_walrus_blob_id` と `manifest_sha256` が入っている

## 6. Web wallet

```sh
pnpm dev:web
```

開く:

```text
http://localhost:3000
```

合格条件:

- ヘッダーにWallet connectボタンが出る
- Sui testnetのウォレットを接続できる
- demo `FamilyMemberSBT` を持つウォレットなら `Family access verified` が表示される
- SBTを持たないウォレットなら `No Hibi Family Pass found` が表示される

## 7. OpenClaw plugin runtime

簡易確認:

```sh
./scripts/verify-openclaw-hibi.sh
```

手動確認:

```sh
openclaw plugins inspect hibi --runtime --json | grep -E 'status|activated|hibi_'
```

合格条件:

- `activated` が `true`
- `status` が `loaded`
- `hibi_remember_text` が表示される
- `hibi_recall_memory` が表示される
- `hibi_upload_photo` が表示される
- `hibi_generate_monthly_album` が表示される

Hibi APIの接続先を明示する場合:

```sh
openclaw config set 'plugins.entries.hibi.config.apiBaseUrl' 'http://127.0.0.1:4000'
openclaw gateway restart
```

## 8. Telegram channel

```sh
openclaw gateway status
openclaw channels status --probe
openclaw plugins inspect telegram --runtime --json | grep -E 'status|activated'
```

合格条件:

- OpenClaw gatewayがrunning
- Telegram bot tokenが設定済み
- `dmPolicy` が `pairing`
- 初回DMを `openclaw pairing approve telegram <CODE>` で承認済み
- Telegram pluginがloaded

## 9. Telegram smoke test

Telegram channel設定後、Telegramから以下を送る。

```text
Hibiに記録して。ミルク120ml飲んだ
```

合格条件:

- OpenClawがHibi pluginのtoolを呼ぶ
- Hibi API logに `POST /api/messages` 相当の保存が出る
- 返答にview URLが含まれる
- Hibi API側の保存結果で `memwal.status=done` を確認できる

## 2026-06-06検証メモ

確認用APIを `PORT=4001` で起動して検証した。

- `GET /api/health`: `memwal.status=ok`, `sui.status=ok`
- `POST /api/messages`: `memwal.status=done`
- `POST /api/recall`: `recall.status=ok`, rememberした内容を取得
- `POST /api/albums/generate`: `walrusArtifact.status=done`, `suiRecord.status=done`
- 生成されたWalrus blob ID: `QbKcl7ulpzH1B0-TZrtZmH-PyELot3eN53CwynQI2Jc`
- Sui AlbumRecord tx: `6rUyEPJgg7iLAJFPJKhQq8oXh426tc5AumYjQPtL4p45`
- `FamilyVault.album_count`: `2`

Sui CLIではclient/server version mismatch warningが出るが、publish、object read、API writeは成功している。
