# Walrus Track Problem Statement

現在のAI Agentは強力だが、根本的にはまだステートレスで分断されている。タスクを単発で処理し、セッションをまたいだ文脈を失いやすく、tool、team、workflowをまたいだ知識共有も難しい。memoryは単一のapp、model、deviceに結びつきがちで、その結果Agent systemは壊れやすく、拡張しにくく、信頼しにくいものになっている。

Agentが単純なassistantから、自律的で長時間動くsystemへ進化するには、より永続的な基盤が必要になる。

- セッションをまたいでmemoryを保存・取得できること
- agentやworkflowをまたいでcontextを共有できること
- 単一platformに閉じ込められない、portableでpersistentなdataにアクセスできること

このtrackでは、WalrusをAI向けのVerifiable Data Platformとして使い、agentic systemの作り方を再考することが求められている。

## 作るもの

finance、productivity、gamingなど任意のdomainで、単一agentまたはmulti-agentの実用的なAI agent / agentic workflowを作る。以下の要素を示せるものが望ましい。

- agent向けのpersistentでverifiableなmemoryによる長期記憶
- Walrusを使った永続data/file access
- agentic systemでWalrusまたはMemWalを導入しやすくするintegrationやtooling

特に重視される例:

- research agent、trading agent、monitoring systemのように、agentが時間をまたいでstateを追跡する長時間workflow
- negotiation、task delegation、step-by-step executionのようなmulti-agent coordination
- dataset、log、report、中間生成物などのfileをagentが生成・保存・再利用するartifact-driven workflow

integrationやtoolingの方向性:

- 既存のagent frameworkやtoolにpersistent memoryを追加するplugin / adapter
- Walrusをstorage foundationとして、memory、messaging、executionを組み合わせるworkflow orchestration layer
- 複数toolや複数agentが、Walrus上の同じcontextをread/writeできるcross-tool / cross-agent memory sharing
- Walrusに保存されたagent memoryやdataをinspect、debug、manageしやすくするinterfaceやdeveloper tool

プロジェクト例:

- user-facing agentまたはmulti-agent system
- developer toolまたはframework integration
- persistent AI memoryとdataを扱う新しいinterface

## 評価されるもの

単なるdemoではなく、次を示すworking systemが求められる。

- agentが記憶し、時間をかけて積み上げられると、どのように有用になるか
- dataがshared、durable、portableになると、workflowがどう改善するか
- developerが壊れやすく分断されたmemory setupからどう脱却できるか

目標は、AI Agentを単なる反応型toolではなく、信頼できるdata layerに支えられたpersistentでcollaborativeなsystemへ進めることである。

## 参照資料

- Walrus docs
  - Getting started
  - CLI / HTTP API / TypeScript SDK
  - Public aggregators and publishers
- Walrus Sites docs
  - site-builder CLIのinstall
  - siteのpublish
- MemWal (Walrus Memory) docs
  - MemWal (Walrus Memory) Playground: account作成とagent用delegate key作成
  - MemWal (Walrus Memory) GitHub repo: sample app、skillなど
- Seal docs: WalrusとMemWalのprivacy layer
- Sui Stack Messaging: Walrusをstorage/recoveryに使い、Sealをprivacyに使うmessaging tooling

## Walrus Builder Group

質問、議論、Walrus teamからの直接サポートには、公式Walrus Telegram groupを使う。

idea validationやproject discussionには、Walrus Discordの `#developers` channelを使う。
