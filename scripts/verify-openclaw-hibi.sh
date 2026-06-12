#!/usr/bin/env bash
set -euo pipefail

HIBI_API_URL="${HIBI_API_URL:-http://127.0.0.1:4000}"
TEST_TEXT="${HIBI_VERIFY_TEXT:-ミルク120ml飲んだ}"
RUN_WRITE_TEST="${HIBI_VERIFY_WRITE:-1}"

log() {
  printf '[hibi-verify] %s\n' "$1"
}

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    printf 'Missing required command: %s\n' "$1" >&2
    exit 1
  fi
}

require_command curl
require_command openclaw

log "Checking OpenClaw gateway"
openclaw gateway status >/dev/null

log "Checking Hibi plugin runtime"
runtime_json="$(openclaw plugins inspect hibi --runtime --json)"

printf '%s\n' "${runtime_json}" | grep '"activated": true' >/dev/null
printf '%s\n' "${runtime_json}" | grep '"status": "loaded"' >/dev/null

for tool in \
  hibi_remember_text \
  hibi_recall_memory \
  hibi_upload_photo \
  hibi_generate_monthly_album
do
  printf '%s\n' "${runtime_json}" | grep "\"${tool}\"" >/dev/null
  log "Found tool: ${tool}"
done

log "Checking Hibi API health at ${HIBI_API_URL}"
health_response="$(curl -fsS "${HIBI_API_URL}/api/health")"
printf '%s\n' "${health_response}" | grep '"ok":true' >/dev/null
printf '%s\n' "${health_response}" | grep '"service":"hibi-api"' >/dev/null

if [ "${RUN_WRITE_TEST}" = "1" ]; then
  log "Running Hibi API write smoke test"
  message_response="$(
    curl -fsS -X POST "${HIBI_API_URL}/api/messages" \
      -H 'content-type: application/json' \
      -d "{\"text\":\"${TEST_TEXT}\"}"
  )"

  printf '%s\n' "${message_response}" | grep '"ok":true' >/dev/null
  printf '%s\n' "${message_response}" | grep '"viewUrl"' >/dev/null
  log "Write smoke test passed"
else
  log "Skipping write smoke test because HIBI_VERIFY_WRITE=${RUN_WRITE_TEST}"
fi

log "OpenClaw Hibi integration looks ready"
