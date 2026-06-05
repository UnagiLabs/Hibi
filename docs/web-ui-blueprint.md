# Hibi Web UI Blueprint

Hibi Webは、チャットで保存した育児ログ、写真、家族の思い出をあとから見返すためのWebアプリである。

現在の優先方針は、管理画面ではなく「家族の記録と思い出を気持ちよく開ける場所」にすること。UI文言は基本英語にし、日本語表示は必要な画面で切り替えられるようにする。

---

## 1. UIの目的

Hibi Webでユーザーが確認したいことは大きく4つ。

1. 今日・最近の育児ログがちゃんと残っているか
2. 写真や思い出が月ごと、年ごとにまとまっているか
3. ウォレット接続で自分の家族アーカイブを開けるか
4. Walrus / MemWal / Suiに保存・参照されている状態がわかるか

そのため、トップページは単なる説明ページではなく、次の行動に進める入口にする。

- Connect Wallet
- Open Care Log
- This Month
- This Year
- On This Day
- Open Album

---

## 2. 全体ナビゲーション

```text
/
  Home / Entry

/albums
  Album Hub

/albums/monthly
  This Month / Monthly Highlights

/albums/yearly
  This Year / Yearly Highlights

/albums/on-this-day
  On This Day

/v/:viewId
  Shared Memory View

/settings/archive
  Wallet / Archive Status
```

MVPでは `/v/:viewId` とトップページを先に作る。次に `/albums` を追加し、月次・年次・去年の今日の導線を広げる。

---

## 3. 主要画面

### 3.1 Home / Entry

役割:

- Hibi Webの最初の入口
- Sui Wallet接続
- 最近のViewやAlbumへの導線
- API接続状態の確認

必要なUI:

- `TopBar`
- `WalletPanel`
- `HeroPreview`
- `QuickActions`
- `RecentViews`
- `ArchiveStatusPreview`

英語文言例:

- `Family memories, remembered.`
- `Connect your Sui wallet to open your family archive.`
- `This Month`
- `This Year`
- `On This Day`
- `Open a View URL`

MVPではWallet接続はUIのみ。次にFamilyVault確認とAPI認証へ接続する。

### 3.2 Album Hub

役割:

- 月次、年次、日付回想、テーマ別アルバムをまとめて表示する
- ユーザーが「どの思い出を見たいか」を選ぶ場所

必要なUI:

- `AlbumHero`
- `HighlightActionGrid`
- `AlbumCard`
- `TimelineFilter`
- `EmptyAlbumState`

カード例:

| カード | 意味 |
|---|---|
| `This Month` | 今月の良い写真と思い出 |
| `This Year` | 今年の成長・出来事まとめ |
| `On This Day` | 去年の今日、または過去の同じ日 |
| `Care Log` | 育児ログの振り返り |
| `Photo Library` | 写真一覧 |

### 3.3 Monthly Highlights

役割:

- その月の良い写真、育児ログ、メモ、成長イベントをまとめる
- 「今月こんなことがあった」とひと目でわかるアルバムにする

必要なUI:

- `MonthCover`
- `HighlightPhotoGrid`
- `MilestoneList`
- `CareLogSummary`
- `MemoryNoteList`
- `StorageProofPanel`

MVPの選定ルール:

- 対象月の写真を新しい順に取得
- メモ付き写真を優先
- 育児ログやイベントに近い時間の写真を優先
- お気に入りフラグがあれば優先
- 似た写真の除外は後回し

後から強化する選定:

- MemWal recallで「今月らしい出来事」を取得
- LLMでアルバム説明文とハイライトタイトルを生成
- 画像解析で笑顔、明るさ、ブレ、重複を見て候補を絞る

### 3.4 Yearly Highlights

役割:

- 1年分の写真・記録を月ごとにまとめる
- 「今年の成長」「今年のベスト」を見返せるようにする

必要なUI:

- `YearCover`
- `MonthChapterGrid`
- `BestMoments`
- `GrowthTimeline`
- `YearStats`

表示例:

- Best Photos
- First Times
- Monthly Chapters
- Family Events
- Care Summary

MVPでは実データが少ないため、年次アルバムは月次アルバムの集合として扱う。

### 3.5 On This Day

役割:

- 「去年の今日」「2年前の今日」の写真や思い出を表示する
- 毎日開きたくなる入口にする

必要なUI:

- `TodayHeader`
- `MemoryYearStack`
- `PhotoStrip`
- `RelatedCareLogs`
- `NoMemoryState`

検索ルール:

- 今日と同じ月日を優先
- ぴったり同じ日がない場合は前後3日を候補にする
- 同じ日付の写真、メモ、育児ログをまとめる
- 家族が見たくない可能性のある内容は自動公開しない

英語文言例:

- `On This Day`
- `1 year ago today`
- `Around this date`
- `No memories found for this day yet.`

### 3.6 Care Log View

役割:

- チャットで保存した育児ログをその日のタイムラインで確認する

必要なUI:

- `CareLogTimeline`
- `CareLogSummary`
- `CareLogIcon`
- `DaySwitcher`
- `PartialFailureNotice`

表示項目:

- Milk
- Nursing
- Sleep
- Wake
- Diaper
- Temperature
- Note

### 3.7 Shared Memory View

役割:

- Hibi APIが返した `/v/:viewId` を開いて、保存済みデータを表示する
- チャット、OpenClaw、アルバム生成から共通で使う閲覧画面

必要な状態:

- Loading
- Ready
- Not Found
- Expired
- Revoked
- API Unavailable
- Partial Failure

URLの役割:

- Album本体ではなく、閲覧用セッション
- 期限切れや取り消しができる
- 家族名、子どもの名前、日付などをURLに含めない

---

## 4. 共通UIコンポーネント

### 4.1 Layout

