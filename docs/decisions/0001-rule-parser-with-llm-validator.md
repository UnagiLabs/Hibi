# Rule Parser With LLM Validator

## Status

Accepted

## Context

HibiはチャットファーストのFamily Memory Agentであり、ユーザーは自然文で育児ログや思い出を送る。

育児ログには次のような言い換えが多い。

- ミルク、母乳、おっぱい、お乳、授乳
- うんち、うんこ、便、排便
- 寝た、ねんね、入眠
- 起きた、起床、目覚めた

完全なルールベースだけでは自然文の揺れに弱い。一方で、保存系workflowをLLMだけに任せると、JSON崩れ、intent名の揺れ、数値抽出ミス、timeout、API障害の影響を受けやすい。

## Decision

Hibiのintent分類と育児ログ抽出は、次の2段階で行う。

```text
User input
-> normalize
-> rule parser
-> LLM validator
-> final structured event
-> workflow
-> DB save
```

`rule parser` は、同義語辞書、正規表現、時刻抽出により下書きの構造化結果を作る。

`LLM validator` は、rule parserの結果を確認し、自然文の揺れ、category、数量、時刻、confidenceを補正する。

LLMが失敗した場合でも、rule parserのconfidenceが高ければrule結果で保存する。rule parserとLLM validatorが大きく食い違う場合は、low confidenceとして扱い、必要に応じて確認メッセージを返す。

## Consequences

良い点:

- 主要デモ入力は安定して処理できる。
- 「母乳」「おっぱい」「うんこ」などの言い換えに対応しやすい。
- LLMを確認役にできるため、ゼロからLLM分類するより構造が安定する。
- LLM障害時も主要な保存workflowを継続できる。

注意点:

- rule parserとLLM validatorの差分をログに残し、誤分類を改善できるようにする。
- LLM validatorの返答はJSON schemaで検証する。
- 育児ログの保存時刻は `createdAt` と `occurredAt` を分ける。
- 医療的に重要な入力は、断定的な解釈を避ける。
