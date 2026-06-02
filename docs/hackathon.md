# ハッカソン参加メモ

## 概要

Hibiは、Sui Overflow 2026 Hackathonに参加するためのプロジェクトである。

Sui Overflow 2026は、Suiのグローバルオンラインハッカソンで、意味のあるプロダクト、実世界で使えるアプリケーション、長期的なエコシステム成長が重視される。

Hibiは主にWalrus trackへの提出を想定する。

## 想定Track

### Walrus

目的:

- Walrusをverifiable data layer / memory layerとして使うAI agentまたはagentic workflowを作る。
- AI agentが長期記憶、永続データ、ファイルアクセスを扱えることを示す。
- WalrusまたはMemWalをagentic systemに導入しやすくする実装や体験を示す。

Hibiとの対応:

- 家族の写真、育児ログ、日々の記憶をAI agentが長期的に保存・検索する。
- 写真と生成アルバムをWalrusに保存する。
- 記憶をMemWalに保存し、チャットからrecallできる。
- SuiにはFamilyVault、hash、pointerなど検証可能なmetadataを記録する。

### Agentic Web

副次的に該当する可能性がある。

目的:

- Sui primitivesを深く活用するAI-native agentやautonomous workflowを作る。
- 単純なAPI連携ではなく、よりsecureでcomposableなagent systemを示す。

Hibiとの対応:

- OpenClaw Pluginとしてチャット入力をAgent workflowに変換する。
- Walrus、MemWal、Sui、DB、Web Viewをまたぐworkflowを構成する。

## 重要日程

日程はPacific Time基準。

- 2026-05-07: Official Launch
- 2026-05-07から2026-06-21: Building Period
- 2026-06-21: Submission Deadline
- 2026-07-08: Shortlisted Teams Announcement
- 2026-07-20から2026-07-21: Demo Day
- 2026-08-27: Winners Announcement

## 提出要件

提出時に必要なもの:

- Project Name: clear + simple
- Description: 何をするか、なぜ重要か
- Project Logo: 1:1 ratio、JPGまたはPNG
- Public GitHub Repo: 審査期間中はpublic必須
- Demo Video: 必須、YouTube推奨、5分以内
- Website: 任意だが強く推奨
- Deployment: testnetまたはmainnet
- Package ID: on-chain deployしている場合に必要

## Eligibility

- プロジェクトは、2026-05-07から2026-06-21の公式build period中に作られている必要がある。
- shortlistingおよびDemo Day時点で、Sui mainnetまたはtestnetにdeployされている必要がある。
- 既存プロジェクトの利用は可能だが、hackathon期間中に substantial new functionality、feature、integration を追加する必要がある。

## 審査基準

Core track projectは主に以下で評価される。

### Product & UX: 20%

評価対象:

- 品質
- 使いやすさ
- polish
- 全体的なuser experience

Hibiで意識すること:

- チャットに送るだけで記録できる体験を明確に見せる。
- Album View、Care Log View、Archive Status Viewを最低限でも見やすくする。
- Demoでは「写真保存」「育児ログ保存」「最近の写真」「今日のログ」が迷わず伝わるようにする。

### Real-World Application: 50%

評価対象:

- 意味のある課題解決
- market relevance
- 長期的な価値

Hibiで意識すること:

- 家族の記憶、育児ログ、ペットの記録が複数アプリに分断される課題を前面に出す。
- 「家族の記憶は単なるapp dataではなく、長期的に残すpersonal archiveである」と説明する。
- Hosted版とSelf-hosted版の両方に広がる構想を示す。
- Export可能性、長期保存、AI recallを価値として見せる。

### Technical Implementation: 20%

評価対象:

- 技術品質
- reliability
- Suiとの意味のあるintegration

Hibiで意識すること:

- Walrusに写真や生成アルバムを保存する。
- MemWalにAIが検索できるmemoryを保存する。
- SuiにFamilyVault、hash、pointer、archive metadataを記録する。
- 単なるstorage uploadではなく、Agent workflowの中でWalrus / MemWal / Suiが必要になる設計を見せる。
- 再起動後もデータが残ることをDemoで示す。

### Presentation & Vision: 10%

評価対象:

- presentationの明確さ
- storytelling
- 長期vision

Hibiで意識すること:

- 「チャットに送るだけで、家族の日々が未来に残る」という一言で伝える。
- Demo flowを短く、実利用に近い順番にする。
- 将来は育児だけでなく、ペット、旅行、家族史、Memory Capsuleに広げられることを示す。

## Strong Overflow Projectの条件

強いプロジェクトは以下を満たす。

- 意味のある問題を解決している。
- UXがpolishedである。
- Suiを意味のある形で活用している。
- product thinkingが強い。
- hackathon後も続く長期的な可能性がある。

Hibiでは、技術デモに寄せすぎず、家族が実際に使えるプロダクトとして見せることを優先する。

## Prize / Award構造

賞金はsplit distribution model。

- winner announcement時に50%
- mainnet deployment成功後に50%
- Winners Announcement時点でmainnet deploy済みの場合は100% upfront

注意:

- mainnet deploymentはSui teamまたはtrack sponsorが定めるminimum functional requirementsを満たす必要がある。
- hackathon後も開発を続けることが推奨される。
- top-performing teamには、ecosystem support、visibility、funding、hiring opportunity、accelerator introduction、office hours、pitch deck supportなどの可能性がある。

## Hibiの提出前チェックリスト

- public GitHub repoになっている。
- READMEに「何を作ったか」「なぜ重要か」「どう動かすか」がある。
- docsにproduct spec、architecture、roadmap、hackathon情報がある。
- Demo videoが5分以内で用意されている。
- testnetまたはmainnet deploy済み。
- on-chain package IDまたはSui object IDを記録している。
- Walrus blob IDまたはalbum artifactの保存先をDemoで示せる。
- MemWalに保存されたmemoryをrecallできる。
- Album ViewまたはCare Log ViewのURLを実際に開ける。
- Sui / Walrus / MemWalを使う必然性を説明できる。

## Demoで見せる順番

1. OpenClawチャットで `/init`
2. 写真とコメントを送って、Walrus保存とMemWal記憶化を行う。
3. `ミルク120ml` のような育児ログを送る。
4. `最近の写真見たい` でAlbum View URLを返す。
5. `今日の育児ログ見せて` でCare Log View URLを返す。
6. `最近できるようになったことは？` でMemWal recallを見せる。
7. Archive Statusで保存状態、期限、重要度を見せる。
8. Sui上のFamilyVaultまたはpointer/hashを見せる。

## Hibiの勝ち筋

審査配点上、HibiはReal-World Applicationを最重要に置く。

技術的にはWalrus / MemWal / Suiを使うだけでなく、家族の長期記憶という具体的で理解しやすい課題に結びつける。

Demoでは「AI Agentが家族の記憶を長期保存し、あとから思い出せる」という体験を、短いチャット操作とWeb URLで見せる。
