# MemWal Setup

Hibiでは、OpenClaw pluginより先にHibi APIからMemWal SDKを直接呼ぶ。

最初のゴールは次の3つ。

1. `GET /api/health` でMemWal relayerの状態を確認できる
2. 育児ログや思い出をMemWalへ `remember` できる
3. 「最近できるようになったことは？」をMemWalで `recall` できる

---

## 1. 採用する方式

MVPでは次を使う。

```text
@mysten-incubation/memwal
+ Managed Relayer
+ Staging / Testnet
```

OpenClaw pluginは後で接続する。先にHibi API側でMemWal接続を完成させる。

---

## 2. 必要な情報

MemWal staging playgroundで次を作る。

| 値 | 意味 |
|---|---|
| `MEMWAL_ACCOUNT_ID` | Sui上のMemWal account object ID |
| `MEMWAL_PRIVATE_KEY` | delegate private key。絶対にGitへ入れない |
| `MEMWAL_SERVER_URL` | MemWal relayer URL |

Developer Playgroundでは、現在次のserver URLが表示される。

```env
MEMWAL_SERVER_URL=https://relayer.memory.walrus.xyz
```

公式docsではMemWal beta中のためendpoint表記が変わる可能性がある。接続に失敗した場合は、Playgroundに表示されているserver URLを正とする。

---

## 3. Hibi APIのenv

`apps/api/.env` に設定する。

```env
MEMWAL_ACCOUNT_ID=0x...
MEMWAL_PRIVATE_KEY=...
MEMWAL_SERVER_URL=https://relayer.memory.walrus.xyz
MEMWAL_NAMESPACE_PREFIX=hibi
MEMWAL_ENV=testnet
```

過去docsとの互換のため、Hibi APIは `MEMWAL_DELEGATE_PRIVATE_KEY` もaliasとして読む。ただし新しく設定する場合は `MEMWAL_PRIVATE_KEY` を使う。

---

## 4. namespace

Hibiでは家族と思い出領域ごとにnamespaceを分ける。

```text
hibi:testnet:{familyId}:{memorySpaceId}
```

例:

```text
hibi:testnet:fam_demo:space_baby_demo
```

これにより、同じMemWal accountの中でも家族・対象ごとにmemoryを分けられる。

---

## 5. 最初の動作確認

APIを起動する。

```bash
pnpm dev:api
```

healthを確認する。

```bash
curl http://127.0.0.1:4000/api/health
```

未設定なら次のようになる。

```json
{
  "ok": true,
  "service": "hibi-api",
  "db": "ok",
  "memwal": {
    "status": "disabled",
    "reason": "missing_credentials",
    "serverUrl": "https://relayer.memory.walrus.xyz"
  }
}
```

credential設定後は `memwal.status` が `ok` になることを確認する。

---

## 6. 次に実装すること

### Step 1: health

- `GET /api/health` にMemWal状態を出す
- credential未設定でもAPI起動を止めない

### Step 2: remember

- `POST /api/messages` でDB保存後にMemWalへ要約を送る
- 成功したjob ID / blob IDをDBに残す
- 失敗してもDB保存は成功扱いにし、MemWalだけpartial failureにする

### Step 3: recall

- `POST /api/recall` を追加
- MemWal recall結果からsource IDを探す
- DBのCareLog / MemoryItemと照合する

動作確認:

```bash
curl -X POST http://127.0.0.1:4000/api/recall \
  -H 'content-type: application/json' \
  -d '{"query":"最近できるようになったことは？"}'
```

期待する結果:

- `recall.status` が `ok`
- `recall.results[].text` にMemWalから返った記憶が入る
- `recall.results[].source` にDB上の元レコードが入る

### Step 4: album generation

- 月次・年次アルバム生成時にMemWal recallを使う
- 「今月できるようになったこと」を抽出してWebに表示する

---

## 7. 参考

- MemWal Quick Start: https://docs.memwal.ai/getting-started/quick-start
- MemWal SDK Quick Start: https://docs.memwal.ai/sdk/quick-start
- MemWal SDK Usage: https://docs.memwal.ai/sdk/usage/memwal
- Walrus Memory OpenClaw Overview: https://docs.wal.app/walrus-memory/openclaw/overview
