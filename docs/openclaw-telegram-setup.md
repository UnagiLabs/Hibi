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

簡単セットアップ用スクリプトを使う場合:

```sh
cd ~/src/Hibi
HIBI_API_URL=http://127.0.0.1:4000 ./scripts/install-openclaw-plugin.sh
```

このスクリプトは次をまとめて実行する。

- `pnpm build:openclaw-plugin`
- symlink問題を避けるためのinstall用フォルダ作成
- `npm install --omit=dev --legacy-peer-deps`
- `openclaw plugins install --link`
- `openclaw plugins enable hibi`
- `plugins.entries.hibi.config.apiBaseUrl` の設定
- `openclaw gateway restart`
- runtimeで4つのHibi toolが見えるか確認

手動で設定する場合:

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

## Telegram channel設定

OpenClaw Telegram channelは、Telegram Bot API tokenを使ってOpenClaw gatewayにmessageを届ける。OpenClaw公式ではlong pollingがdefaultで、webhookは任意。

### 1. BotFatherでbot tokenを作る

Telegramで `@BotFather` を開く。

```text
/newbot
```

BotFatherの案内に従ってbot名とusernameを決め、最後に表示されるtokenを保存する。

```text
123456789:AA...
```

このtokenは秘密情報なのでGit管理ファイルに書かない。

### 2. OpenClawにTelegram tokenを設定する

surface上で実行する。

```sh
openclaw config set 'channels.telegram.enabled' true
openclaw config set 'channels.telegram.botToken' '<TELEGRAM_BOT_TOKEN>'
openclaw config set 'channels.telegram.dmPolicy' 'pairing'
openclaw config set 'channels.telegram.groups.*.requireMention' true
openclaw gateway restart
```

`<TELEGRAM_BOT_TOKEN>` はBotFatherから受け取ったtokenに置き換える。

tokenをconfigに直接置きたくない場合は、default accountに限り `TELEGRAM_BOT_TOKEN` env fallbackを使える。ただしsystemd serviceでgatewayを動かす場合は、service環境変数へ渡す必要があるため、初心者向け手順ではまず `openclaw config set` を使う。

### 3. 最初のDMをpairingする

Telegramで作成したbotへDMを送る。

```text
/start
```

または:

```text
ミルク120ml飲んだ
```

OpenClaw側でpairing codeを確認する。

```sh
openclaw pairing list telegram
```

表示されたcodeを承認する。

```sh
openclaw pairing approve telegram <CODE>
```

pairing codeは期限があるため、期限切れの場合はTelegramからもう一度botへmessageを送って再発行する。

### 4. allowFromを確認する

`dmPolicy=pairing` の場合、承認済みユーザーはOpenClawのcredentials storeに保存される。設定ファイルに固定したい場合はTelegram user IDを `tg:` prefix付きで入れる。

```sh
openclaw config set 'channels.telegram.allowFrom' '["tg:123456789"]'
openclaw gateway restart
```

通常はpairing approveで十分。公開botとして誰でも使えるようにする設定は避ける。

### 5. Telegram channel状態を確認する

```sh
openclaw gateway status
openclaw channels status --probe
openclaw plugins inspect telegram --runtime --json | grep -E 'status|activated'
```

合格条件:

- gatewayがrunning
- Telegram channelがconfiguredまたはhealthy
- Telegram pluginがloaded

### 6. groupで使う場合

まずDMで動作確認してからgroupへ入れる。groupでは誤反応を避けるため、defaultでmention必須にする。

```sh
openclaw config set 'channels.telegram.groups.*.requireMention' true
openclaw gateway restart
```

group chat IDは `openclaw logs --follow`、Bot API `getUpdates`、またはID確認botで取得する。Telegram supergroup IDは `-100...` で始まることが多く、`channels.telegram.groups` のkeyとして扱う。

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
| `scripts/install-openclaw-plugin.sh` | plugin build、install用フォルダ作成、npm install、OpenClaw登録、config設定、gateway restartをまとめる。実装済み。 |
| `scripts/verify-openclaw-hibi.sh` | OpenClaw plugin loaded状態、Hibi API疎通、tool一覧を確認する。 |

## 次の実装ステップ

1. OpenClaw Telegram channelの現設定を確認する。
2. Telegram bot tokenとallowFromの設定手順を文書化する。
3. `scripts/install-openclaw-plugin.sh` をsurfaceで実行して再現確認する。
4. `scripts/setup-hibi-api.sh` を追加する。
5. Telegramから `hibi_remember_text` を呼べることを実機確認する。
6. 写真添付が `hibi_upload_photo` へ渡るかを確認する。

## 参考

- OpenClaw Telegram channel: https://docs.openclaw.ai/channels/telegram
- OpenClaw channel config: https://docs.openclaw.ai/gateway/config-channels
- OpenClaw channel CLI: https://docs.openclaw.ai/cli/channels
- OpenClaw security / allowFrom: https://docs.openclaw.ai/gateway/security
