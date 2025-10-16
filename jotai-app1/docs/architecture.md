# チケット管理アプリ - アーキテクチャ設計

## アーキテクチャ概要

本アプリケーションは**レイヤードアーキテクチャ**と**DDD（ドメイン駆動設計）**の戦術的パターンを組み合わせた構成を採用します。

## レイヤー構成

```
┌─────────────────────────────────────────┐
│     Presentation Layer (UI)             │
│  - React Components                     │
│  - Jotai Atoms (State Management)       │
│  - Custom Hooks                         │
└────────────┬────────────────────────────┘
             │ depends on
             ▼
┌─────────────────────────────────────────┐
│     Application Layer (Use Cases)       │
│  - GetTicketsUseCase                    │
│  - CreateTicketUseCase                  │
│  - UpdateTicketStatusUseCase            │
│  - DeleteTicketUseCase                  │
└────────────┬────────────────────────────┘
             │ depends on
             ▼
┌─────────────────────────────────────────┐
│     Domain Layer (Business Logic)       │
│  - Entities (Ticket)                    │
│  - Value Objects (TicketStatus, etc)    │
│  - Repository Interfaces                │
│  - Domain Services                      │
└─────────────────────────────────────────┘
             ▲
             │ implements (DIP)
             │
┌────────────┴────────────────────────────┐
│     Infrastructure Layer                │
│  - Repository Implementations           │
│  - DI Container                         │
│  - Polling Service                      │
│  - External API Clients                 │
└─────────────────────────────────────────┘
```

## 依存関係の方向

**依存性逆転原則（Dependency Inversion Principle）** を適用：

1. **上位レイヤーは下位レイヤーに依存**
   - Presentation → Application → Domain

2. **インフラ層はインターフェースに依存**
   - Infrastructure → Domain (interfaces)

3. **具体的な実装はDIコンテナで注入**
   - 各レイヤーは抽象（interface）に依存
   - 実装は実行時に注入

## 各レイヤーの責務

### 1. Domain Layer（ドメイン層）

**責務**: ビジネスロジックとビジネスルールを表現

#### 構成要素

##### 1.1 Entities（エンティティ）
```typescript
// domain/entities/Ticket.ts
export class Ticket {
  private constructor(
    public readonly id: TicketId,
    public title: string,
    public description: string,
    public status: TicketStatus,
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {}

  // ファクトリメソッド
  static create(title: string, description: string): Ticket
  static reconstruct(data: TicketData): Ticket

  // ビジネスロジック
  updateStatus(newStatus: TicketStatus): void
  updateContent(title: string, description: string): void
}
```

##### 1.2 Value Objects（バリューオブジェクト）
```typescript
// domain/value-objects/TicketId.ts
export class TicketId {
  private constructor(private readonly value: string) {}

  static create(): TicketId
  static fromString(value: string): TicketId

  toString(): string
  equals(other: TicketId): boolean
}

// domain/value-objects/TicketStatus.ts
export enum TicketStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE'
}
```

##### 1.3 Repository Interfaces（リポジトリインターフェース）
```typescript
// domain/repositories/ITicketRepository.ts
export interface ITicketRepository {
  findAll(): Promise<Ticket[]>
  findById(id: TicketId): Promise<Ticket | null>
  save(ticket: Ticket): Promise<void>
  delete(id: TicketId): Promise<void>
}
```

### 2. Application Layer（アプリケーション層）

**責務**: ユースケースの実装、ドメインオブジェクトの協調

#### 構成要素

