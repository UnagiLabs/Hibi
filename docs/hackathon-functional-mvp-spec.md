# Hibi Hackathon Functional MVP 仕様書

## 1. 結論

Hibiのハッカソン提出物は、説明用デモではなく、実際に動作するシステムとして作る。

対象機能は次の2つ。

1. OpenClawなどのチャットだけで記録・仕訳・保存・閲覧できる育児ログ
2. OpenClawなどのチャットだけで写真・思い出を保存し、Webで閲覧できる家族アルバム

Hibiは、ぴよログ的な育児ログ体験と、みてね的な家族アルバム体験を、Walrus / MemWal / OpenClawを使った **chat-first family memory agent** として実装する。

ハッカソンでの勝ち筋は、以下の流れが実際に動くこと。

```text
Chat input
  -> OpenClaw Plugin
  -> Hibi API
  -> intent classification
  -> DB save
  -> MemWal remember / recall
  -> Walrus file or album artifact save
  -> Memory View URL
  -> Web app rendering
```

---

## 2. ハッカソン提出の前提

### 2.1 動く必要があるもの

提出時点で、最低限以下が実際に動く必要がある。

| 項目 | 必須 | 説明 |
|---|---:|---|
| OpenClaw Plugin | 必須 | チャットからHibi APIを呼べる |
| Hibi API | 必須 | メッセージ処理、保存、URL発行を行う |
| DB | 必須 | MemoryItem、CareLog、Album、ViewSessionを永続化する |
| Web App | 必須 | URLから育児ログ・写真・アルバムを閲覧できる |
| MemWal | 必須 | remember / recall が実接続で動く |
| Walrus | 必須 | 写真またはAlbumManifestを実際に保存する |
| Sui | できれば必須 | hash / pointer記録。時間が足りなければread-only表示でもよい |

### 2.2 動かないと評価されにくいもの

以下だけでは不十分。

- スライドだけ。
- Figmaだけ。
- ダミーのURLだけ。
- localStorageだけで完結するアプリ。
- MemWalやWalrusを呼んでいないモック。
- Web画面に固定データを表示するだけ。

### 2.3 MVPで許容する簡略化

ハッカソンでは、以下は簡略化してよい。

| 項目 | MVPでの扱い |
|---|---|
| 認証 | demo family固定、または簡易token |
| ユーザー管理 | 1 family / 1 memory space固定でも可 |
| 写真暗号化 | 最低限Walrus保存を優先。暗号化は可能なら実装 |
| Sui contract | 既存objectまたは簡易pointer記録で可 |
| 年次アルバム | MVP後。月次アルバムを優先 |
| AI分類 | ルールベース + LLM補助で可 |
| OpenClaw以外 | 直接APIテストUIを補助で用意してよい |

---

## 3. プロダクト定義

### 3.1 一言説明

```text
Hibi is a chat-first family memory agent that records childcare logs and family photos, stores long-term semantic memory in MemWal, stores durable artifacts on Walrus, and lets families revisit them through web albums.
```

日本語:

```text
Hibiは、チャットで送った育児ログと家族写真をAIが仕訳・記憶し、Walrusに永続保存して、Webアルバムで見返せるFamily Memory Agentです。
```

### 3.2 参考体験

| 参考アプリ | Hibiで取り入れる要素 | Hibiで変える要素 |
|---|---|---|
| ぴよログ | ミルク、睡眠、排泄、体温などの育児ログ | 入力はフォームではなくチャット中心 |
| みてね | 家族写真、月別アルバム、成長の振り返り | AIが思い出を意味検索し、MemWalで長期記憶化 |

---

## 4. ハッカソンMVP機能

## 4.1 育児ログ

### 4.1.1 入力例

```text
ミルク120ml飲んだ
寝た
起きた
うんちした
体温36.8度
今日は機嫌がよかった
```

### 4.1.2 処理

```text
1. OpenClaw Pluginがチャット入力を受け取る
2. Hibi APIへPOST /api/messages
3. intent = care_log と判定
4. care log categoryを抽出
5. CareLogをDBに保存
6. 自然文要約をMemWalにremember
7. 今日のログURLを返す
```

### 4.1.3 チャット返答例

```text
ミルク120mlを記録しました。
今日の育児ログはこちらです。
https://hibi.app/v/view_abc
```

