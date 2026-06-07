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
