# アーキテクチャ

## 全体フロー

```text
OpenClaw Chat / Telegram
  -> Hibi OpenClaw Plugin
  -> Hibi API
  -> AI Agent
     -> MemWal: AI long-term memory
     -> Walrus: photos, albums, artifacts
     -> Sui: FamilyVault, pointers, hashes
     -> DB: index, auth, cache
     -> Web Views: album, log, archive
```

## モノレポ構成

```text
apps/
  api/
    Hibi API、認証、memory workflow、album generation、archive management
  web/
    Album View、Care Log View、Archive Status View

packages/
  core/
    shared types、MemWal client、Walrus client、Sui client、Archive Planner、AI providers
  openclaw-plugin/
    OpenClaw plugin package、bundled Skill

contracts/
  Sui Move contracts

docker/
  Self-hosted runtime files

docs/
  プロダクト仕様と技術ドキュメント

scripts/
  ローカル開発補助スクリプト
```

## 責務分担

### OpenClaw Plugin

- チャットと添付ファイルのイベントをHibi API呼び出しに変換する。
- 可能な限りAPIキーをPlugin側に持たせない。
- ユーザーが読める返信文とURLを返す。

### Hibi API

- workflow全体の制御を担当する。
- AI provider呼び出しを担当する。
- DB保存、Walrus保存、MemWal保存、Sui書き込みなどの副作用を担当する。
- MemWal、Walrus、Sui、DBの詳細をPluginから隠す。

### Webアプリ

- アルバム、育児ログ、Archive Statusの閲覧専用画面を提供する。
- MVPでは複雑な入力フォームを作らない。

### Core Package

- 共通TypeScript型。
- provider interfaceとclient。
- 再利用できるworkflow helper。

### Contracts

- 検証可能なmetadataだけを保存する。
- 個人情報や家族の生データを保存しない。

## 初期技術前提

- API、Web、Plugin、共通packageはTypeScriptで実装する。
- Web ViewにはNext.jsまたは同等のReact stackを使う。
- 関係データにはPostgresまたはSupabaseを使う。
- AI providerはMockProviderとOpenAIProviderを用意する。
- 写真と生成アルバムはWalrusに保存する。
- 長期記憶はMemWalに保存する。
- hash、pointer、FamilyVault metadataはSuiに記録する。