##### 2.1 Use Cases（ユースケース）
```typescript
// application/usecases/GetTicketsUseCase.ts
export class GetTicketsUseCase {
  constructor(private ticketRepository: ITicketRepository) {}

  async execute(): Promise<Ticket[]> {
    return await this.ticketRepository.findAll()
  }
}

// application/usecases/CreateTicketUseCase.ts
export class CreateTicketUseCase {
  constructor(private ticketRepository: ITicketRepository) {}

  async execute(input: CreateTicketInput): Promise<Ticket> {
    const ticket = Ticket.create(input.title, input.description)
    await this.ticketRepository.save(ticket)
    return ticket
  }
}

// application/usecases/UpdateTicketStatusUseCase.ts
export class UpdateTicketStatusUseCase {
  constructor(private ticketRepository: ITicketRepository) {}

  async execute(input: UpdateStatusInput): Promise<void> {
    const ticket = await this.ticketRepository.findById(input.ticketId)
    if (!ticket) throw new Error('Ticket not found')

    ticket.updateStatus(input.newStatus)
    await this.ticketRepository.save(ticket)
  }
}

// application/usecases/DeleteTicketUseCase.ts
export class DeleteTicketUseCase {
  constructor(private ticketRepository: ITicketRepository) {}

  async execute(ticketId: TicketId): Promise<void> {
    await this.ticketRepository.delete(ticketId)
  }
}
```

### 3. Infrastructure Layer（インフラ層）

**責務**: 技術的な実装詳細、外部システムとの統合

#### 構成要素

##### 3.1 Repository Implementation
```typescript
// infrastructure/repositories/InMemoryTicketRepository.ts
export class InMemoryTicketRepository implements ITicketRepository {
  private tickets: Map<string, Ticket> = new Map()

  async findAll(): Promise<Ticket[]> {
    return Array.from(this.tickets.values())
  }

  async findById(id: TicketId): Promise<Ticket | null> {
    return this.tickets.get(id.toString()) || null
  }

  async save(ticket: Ticket): Promise<void> {
    this.tickets.set(ticket.id.toString(), ticket)
  }

  async delete(id: TicketId): Promise<void> {
    this.tickets.delete(id.toString())
  }
}
```

##### 3.2 DI Container
```typescript
// infrastructure/di/DIContainer.ts
export class DIContainer {
  private static instance: DIContainer

  private ticketRepository: ITicketRepository
  private getTicketsUseCase: GetTicketsUseCase
  private createTicketUseCase: CreateTicketUseCase
  private updateTicketStatusUseCase: UpdateTicketStatusUseCase
  private deleteTicketUseCase: DeleteTicketUseCase

  private constructor() {
    // リポジトリのインスタンス化
    this.ticketRepository = new InMemoryTicketRepository()

    // ユースケースの注入
    this.getTicketsUseCase = new GetTicketsUseCase(this.ticketRepository)
    this.createTicketUseCase = new CreateTicketUseCase(this.ticketRepository)
    this.updateTicketStatusUseCase = new UpdateTicketStatusUseCase(this.ticketRepository)
    this.deleteTicketUseCase = new DeleteTicketUseCase(this.ticketRepository)
  }

  static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer()
    }
    return DIContainer.instance
  }

  // Getter methods
  getGetTicketsUseCase(): GetTicketsUseCase
  getCreateTicketUseCase(): CreateTicketUseCase
  getUpdateTicketStatusUseCase(): UpdateTicketStatusUseCase
  getDeleteTicketUseCase(): DeleteTicketUseCase
}
```

##### 3.3 Polling Service
```typescript
// infrastructure/services/PollingService.ts
export class PollingService {
  private intervalId: number | null = null

  start(callback: () => Promise<void>, intervalMs: number): void {
    this.stop() // 既存のポーリングを停止

    // 初回実行
    callback().catch(console.error)

    // 定期実行
    this.intervalId = window.setInterval(() => {
      callback().catch(console.error)
    }, intervalMs)
  }

  stop(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }
}
```

### 4. Presentation Layer（プレゼンテーション層）

**責務**: UIの表示、ユーザー操作の処理、状態管理

#### 構成要素