### 4.1.4 Web表示

```text
今日の育児ログ

09:10 ミルク 120ml
10:30 睡眠開始
12:00 起床
13:20 うんち
16:00 体温 36.8度
```

---

## 4.2 写真・思い出保存

### 4.2.1 入力例

```text
この写真、はじめて寝返りした！
```

添付:

```text
photo.jpg
```

### 4.2.2 処理

```text
1. OpenClaw Pluginが写真添付とコメントを受け取る
2. Hibi APIへPOST /api/photosまたはPOST /api/messages
3. intent = photo_memory と判定
4. 写真をWalrusへ保存
5. MediaAssetをDBに保存
6. コメント・caption・tagsをMemoryItemとしてDBに保存
7. 写真説明と家族コメントをMemWalにremember
8. 必要ならWalrus blob ID / hashをDBに保存
9. 保存完了メッセージを返す
```

### 4.2.3 チャット返答例

```text
大切な成長の記録として保存しました。
「はじめて寝返りした」思い出としてあとから見返せます。
```

---

## 4.3 思い出閲覧URL

### 4.3.1 入力例

```text
思い出を見たい！
```

### 4.3.2 処理

```text
1. intent = get_memory_view_url
2. DBから最近のMemoryItem / MediaAsset / CareLogを取得
3. MemWal recallで重要そうな思い出を補完
4. MemoryViewSessionをDBに作成
5. /v/:viewId URLを返す
```

### 4.3.3 チャット返答例

```text
最近の思い出をまとめました。
写真、できごと、成長のハイライトを見返せます。

https://hibi.app/v/view_recent
```

### 4.3.4 Web表示

```text
最近の思い出

[成長ハイライト]
- はじめて寝返りした
- 公園で犬を見て笑っていた

[写真]
□ □ □ □

[タイムライン]
6/3 はじめて寝返りした
6/2 公園で犬を見て笑っていた
```

---

## 4.4 月次成長アルバム

### 4.4.1 入力例

```text
今月の成長アルバム見せて
```

### 4.4.2 処理

```text
1. intent = generate_monthly_growth_album
2. 対象月を解釈
3. DBから対象月の写真・育児ログ・思い出を取得
4. MemWal recallで成長milestone候補を取得
5. AlbumManifest JSONを生成
6. AlbumManifestをWalrusへ保存
7. AlbumをDBに保存
8. MemoryViewSessionを作成
9. URLを返す
```

### 4.4.3 チャット返答例

```text
2026年6月の成長アルバムを作成しました。

https://hibi.app/v/view_monthly
```

### 4.4.4 Web表示

```text
2026年6月の成長アルバム

[Cover]

今月できるようになったこと
- 寝返り
- 声を出して笑う

今月の写真
□ □ □

日々の思い出
6/3 はじめて寝返りした
6/2 公園で犬を見て笑っていた
```

---

## 4.5 MemWal recall体験

### 4.5.1 入力例

```text
最近できるようになったことは？
```

### 4.5.2 処理

```text
1. intent = ask_memory
2. MemWal recallを実行
3. recall結果に含まれるsource IDからDB lookup
4. AIまたはtemplateで返答生成
5. 関連するMemory View URLも返す
```

### 4.5.3 チャット返答例

```text
最近は寝返りができるようになりました。
6月3日に「はじめて寝返りした！」という写真付きの思い出があります。

写真で見返せます。
https://hibi.app/v/view_rollover
```

---

## 5. OpenClaw Plugin仕様

### 5.1 必須tool

```ts
type HibiOpenClawTool =
  | "hibi_status"
  | "hibi_record_message"
  | "hibi_record_photo"
  | "hibi_create_memory_view"
  | "hibi_create_monthly_album"
  | "hibi_recall_memory";
```

### 5.2 `hibi_record_message`

用途:

- 育児ログ
- 日々の出来事
- 思い出への質問
- アルバムURL要求

Input:

```json
{
  "text": "ミルク120ml飲んだ",
  "timezone": "Asia/Tokyo"
}
```

Output:

```json
{
  "reply": "ミルク120mlを記録しました。",
  "intent": "care_log",
  "url": "https://hibi.app/v/view_today"
}
```

### 5.3 `hibi_record_photo`

