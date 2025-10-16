import type { ITicketRepository } from '../../domain/repositories/ITicketRepository'
import { Ticket } from '../../domain/entities/Ticket'
import { TicketId } from '../../domain/value-objects/TicketId'
import { TicketStatus } from '../../domain/value-objects/TicketStatus'

/**
 * インメモリチケットリポジトリ
 * 開発・デモ用の実装
 */
export class InMemoryTicketRepository implements ITicketRepository {
  private tickets: Map<string, Ticket> = new Map()

  constructor() {
    // 初期データの投入
    this.seedInitialData()
  }

  /**
   * 初期データの投入
   */
  private seedInitialData(): void {
    const now = new Date()

    // サンプルチケット1
    const ticket1 = Ticket.reconstruct({
      id: crypto.randomUUID(),
      title: 'プロジェクトの初期セットアップ',
      description: 'Vite + React + TypeScript + Jotaiの環境を構築する',
      status: TicketStatus.DONE,
      createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3日前
      updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2日前
    })
    this.tickets.set(ticket1.id.toString(), ticket1)

    // サンプルチケット2
    const ticket2 = Ticket.reconstruct({
      id: crypto.randomUUID(),
      title: 'ドメインモデルの設計',
      description: 'DDD戦術的パターンを適用したドメインモデルを設計する',
      status: TicketStatus.DONE,
      createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2日前
      updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1日前
    })
    this.tickets.set(ticket2.id.toString(), ticket2)

    // サンプルチケット3
    const ticket3 = Ticket.reconstruct({
      id: crypto.randomUUID(),
      title: 'UIコンポーネントの実装',
      description: 'チケット一覧、カード、フォームなどのコンポーネントを実装',
      status: TicketStatus.IN_PROGRESS,
      createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1日前
      updatedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2時間前
    })
    this.tickets.set(ticket3.id.toString(), ticket3)

    // サンプルチケット4
    const ticket4 = Ticket.reconstruct({
      id: crypto.randomUUID(),
      title: 'ポーリング機能の実装',
      description: '5秒間隔でデータを自動更新する機能を実装',
      status: TicketStatus.TODO,
      createdAt: new Date(now.getTime() - 12 * 60 * 60 * 1000), // 12時間前
      updatedAt: new Date(now.getTime() - 12 * 60 * 60 * 1000),
    })
    this.tickets.set(ticket4.id.toString(), ticket4)

    // サンプルチケット5
    const ticket5 = Ticket.reconstruct({
      id: crypto.randomUUID(),
      title: 'エラーハンドリングの追加',
      description: 'ユーザーフィードバックのためのエラー処理を実装',
      status: TicketStatus.TODO,
      createdAt: new Date(now.getTime() - 6 * 60 * 60 * 1000), // 6時間前
      updatedAt: new Date(now.getTime() - 6 * 60 * 60 * 1000),
    })
    this.tickets.set(ticket5.id.toString(), ticket5)
  }

  /**
   * すべてのチケットを取得
   */
  async findAll(): Promise<Ticket[]> {
    // 更新日時の降順でソート
    return Array.from(this.tickets.values()).sort((a, b) => {
      return b.updatedAt.getTime() - a.updatedAt.getTime()
    })
  }

  /**
   * IDでチケットを検索
   */
  async findById(id: TicketId): Promise<Ticket | null> {
    const ticket = this.tickets.get(id.toString())
    return ticket || null
  }

  /**
   * チケットを保存（作成または更新）
   */
  async save(ticket: Ticket): Promise<void> {
    // 新しいインスタンスとして保存（イミュータビリティ）
    this.tickets.set(ticket.id.toString(), ticket)
  }

  /**
   * チケットを削除
   */
  async delete(id: TicketId): Promise<void> {
    this.tickets.delete(id.toString())
  }

  /**
   * すべてのチケットをクリア（テスト用）
   */
  async clear(): Promise<void> {
    this.tickets.clear()
  }

  /**
   * チケット数を取得（デバッグ用）
   */
  async count(): Promise<number> {
    return this.tickets.size
  }
}
