# Hibi Memory Views & Album Web App 仕様書

## 1. 概要

Hibiは、チャットを主な入力口として家族の写真、育児ログ、ペットとの思い出、日々の出来事を保存し、あとからWebアプリで見返せるFamily Memory Agentである。

本仕様書では、Hibiにおける次の体験を定義する。

- チャットで「思い出を見たい！」と言うと、閲覧用URLが返る。
- Webアプリで写真、日々の記録、育児ログ、成長ハイライトを見られる。
- 1か月の成長アルバムを生成・閲覧できる。
- 1年の成長アルバムを生成・閲覧できる。
- 写真一覧、タイムライン、アルバム、保存状態をWebで確認できる。
- 家族写真や育児ログなどのプライベート情報は、安全に扱う。

HibiにおけるWebアプリは、単なる管理画面ではない。チャットで保存された思い出が「ちゃんと残っている」とユーザーが実感するための、Hibiの主要体験である。

---

## 2. 設計方針

### 2.1 基本方針

Hibiは次の構造で設計する。

```text
Hibi = Chat-first memory input
     + AI memory organization
     + private encrypted media/archive
     + beautiful read-only web albums
     + verifiable long-term preservation
```

### 2.2 baby_clawから引き継ぐ設計思想

baby_clawを参考に、Hibiでも以下を採用する。

- 自然文入力をintentに分類し、tool/APIへルーティングする。
- 写真、コメント、育児ログ、家族の個人情報は平文で公開領域に置かない。
- Walrusには暗号化されたBlobや生成アルバムを保存する。
- Suiには検証可能なhash、pointer、metadataのみを記録する。
- on-chainの関数名やmetadataは、できるだけドメイン固有の意味を漏らさない。
- Pluginは薄く保ち、Hibi APIにworkflowを集約する。

### 2.3 AlbumとURLを分離する

Hibiでは、`Album` と `MemoryViewSession` を分ける。

| 概念 | 役割 | 寿命 |
|---|---|---|
| `Album` | 月次・年次・テーマ別に編集された思い出のまとまり | 長期保存 |
| `MemoryViewSession` | チャット要求に応じて発行される閲覧URL | 短期または認証依存 |

重要なルール:

- Albumはコンテンツである。
- URLはアクセス手段である。
- URLを消してもAlbum本体は消さない。
- Albumを再生成しても過去のURL権限は自動で引き継がない。
- 家族共有、期限切れ、URL取り消し、公開設定は `MemoryViewSession` 側で管理する。

---

## 3. スコープ

### 3.1 MVPで実装するもの

- チャットから写真と思い出を保存できる。
- チャットから育児ログを保存できる。
- 「思い出を見たい！」に対してWeb閲覧URLを返せる。
- 「最近の写真見たい」に対して写真ギャラリーURLを返せる。
- 「今月の成長アルバム見せて」に対して月次成長アルバムURLを返せる。
- 月次成長アルバムを生成できる。
- Webアプリで写真グリッド、タイムライン、アルバムを表示できる。
- URLはログイン必須または短期限の署名付きURLにする。
- URLを取り消せる。
- 写真とアルバムmanifestをWalrusに保存できる。
- hash/pointerをSuiに記録できる。

### 3.2 MVP後に実装するもの

- 1年の成長アルバム生成。
- 家族共有アカウント。
- 公開アルバム。
- コメント追加やお気に入りなどのWeb編集機能。
- 動画対応。
- 印刷用PDFアルバム。
- AI生成ムービー。
- 顔認識や人物クラスタリング。
- 完全なクライアントサイド復号。

### 3.3 MVPでやらないこと

- 複雑な入力フォーム中心のWebアプリ。
- SNS的な公開フィード。
- 誰でも見られる恒久公開URL。
- 子どもの名前、家族名、日付、アルバム名を含むURL。
- 平文写真や平文メモのオンチェーン保存。
- Webアプリ側での長期秘密情報保存。

---

## 4. 用語定義

| 用語 | 意味 |
|---|---|
| `Family` | Hibiを使う家族単位 |
| `User` | 家族に属する利用者 |
| `MemorySpace` | baby、pet、familyなど、記憶の対象領域 |
| `MemoryItem` | チャットで保存された思い出本文、写真コメント、出来事 |
| `MediaAsset` | 写真、将来的には動画・音声 |
| `CareLog` | ミルク、睡眠、排泄、体調などの育児ログ |
| `Album` | 保存されたアルバム単位 |
| `AlbumItem` | Album内の個別要素 |
| `AlbumManifest` | Albumを表示するための構造化JSON |
| `MemoryViewSession` | Web閲覧用URLのセッション |
| `FamilyVault` | Sui上に記録する家族単位の検証metadata |
| `Pointer` | Walrus Blobや外部保存先への参照 |
| `Commitment` | 内容を明かさず同一性や改ざん検知に使う値 |