Input:

```json
{
  "text": "この写真、はじめて寝返りした！",
  "attachment": {
    "filename": "photo.jpg",
    "mimeType": "image/jpeg"
  }
}
```

Output:

```json
{
  "reply": "大切な成長の記録として保存しました。",
  "intent": "photo_memory",
  "mediaId": "media_abc"
}
```

### 5.4 Pluginの原則

- PluginはHibi APIを呼ぶだけにする。
- MemWal key、Walrus credential、Sui private keyをPluginに持たせない。
- Pluginから返すのはreplyとURL中心。
- 保存・分類・アルバム生成の本体はHibi APIで実装する。

---

## 6. Hibi API仕様

## 6.1 必須endpoint

```text
GET  /api/health
POST /api/messages
POST /api/photos
POST /api/memory-views
GET  /api/memory-views/:id/bootstrap
POST /api/albums/generate
GET  /api/albums/:id/manifest
GET  /api/media/:id
```

### 6.2 `GET /api/health`

必須接続確認:

```json
{
  "status": "ok",
  "db": "ok",
  "memwal": "ok",
  "walrus": "ok",
  "sui": "ok_or_skipped"
}
```

### 6.3 `POST /api/messages`

Request:

```json
{
  "familyId": "fam_demo",
  "memorySpaceId": "space_baby_demo",
  "text": "ミルク120ml飲んだ",
  "timezone": "Asia/Tokyo"
}
```

Response:

```json
{
  "intent": "care_log",
  "reply": "ミルク120mlを記録しました。",
  "saved": true,
  "careLogId": "care_abc",
  "memwalRememberJobId": "job_abc",
  "url": "https://hibi.app/v/view_today"
}
```

### 6.4 `POST /api/photos`

Request:

```text
multipart/form-data
- familyId
- memorySpaceId
- text
- file
```

Response:

```json
{
  "intent": "photo_memory",
  "reply": "大切な成長の記録として保存しました。",
  "mediaId": "media_abc",
  "memoryItemId": "mem_abc",
  "walrusBlobId": "blob_abc",
  "memwalRememberJobId": "job_abc"
}
```

### 6.5 `POST /api/albums/generate`

Request:

```json
{
  "familyId": "fam_demo",
  "memorySpaceId": "space_baby_demo",
  "type": "monthly_growth",
  "year": 2026,
  "month": 6
}
```

Response:

```json
{
  "albumId": "album_abc",
  "status": "ready",
  "manifestBlobId": "blob_manifest_abc",
  "manifestHash": "sha256:...",
  "url": "https://hibi.app/v/view_album"
}
```

---

## 7. Intent分類仕様

### 7.1 MVP intent

```ts
type HibiIntent =
  | "care_log"
  | "photo_memory"
  | "daily_memory"
  | "ask_memory"
  | "get_memory_view_url"
  | "generate_monthly_growth_album"
  | "help";
```

### 7.2 ルールベース分類

ハッカソンMVPでは、まずルールベースでよい。

| 入力 | intent | 抽出 |
|---|---|---|
| ミルク120ml | `care_log` | category=milk, amountMl=120 |
| 寝た | `care_log` | category=sleep_start |
| 起きた | `care_log` | category=sleep_end |
| うんち | `care_log` | category=poop |
| 体温36.8 | `care_log` | category=temperature, value=36.8 |
| 写真添付あり | `photo_memory` | media + text |
| 思い出を見たい | `get_memory_view_url` | recent_memories |
| 今月のアルバム | `generate_monthly_growth_album` | current month |
| 最近できるようになったこと | `ask_memory` | recall query |

LLM分類は追加してよいが、ルールベースで主要デモが壊れないことを優先する。

---

## 8. MemWal実装仕様

### 8.1 採用方式

ハッカソンMVPでは次を使う。

```text
Default SDK
+ Managed Relayer
+ Dashboardで発行したaccount ID / delegate key
```

### 8.2 必須env

```env
MEMWAL_ACCOUNT_ID=
MEMWAL_DELEGATE_PRIVATE_KEY=
MEMWAL_SERVER_URL=https://relayer.memory.walrus.xyz
MEMWAL_NAMESPACE_PREFIX=hibi
MEMWAL_ENV=hackathon
```

