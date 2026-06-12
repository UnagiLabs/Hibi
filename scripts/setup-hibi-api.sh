#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
API_ENV="${ROOT_DIR}/apps/api/.env"
API_ENV_EXAMPLE="${ROOT_DIR}/apps/api/.env.example"

log() {
  printf '[hibi-api-setup] %s\n' "$1"
}

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    printf 'Missing required command: %s\n' "$1" >&2
    return 1
  fi
}

missing=0
require_command node || missing=1
require_command pnpm || missing=1

if ! command -v sqlite3 >/dev/null 2>&1; then
  cat >&2 <<'EOF'
Missing required command: sqlite3

Install it first.

Ubuntu/Debian:
  sudo apt update
  sudo apt install -y sqlite3

macOS:
  brew install sqlite
EOF
  missing=1
fi

if [ "${missing}" -ne 0 ]; then
  exit 1
fi

log "Using Node $(node --version)"
log "Using pnpm $(pnpm --version)"
log "Using sqlite3 $(sqlite3 --version | awk '{print $1}')"

if [ ! -f "${API_ENV}" ]; then
  if [ ! -f "${API_ENV_EXAMPLE}" ]; then
    printf 'Missing env example: %s\n' "${API_ENV_EXAMPLE}" >&2
    exit 1
  fi

  log "Creating apps/api/.env from apps/api/.env.example"
  cp "${API_ENV_EXAMPLE}" "${API_ENV}"
else
  log "Keeping existing apps/api/.env"
fi

cd "${ROOT_DIR}"

log "Installing dependencies"
pnpm install

log "Running SQLite migrations and Prisma generate"
pnpm db:migrate

cat <<'EOF'

Hibi API setup is ready.

Start the API:
  pnpm dev:api

In another terminal, verify it:
  curl -X POST http://127.0.0.1:4000/api/messages \
    -H 'content-type: application/json' \
    -d '{"text":"ミルク120ml飲んだ"}'

For MemWal / Walrus / Sui full integration, fill apps/api/.env with the required secrets before running the API.
EOF