---

## 5. 主要ユーザー体験

### 5.1 思い出を見る

```text
User:
思い出を見たい！

Hibi:
最近の思い出アルバムを用意しました。
写真、できごと、成長のハイライトをまとめています。

https://hibi.app/v/01JX9P7M2K
```

デフォルト解釈:

```json
{
  "intent": "get_memory_view_url",
  "viewType": "recent_memories",
  "params": {
    "range": "recent",
    "days": 90,
    "includePhotos": true,
    "includeCareLogs": true,
    "includeMilestones": true,
    "limit": 50
  }
}
```

確認質問は原則返さない。曖昧な依頼は、まず最近のハイライトとして気持ちよく返す。

### 5.2 最近の写真を見る

```text
User:
最近の写真見たい

Hibi:
最近の写真を開けます。

https://hibi.app/v/01JXPHOTO
```

表示内容:

- 写真グリッド
- 日付別セクション
- 写真詳細
- 写真に紐づく家族コメント
- AI caption/tags

### 5.3 月次成長アルバムを見る

```text
User:
今月の成長アルバム見せて

Hibi:
2026年6月の成長アルバムを用意しました。
写真とできるようになったことをまとめています。

https://hibi.app/v/01JXMONTH
```

既存Albumがあれば再利用する。未生成なら生成する。

### 5.4 年次成長アルバムを見る

```text
User:
1年の成長アルバム作って

Hibi:
この1年の成長アルバムを作成しました。
月ごとの写真、初めてできたこと、印象的な思い出をまとめています。

https://hibi.app/v/01JXYEAR
```

MVP後に実装する。年次アルバムは、月次アルバムを集約して生成する。

---

## 6. Intent仕様

### 6.1 Intent一覧

```ts
type HibiIntent =
  | "init"
  | "photo_memory"
  | "care_log"
  | "ask_memory"
  | "get_memory_view_url"
  | "get_photo_gallery_url"
  | "generate_monthly_growth_album"
  | "generate_yearly_growth_album"
  | "get_care_log_url"
  | "get_today"
  | "help";
```

### 6.2 発話マッピング

| ユーザー発話 | intent | viewType | 動作 |
|---|---|---|---|
| 思い出を見たい | `get_memory_view_url` | `recent_memories` | 最近の思い出URLを返す |
| 最近の写真見たい | `get_photo_gallery_url` | `photo_gallery` | 写真ギャラリーURLを返す |
| 写真一覧見たい | `get_photo_gallery_url` | `photo_gallery` | 写真一覧URLを返す |
| 今月の成長アルバム見せて | `generate_monthly_growth_album` | `monthly_growth_album` | 月次Album生成/取得 |
| 5月のアルバム作って | `generate_monthly_growth_album` | `monthly_growth_album` | 対象月のAlbum生成 |
| 1年の成長アルバム見たい | `generate_yearly_growth_album` | `yearly_growth_album` | 年次Album生成/取得 |
| 今日の育児ログ見せて | `get_care_log_url` | `care_log` | 今日のログURLを返す |
| 最近できるようになったことは？ | `ask_memory` | none | MemWal recallで回答 |

### 6.3 日付解釈

- 「今月」はユーザーのローカルタイムゾーン基準で解釈する。
- 「今年」はユーザーのローカルタイムゾーン基準で解釈する。
- 「最近」は初期値90日とする。
- 「5月」のように年が省略された場合は、現在年の5月とする。ただし未来月になる場合は前年を優先する。
- アルバム生成対象期間はAPI responseに明示する。

---

## 7. OpenClaw Plugin仕様

### 7.1 Pluginの責務

OpenClaw Pluginは薄く保つ。

責務:

- チャット入力を受け取る。
- 添付ファイルを受け取る。
- Hibi APIにリクエストする。
- Hibi APIの返信文とURLをチャットに返す。

持たない責務:

- Walrus、Sui、MemWalの詳細実装。
- アルバム生成ロジック。
- 長期秘密情報の保存。
- DB永続化。

### 7.2 Tool一覧

MVPでは、細かいtoolを用意しつつ、内部的には `hibi_create_memory_view` に集約できる設計にする。

```ts
type HibiToolName =
  | "hibi_init"
  | "hibi_status"
  | "hibi_record_message"
  | "hibi_record_photo_memory"
  | "hibi_record_care_log"
  | "hibi_create_memory_view"
  | "hibi_get_photo_gallery_url"
  | "hibi_create_monthly_growth_album"
  | "hibi_create_yearly_growth_album"
  | "hibi_revoke_memory_view_url";
```

### 7.3 `hibi_create_memory_view`

入力:

```json
{
  "viewType": "recent_memories",
  "memorySpaceType": "baby",
  "period": {
    "from": "2026-03-01",
    "to": "2026-06-03"
  },
  "accessMode": "authenticated"
}
```

