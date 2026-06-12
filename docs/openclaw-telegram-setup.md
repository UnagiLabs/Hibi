# OpenClaw Telegram Setup

HibiをTelegramから操作するための実機構成と設定方針。

## ゴール

TelegramでHibiに自然文を送ると、OpenClawがHibi pluginのtoolを選び、Hibi APIへ保存・recall・アルバム生成・写真保存を依頼できる状態にする。

```text
Telegram
  -> OpenClaw Telegram channel
  -> OpenClaw agent
  -> Hibi OpenClaw plugin
  -> Hibi API
  -> SQLite / MemWal / Walrus / Sui / Web
```

## 役割分担

| 部品 | 役割 |
| --- | --- |
| Telegram | 家族が普段使う入力口。テキスト、写真、短い依頼を送る。 |
| OpenClaw Telegram channel | Telegram botからのmessageをOpenClaw agentへ渡す。 |
| OpenClaw agent | 会話理解、tool選択、自然な返答を担当する。 |
| Hibi plugin | OpenClaw tool callをHibi API requestへ変換する薄いadapter。 |
| Hibi API | DB保存、MemWal remember/recall、Walrus保存、Sui記録、view URL生成を担当する。 |
| Hibi Web | 返却されたview URLやアルバム画面を家族が見る場所。 |

Hibi pluginにはMemWal private key、Sui private key、Walrus credentialを置かない。秘密情報は `apps/api/.env` とOpenClawのTelegram credentialに分けて管理する。

## 実機で確認済みの状態

2026-06-12時点で、surface上で以下を確認済み。

- OpenClaw `2026.6.5`
- Hibi plugin `0.1.0` をlocal linked pluginとして登録
- `openclaw plugins inspect hibi --runtime --json` で `status=loaded`
- Hibi tools:
  - `hibi_remember_text`
  - `hibi_recall_memory`
  - `hibi_upload_photo`
  - `hibi_generate_monthly_album`
- `plugins.entries.hibi.config.apiBaseUrl = "http://127.0.0.1:4000"`
- `pnpm dev:api` でHibi API起動
- `POST /api/messages` で `ok=true`、`memwal.status=done`

## OpenClaw plugin設定

OpenClawのHibi plugin configはHibi APIの場所だけを持つ。

```sh
openclaw config set 'plugins.entries.hibi.config.apiBaseUrl' 'http://127.0.0.1:4000'
openclaw gateway restart
```

確認:

```sh
openclaw plugins inspect hibi --runtime --json | grep -E 'status|activated|hibi_'
```

合格条件:

- `activated` が `true`
- `status` が `loaded`
- 4つの `hibi_` toolが表示される

## Hibi API確認

Hibi APIを起動する。

```sh
cd ~/src/Hibi
pnpm dev:api
```

別Terminalから保存確認をする。

```sh
curl -X POST http://127.0.0.1:4000/api/messages \
  -H 'content-type: application/json' \
  -d '{"text":"ミルク120ml飲んだ"}'
```

合格条件:

- `ok` が `true`
- `intent` が `care_log`
- `memwal.status` が `done`
- `reply` にview URLが含まれる

## Telegramで確認する操作

Telegram channel設定後、以下の文を実機で送る。

| Telegram入力 | 期待されるtool | Hibi API |
| --- | --- | --- |
| `ミルク120ml飲んだ` | `hibi_remember_text` | `POST /api/messages` |
| `最近できるようになったことは？` | `hibi_recall_memory` | `POST /api/recall` |
| `今月の成長アルバム見せて` | `hibi_generate_monthly_album` | `POST /api/albums/generate` |
| `この写真、はじめて寝返りした！` + 写真 | `hibi_upload_photo` | `POST /api/photos` |

写真添付は、OpenClaw Telegram channelが写真をtool inputの `imageBase64` / `filename` / `mimeType` へ渡せるかを実機で確認する。渡せない場合は、Telegram添付をHibi API用base64へ変換する小さなbridgeを次ステップで検討する。

## 簡単セットアップ化の方針

手作業で確認した流れは長いので、次ステップでスクリプト化する。

| 予定スクリプト | 目的 |
| --- | --- |
| `scripts/setup-hibi-api.sh` | 依存関係、`.env`、SQLite、migration、API疎通確認をまとめる。 |
| `scripts/install-openclaw-plugin.sh` | plugin build、install用フォルダ作成、npm install、OpenClaw登録、config設定、gateway restartをまとめる。 |
| `scripts/verify-openclaw-hibi.sh` | OpenClaw plugin loaded状態、Hibi API疎通、tool一覧を確認する。 |

## 次の実装ステップ

1. OpenClaw Telegram channelの現設定を確認する。
2. Telegram bot tokenとallowFromの設定手順を文書化する。
3. `scripts/install-openclaw-plugin.sh` を追加する。
4. `scripts/setup-hibi-api.sh` を追加する。
5. Telegramから `hibi_remember_text` を呼べることを実機確認する。
6. 写真添付が `hibi_upload_photo` へ渡るかを確認する。
