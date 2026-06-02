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

This repository is at the planning and scaffold stage. Implementation choices should follow the MVP phases in `docs/roadmap.md`.