出力:

```json
{
  "reply": "最近の思い出アルバムを用意しました。",
  "url": "https://hibi.app/v/01JX9P7M2K",
  "viewType": "recent_memories",
  "expiresAt": "2026-06-10T00:00:00+09:00"
}
```

### 7.4 `hibi_create_monthly_growth_album`

入力:

```json
{
  "year": 2026,
  "month": 6,
  "memorySpaceType": "baby",
  "accessMode": "authenticated"
}
```

出力:

```json
{
  "reply": "2026年6月の成長アルバムを用意しました。",
  "albumId": "alb_01JXMONTH",
  "url": "https://hibi.app/v/01JXVIEW",
  "status": "ready"
}
```

---

## 8. Hibi API仕様

### 8.1 API一覧

```text
POST /api/init
POST /api/messages
POST /api/photos
POST /api/care-logs
POST /api/recall

POST /api/memory-views
GET  /api/memory-views/:id/bootstrap
POST /api/memory-views/:id/revoke

POST /api/albums/generate
GET  /api/albums/:id
GET  /api/albums/:id/manifest

GET  /api/media/:id
GET  /api/logs/:date
GET  /api/archive/status
```

### 8.2 `POST /api/messages`

チャット入力の入口。

Request:

```json
{
  "familyId": "fam_123",
  "userId": "usr_123",
  "memorySpaceId": "space_123",
  "text": "思い出を見たい！",
  "attachments": [],
  "timezone": "Asia/Tokyo"
}
```

Response:

```json
{
  "intent": "get_memory_view_url",
  "reply": "最近の思い出アルバムを用意しました。",
  "url": "https://hibi.app/v/01JX9P7M2K",
  "viewType": "recent_memories"
}
```

### 8.3 `POST /api/memory-views`

閲覧URLを作成する。

Request:

```json
{
  "familyId": "fam_123",
  "userId": "usr_123",
  "memorySpaceId": "space_123",
  "viewType": "recent_memories",
  "resourceId": null,
  "params": {
    "from": "2026-03-01",
    "to": "2026-06-03",
    "limit": 50
  },
  "accessMode": "authenticated"
}
```

Response:

```json
{
  "id": "view_01JX9P7M2K",
  "url": "https://hibi.app/v/01JX9P7M2K",
  "viewType": "recent_memories",
  "expiresAt": "2026-06-10T00:00:00+09:00"
}
```

### 8.4 `GET /api/memory-views/:id/bootstrap`

Webアプリ初期表示用データを返す。

Response:

```json
{
  "view": {
    "id": "view_01JX9P7M2K",
    "viewType": "monthly_growth_album",
    "resourceId": "alb_01JXMONTH",
    "params": {
      "year": 2026,
      "month": 6
    }
  },
  "album": {
    "id": "alb_01JXMONTH",
    "title": "2026年6月の成長アルバム",
    "type": "monthly_growth",
    "manifestUrl": "/api/albums/alb_01JXMONTH/manifest"
  },
  "viewer": {
    "accessMode": "authenticated",
    "canRevoke": true,
    "canShare": false
  }
}
```

### 8.5 `POST /api/albums/generate`

Albumを生成する。

Request:

```json
{
  "familyId": "fam_123",
  "memorySpaceId": "space_123",
  "type": "monthly_growth",
  "period": {
    "from": "2026-06-01",
    "to": "2026-06-30"
  },
  "forceRegenerate": false
}
```

Response:

```json
{
  "albumId": "alb_01JXMONTH",
  "status": "ready",
  "manifestBlobId": "walrus_blob_123",
  "manifestHash": "sha256:..."
}
```

### 8.6 エラー形式

```json
{
  "error": {
    "code": "VIEW_EXPIRED",
    "message": "この閲覧URLは期限切れです。",
    "requestId": "req_123"
  }
}
```

主なエラーコード:

| code | 意味 |
|---|---|
| `UNAUTHORIZED` | 未ログインまたは権限なし |
| `VIEW_EXPIRED` | URL期限切れ |
| `VIEW_REVOKED` | URL取り消し済み |
| `ALBUM_NOT_READY` | アルバム生成中 |
| `ALBUM_GENERATION_FAILED` | アルバム生成失敗 |
| `MEDIA_NOT_FOUND` | メディアが見つからない |
| `MEMORY_SPACE_NOT_FOUND` | MemorySpaceが見つからない |

---

## 9. Webアプリ仕様

### 9.1 ルーティング

ユーザーに返すURLは、原則 `/v/:viewId` に統一する。

```text
/v/:viewId                         チャット返却用の汎用閲覧ページ
/albums/:albumId                   保存済みアルバム直接表示
/gallery                           認証後の写真一覧
/growth/monthly/:yyyy-mm           月次成長アルバム
/growth/yearly/:yyyy               年次成長アルバム
/logs/:date                        育児ログ
/archive/status                    保存状態
```