##### 4.1 Jotai Atoms（状態管理）
```typescript
// presentation/state/ticketAtoms.ts
import { atom } from 'jotai'
import { Ticket } from '@/domain/entities/Ticket'

// チケット一覧のatom
export const ticketsAtom = atom<Ticket[]>([])

// ローディング状態のatom
export const isLoadingAtom = atom<boolean>(false)

// エラー状態のatom
export const errorAtom = atom<string | null>(null)

// フィルタ済みチケットのatom（派生atom）
export const filteredTicketsAtom = atom((get) => {
  const tickets = get(ticketsAtom)
  const filter = get(filterAtom)

  if (filter === 'ALL') return tickets
  return tickets.filter(ticket => ticket.status === filter)
})
```

##### 4.2 Custom Hooks
```typescript
// presentation/hooks/useTicketPolling.ts
export const useTicketPolling = () => {
  const [, setTickets] = useAtom(ticketsAtom)
  const container = DIContainer.getInstance()
  const getTicketsUseCase = container.getGetTicketsUseCase()

  useEffect(() => {
    const pollingService = new PollingService()

    const fetchTickets = async () => {
      try {
        const tickets = await getTicketsUseCase.execute()
        setTickets(tickets)
      } catch (error) {
        console.error('Failed to fetch tickets:', error)
      }
    }

    // 5秒間隔でポーリング
    pollingService.start(fetchTickets, 5000)

    return () => {
      pollingService.stop()
    }
  }, [])
}

// presentation/hooks/useTicketOperations.ts
export const useTicketOperations = () => {
  const [tickets, setTickets] = useAtom(ticketsAtom)
  const container = DIContainer.getInstance()

  const createTicket = async (input: CreateTicketInput) => {
    const useCase = container.getCreateTicketUseCase()
    const newTicket = await useCase.execute(input)
    setTickets([...tickets, newTicket])
  }

  const updateStatus = async (ticketId: TicketId, status: TicketStatus) => {
    const useCase = container.getUpdateTicketStatusUseCase()
    await useCase.execute({ ticketId, newStatus: status })
    // ポーリングで自動更新されるため、手動更新は不要
  }

  const deleteTicket = async (ticketId: TicketId) => {
    const useCase = container.getDeleteTicketUseCase()
    await useCase.execute(ticketId)
    setTickets(tickets.filter(t => !t.id.equals(ticketId)))
  }

  return { createTicket, updateStatus, deleteTicket }
}
```

##### 4.3 React Components
```typescript
// presentation/components/TicketList.tsx
export const TicketList: React.FC = () => {
  const [tickets] = useAtom(filteredTicketsAtom)
  useTicketPolling() // ポーリング開始

  return (
    <div>
      {tickets.map(ticket => (
        <TicketCard key={ticket.id.toString()} ticket={ticket} />
      ))}
    </div>
  )
}

// presentation/components/TicketCard.tsx
// presentation/components/TicketForm.tsx
```

## ディレクトリ構造

```
src/
├── domain/
│   ├── entities/
│   │   └── Ticket.ts
│   ├── value-objects/
│   │   ├── TicketId.ts
│   │   └── TicketStatus.ts
│   └── repositories/
│       └── ITicketRepository.ts
│
├── application/
│   ├── usecases/
│   │   ├── GetTicketsUseCase.ts
│   │   ├── CreateTicketUseCase.ts
│   │   ├── UpdateTicketStatusUseCase.ts
│   │   └── DeleteTicketUseCase.ts
│   └── dto/
│       └── TicketDTO.ts
│
├── infrastructure/
│   ├── repositories/
│   │   └── InMemoryTicketRepository.ts
│   ├── services/
│   │   └── PollingService.ts
│   └── di/
│       └── DIContainer.ts
│
└── presentation/
    ├── components/
    │   ├── TicketList.tsx
    │   ├── TicketCard.tsx
    │   ├── TicketForm.tsx
    │   └── TicketStatusBadge.tsx
    ├── hooks/
    │   ├── useTicketPolling.ts
    │   └── useTicketOperations.ts
    ├── state/
    │   └── ticketAtoms.ts
    └── pages/
        └── TicketPage.tsx
```