### 8.3 namespace

```text
hibi:hackathon:{familyId}:{memorySpaceId}
```

例:

```text
hibi:hackathon:fam_demo:space_baby_demo
```

### 8.4 rememberする内容

育児ログ:

```text
[care_log]
Date: 2026-06-03T09:10:00+09:00
Type: milk
Amount: 120ml
Summary: ミルクを120ml飲んだ。
Source: care_abc
```

写真思い出:

```text
[photo_memory]
Date: 2026-06-03
Summary: はじめて寝返りした写真。
Family comment: この写真、はじめて寝返りした！
Tags: milestone, rollover, baby, photo
Source memory item: mem_abc
Source media: media_abc
```

日々の思い出:

```text
[daily_memory]
Date: 2026-06-03
Summary: 公園で犬を見て笑っていた。
Tags: park, dog, happy
Source: mem_abc
```

### 8.5 recallする内容

```ts
await memwal.recall({
  query: "最近できるようになったことは？"
});
```

Hibiはrecall結果をそのまま表示するのではなく、DBのsource IDと照合してWeb URLにつなげる。

### 8.6 必須動作確認

- `memwal.health()` が成功する。
- `memwal.remember()` が成功する。
- `waitForRememberJob()` が成功する。
- `memwal.recall()` で過去に保存した記憶が返る。

---

## 9. Walrus実装仕様

### 9.1 必ず保存するもの

MVPでは、最低でも1つはWalrusに実保存する。

優先順:

1. 写真ファイル
2. AlbumManifest JSON
3. 月次アルバムHTMLまたはJSON artifact

### 9.2 AlbumManifest

```json
{
  "schemaVersion": 1,
  "albumId": "album_abc",
  "type": "monthly_growth",
  "title": "2026年6月の成長アルバム",
  "period": {
    "from": "2026-06-01",
    "to": "2026-06-30"
  },
  "sections": [
    {
      "type": "highlights",
      "title": "今月できるようになったこと",
      "items": [
        {
          "memoryItemId": "mem_abc",
          "mediaId": "media_abc",
          "caption": "はじめて寝返りした"
        }
      ]
    }
  ]
}
```

### 9.3 保存結果

DBに保存する。

```ts
type WalrusArtifactRef = {
  blobId: string;
  hash?: string;
  kind: "photo" | "album_manifest" | "album_html";
  sourceId: string;
  createdAt: string;
};
```

### 9.4 fallback禁止

Walrus保存に失敗した場合、成功したふりをしない。

Response例:

```json
{
  "status": "partial_failure",
  "savedToDb": true,
  "savedToMemWal": true,
  "savedToWalrus": false,
  "error": "WALRUS_UPLOAD_FAILED"
}
```

ハッカソン提出では、最低1つの成功したWalrus blob IDを画面またはAPI responseで確認できること。

---

## 10. Web App仕様

### 10.1 必須ルート

```text
/v/:viewId
```

MVPではこの1ルートに集約してよい。

### 10.2 View type

```ts
type ViewType =
  | "care_log_day"
  | "recent_memories"
  | "photo_gallery"
  | "monthly_growth_album";
```

### 10.3 表示要件

`/v/:viewId` はAPIからbootstrapを取得する。

```text
GET /api/memory-views/:id/bootstrap
```

表示するもの:

- view title
- period
- care logs
- photo grid
- memory timeline
- album sections
- Walrus blob ID / storage status
- MemWal recall source indicator

### 10.4 必須UI状態

- loading
- not found
- expired
- revoked
- generation failed
- Walrus partial failure

---

## 11. DBモデル

### 11.1 `CareLog`

```ts
type CareLog = {
  id: string;
  familyId: string;
  memorySpaceId: string;
  category: "milk" | "sleep_start" | "sleep_end" | "poop" | "pee" | "temperature" | "mood" | "note";
  occurredAt: string;
  amountMl?: number;
  temperatureC?: number;
  note?: string;
  memwalRememberJobId?: string;
  createdAt: string;
};
```

### 11.2 `MemoryItem`

```ts
type MemoryItem = {
  id: string;
  familyId: string;
  memorySpaceId: string;
  kind: "daily_memory" | "photo_memory" | "milestone";
  text: string;
  occurredAt: string;
  mediaAssetIds: string[];
  tags: string[];
  memwalRememberJobId?: string;
  createdAt: string;
};
```

