import type { ITicketRepository } from '../../domain/repositories/ITicketRepository'
import { Ticket } from '../../domain/entities/Ticket'
import { TicketId } from '../../domain/value-objects/TicketId'
import { TicketStatus } from '../../domain/value-objects/TicketStatus'

/**
 * LocalStorageチケットリポジトリ
 * ブラウザのLocalStorageにデータを永続化
 */
export class LocalStorageTicketRepository implements ITicketRepository {
  private readonly STORAGE_KEY = 'jotai-app1-tickets'
  private readonly VERSION_KEY = 'jotai-app1-tickets-version'

  constructor() {
    // 初期データがない場合は投入
    this.initializeIfNeeded()
  }

  /**
   * 初期データの投入（LocalStorageが空の場合のみ）
   */
  private initializeIfNeeded(): void {
    const existing = localStorage.getItem(this.STORAGE_KEY)
    if (!existing) {
      const initialTickets = this.getInitialData()
      this.saveToStorage(initialTickets)
      console.log('[LocalStorageTicketRepository] Initialized with seed data')
    }
  }

  /**
   * 初期データの生成
   */
  private getInitialData(): Ticket[] {
    const now = new Date()

    const tickets = [
      Ticket.reconstruct({
        id: crypto.randomUUID(),
        title: 'プロジェクトの初期セットアップ',
        description: 'Vite + React + TypeScript + Jotaiの環境を構築する',
        status: TicketStatus.DONE,
        createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      }),
      Ticket.reconstruct({
        id: crypto.randomUUID(),
        title: 'ドメインモデルの設計',
        description: 'DDD戦術的パターンを適用したドメインモデルを設計する',
        status: TicketStatus.DONE,
        createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      }),
      Ticket.reconstruct({
        id: crypto.randomUUID(),
        title: 'UIコンポーネントの実装',
        description: 'チケット一覧、カード、フォームなどのコンポーネントを実装',
        status: TicketStatus.IN_PROGRESS,
        createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      }),
      Ticket.reconstruct({
        id: crypto.randomUUID(),
        title: 'ポーリング機能の実装',
        description: '5秒間隔でデータを自動更新する機能を実装',
        status: TicketStatus.TODO,
        createdAt: new Date(now.getTime() - 12 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 12 * 60 * 60 * 1000),
      }),
      Ticket.reconstruct({
        id: crypto.randomUUID(),
        title: 'エラーハンドリングの追加',
        description: 'ユーザーフィードバックのためのエラー処理を実装',
        status: TicketStatus.TODO,
        createdAt: new Date(now.getTime() - 6 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 6 * 60 * 60 * 1000),
      }),
    ]

    return tickets
  }

  /**
   * LocalStorageからデータを読み込み
   */
  private loadFromStorage(): Ticket[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY)
      if (!data) {
        return []
      }

      const ticketsData = JSON.parse(data)
      return ticketsData.map((t: any) =>
        Ticket.reconstruct({
          id: t.id,
          title: t.title,
          description: t.description,
          status: t.status,
          createdAt: new Date(t.createdAt),
          updatedAt: new Date(t.updatedAt),
        })
      )
    } catch (error) {
      console.error('[LocalStorageTicketRepository] Failed to load data:', error)
      return []
    }
  }

  /**
   * LocalStorageにデータを保存
   */
  private saveToStorage(tickets: Ticket[]): void {
    try {
      const data = tickets.map((t) => t.toPlainObject())
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data))

      // バージョンを更新（他タブへの通知用）
      const version = Date.now().toString()
      localStorage.setItem(this.VERSION_KEY, version)

      console.log(`[LocalStorageTicketRepository] Saved ${tickets.length} tickets`)
    } catch (error) {
      console.error('[LocalStorageTicketRepository] Failed to save data:', error)
      throw error
    }
  }

  /**
   * すべてのチケットを取得
   */
  async findAll(): Promise<Ticket[]> {
    const tickets = this.loadFromStorage()
    // 更新日時の降順でソート
    return tickets.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
  }

  /**
   * IDでチケットを検索
   */
  async findById(id: TicketId): Promise<Ticket | null> {
    const tickets = this.loadFromStorage()
    const ticket = tickets.find((t) => t.id.equals(id))
    return ticket || null
  }

  /**
   * チケットを保存（作成または更新）
   */
  async save(ticket: Ticket): Promise<void> {
    const tickets = this.loadFromStorage()
    const index = tickets.findIndex((t) => t.id.equals(ticket.id))

    if (index >= 0) {
      // 更新
      tickets[index] = ticket
    } else {
      // 新規作成
      tickets.push(ticket)
    }

    this.saveToStorage(tickets)
  }

  /**
   * チケットを削除
   */
  async delete(id: TicketId): Promise<void> {
    const tickets = this.loadFromStorage()
    const filtered = tickets.filter((t) => !t.id.equals(id))
    this.saveToStorage(filtered)
  }

  /**
   * すべてのチケットをクリア（テスト用）
   */
  async clear(): Promise<void> {
    localStorage.removeItem(this.STORAGE_KEY)
    localStorage.removeItem(this.VERSION_KEY)
    console.log('[LocalStorageTicketRepository] Cleared all data')
  }

  /**
   * チケット数を取得（デバッグ用）
   */
  async count(): Promise<number> {
    const tickets = this.loadFromStorage()
    return tickets.length
  }

  /**
   * 初期データにリセット
   */
  async reset(): Promise<void> {
    const initialTickets = this.getInitialData()
    this.saveToStorage(initialTickets)
    console.log('[LocalStorageTicketRepository] Reset to initial data')
  }
}