MVPでは、チャットから返すURLは `/v/:viewId` のみとする。

### 9.2 `/v/:viewId` の表示分岐

`MemoryViewSession.viewType` に応じて表示する。

| viewType | 表示 |
|---|---|
| `recent_memories` | 最近の思い出ハイライト + 写真 + タイムライン |
| `photo_gallery` | 写真一覧 |
| `monthly_growth_album` | 月次成長アルバム |
| `yearly_growth_album` | 年次成長アルバム |
| `care_log` | 育児ログ |
| `archive_status` | 保存状態 |
| `custom_album` | 任意アルバム |

### 9.3 最近の思い出画面

構成:

```text
[Header]
最近の思い出
対象期間: 2026/03/01 - 2026/06/03

[Highlights]
- はじめて寝返りした
- 家族で公園に行った
- よく笑っていた写真

[Photo Grid]
□ □ □ □
□ □ □ □

[Timeline]
6/3
  写真
  コメント

6/2
  育児ログ
  写真
```

### 9.4 写真ギャラリー画面

構成:

```text
写真
[すべて] [今月] [お気に入り] [成長] [家族] [ペット]

2026年6月
□ □ □ □ □
□ □ □ □ □

2026年5月
□ □ □ □ □
```

機能:

- グリッド表示。
- 日付別グルーピング。
- 写真詳細モーダル。
- コメントとAI caption表示。
- 初期MVPでは編集はしない。

### 9.5 月次成長アルバム画面

構成:

```text
2026年6月の成長アルバム

[Cover Photo]

今月できるようになったこと
- 寝返り
- 声を出して笑う
- 離乳食を少し食べた

今月のベスト写真
□ □ □

日々の思い出
6/1 ...
6/8 ...
6/15 ...
```

### 9.6 年次成長アルバム画面

構成:

```text
2026年の成長アルバム

[Cover Photo]

12か月の成長
1月 ...
2月 ...
3月 ...

今年できるようになったこと
- 初めて歩いた
- 初めて話した言葉
- 初めて旅行した

写真で振り返る1年
□ □ □ □
```

### 9.7 Web UI原則

- 閲覧専用を基本にする。
- 入力・編集はチャットを主導線にする。
- スマホファーストで実装する。
- 写真、日付、家族コメントを大きく見せる。
- AI要約よりも、家族が送った言葉を優先表示する。
- ロード中、生成中、期限切れ、権限なしの状態を明確に表示する。

---

## 10. データモデル

### 10.1 `MemoryViewType`

```ts
type MemoryViewType =
  | "recent_memories"
  | "photo_gallery"
  | "monthly_growth_album"
  | "yearly_growth_album"
  | "care_log"
  | "archive_status"
  | "custom_album";
```

### 10.2 `MemoryViewSession`

```ts
type MemoryViewSession = {
  id: string;
  familyId: string;
  memorySpaceId: string;
  createdByUserId: string;

  viewType: MemoryViewType;
  resourceId?: string;

  params: {
    from?: string;
    to?: string;
    year?: number;
    month?: number;
    tags?: string[];
    limit?: number;
  };

  accessMode: "authenticated" | "signed_link" | "family_share";
  tokenHash?: string;
  expiresAt?: string;
  revokedAt?: string;

  createdAt: string;
  lastAccessedAt?: string;
};
```

### 10.3 `Album`

```ts
type AlbumType =
  | "monthly_growth"
  | "yearly_growth"
  | "photo_album"
  | "highlight_album"
  | "custom";

type Album = {
  id: string;
  familyId: string;
  memorySpaceId: string;

  type: AlbumType;
  title: string;

  periodStart?: string;
  periodEnd?: string;

  coverMediaId?: string;
  summary?: string;

  status: "draft" | "generating" | "ready" | "failed";
  generationVersion: number;

  manifestBlobId?: string;
  manifestHash?: string;
  suiPointerId?: string;

  createdAt: string;
  updatedAt: string;
};
```

### 10.4 `AlbumItem`

```ts
type AlbumItem = {
  id: string;
  albumId: string;

  memoryItemId?: string;
  mediaAssetId?: string;
  careLogId?: string;

  caption?: string;
  layoutHint?: "cover" | "large" | "grid" | "timeline" | "milestone";
  sortOrder: number;

  createdAt: string;
};
```

### 10.5 `MediaAsset`

```ts
type MediaAsset = {
  id: string;
  familyId: string;
  memorySpaceId: string;

  kind: "photo" | "video" | "audio";
  mimeType: string;

  originalFilename?: string;
  capturedAt?: string;
  uploadedAt: string;

  encryptedBlobId: string;
  blobHash: string;
  thumbnailBlobId?: string;

  width?: number;
  height?: number;
  durationMs?: number;

  aiCaption?: string;
  tags: string[];

  createdByUserId: string;
};
```