## データフロー

### 1. チケット取得（ポーリング）
```
PollingService (5秒間隔)
  → useTicketPolling hook
  → GetTicketsUseCase.execute()
  → ITicketRepository.findAll()
  → InMemoryTicketRepository
  → ticketsAtom に格納
  → TicketList コンポーネント再レンダリング
```

### 2. チケット作成
```
TicketForm (ユーザー入力)
  → useTicketOperations.createTicket()
  → CreateTicketUseCase.execute()
  → Ticket.create() (ドメインロジック)
  → ITicketRepository.save()
  → InMemoryTicketRepository
  → ticketsAtom に追加
  → UI即座に更新（楽観的更新）
```

### 3. ステータス更新
```
TicketCard (ステータスボタン)
  → useTicketOperations.updateStatus()
  → UpdateTicketStatusUseCase.execute()
  → Ticket.updateStatus() (ドメインロジック)
  → ITicketRepository.save()
  → InMemoryTicketRepository
  → ポーリングで自動的に反映
```

## 設計原則の適用

### 1. 依存性逆転原則（DIP）
- アプリケーション層・ドメイン層はインターフェースに依存
- インフラ層が具体実装を提供
- DIコンテナで注入

### 2. 単一責任原則（SRP）
- 各クラスは1つの責務のみを持つ
- エンティティ：ビジネスロジック
- ユースケース：シナリオの実行
- リポジトリ：データアクセス

### 3. 開放閉鎖原則（OCP）
- リポジトリの実装を切り替え可能
- InMemory → LocalStorage → API
- 既存コードを変更せずに拡張

### 4. インターフェース分離原則（ISP）
- 必要最小限のメソッドのみをインターフェースに定義
- クライアントは不要なメソッドに依存しない

## テスト戦略

### 1. ドメイン層
- **単体テスト**: エンティティ、バリューオブジェクトのロジック
- **テストしやすさ**: 外部依存なし

### 2. アプリケーション層
- **単体テスト**: ユースケースの動作
- **モック**: リポジトリをモック化

### 3. インフラ層
- **統合テスト**: リポジトリの実装

### 4. プレゼンテーション層
- **コンポーネントテスト**: React Testing Library
- **E2Eテスト**: Playwright / Cypress（将来）

## 拡張性

### データソースの切り替え
```typescript
// InMemoryRepositoryの代わりにAPIRepositoryを注入
class DIContainer {
  private constructor() {
    // 環境変数で切り替え
    this.ticketRepository = import.meta.env.VITE_USE_API
      ? new ApiTicketRepository()
      : new InMemoryTicketRepository()
  }
}
```

### 新機能の追加
1. ドメイン層に新しいエンティティ・バリューオブジェクトを追加
2. アプリケーション層に新しいユースケースを追加
3. インフラ層に必要なリポジトリを実装
4. プレゼンテーション層にUIを追加

### キャッシュ戦略の追加
```typescript
class CachedTicketRepository implements ITicketRepository {
  constructor(
    private baseRepository: ITicketRepository,
    private cache: Cache
  ) {}

  async findAll(): Promise<Ticket[]> {
    const cached = this.cache.get('tickets')
    if (cached) return cached

    const tickets = await this.baseRepository.findAll()
    this.cache.set('tickets', tickets)
    return tickets
  }
}
```

## まとめ

このアーキテクチャは以下を実現します：

✅ **保守性**: 各レイヤーが独立して変更可能
✅ **テスタビリティ**: 依存性を注入してモック化可能
✅ **拡張性**: 実装を容易に切り替え・追加可能
✅ **可読性**: 責務が明確で理解しやすい
✅ **再利用性**: ドメインロジックが技術詳細から分離