### 11.3 `MediaAsset`

```ts
type MediaAsset = {
  id: string;
  familyId: string;
  memorySpaceId: string;
  filename: string;
  mimeType: string;
  walrusBlobId?: string;
  walrusHash?: string;
  createdAt: string;
};
```

### 11.4 `Album`

```ts
type Album = {
  id: string;
  familyId: string;
  memorySpaceId: string;
  type: "monthly_growth";
  title: string;
  periodStart: string;
  periodEnd: string;
  manifestBlobId?: string;
  manifestHash?: string;
  status: "generating" | "ready" | "failed";
  createdAt: string;
};
```

### 11.5 `MemoryViewSession`

```ts
type MemoryViewSession = {
  id: string;
  familyId: string;
  memorySpaceId: string;
  viewType: "care_log_day" | "recent_memories" | "photo_gallery" | "monthly_growth_album";
  resourceId?: string;
  expiresAt?: string;
  revokedAt?: string;
  createdAt: string;
};
```

---

## 12. 実装順

### Phase 1: 動くAPIとDB

- API serverを起動できる。
- DBにCareLog / MemoryItem / MediaAsset / Album / MemoryViewSessionを保存できる。
- `GET /api/health` が動く。

完了条件:

```text
curl /api/health でdb=okが返る
```

### Phase 2: チャット入力処理

- `POST /api/messages`。
- ルールベースintent分類。
- 育児ログ保存。
- 日々の思い出保存。

完了条件:

```text
「ミルク120ml飲んだ」がCareLogとしてDB保存される
```

### Phase 3: MemWal接続

- `memwal.health()`。
- `remember()`。
- `recall()`。

完了条件:

```text
「はじめて寝返りした」をrememberした後、
「最近できるようになったことは？」でrecallできる
```

### Phase 4: Web View

- `/v/:viewId`。
- `GET /api/memory-views/:id/bootstrap`。
- 育児ログ表示。
- 最近の思い出表示。

完了条件:

```text
チャット返却URLを開くと保存済みデータが表示される
```

### Phase 5: Walrus保存

- 写真upload。
- Walrus blob save。
- MediaAssetへblob ID保存。
- AlbumManifest JSONをWalrus保存。

完了条件:

```text
保存結果にwalrusBlobIdがあり、Web画面で確認できる
```

### Phase 6: 月次成長アルバム

- `POST /api/albums/generate`。
- DB + MemWal recallで材料収集。
- AlbumManifest生成。
- Walrus保存。
- `/v/:viewId`で表示。

完了条件:

```text
「今月の成長アルバム見せて」でURLが返り、Webで開ける
```

### Phase 7: OpenClaw Plugin接続

- `hibi_status`。
- `hibi_record_message`。
- `hibi_record_photo`。
- `hibi_create_memory_view`。
- `hibi_create_monthly_album`。

完了条件:

```text
OpenClawからチャット入力し、URLが返る
```

### Phase 8: Sui pointer/hash

- 簡易pointer/hash記録。
- Archive status表示。

完了条件:

```text
Walrus artifactのhash/pointerがSuiまたはDB上で検証可能に表示される
```

---

## 13. 最小受け入れ条件

ハッカソン提出前に、以下をすべて満たす。

### 13.1 育児ログ

- [ ] OpenClawまたはAPIから「ミルク120ml飲んだ」を送れる。
- [ ] `care_log` intentになる。
- [ ] DBにCareLogが保存される。
- [ ] MemWalに育児ログ要約がrememberされる。
- [ ] Web URLが返る。
- [ ] Webで今日の育児ログが見える。

### 13.2 写真と思い出

- [ ] 写真とコメントを送れる。
- [ ] `photo_memory` intentになる。
- [ ] 写真がWalrusに保存される。
- [ ] MediaAssetがDBに保存される。
- [ ] コメントがMemoryItemとしてDBに保存される。
- [ ] 写真説明がMemWalにrememberされる。

### 13.3 Recall

- [ ] 「最近できるようになったことは？」を送れる。
- [ ] MemWal recallが実行される。
- [ ] 過去の「はじめて寝返りした」が回答に使われる。
- [ ] 関連Web URLが返る。