### 10.6 `MemoryItem`

```ts
type MemoryItem = {
  id: string;
  familyId: string;
  memorySpaceId: string;

  source: "chat" | "photo" | "album" | "import";
  text?: string;
  occurredAt?: string;

  mediaAssetIds: string[];
  careLogIds: string[];

  aiSummary?: string;
  tags: string[];
  importance: "low" | "normal" | "high" | "milestone";

  memwalMemoryId?: string;
  suiPointerId?: string;

  createdByUserId: string;
  createdAt: string;
};
```

### 10.7 `AlbumManifest`

```ts
type AlbumManifest = {
  schemaVersion: number;
  albumId: string;
  type: AlbumType;
  title: string;
  period: {
    from: string;
    to: string;
  };
  cover?: {
    mediaId: string;
    caption?: string;
  };
  sections: AlbumSection[];
};

type AlbumSection = {
  type:
    | "cover"
    | "highlights"
    | "photo_grid"
    | "milestones"
    | "timeline"
    | "care_summary"
    | "monthly_summary";
  title: string;
  items: AlbumManifestItem[];
};

type AlbumManifestItem = {
  memoryItemId?: string;
  mediaId?: string;
  careLogId?: string;
  caption?: string;
  occurredAt?: string;
  layoutHint?: "cover" | "large" | "grid" | "timeline" | "milestone";
};
```

---

## 11. 保存責務

| 保存先 | 保存するもの | 保存しないもの |
|---|---|---|
| DB | index、Family、User、MemorySpace、MemoryItem metadata、Album、AlbumItem、MemoryViewSession | 平文秘密鍵、不要なraw media |
| Walrus | 暗号化写真、暗号化thumbnail、暗号化AlbumManifest、生成アルバムartifact | 暗号鍵 |
| MemWal | 思い出の長期記憶、検索・要約用memory | raw写真そのもの |
| Sui | FamilyVault、pointer、hash、commitment、schema version | 家族の本名、写真、コメント、育児ログ本文、医療詳細 |
| Web App | 表示用一時データ | 長期秘密情報、復号済みデータの永続保存 |

### 11.1 Sui metadataの原則

Suiには検証可能なmetadataだけを記録する。

推奨する汎用関数名:

```text
add_artifact_pointer
add_memory_pointer
add_blob_hash
update_archive_pointer
```

避ける関数名:

```text
add_baby_photo
add_growth_album
add_medical_log
add_sleep_log
```

理由:

- 関数名やイベント名から家庭状況を推測されるリスクを減らす。
- baby/pet/familyなど複数MemorySpaceで共通化できる。
- baby_clawと同じく、公開台帳には意味の強い個人データを載せない。

---

## 12. URL・認証・共有仕様

### 12.1 URL形式

ユーザーに返すURL:

```text
https://hibi.app/v/01JX9P7M2K
```

使わないURL:

```text
https://hibi.app/albums/taro-2026-05-growth
https://hibi.app/family/yamada/baby/2026-05
```

URLに含めないもの:

- 子どもの名前。
- 家族名。
- 生年月日。
- 月齢。
- アルバムタイトル。
- 住所や場所。
- `baby`, `medical`, `sleep` など推測性の強いラベル。

### 12.2 accessMode

| accessMode | 用途 | MVP |
|---|---|---|
| `authenticated` | 通常利用。ログイン必須。 | 対応 |
| `signed_link` | デモや一時共有。短期限。 | 限定対応 |
| `family_share` | 家族招待後の共有。 | MVP後 |
| `public` | 公開アルバム。 | MVPでは非対応 |

### 12.3 署名付きURL

署名付きURLを使う場合、tokenは一度だけURLに含める。

```text
https://hibi.app/v/01JX9P7M2K?t=one_time_token
```

初回アクセス後:

1. tokenを検証する。
2. DBの `tokenHash` と比較する。
3. HttpOnly Cookieに交換する。
4. token付きURLからtokenなしURLへリダイレクトする。

```text
https://hibi.app/v/01JX9P7M2K
```

DBに保存するのはtokenそのものではなく、hashのみ。

### 12.4 期限と取り消し

初期値:

| 種類 | 期限 |
|---|---|
| authenticated | セッション依存 |
| signed_link | 7日 |
| demo signed_link | 24時間 |

取り消し:

```text
POST /api/memory-views/:id/revoke
```

取り消し後は `VIEW_REVOKED` を返す。

---

## 13. アルバム生成仕様

### 13.1 月次成長アルバム

対象:

- `Album.type = monthly_growth`
- 対象期間: 月初 00:00:00 から月末 23:59:59
- 初期対象MemorySpace: `baby`

構成:

