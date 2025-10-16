import type { ITicketRepository } from '../../domain/repositories/ITicketRepository'
import { InMemoryTicketRepository } from '../repositories/InMemoryTicketRepository'
import { LocalStorageTicketRepository } from '../repositories/LocalStorageTicketRepository'
import { GetTicketsUseCase } from '../../application/usecases/GetTicketsUseCase'
import { GetTicketByIdUseCase } from '../../application/usecases/GetTicketByIdUseCase'
import { CreateTicketUseCase } from '../../application/usecases/CreateTicketUseCase'
import { UpdateTicketStatusUseCase } from '../../application/usecases/UpdateTicketStatusUseCase'
import { UpdateTicketContentUseCase } from '../../application/usecases/UpdateTicketContentUseCase'
import { DeleteTicketUseCase } from '../../application/usecases/DeleteTicketUseCase'

/**
 * DIコンテナ
 * 依存性の注入を管理するシングルトンクラス
 *
 * 責務:
 * - 各層のインスタンスを生成
 * - 依存関係を注入
 * - アプリケーション全体で単一のインスタンスを共有
 */
export class DIContainer {
  private static instance: DIContainer | null = null

  // リポジトリ
  private readonly ticketRepository: ITicketRepository

  // ユースケース
  private readonly getTicketsUseCase: GetTicketsUseCase
  private readonly getTicketByIdUseCase: GetTicketByIdUseCase
  private readonly createTicketUseCase: CreateTicketUseCase
  private readonly updateTicketStatusUseCase: UpdateTicketStatusUseCase
  private readonly updateTicketContentUseCase: UpdateTicketContentUseCase
  private readonly deleteTicketUseCase: DeleteTicketUseCase

  private constructor() {
    // リポジトリのインスタンス化
    // 環境変数で切り替え可能（デフォルトはLocalStorage）
    const useMemory = import.meta.env.VITE_USE_MEMORY_STORAGE === 'true'

    if (useMemory) {
      this.ticketRepository = new InMemoryTicketRepository()
      console.log('[DIContainer] Initialized with InMemoryTicketRepository')
    } else {
      this.ticketRepository = new LocalStorageTicketRepository()
      console.log('[DIContainer] Initialized with LocalStorageTicketRepository')
    }

    // ユースケースへの依存性注入
    this.getTicketsUseCase = new GetTicketsUseCase(this.ticketRepository)
    this.getTicketByIdUseCase = new GetTicketByIdUseCase(this.ticketRepository)
    this.createTicketUseCase = new CreateTicketUseCase(this.ticketRepository)
    this.updateTicketStatusUseCase = new UpdateTicketStatusUseCase(
      this.ticketRepository
    )
    this.updateTicketContentUseCase = new UpdateTicketContentUseCase(
      this.ticketRepository
    )
    this.deleteTicketUseCase = new DeleteTicketUseCase(this.ticketRepository)
  }

  /**
   * シングルトンインスタンスを取得
   */
  static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer()
    }
    return DIContainer.instance
  }

  /**
   * インスタンスをリセット（テスト用）
   */
  static reset(): void {
    DIContainer.instance = null
  }

  // Getter methods for use cases

  getGetTicketsUseCase(): GetTicketsUseCase {
    return this.getTicketsUseCase
  }

  getGetTicketByIdUseCase(): GetTicketByIdUseCase {
    return this.getTicketByIdUseCase
  }

  getCreateTicketUseCase(): CreateTicketUseCase {
    return this.createTicketUseCase
  }

  getUpdateTicketStatusUseCase(): UpdateTicketStatusUseCase {
    return this.updateTicketStatusUseCase
  }

  getUpdateTicketContentUseCase(): UpdateTicketContentUseCase {
    return this.updateTicketContentUseCase
  }

  getDeleteTicketUseCase(): DeleteTicketUseCase {
    return this.deleteTicketUseCase
  }

  // リポジトリへの直接アクセス（デバッグ用、通常は使用しない）
  getTicketRepository(): ITicketRepository {
    return this.ticketRepository
  }
}
