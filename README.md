# Hibi

Family memories, remembered.

Hibi is an OpenClaw-powered chat-first family memory agent.

Families send photos, baby care logs, pet memories, and everyday moments through chat. Hibi classifies the input, stores long-term memories with MemWal, stores photos and generated albums with Walrus, and records verifiable pointers and hashes on Sui.

## MVP Scope

- OpenClaw Plugin for chat input
- Hibi API for workflows and persistence
- Album, care log, and archive status web views
- MemWal integration for long-term AI memory
- Walrus integration for photos and generated albums
- Sui FamilyVault or pointer/hash recording
- Self-hostable OSS setup

## Repository Layout

```text
apps/
  api/                  Hibi API
  web/                  Read-only album, care log, and archive views
packages/
  core/                 Shared types, clients, and workflow logic
  openclaw-plugin/      OpenClaw plugin package
contracts/             Sui Move contracts
docker/                Self-hosting compose files
docs/                  Product, architecture, and roadmap docs
scripts/               Local development and maintenance scripts
```

## Docs

- [Docs index](docs/README.md)
- [Product spec](docs/product-spec.md)
- [Architecture](docs/architecture.md)
- [Roadmap](docs/roadmap.md)
- [OpenClaw plugin](docs/openclaw-plugin.md)

## Current Status

The local MVP path is implemented for the Hibi API and Web app:

- Natural-language memory input is saved to SQLite and remembered by MemWal.
- Photos and monthly AlbumManifest artifacts can be stored on Walrus testnet.
- AlbumManifest blob IDs and hashes are recorded in the Sui testnet `FamilyVault`.
- The Web app can connect a Sui wallet and verify the demo `FamilyMemberSBT`.

OpenClaw packaging and production multi-family auth are still future phases.

## Development

Install dependencies:

```bash
pnpm install
```

Prepare API environment:

```bash
cp apps/api/.env.example apps/api/.env
```

Create the local SQLite database:

```bash
pnpm db:migrate
pnpm db:seed
```

Start the Hibi API:

```bash
pnpm dev:api
```

Health check:

```bash
curl http://127.0.0.1:4000/api/health
```

Record a care log:

```bash
curl -X POST http://127.0.0.1:4000/api/messages \
  -H 'content-type: application/json' \
  -d '{"text":"ミルク120ml飲んだ"}'
```

The response includes a `viewId` and `viewUrl`. Fetch view data for the web app:

```bash
curl http://127.0.0.1:4000/api/memory-views/<viewId>/bootstrap
```

Start the Hibi Web app in another terminal:

```bash
cp apps/web/.env.example apps/web/.env
pnpm dev:web
```

Open the `viewUrl` returned by `POST /api/messages`.

Create a monthly growth album view:

```bash
curl -X POST http://127.0.0.1:4000/api/albums/generate \
  -H 'content-type: application/json' \
  -d '{"targetYear":2026,"targetMonth":6}'
```

Open the returned `viewUrl` to see the album page.

Wallet connection:

- The web view includes a Sui wallet connection panel.
- The connected wallet is checked for the demo `FamilyMemberSBT` on Sui testnet.
- When the wallet owns the SBT for the demo `FamilyVault`, the home page shows verified family access.

Full integration verification steps are in [Integration verification](docs/integration-verification.md).

## 日本語版

# Hibi

Family memories, remembered.

Hibi は OpenClaw を土台にした、チャット中心のファミリー思い出保存エージェントです。

家族はチャットで写真、育児ログ、ペットの記録、日常の瞬間を送信します。Hibi は入力を分類し、MemWal に長期記憶を保存し、写真と自動生成アルバムを Walrus に保存し、検証可能なポインターとハッシュを Sui に記録します。

## MVP の対象範囲

- チャット入力用の OpenClaw プラグイン
- ワークフローと永続化を担う Hibi API
- アルバム・育児ログ・アーカイブ状況のウェブ表示
- 長期 AI 記憶のための MemWal 連携
- 写真・自動生成アルバムのための Walrus 連携
- ポインターとハッシュの記録（Sui FamilyVault）
- セルフホスティング可能な OSS 構成

## リポジトリ構成

```text
apps/
  api/                  Hibi API
  web/                  参照専用のアルバム / 育児ログ / アーカイブ画面
packages/
  core/                 共通型、クライアント、ワークフロー実装
  openclaw-plugin/      OpenClaw プラグイン
contracts/             Sui Move コントラクト
docker/                セルフホスティング用 Compose 定義
docs/                  製品、アーキテクチャ、ロードマップ
scripts/               開発・保守用スクリプト
```

## ドキュメント

- [Docs index](docs/README.md)
- [Product spec](docs/product-spec.md)
- [Architecture](docs/architecture.md)
- [Roadmap](docs/roadmap.md)
- [OpenClaw plugin](docs/openclaw-plugin.md)

## 現在の進捗

ローカル MVP は Hibi API と Web アプリの実装が完了しています。

- 自然言語でのメモ投稿は SQLite に保存され、MemWal で記憶されます。
- 写真と月次の `AlbumManifest` アーティファクトは Walrus testnet に保存できます。
- `AlbumManifest` の blob ID とハッシュは Sui testnet の `FamilyVault` に記録されます。
- Web アプリは Sui ウォレット接続に対応し、デモ `FamilyMemberSBT` を検証できます。

OpenClaw のパッケージ化と本番向けのマルチファミリー認証は、今後のフェーズです。

## 開発

依存関係をインストール:

```bash
pnpm install
```

API 用環境変数を用意:

```bash
cp apps/api/.env.example apps/api/.env
```

ローカル SQLite の初期化:

```bash
pnpm db:migrate
pnpm db:seed
```

Hibi API を起動:

```bash
pnpm dev:api
```

ヘルスチェック:

```bash
curl http://127.0.0.1:4000/api/health
```

育児ログを記録:

```bash
curl -X POST http://127.0.0.1:4000/api/messages \
  -H 'content-type: application/json' \
  -d '{"text":"ミルク120ml飲んだ"}'
```

レスポンスには `viewId` と `viewUrl` が返ります。Web アプリ向けに表示データを取得:

```bash
curl http://127.0.0.1:4000/api/memory-views/<viewId>/bootstrap
```

別ターミナルで Hibi Web を起動:

```bash
cp apps/web/.env.example apps/web/.env
pnpm dev:web
```

`POST /api/messages` のレスポンスで返却された `viewUrl` を開きます。

月次の成長アルバムを作成:

```bash
curl -X POST http://127.0.0.1:4000/api/albums/generate \
  -H 'content-type: application/json' \
  -d '{"targetYear":2026,"targetMonth":6}'
```

返却された `viewUrl` を開くと、アルバムページを確認できます。

ウォレット接続:

- Web 画面には Sui ウォレット接続パネルがあります。
- 接続したウォレットは Sui testnet 上のデモ `FamilyMemberSBT` 保有を確認します。
- デモ `FamilyVault` の SBT を所有している場合、ホーム画面に検証済みファミリーアクセスが表示されます。

統合検証の手順は [Integration verification](docs/integration-verification.md) を参照してください。