### 13.4 アルバム

- [ ] 「今月の成長アルバム見せて」を送れる。
- [ ] DBから対象月の写真・ログが取得される。
- [ ] MemWal recallでmilestone候補が取得される。
- [ ] AlbumManifestが生成される。
- [ ] AlbumManifestがWalrusに保存される。
- [ ] Web URLが返る。
- [ ] Webで月次アルバムが見える。

### 13.5 Web

- [ ] `/v/:viewId` が存在する。
- [ ] care log viewが見える。
- [ ] recent memories viewが見える。
- [ ] monthly album viewが見える。
- [ ] Walrus保存状態が表示される。

---

## 14. 失敗時の方針

### 14.1 MemWal失敗

- DB保存は続行してよい。
- `memwalStatus = failed` をDBに保存する。
- Webで「AI memory sync failed」と表示する。
- 成功したふりをしない。

### 14.2 Walrus失敗

- 写真保存・アルバム保存でWalrusが失敗した場合、ハッカソン評価に大きく響く。
- fallback local保存は一時的には可だが、UI/APIでpartial failureを明示する。
- 提出デモでは必ずWalrus成功ケースを用意する。

### 14.3 OpenClaw失敗

- API直叩きUIまたはWeb入力欄を補助として用意してよい。
- ただし最終提出ではOpenClaw Plugin経由の動線を最低1本通す。

---

## 15. 審査員に見せる動作シナリオ

### Scenario 1: 育児ログ

```text
User: ミルク120ml飲んだ
Hibi: ミルク120mlを記録しました。URL...
Web: 今日の育児ログに表示
```

確認ポイント:

- intent分類
- DB保存
- MemWal remember
- Web閲覧

### Scenario 2: 写真思い出

```text
User: この写真、はじめて寝返りした！ + photo
Hibi: 成長の記録として保存しました
```

確認ポイント:

- Walrus blob ID
- MemoryItem
- MemWal remember

### Scenario 3: 長期記憶recall

```text
User: 最近できるようになったことは？
Hibi: 最近は寝返りができるようになりました。URL...
```

確認ポイント:

- MemWal recall
- セッションをまたいだ記憶
- Web URL再利用

### Scenario 4: 月次アルバム

```text
User: 今月の成長アルバム見せて
Hibi: 2026年6月の成長アルバムを作成しました。URL...
Web: 月次アルバム表示
```

確認ポイント:

- Artifact生成
- Walrus AlbumManifest保存
- Web rendering

---

## 16. 勝つための実装優先順位

時間がない場合は、この順に作る。

```text
1. care_log chat -> DB -> Web
2. MemWal remember / recall
3. photo upload -> Walrus -> DB
4. recent memories URL -> Web
5. monthly album manifest -> Walrus -> Web
6. OpenClaw Plugin接続
7. Sui pointer/hash
```

Suiは重要だが、Hibiの核は以下の1本が動くこと。

```text
chat -> classify -> remember -> store artifact -> recall -> web view
```

---

## 17. 実装上の禁止事項

- 成功していないMemWal保存を成功扱いしない。
- 成功していないWalrus保存を成功扱いしない。
- Webに固定データだけを表示しない。
- `localhost` 専用URLしか返せない状態で提出しない。
- secret keyをGitHubにcommitしない。
- delegate private keyをログに出さない。
- 写真binaryをMemWalに送らない。
- 子どもの本名や家族名をURLに含めない。

---

## 18. 完成定義

Hibi Hackathon MVPは、以下が実際に動作したとき完成とする。

```text
1. OpenClawまたはチャットUIで育児ログを送る
2. Hibiがcare_logに分類する
3. DBに保存する
4. MemWalにrememberする
5. Web URLを返す
6. Webで育児ログが見える

7. 写真と思い出コメントを送る
8. 写真をWalrusに保存する
9. コメントをMemWalにrememberする
10. 「最近できるようになったことは？」でrecallする
11. 関連する思い出URLを返す
12. Webで写真・思い出・月次アルバムが見える
```

この状態で、HibiはWalrus Trackの要求である以下をすべて満たす。

- long-term memory
- persistent data and file access
- artifact-driven workflow
- agentic workflow
- portable family memory
- verifiable storage foundationへの接続
