# ロードマップ

このロードマップは、ハッカソン提出物が説明用デモではなく、実際に動くシステムであることを前提にする。

最優先の完成ラインは次の1本を通すこと。

```text
chat -> classify -> DB save -> MemWal remember -> Walrus artifact save -> MemWal recall -> Web URL -> Web rendering
```

詳細仕様は `docs/hackathon-functional-mvp-spec.md` を正とする。

---

## Phase 1: Functional API And DB

ゴール: Hibi APIを起動し、チャット入力を受け取り、DBへ永続化できる。

- Hibi API skeleton
- `GET /api/health`
- `POST /api/messages`
- User / Family / MemorySpace demo seed
- CareLog model
- MemoryItem model
- MediaAsset model
- Album model
- MemoryViewSession model
- local Postgres or SQLite for hackathon runtime

完了条件:

- `GET /api/health` で `db=ok` が返る。
- `POST /api/messages` に送った本文がDBに保存される。
- 再起動後も保存済みデータが残る。

---

## Phase 2: Rule-Based Intent Classification

ゴール: ハッカソンで使う主要入力を壊れずに分類できる。

- intent classifier
- care log parser
- photo memory detection
- memory view request detection
- monthly album request detection
- recall question detection

対応必須入力:

```text
ミルク120ml飲んだ
寝た
起きた
うんちした
体温36.8度
思い出を見たい！
最近の写真見たい
今月の成長アルバム見せて
最近できるようになったことは？
```

完了条件:

- 上記入力が正しいintentになる。
- LLMなしでも主要シナリオが動く。

---

## Phase 3: Care Log Workflow

ゴール: チャットから育児ログを保存し、Web URLで閲覧できる。

- `care_log` intent
- `POST /api/messages`
- CareLog DB save
- MemoryViewSession作成
- `/v/:viewId` care log view
- `GET /api/memory-views/:id/bootstrap`

完了条件:

```text
User: ミルク120ml飲んだ
Hibi: ミルク120mlを記録しました。https://.../v/...
Web: 今日の育児ログにミルク120mlが表示される
```

---

## Phase 4: MemWal Remember / Recall

ゴール: MemWalに実接続し、育児ログと思い出をrememberし、あとからrecallできる。

- `@mysten-incubation/memwal`
- MemWal Dashboard / Playgroundでaccount IDとdelegate keyを発行
- `MEMWAL_*` env
- `memwal.health()`
- `memwal.remember()`
- `waitForRememberJob()`
- `memwal.recall()`
- MemWalMemoryRef model

完了条件:

```text
1. 「この写真、はじめて寝返りした！」をrememberする
2. 「最近できるようになったことは？」でrecallする
3. recall結果に「寝返り」が含まれる
```

注意:

- 成功していないMemWal保存を成功扱いしない。
- delegate private keyをログに出さない。
- 写真binaryをMemWalに送らない。

---

## Phase 5: Web Memory Views

ゴール: チャットで返されたURLから保存済みデータを実際に閲覧できる。

- `apps/web`
- `/v/:viewId`
- care log day view
- recent memories view
- photo gallery view
- monthly growth album view shell
- loading / not found / expired / revoked / partial failure states

完了条件:

- `POST /api/messages` のresponseに含まれるURLを開くと、DBに保存された内容が表示される。
- 固定データではなく、APIから取得したデータが表示される。

---

## Phase 6: Photo Memory And Walrus Upload

ゴール: 写真と思い出コメントを受け取り、写真またはartifactをWalrusへ実保存できる。

- `POST /api/photos`
- multipart upload
- Walrus client
- Walrus blob upload
- MediaAsset DB save
- MemoryItem DB save
- MemWal remember
- Web photo display

完了条件:

```text
User: この写真、はじめて寝返りした！ + photo
Hibi: 保存しました
DB: MediaAsset / MemoryItemが保存される
Walrus: walrusBlobIdが保存される
MemWal: comment summaryがrememberされる
Web: 写真または保存済みmedia entryが表示される
```

注意:

- Walrus保存に失敗した場合はpartial failureとして表示する。
- 成功していないWalrus保存を成功扱いしない。

---

## Phase 7: Monthly Growth Album

ゴール: 月次アルバムを実生成し、AlbumManifestをWalrusへ保存し、Webで表示できる。

- `POST /api/albums/generate`
- `generate_monthly_growth_album` intent
- DBから対象月のCareLog / MemoryItem / MediaAsset取得
- MemWal recallでmilestone候補取得
- AlbumManifest JSON generation
- Walrus upload for AlbumManifest
- Album DB save
- MemoryViewSession作成
- `/v/:viewId` monthly album view

完了条件:

```text
User: 今月の成長アルバム見せて
Hibi: 2026年X月の成長アルバムを作成しました。https://.../v/...
Walrus: AlbumManifest blob IDが存在する
Web: 月次アルバムが表示される
```

---

## Phase 8: OpenClaw Plugin Integration

ゴール: OpenClaw PluginからHibi APIを呼び、チャットだけで主要workflowを動かせる。

- `openclaw.plugin.json`
- bundled Skill
- `hibi_status`
- `hibi_record_message`
- `hibi_record_photo`
- `hibi_create_memory_view`
- `hibi_create_monthly_album`
- Hibi API base URL config

完了条件:

- OpenClawでPluginを有効化できる。
- OpenClawから「ミルク120ml飲んだ」を送るとHibi APIに保存される。
- OpenClawから「思い出を見たい！」を送るとWeb URLが返る。
- OpenClawから「今月の成長アルバム見せて」を送ると月次アルバムURLが返る。

---

## Phase 9: Sui Pointer / Hash

ゴール: Walrus artifactのpointer/hashを検証可能な形で記録する。

- Sui client
- simple pointer/hash write
- FamilyVault or generic artifact pointer
- Archive status display

完了条件:

- 写真またはAlbumManifestのWalrus blob ID / hashがSuiまたはDB上で検証可能に表示される。
- Suiに平文の家族情報、写真コメント、育児ログ本文を載せない。

MVPで時間が足りない場合:

- Suiはreadiness表示とDB上のhash保存までに縮小してよい。
- ただしWalrusとMemWalの実接続は必須。

---

## Phase 10: Submission Hardening

ゴール: 審査員が触っても壊れにくい状態にする。

- `.env.example`
- setup guide
- seed demo data script
- smoke test script
- deployed API URL
- deployed Web URL
- OpenClaw Plugin install steps
- health page
- error display
- logs without secrets

完了条件:

- 新しい環境でREADME通りに起動できる。
- `pnpm test` または `pnpm smoke` で主要動作を確認できる。
- secret keyがrepositoryに含まれていない。
- localhost専用URLだけでなく、審査員が開けるWeb URLがある。

---

## 優先順位

時間が足りない場合は、以下の順で残す。

```text
1. API + DB
2. care_log chat -> Web
3. MemWal remember / recall
4. photo -> Walrus -> DB
5. recent memories URL -> Web
6. monthly album manifest -> Walrus -> Web
7. OpenClaw Plugin
8. Sui pointer/hash
```

絶対に削らないもの:

- 実際のDB保存
- MemWal remember / recall
- Walrusへのartifact保存
- URLからWebで閲覧できること

削ってよいもの:

- 年次アルバム
- 家族招待
- 完全な認証
- 完全なSeal権限管理
- 印刷用PDF
- 動画