```text
表紙
- 今月のベスト写真
- 月齢 / 年齢
- タイトル

今月のハイライト
- はじめてできたこと
- よく笑った日
- 印象的なできごと
- 家族のコメント

写真セクション
- お気に入り
- 日常
- おでかけ
- 食事
- 睡眠
- ペット / 兄弟姉妹

成長メモ
- できるようになったこと
- よく使った言葉
- 好きだったもの
- 生活リズムの変化

タイムライン
- 日付順の記録
```

生成材料:

| データ | 用途 |
|---|---|
| `MediaAsset` | 表紙、写真グリッド、ハイライト |
| `MemoryItem.text` | 家族コメント、タイムライン |
| `CareLog` | 生活リズム要約 |
| `MemWal recall` | 関連する思い出抽出 |
| `aiCaption/tags` | 写真分類、検索 |

選定ロジック:

1. 対象月のMemoryItem、MediaAsset、CareLogを取得する。
2. milestoneタグ、high importanceを優先する。
3. 写真は日付・タグが偏りすぎないように選ぶ。
4. 家族が書いたコメントをAI captionより優先する。
5. coverは人物性、明るさ、重複度、milestone性で選ぶ。
6. AlbumManifestを生成する。
7. Manifestを暗号化しWalrusに保存する。
8. DBにAlbumとAlbumItemを保存する。
9. 必要に応じてSuiへhash/pointerを記録する。

### 13.2 年次成長アルバム

対象:

- `Album.type = yearly_growth`
- 対象期間: 年初から年末、または直近12か月
- MVP後に実装

設計方針:

- 年次アルバムは、月次アルバムを集約して生成する。
- 毎回全MemoryItemを走査しない。
- 月次アルバムがない月は、その月だけ要約生成する。

構成:

```text
表紙
- 今年を象徴する写真
- 年間タイトル

12か月の成長
- 1月
- 2月
- 3月
...
- 12月

今年できるようになったこと
- 初めて歩いた
- 初めて話した言葉
- 初めて行った場所

写真ハイライト
- ベストショット
- 家族写真
- 何気ない日常
- 行事

家族の思い出
- 印象的な会話
- 大変だったこと
- 嬉しかったこと

年間タイムライン
- 重要イベントだけ
```

生成ロジック:

1. 対象年の月次Albumを取得する。
2. 未生成月があれば月次summaryだけ生成する。
3. 各月のcover、milestone、summaryを抽出する。
4. 年間milestone候補を選ぶ。
5. 重複写真を除外する。
6. 年間AlbumManifestを生成する。
7. Manifestを暗号化しWalrusへ保存する。
8. DBにAlbumとAlbumItemを保存する。
9. SuiへmanifestHash/pointerを記録する。
10. MemoryViewSessionを作成しURLを返す。

### 13.3 最近の思い出ビュー

`recent_memories` はAlbumを必須にしない。

- 速度優先の場合: DBから動的に組み立てる。
- 保存性優先の場合: temporary AlbumManifestを生成する。

MVPでは、DBから動的に組み立てる。

初期条件:

```json
{
  "days": 90,
  "limit": 50,
  "includePhotos": true,
  "includeCareLogs": true,
  "includeMilestones": true
}
```

---

## 14. 暗号化・プライバシー仕様

### 14.1 プライバシー境界

平文で外部に出してはいけないもの:

- 家族の本名。
- 子どもの本名。
- 写真。
- 写真コメント。
- 育児ログ本文。
- 医療的な詳細情報。
- 位置情報。
- AI要約のうち個人情報を含むもの。
- 復号済みAlbumManifest。

### 14.2 ログ禁止項目

API、Plugin、Web Appのログに出してはいけないもの:

- private key。
- encryption key。
- raw record。
- image data。
- unencrypted note。
- signed URL token。
- Cookie値。
- 復号済みAlbumManifest全体。

### 14.3 暗号化方針

MVP:

- Hibi APIまたはtrusted backendで暗号化・復号を担当する。
- Walrusには暗号化済みBlobを保存する。
- Web表示時は認証済みAPIを通じて必要な範囲だけ返す。

将来:

- クライアントサイド復号に対応する。
- Family key sharingを導入する。
- Sealなどの権限管理を検討する。

---

## 15. Sui / Walrus / MemWal連携

### 15.1 Walrus

Walrusに保存するもの:

- 暗号化写真Blob。
- 暗号化thumbnail Blob。
- 暗号化AlbumManifest。
- 生成アルバムartifact。

### 15.2 Sui

Suiに保存するもの:

- `FamilyVault`。
- `schemaVersion`。
- `blobHash`。
- `manifestHash`。
- 汎用pointer。
- commitment。

Suiに保存しないもの:

- 写真本文。
- 育児ログ本文。
- コメント本文。
- 家族名や子どもの名前。
- 具体的なalbum typeが推測できるmetadata。

