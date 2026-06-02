# ロードマップ

## Phase 1: OpenClaw Plugin Skeleton

ゴール: HibiをOpenClaw Pluginとして読み込める。

- `hibi_openclaw`
- `openclaw.plugin.json`
- healthcheck tool
- bundled Skill
- Hibi API設定

完了条件: OpenClawでPluginを有効化でき、toolをinspectできる。

## Phase 2: Hibi API And DB

ゴール: チャット入力をAPIで受け取り、永続化できる。

- Hibi API skeleton
- User、Family、MemorySpace、MemoryItem、CareLog、Album model
- `POST /api/messages`

完了条件: APIに送ったメッセージが保存される。

## Phase 3: Intent Classification

ゴール: 自然文メッセージをMVP intentに分類できる。

- intent classifier
- care log parser
- photo memory handler
- ask memory handler
- generate album handler
- MockProvider

完了条件: `ミルク120ml`、`最近の写真見たい`、`5月のアルバム作って` を正しいintentに分類できる。

## Phase 4: Care Log Workflow

ゴール: チャットから育児ログを保存し、URLで閲覧できる。

- `hibi_record_care_log`
- `POST /api/care-logs`
- CareLog DB save
- MemWal remember
- Care Log Web View

## Phase 5: Photo Memory Workflow

ゴール: チャットから写真を保存し、アルバムで閲覧できる。

- attachment handling
- AI caption and tags
- encryption
- Walrus upload
- MemWal remember
- DB save
- Album Web View

## Phase 6: Recall Workflow

ゴール: ユーザーが過去の記憶に質問できる。

- `hibi_recall_memory`
- `POST /api/recall`
- MemWal recall
- related item lookup
- AI response generation

## Phase 7: Album Generation

ゴール: 月次アルバムを生成して保存できる。

- `hibi_create_album`
- `POST /api/albums`
- monthly memory recall
- photo selection
- album HTML/JSON generation
- Walrus upload
- Album DB save

## Phase 8: Sui FamilyVault

ゴール: 検証可能なpointerをSuiに記録できる。

- Sui Move contract
- FamilyVault
- MemorySpace
- memory pointer hash
- blob hash
- TypeScript Sui client

## Phase 9: Archive Status

ゴール: 保存状態と保存期間の推奨を確認できる。

- Archive Planner
- importance tiers
- expiry display
- cost estimate
- Archive Status View
- `hibi_get_archive_status`

## Phase 10: OSS Self-Hosted

ゴール: 開発者が自分の環境でHibiを動かせる。

- Docker Compose
- `.env.example`
- Self-host guide
- BYO Wallet
- BYO MemWal
- BYO Walrus
- BYO Sui
