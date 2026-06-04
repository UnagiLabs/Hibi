# プロダクト仕様

## プロダクト

名前: Hibi

タグライン: Family memories, remembered.

日本語タグライン: 家族の日々を、未来に残す。

Hibiは、OpenClaw上で動くチャットファーストのFamily Memory Agentである。家族は写真、育児ログ、ペットとの思い出、日々の出来事をチャットに送る。Hibiはそれらを分類し、長期記憶をMemWalに保存し、写真や生成アルバムをWalrusに保存し、検証可能なhashやpointerをSuiに記録する。

## 解決する課題

家族写真、育児ログ、ペットとの思い出、日々の記録は、別々のアプリに閉じ込められやすい。Hibiはチャットを主な入力口にすることで記録の手間を減らしつつ、記憶をポータブルで、長期保存でき、AIがあとから思い出せる形にする。

## 中心体験

ユーザーは次のような自然文をチャットに送る。

```text
ミルク120ml飲んだ
寝た
起きた
この写真、はじめて寝返りした！
最近の写真見たい
今日の育児ログ見せて
5月のアルバム作って
最近できるようになったことは？
```

Hibiはそれらのメッセージをintentに分類し、必要に応じて記憶の保存・検索・アルバム生成を行い、チャット返信とWeb URLを返す。

## MVP要件

- OpenClaw Pluginとして動く。
- チャットから写真を受け取れる。
- チャットから育児ログを受け取れる。
- チャット入力をrule parser + LLM validatorで分類できる。
- 写真をWalrusに保存できる。
- 写真説明、コメント、育児ログをMemWalに保存できる。
- 「最近の写真見たい」に対してアルバムWeb URLを返せる。
- 「今日の育児ログ見せて」に対して育児ログWeb URLを返せる。
- 月次アルバムを生成できる。
- 生成アルバムをWalrusに保存できる。
- Web URLから保存済みデータを再表示できる。
- FamilyVaultまたはアルバムhash/pointerをSuiに記録できる。
- 再起動後もデータが残る。

## MVPコンポーネント

### OpenClaw Plugin

- チャット入力と写真添付を受け取る。
- Hibi APIを呼び出す。
- チャットに返信文とURLを返す。
- OpenClaw Skillの挙動を同梱する。

### Hibi API

- 認証、family管理、memory管理、DB保存、Walrus upload、MemWal remember/recall、Sui write、アルバム生成、閲覧URL生成を担当する。

### Web View

- アルバム閲覧
- 最近の写真閲覧
- 育児ログ閲覧
- Archive Status閲覧

## MVP Intent

```text
init
photo_memory
care_log
ask_memory
generate_album
get_album_url
get_care_log_url
get_today
help
```

## APIエンドポイント

```text
POST /api/init
POST /api/messages
POST /api/photos
POST /api/care-logs
POST /api/recall
POST /api/albums
GET  /api/albums/:id
GET  /api/logs/:date
GET  /api/archive/status
```

## データモデル

初期モデル:

- FamilyVault
- MemorySpace
- MemoryItem
- CareLog
- Album
- ArchivePolicy

MVPでは `MemorySpace.type = baby` を最初に実装する。

## Privacy / Security

- 家族の本名、写真、コメント、育児ログ、医療的な詳細情報をSuiに直接載せない。
- 写真は暗号化済みBlobとしてWalrusに保存する。
- Suiにはhashとpointerを記録する。
- URLはログイン必須を基本にする。
- デモ用途では署名付きURLを使ってよい。
- Hosted版とSelf-hosted版のどちらでもexport可能にする。

## MVPでやらないこと

- 複雑な入力フォームを持つフルWebアプリ
- ネイティブiOS/Androidアプリ
- 本格的な家族招待機能
- 完全なSeal権限管理
- クレカ課金
- WAL自動購入
- 動画対応
- LINE連携
- ユーザーごとのSui contract publish