### 15.3 MemWal

MemWalに保存するもの:

- 写真説明。
- 家族コメント。
- 出来事。
- 育児ログ要約。
- milestone候補。

MemWalを使う場面:

- 「最近できるようになったことは？」への回答。
- アルバム生成時の関連memory抽出。
- 月次/年次ハイライト選定。

---

## 16. 非機能要件

### 16.1 パフォーマンス

| 操作 | 目標 |
|---|---|
| `/v/:viewId` 初期表示 | 2秒以内にskeleton表示 |
| 写真ギャラリー初期表示 | 3秒以内 |
| 最近の思い出URL発行 | 2秒以内 |
| 月次アルバム既存取得 | 2秒以内 |
| 月次アルバム新規生成 | 非同期可。生成中画面を返す |
| 年次アルバム生成 | 非同期前提 |

### 16.2 可用性

- Walrusが一時的に失敗しても、DB上のmetadataで「保存処理中」と表示できる。
- Sui書き込みが失敗しても、MVPでは写真閲覧自体は可能にする。
- Album生成失敗時は再生成できる。

### 16.3 監査性

記録する監査イベント:

- MemoryViewSession作成。
- MemoryViewSessionアクセス。
- URL取り消し。
- Album生成開始。
- Album生成完了。
- Walrus upload成功/失敗。
- Sui pointer記録成功/失敗。

ただし、監査ログに秘密情報を含めない。

---

## 17. 実装フェーズ

### Phase 5.1: Memory View URL

目的:

- チャットで「思い出を見たい！」と言うとURLが返る。

実装:

- `MemoryViewSession` model。
- `POST /api/memory-views`。
- `GET /api/memory-views/:id/bootstrap`。
- `apps/web` の `/v/:viewId`。
- `hibi_create_memory_view` tool。
- intent `get_memory_view_url`。

完了条件:

- 「思い出を見たい！」に対して `/v/:viewId` が返る。
- URLを開くと最近の思い出が表示される。
- 未ログインまたは期限切れはエラー表示になる。

### Phase 5.2: Photo Gallery

目的:

- 写真一覧をWebで見られる。

実装:

- `MediaAsset` model。
- 写真グリッド。
- 日付別表示。
- 写真詳細モーダル。
- `get_photo_gallery_url` intent。

完了条件:

- 「最近の写真見たい」に対して写真ギャラリーURLが返る。
- 保存済み写真が一覧表示される。

### Phase 7.1: Monthly Growth Album

目的:

- 月次成長アルバムを生成・閲覧できる。

実装:

- `Album` / `AlbumItem` model。
- `AlbumManifest` schema。
- 月次アルバム生成workflow。
- Walrus manifest保存。
- `/v/:viewId` で月次アルバム表示。

完了条件:

- 「今月の成長アルバム見せて」に対してURLが返る。
- 表紙、ハイライト、写真、タイムラインが表示される。

### Phase 7.2: Yearly Growth Album

目的:

- 年次成長アルバムを生成・閲覧できる。

実装:

- 年次Album workflow。
- 月次Album集約。
- milestone抽出。
- 年間manifest生成。

完了条件:

- 「1年の成長アルバム作って」に対してURLが返る。
- 12か月の成長が表示される。

### Phase 8+: Verifiable Archive

目的:

- Album manifestや写真Blobのhash/pointerをSuiに記録する。

実装:

- 汎用pointer記録Move contract。
- TypeScript Sui client。
- Sui write retry。
- Archive Status Viewとの連携。

---

## 18. 受け入れ条件

### 18.1 Chat UX

- 「思い出を見たい！」で最近の思い出URLが返る。
- 「最近の写真見たい」で写真ギャラリーURLが返る。
- 「今月の成長アルバム見せて」で月次成長アルバムURLが返る。
- 「5月のアルバム作って」で対象月のアルバムURLが返る。
- URL返却時、ユーザーにわかりやすい短い説明文が添えられる。

### 18.2 Web UX

- `/v/:viewId` でviewTypeに応じた画面が表示される。
- スマホで見やすい。
- 写真グリッドとタイムラインが表示される。
- Albumが生成中の場合は生成中画面を表示する。
- URL期限切れ、権限なし、取り消し済みの画面がある。

### 18.3 Security

- URLに家族名、子どもの名前、日付、アルバム名が含まれない。
- tokenはDBに平文保存しない。
- signed linkは期限切れになる。
- URLを取り消せる。
- Suiに平文の写真、コメント、育児ログを保存しない。
- ログに秘密情報を出さない。

### 18.4 Storage

- 写真は暗号化済みBlobとしてWalrusに保存される。
- AlbumManifestは暗号化してWalrusに保存される。
- DBにAlbumとMemoryViewSessionが保存される。
- Suiにはhash/pointerのみ保存される。

---

## 19. テスト観点

