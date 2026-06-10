# OpenClaw Plugin

HibiのOpenClaw pluginは、OpenClaw側のAIモデルが選んだtool callをHibi APIへ渡す薄いadapterとして実装する。

## 方針

OpenClaw pluginはAIモデルを直接選ばない。

- OpenClaw側: ユーザーが選んだモデルで会話理解、tool選択、自然な返答を担当する
- Hibi plugin: OpenClaw tool callをHibi API requestに変換する
- Hibi API: DB、MemWal、Walrus、Sui、URL生成を担当する

これにより、Hibi pluginにはMemWal private key、Sui private key、Walrus credentialを持たせない。

## 実装場所

```text
packages/openclaw-plugin/
  package.json
  openclaw.plugin.json
  src/
    index.ts
    config.ts
    hibi-client.ts
```

OpenClawのtool plugin仕様に合わせて、runtime entryは `defineToolPlugin` をexportする。

## Tools

| Tool | Hibi API | 目的 |
| --- | --- | --- |
| `hibi_remember_text` | `POST /api/messages` | 育児ログや思い出を保存する |
| `hibi_recall_memory` | `POST /api/recall` | MemWalから思い出をrecallする |
| `hibi_generate_monthly_album` | `POST /api/albums/generate` | 月次アルバムを作成し、Walrus保存とSui記録を行う |

写真添付は次フェーズで `hibi_upload_photo` として追加する。

## Config

OpenClaw plugin config:

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

`apiBaseUrl` がない場合は、`HIBI_API_URL` envを読み、それもなければ `http://127.0.0.1:4000` を使う。

## Build

```sh
pnpm build:openclaw-plugin
pnpm typecheck:openclaw-plugin
```

## OpenClaw validation

OpenClaw CLI validation requires Node.js v22.19+. This repository uses `.nvmrc` with Node v24.16.0.

```sh
source "$HOME/.nvm/nvm.sh"
nvm use
pnpm validate:openclaw-plugin
```

Node 20の場合、次のように失敗する。

```text
openclaw: Node.js v22.19+ is required
```

その場合はNode 22.19+へ切り替えてから再実行する。

2026-06-07時点では、Node v24.16.0で `pnpm validate:openclaw-plugin` が成功済み。

## Expected flows

```text
ユーザー: ミルク120ml飲んだ
OpenClaw model: hibi_remember_text を呼ぶ
Hibi API: DB保存 + MemWal remember + viewUrl返却
```

```text
ユーザー: 最近できるようになったことは？
OpenClaw model: hibi_recall_memory を呼ぶ
Hibi API: MemWal recall結果を返す
```

```text
ユーザー: 今月の成長アルバム見せて
OpenClaw model: hibi_generate_monthly_album を呼ぶ
Hibi API: MemWal highlights + Walrus AlbumManifest + Sui AlbumRecord + viewUrl返却
```
