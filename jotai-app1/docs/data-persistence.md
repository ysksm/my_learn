# データ永続化と複数ブラウザ対応

## 現在の実装（Phase 1）

### InMemoryTicketRepository の特性

**データの保存場所**: ブラウザのメモリ（JavaScriptヒープ）

**制約**:
- ✅ 単一ブラウザ/タブ内では動作する
- ❌ 複数ブラウザ/タブ間でデータは共有されない
- ❌ ページリロードでデータが消える
- ❌ ブラウザを閉じるとデータが消える

### 動作例

```
【ブラウザA】
- 初期データ: 5件
- 新規作成: "チケット6"
- 現在の一覧: 6件

【ブラウザB】（別ウィンドウまたは別ブラウザ）
- 初期データ: 5件
- "チケット6" は表示されない
- ブラウザAとは独立している
```

### ポーリングの役割

現在のポーリング（5秒間隔）は：
- ✅ リポジトリの変更を検出
- ✅ UI更新のトリガー
- ❌ 他のブラウザの変更は検出できない

主な用途：
1. 将来のAPI連携への準備
2. 楽観的更新とサーバーデータの同期
3. アーキテクチャの完全性

---

## Phase 2: LocalStorage対応（単一ブラウザ内で永続化）

### 実装概要

`LocalStorageTicketRepository` を追加

**メリット**:
- ✅ ページリロードしてもデータが残る
- ✅ ブラウザを閉じてもデータが残る
- ✅ 同じブラウザの複数タブ間で共有可能
- ✅ 簡単に実装できる

**デメリット**:
- ❌ 別ブラウザとはデータ共有できない
- ❌ 容量制限あり（5-10MB程度）
- ❌ サーバーへの同期なし

### 実装例

```typescript
// infrastructure/repositories/LocalStorageTicketRepository.ts
export class LocalStorageTicketRepository implements ITicketRepository {
  private readonly STORAGE_KEY = 'tickets'

  async findAll(): Promise<Ticket[]> {
    const data = localStorage.getItem(this.STORAGE_KEY)
    if (!data) return this.getInitialData()

    const ticketsData = JSON.parse(data)
    return ticketsData.map((t: any) => Ticket.reconstruct(t))
  }

  async save(ticket: Ticket): Promise<void> {
    const tickets = await this.findAll()
    const index = tickets.findIndex(t => t.id.equals(ticket.id))

    if (index >= 0) {
      tickets[index] = ticket
    } else {
      tickets.push(ticket)
    }

    localStorage.setItem(
      this.STORAGE_KEY,
      JSON.stringify(tickets.map(t => t.toPlainObject()))
    )

    // StorageEventを発火させて他タブに通知
    window.dispatchEvent(new Event('storage'))
  }

  // delete, findByIdも同様に実装
}
```

### DIContainerでの切り替え

```typescript
// infrastructure/di/DIContainer.ts
constructor() {
  // 環境変数で切り替え
  const useLocalStorage = import.meta.env.VITE_USE_LOCALSTORAGE === 'true'

  this.ticketRepository = useLocalStorage
    ? new LocalStorageTicketRepository()
    : new InMemoryTicketRepository()
}
```

### 複数タブ間の同期

```typescript
// presentation/hooks/useStorageSync.ts
export const useStorageSync = () => {
  const setTickets = useSetAtom(ticketsAtom)

  useEffect(() => {
    const handleStorageChange = async () => {
      // LocalStorageが変更されたら再取得
      const container = DIContainer.getInstance()
      const useCase = container.getGetTicketsUseCase()
      const tickets = await useCase.execute()
      setTickets(tickets)
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])
}
```

**動作**:
```
【タブA】
- チケット作成 → LocalStorageに保存
- StorageEventを発火

【タブB】（同じブラウザ）
- StorageEventを受信
- LocalStorageから再取得
- UIを更新 ✅
```

---

## Phase 3: API + データベース対応（完全な複数ブラウザ対応）

### アーキテクチャ

```
【フロントエンド】          【バックエンド】
 ブラウザA  }
 ブラウザB  } → API → データベース
 ブラウザC  }
```

### 実装概要

`ApiTicketRepository` を追加

```typescript
// infrastructure/repositories/ApiTicketRepository.ts
export class ApiTicketRepository implements ITicketRepository {
  private readonly API_BASE = import.meta.env.VITE_API_BASE_URL

  async findAll(): Promise<Ticket[]> {
    const response = await fetch(`${this.API_BASE}/tickets`)
    const data = await response.json()
    return data.map((t: any) => Ticket.reconstruct(t))
  }

  async save(ticket: Ticket): Promise<void> {
    const plain = ticket.toPlainObject()
    await fetch(`${this.API_BASE}/tickets/${plain.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(plain),
    })
  }

  async delete(id: TicketId): Promise<void> {
    await fetch(`${this.API_BASE}/tickets/${id.toString()}`, {
      method: 'DELETE',
    })
  }
}
```

### ポーリングの真価

API連携時にポーリングが本領を発揮：

```
【ブラウザA】
- チケット作成 → API経由でDB保存

