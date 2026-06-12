#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PLUGIN_DIR="${ROOT_DIR}/packages/openclaw-plugin"
INSTALL_DIR="${HIBI_OPENCLAW_PLUGIN_INSTALL_DIR:-${HOME}/src/hibi-openclaw-plugin-install}"
HIBI_API_URL="${HIBI_API_URL:-http://127.0.0.1:4000}"

log() {
  printf '[hibi-openclaw] %s\n' "$1"
}

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    printf 'Missing required command: %s\n' "$1" >&2
    exit 1
  fi
}

require_command pnpm
require_command npm
require_command openclaw

if [ ! -f "${PLUGIN_DIR}/package.json" ]; then
  printf 'OpenClaw plugin package was not found at %s\n' "${PLUGIN_DIR}" >&2
  exit 1
fi

log "Building Hibi OpenClaw plugin"
cd "${ROOT_DIR}"
pnpm build:openclaw-plugin

log "Preparing install directory: ${INSTALL_DIR}"
rm -rf "${INSTALL_DIR}"
mkdir -p "${INSTALL_DIR}"

cp -R "${PLUGIN_DIR}/dist" "${INSTALL_DIR}/"
cp "${PLUGIN_DIR}/openclaw.plugin.json" "${INSTALL_DIR}/"
cp "${PLUGIN_DIR}/package.json" "${INSTALL_DIR}/"
cp "${PLUGIN_DIR}/README.md" "${INSTALL_DIR}/"

log "Installing runtime dependencies with npm"
cd "${INSTALL_DIR}"
npm install --omit=dev --legacy-peer-deps

log "Installing linked OpenClaw plugin"
openclaw plugins install --link "${INSTALL_DIR}"
openclaw plugins enable hibi

log "Configuring Hibi API URL: ${HIBI_API_URL}"
openclaw config set 'plugins.entries.hibi.config.apiBaseUrl' "${HIBI_API_URL}"

log "Restarting OpenClaw gateway"
openclaw gateway restart

log "Verifying Hibi plugin runtime"
openclaw plugins inspect hibi --runtime --json | grep -E 'status|activated|hibi_'

log "Done"
