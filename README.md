# Hibi

Family memories, remembered.

Hibi is a chat-first family memory agent for the moments that are easy to lose: a first smile, a bottle at midnight, a photo from a walk, a small sentence a child says once and never repeats.

Families should not have to organize all of that by hand. With Hibi, they send photos and care logs through chat, and Hibi turns them into a private long-term memory archive that can be searched, revisited, and verified later.

## Why It Matters

Family memories are scattered across camera rolls, chat apps, baby tracker apps, cloud drives, and old phones. The important pieces are often mixed with thousands of ordinary files, and the people who care about them most are usually too busy to sort them.

Hibi makes the archive feel natural:

- Send a photo or note in chat.
- Hibi understands whether it is a memory, care log, or album request.
- Hibi remembers the context with MemWal.
- Hibi stores photos and album artifacts on Walrus.
- Hibi records verifiable pointers and hashes on Sui.
- The family gets a simple web view for albums, care logs, and archive status.

The goal is not just storage. The goal is for a family to ask, "What changed this month?" or "What did she start doing recently?" and get back the memories that would otherwise disappear.

## Product Experience

Hibi is designed to feel like this:

1. A parent sends a message such as `ミルク120ml飲んだ` or uploads a photo with a caption.
2. Hibi saves the care log or memory and returns a web link.
3. The family opens a polished album or daily log view.
4. Later, the family asks a recall question and Hibi finds relevant memories.
5. The archive can show Walrus and Sui proof that important artifacts were saved.

The public website uses sample family demo content to show the intended experience safely. The real API is local-first because family photos, baby logs, and relationship data are private.

## Local-First Privacy Model

Hibi separates the public web experience from the private data workflow:

- The web app can be hosted publicly as a product showcase and viewer.
- The API runs in the family's own local or private environment.
- Secrets, photos, care logs, wallet mapping, and archive operations stay under the user's control.
- Public demo data is clearly treated as sample data, while the local API proves the real workflow.

This is a deliberate privacy choice, not a limitation. Family memory should be portable, verifiable, and owned by the family.

## What Works Today

The current MVP includes:

- Hibi API for message intake, persistence, photo upload, recall, and album generation.
- OpenClaw plugin tools for text memory, photo upload, memory recall, photo gallery links, and monthly album generation.
- Web views for sample demo, albums, photos, care logs, wallet status, and archive proof.
- MemWal integration for long-term AI memory.
- Walrus testnet storage for photos and monthly `AlbumManifest` artifacts.
- Sui testnet `FamilyVault`, `FamilyMemberSBT`, and album proof records.
- SQLite local persistence for the self-hosted OSS flow.

## Hackathon Demo Path

For a short judge review, the clearest flow is:

1. Show the public sample website so the product feeling is obvious in the first few seconds.
2. Send a photo and caption through OpenClaw or the Hibi API.
3. Save a care log such as `ミルク120ml飲んだ`.
4. Generate a monthly album and open the returned web URL.
5. Ask a recall question such as `最近できるようになったことは？`.
6. Show the MemWal result, Walrus blob ID, and Sui transaction or object proof.

This keeps the story simple: chat in, memories preserved, beautiful family view out, verifiable archive underneath.

## Architecture

```text
OpenClaw / Telegram / Chat
  -> Hibi OpenClaw Plugin
  -> Hibi API
     -> SQLite: local index and care logs
     -> MemWal: long-term AI memory
     -> Walrus: photos and album artifacts
     -> Sui: FamilyVault, SBT, hashes, pointers
  -> Hibi Web: albums, photos, care logs, archive status
```

## Repository Layout

```text
apps/
  api/                  Hibi API
  web/                  Public showcase and read-only family views
packages/
  openclaw-plugin/      OpenClaw tool plugin
contracts/
  hibi/                 Sui Move contracts
docs/                   Product, architecture, setup, and hackathon notes
scripts/                Local setup and verification scripts
```

## Quick Start

Install dependencies:

```bash
pnpm install
```

Prepare and start the API:

```bash
cp apps/api/.env.example apps/api/.env
pnpm db:migrate
pnpm db:seed
pnpm dev:api
```

Start the web app in another terminal:

```bash
cp apps/web/.env.example apps/web/.env
pnpm dev:web
```

Record a care log:

```bash
curl -X POST http://127.0.0.1:4000/api/messages \
  -H 'content-type: application/json' \
  -d '{"text":"ミルク120ml飲んだ"}'
```

Open the returned `viewUrl` to see the generated care log view.

Generate a monthly album:

```bash
curl -X POST http://127.0.0.1:4000/api/albums/generate \
  -H 'content-type: application/json' \
  -d '{"targetYear":2026,"targetMonth":6}'
```

## Verification

Useful local checks:

```bash
pnpm test:api
pnpm typecheck
pnpm typecheck:openclaw-plugin
pnpm build:api
pnpm build:web
pnpm validate:openclaw-plugin
sui move test --path contracts/hibi
```

Full integration steps are documented in [Integration verification](docs/integration-verification.md).

## Docs

- [Product spec](docs/product-spec.md)
- [Architecture](docs/architecture.md)
- [Hackathon notes](docs/hackathon.md)
- [OpenClaw plugin](docs/openclaw-plugin.md)
- [Telegram setup](docs/openclaw-telegram-setup.md)
- [MemWal setup](docs/memwal-setup.md)
- [Walrus setup](docs/walrus-setup.md)
- [Sui contracts](docs/sui-contracts.md)

## 日本語概要

Hibiは、家族の写真や育児ログをチャットで送るだけで、あとから思い出せる形に整理して残すファミリー記憶エージェントです。

忙しい家族は、毎日の小さな出来事をきれいに整理する時間がありません。Hibiは、チャットで送られた写真やメモを理解し、MemWalに記憶し、Walrusに保存し、Suiに検証できる証拠を残します。

公開Webサイトでは安全なサンプル家族データで完成イメージを見せます。実際のAPIはローカルまたはプライベート環境で動かし、写真、育児ログ、家族情報をユーザー自身が管理できる設計です。
