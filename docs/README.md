# Hibi Docs

このフォルダには、実装を始める前に必要な最小限のドキュメントを置く。

## ファイル

- `product-spec.md`: プロダクトのコンセプト、MVP範囲、ユーザーフロー、機能要件。
- `hibi-explainer.html`: Hibiの全体構成、部品ごとの役割、最初に作るべきものをブラウザで読める説明書。
- `architecture.md`: 初期のシステム境界、責務分担、モノレポ構成。
- `roadmap.md`: MVPの実装順。
- `hackathon-functional-mvp-spec.md`: ハッカソン提出物を実際に動くシステムとして作るための機能MVP仕様。チャット入力、育児ログ、写真保存、MemWal recall、Walrus保存、Web閲覧までの必須動作を定義する。
- `memory-views-spec.md`: チャットから閲覧URLを返すMemory View、写真ギャラリー、月次/年次成長アルバム、Webアプリ、URL安全設計の完全仕様。
- `web-ui-blueprint.md`: Hibi Webアプリの画面構成、UIコンポーネント、月次/年次ハイライト、On This Dayの設計図。
- `memwal-setup.md`: MemWal / Walrus Memoryの採用方針、staging/testnetの設定方法、必要env、namespace、health確認手順。
- `walrus-setup.md`: 月次AlbumManifestをWalrus testnetへ保存するための設定、env、動作確認手順。
- `sui-contracts.md`: FamilyVault、FamilyMemberSBT、AlbumRecordのSui Move設計と確認コマンド。
- `hackathon.md`: Sui Overflow 2026の提出要件、審査基準、Hibiでの勝ち筋。
- `walrus_track.md`: Walrus trackの問題設定と評価される方向性。
- `decisions/`: 後から変更しにくい技術判断の記録。
  - `decisions/0001-rule-parser-with-llm-validator.md`: intent分類をrule parser + LLM validatorにする判断。

## ドキュメント運用ルール

- ルートのREADMEは短く保ち、詳細はdocsに置く。
- プロダクトの挙動が変わったら `product-spec.md` を更新する。
- システム境界や保存責務が変わったら `architecture.md` を更新する。
- ハッカソン実装の優先順位が変わったら `hackathon-functional-mvp-spec.md` を更新する。
- 後から戻しにくい判断をしたら `decisions/` に記録する。
