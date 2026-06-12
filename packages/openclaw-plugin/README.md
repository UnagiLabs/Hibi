# Hibi OpenClaw Plugin

OpenClaw tools for the Hibi family memory agent.

The plugin stays thin:

- OpenClaw's selected model decides when to call a Hibi tool.
- This plugin calls Hibi API.
- Hibi API owns persistence, MemWal, Walrus, Sui, and generated view URLs.
- MemWal keys, Walrus/Sui credentials, and private keys stay in `apps/api/.env`.

## Tools

| Tool | Hibi API endpoint | Purpose |
| --- | --- | --- |
| `hibi_remember_text` | `POST /api/messages` | Save a care log or memory text |
| `hibi_recall_memory` | `POST /api/recall` | Recall memories from MemWal |
| `hibi_upload_photo` | `POST /api/photos` | Save a photo to Walrus and remember its caption |
| `hibi_generate_monthly_album` | `POST /api/albums/generate` | Generate a monthly album, archive to Walrus, record on Sui |

Photo uploads accept base64-encoded image bytes, including `data:image/...;base64,...` URLs.

## Config

```json
{
  "plugins": {
    "entries": {
      "hibi": {
        "config": {
          "apiBaseUrl": "http://127.0.0.1:4000"
        }
      }
    }
  }
}
```

If `apiBaseUrl` is omitted, the plugin uses `HIBI_API_URL`, then falls back to `http://127.0.0.1:4000`.

## Build

```sh
pnpm --filter @hibi/openclaw-plugin build
```

## Expected Chat Flows

```text
User: ミルク120ml飲んだ
OpenClaw model: call hibi_remember_text
Hibi: saves DB + MemWal and returns a view URL
```

```text
User: 最近できるようになったことは？
OpenClaw model: call hibi_recall_memory
Hibi: returns MemWal recall results
```

```text
User: この写真、はじめて寝返りした！ + photo
OpenClaw model: call hibi_upload_photo with imageBase64, filename, mimeType, and caption
Hibi: stores the photo on Walrus, saves metadata, and remembers the caption in MemWal
```

```text
User: 今月の成長アルバム見せて
OpenClaw model: call hibi_generate_monthly_album
Hibi: archives AlbumManifest to Walrus, records it on Sui, and returns a view URL
```