| Component | 役割 |
|---|---|
| `PageShell` | 余白、背景、最大幅を管理 |
| `TopBar` | ロゴ、言語、Wallet、主要導線 |
| `SectionHeader` | 各セクションのタイトルと補足 |
| `ActionGrid` | This Monthなどの主要ボタン |
| `StatusBadge` | API / Walrus / MemWal / Sui状態 |
| `EmptyState` | データがない状態 |
| `ErrorState` | 期限切れ、未接続、取得失敗 |

### 4.2 Memory / Album

| Component | 役割 |
|---|---|
| `AlbumCard` | アルバム入口 |
| `AlbumCover` | 表紙写真とタイトル |
| `HighlightPhotoGrid` | 良い写真の一覧 |
| `MemoryTimeline` | 日付順の思い出 |
| `MilestoneList` | できるようになったこと |
| `PhotoDetailPanel` | 写真、メモ、保存状態 |
| `StorageProofPanel` | Walrus blob ID / Sui pointer表示 |

### 4.3 Wallet / Archive

| Component | 役割 |
|---|---|
| `WalletPanel` | Sui Wallet接続 |
| `ConnectedAccountCard` | 接続中アドレス表示 |
| `FamilyVaultStatus` | FamilyVault確認状態 |
| `ArchiveStatusPreview` | Walrus / MemWal / Suiの状態 |
| `AccessNotice` | demo mode / read-only / verified表示 |

---

## 5. デザイン方針

### 5.1 色

参考イメージに近い、やわらかい育児記録アプリの印象にする。

| 用途 | 色 |
|---|---|
| Background | warm off-white |
| Primary accent | warm yellow |
| Secondary accent | soft pink |
| Text | muted dark gray |
| Success | soft green |
| Info | soft blue |
| Border | light beige gray |

注意:

- 全体を黄色だけにしない
- カードを多用しすぎない
- 写真やアルバムが主役になる余白を残す
- 操作ボタンは英語で短くする

### 5.2 トーン

英語UIの基本トーン:

- Simple
- Warm
- Private
- Family-focused
- Not technical unless archive status is shown

例:

- `Connect Wallet`
- `Open Album`
- `This Month`
- `This Year`
- `On This Day`
- `Saved to Hibi`
- `Archive status`

技術用語は通常画面では控えめにし、詳細パネルで表示する。

---

## 6. データ設計への要求

UIから逆算すると、最低限次のデータが必要になる。

### 6.1 Album

必要フィールド:

- `id`
- `familyId`
- `memorySpaceId`
- `type`
- `title`
- `description`
- `targetYear`
- `targetMonth`
- `coverMediaAssetId`
- `status`
- `walrusBlobId`
- `createdAt`
- `updatedAt`

想定type:

- `monthly_highlights`
- `yearly_highlights`
- `on_this_day`
- `photo_gallery`
- `care_log_day`

### 6.2 AlbumItem

今後追加したいフィールド:

- `albumId`
- `itemType`
- `mediaAssetId`
- `memoryItemId`
- `careLogId`
- `title`
- `caption`
- `occurredAt`
- `sortOrder`
- `source`

`source` の例:

- `manual`
- `rule`
- `llm`
- `memwal_recall`

### 6.3 MediaAsset

UIで必要になる情報:

- サムネイルURL
- 表示用URL
- 撮影日時
- アップロード日時
- コメント
- お気に入り
- Walrus blob ID
- 保存状態

---

## 7. API設計への要求

今後ほしいAPI:

```text
GET  /api/albums
GET  /api/albums/monthly?year=2026&month=6
GET  /api/albums/yearly?year=2026
GET  /api/albums/on-this-day?date=2026-06-05
POST /api/albums/generate/monthly
POST /api/albums/generate/yearly
POST /api/albums/generate/on-this-day
GET  /api/media-assets
GET  /api/archive/status
```

既存の `/api/memory-views/:id/bootstrap` は、共有URL表示用として継続して使う。

---

## 8. 実装順

### Step 1: UI設計を固定する

- この設計書を正にする
- トップページに必要な導線を整理する
- 英語UI文言を決める

### Step 2: Album Hubを作る

- `/albums`
- `This Month`
- `This Year`
- `On This Day`
- `Photo Library`

まだ実データがなくても、デモデータで画面を成立させる。

### Step 3: Monthly Highlightsを実装する

- DBの対象月データから月次アルバムを表示
- 写真がない場合の空状態を作る
- 既存の `POST /api/albums/generate` と接続する

### Step 4: On This Dayを実装する

- 今日と同じ月日を検索
- なければ前後3日の候補を表示
- 写真、メモ、育児ログをまとめる

### Step 5: Yearly Highlightsを実装する

- 月次アルバムの集合として表示
- 年間ベスト、月別チャプター、成長タイムラインを作る

### Step 6: Wallet / FamilyVault連携

- Wallet addressをAPIへ送る
- FamilyVaultの存在確認
- familyIdとの対応を確認
- 接続済み家族だけが該当Albumを見られるようにする

### Step 7: Walrus / MemWal / Suiの実状態表示

- Walrus保存済み
- MemWal remembered
- Sui pointer verified
- partial failure

ユーザーにはやさしい文言で表示し、詳細は折りたたみパネルに入れる。

---

## 9. MVPの完成イメージ

MVPとして目指す画面遷移:

```text
Home
  -> Connect Wallet
  -> This Month
  -> Monthly Highlights
  -> Photo Detail
  -> Archive Status
```

または:

```text
Chat / OpenClaw
  -> Hibi API
  -> /v/:viewId
  -> Care Log or Album
```

この時点で、Hibiは「チャットで保存した記録をWebで見返せる」だけでなく、「今月・今年・去年の今日という思い出の入口を持つWebアプリ」になる。

