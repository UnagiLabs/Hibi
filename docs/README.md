# Hibi Docs

このフォルダには、実装を始める前に必要な最小限のドキュメントを置く。

## ファイル

- `product-spec.md`: プロダクトのコンセプト、MVP範囲、ユーザーフロー、機能要件。
- `architecture.md`: 初期のシステム境界、責務分担、モノレポ構成。
- `roadmap.md`: MVPの実装順。
- `hackathon.md`: Sui Overflow 2026の提出要件、審査基準、Hibiでの勝ち筋。
- `walrus_track.md`: Walrus trackの問題設定と評価される方向性。
- `decisions/`: 後から変更しにくい技術判断の記録。

## ドキュメント運用ルール

- ルートのREADMEは短く保ち、詳細はdocsに置く。
- プロダクトの挙動が変わったら `product-spec.md` を更新する。
- システム境界や保存責務が変わったら `architecture.md` を更新する。
- 後から戻しにくい判断をしたら `decisions/` に記録する。