### 19.1 Unit Tests

- Intent classifier。
- Date parser。
- MemoryViewSession URL生成。
- token hash検証。
- AlbumManifest生成。
- 月次写真選定。
- milestone抽出。

### 19.2 Integration Tests

- `POST /api/messages` -> URL返却。
- `POST /api/memory-views` -> `/v/:viewId` 表示。
- `POST /api/albums/generate` -> Walrus保存 -> DB保存。
- URL取り消し後アクセス拒否。
- 期限切れURLアクセス拒否。

### 19.3 Security Tests

- URLに秘密情報が含まれない。
- tokenがログに出ない。
- DBにtoken平文が保存されない。
- Sui payloadに平文コメントが含まれない。
- 未認証ユーザーが他Familyのviewを開けない。

---

## 20. 推奨ディレクトリ構成

```text
apps/
  api/
    src/
      routes/
        messages.ts
        memoryViews.ts
        albums.ts
        media.ts
      workflows/
        createMemoryView.ts
        generateMonthlyAlbum.ts
        generateYearlyAlbum.ts
        recordPhotoMemory.ts
      services/
        albumManifestService.ts
        urlTokenService.ts
        accessControlService.ts
  web/
    app/
      v/[viewId]/page.tsx
      albums/[albumId]/page.tsx
      gallery/page.tsx
      growth/monthly/[month]/page.tsx
      growth/yearly/[year]/page.tsx
    components/
      MemoryViewShell.tsx
      PhotoGrid.tsx
      Timeline.tsx
      MonthlyGrowthAlbum.tsx
      YearlyGrowthAlbum.tsx
      ExpiredView.tsx

packages/
  core/
    src/
      types/
        memoryView.ts
        album.ts
        media.ts
      schemas/
        albumManifest.ts
      clients/
        walrusClient.ts
        suiClient.ts
        memwalClient.ts

  openclaw-plugin/
    src/
      tools/
        createMemoryView.ts
        createMonthlyGrowthAlbum.ts
        getPhotoGalleryUrl.ts
    skills/
      hibi/
        SKILL.md
```

---

## 21. 初期実装タスク

優先順:

1. `MemoryViewSession` type/schemaを `packages/core` に追加する。
2. `Album`, `AlbumItem`, `AlbumManifest` type/schemaを追加する。
3. `POST /api/memory-views` を実装する。
4. `GET /api/memory-views/:id/bootstrap` を実装する。
5. `apps/web/app/v/[viewId]/page.tsx` を作る。
6. `hibi_create_memory_view` toolを追加する。
7. Skillに「思い出を見たい！」のルーティングを追加する。
8. `photo_gallery` viewを実装する。
9. 月次Album生成workflowを実装する。
10. AlbumManifestをWalrusに保存する。
11. `monthly_growth_album` viewを実装する。
12. URL expiry/revokeを実装する。
13. Sui pointer/hash記録を接続する。
14. 年次Album生成を追加する。

---

## 22. 判断が必要な論点

### 22.1 MVPの復号方式

推奨:

- MVPはtrusted backend復号。
- 将来はclient-side復号を検討。

理由:

- MVPで複雑なkey sharingを入れると実装が重くなる。
- まず「チャットからURLが返り、Webで美しく見られる」体験を優先する。

### 22.2 URLのデフォルト期限

推奨:

- ログイン必須URL: セッション依存。
- signed link: 7日。
- demo signed link: 24時間。

### 22.3 年次アルバムのMVP入り

推奨:

- 年次アルバムはMVP後。
- ただし、データモデルとManifest schemaは最初から年次対応にする。

### 22.4 Sui書き込みの必須度

推奨:

- MVPでは写真閲覧・Album生成をブロックしない。
- Sui書き込みは非同期でretry可能にする。
- Archive StatusでSui記録状態を表示する。

---

## 23. 最終的なプロダクト像

HibiのWebアプリは、入力フォーム中心のアプリではない。

ユーザーは、日々の写真や出来事をチャットに送るだけでよい。あとから「思い出を見たい！」と聞くと、Hibiが写真、言葉、育児ログ、成長ハイライトをまとめた閲覧URLを返す。

Hibiが目指す体験は、単なる写真保存ではなく、家族が送った言葉ごと未来に残るアルバムである。

そのため、HibiではAI captionよりも、家族がその瞬間に送った言葉を大切に表示する。

```text
写真だけが残るのではなく、
その日に家族が何を感じ、何を見て、何を残したかったのかまで残る。
```

この体験を成立させるために、Hibiは次の順で実装する。

```text
1. チャットで記録する
2. 安全に保存する
3. URLで見返せる
4. 月ごとに美しくまとめる
5. 年ごとに成長を振り返る
6. 長期保存と検証可能性を加える
```

以上をHibi Memory Views & Album Web Appの仕様とする。