【ブラウザB】（5秒後）
- ポーリングが発火
- API経由でDB取得
- 新しいチケットが表示される ✅
```

### バックエンド例（Express + PostgreSQL）

```typescript
// Backend API (Node.js + Express)
app.get('/api/tickets', async (req, res) => {
  const tickets = await db.query('SELECT * FROM tickets ORDER BY updated_at DESC')
  res.json(tickets.rows)
})

app.put('/api/tickets/:id', async (req, res) => {
  const { id } = req.params
  const { title, description, status } = req.body
  await db.query(
    'UPDATE tickets SET title=$1, description=$2, status=$3, updated_at=NOW() WHERE id=$4',
    [title, description, status, id]
  )
  res.json({ success: true })
})
```

---

## Phase 4: リアルタイム同期（WebSocket / SSE）

### WebSocketによる即座の同期

```typescript
// infrastructure/services/WebSocketService.ts
export class WebSocketService {
  private ws: WebSocket

  connect() {
    this.ws = new WebSocket('ws://localhost:3000')

    this.ws.onmessage = (event) => {
      const { type, ticket } = JSON.parse(event.data)

      switch(type) {
        case 'TICKET_CREATED':
          // Jotai atomを更新
          break
        case 'TICKET_UPDATED':
          // Jotai atomを更新
          break
        case 'TICKET_DELETED':
          // Jotai atomを更新
          break
      }
    }
  }

  sendTicketCreated(ticket: Ticket) {
    this.ws.send(JSON.stringify({
      type: 'TICKET_CREATED',
      ticket: ticket.toPlainObject()
    }))
  }
}
```

**動作**:
```
【ブラウザA】
- チケット作成 → WebSocket送信

【サーバー】
- 全接続クライアントにブロードキャスト

【ブラウザB、C、D...】（即座に）
- WebSocketメッセージ受信
- UIを即座に更新 ✅
```

**メリット**:
- ⚡ ポーリング不要（即座に反映）
- ⚡ サーバー負荷軽減
- ⚡ リアルタイムコラボレーション

---

## 比較表

| 方式 | ブラウザ間共有 | 永続化 | 実装難易度 | リアルタイム性 |
|------|------------|--------|-----------|-------------|
| **InMemory** (現在) | ❌ | ❌ | ⭐ 簡単 | ❌ |
| **LocalStorage** | △ (同一ブラウザのみ) | ✅ | ⭐⭐ 簡単 | △ (StorageEvent) |
| **API + DB** | ✅ | ✅ | ⭐⭐⭐ 中程度 | △ (ポーリング) |
| **WebSocket** | ✅ | ✅ | ⭐⭐⭐⭐ 難しい | ✅ 即座 |

---

## 推奨実装順序

### 学習目的の場合

1. ✅ **InMemory** - アーキテクチャ理解（完了）
2. **LocalStorage** - 永続化とStorageEventの理解
3. **API + DB** - フルスタック開発の理解
4. **WebSocket** - リアルタイム通信の理解

### 本番アプリの場合

1. **API + DB** - 基本機能
2. **WebSocket** - リアルタイム性が必要な場合
3. **LocalStorage** - オフライン対応（Progressive Web App）

---

## 現在の実装での対処法

### デモ/プレゼン時の注意点

```markdown
⚠️ 現在はデモ用のインメモリ実装です
- 各ブラウザ/タブで独立したデータを持ちます
- ページをリロードすると初期データ5件に戻ります
- 実際のアプリケーションではAPI + DBを使用します
```

### 簡易的な複数タブ対応

BroadcastChannel APIを使用（同じブラウザの複数タブ間で通信）:

```typescript
// infrastructure/services/BroadcastService.ts
const channel = new BroadcastChannel('ticket-updates')

// 送信側
channel.postMessage({ type: 'TICKET_CREATED', ticket })

// 受信側
channel.onmessage = (event) => {
  // Jotai atomを更新
}
```

これなら**バックエンドなし**で同じブラウザの複数タブ間で同期できます！

---

## まとめ

**現在の状態**:
- ✅ DDDアーキテクチャの完全な実装
- ✅ 将来の拡張に備えた設計
- ❌ 複数ブラウザ間のデータ共有は未対応

**次のステップ**:
1. LocalStorage実装（簡単、すぐできる）
2. BroadcastChannel追加（同じブラウザ内の複数タブ対応）
3. バックエンドAPI実装（完全な複数ブラウザ対応）

どの実装を試してみたいですか？
