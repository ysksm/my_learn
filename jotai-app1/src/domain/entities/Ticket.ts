import { TicketId } from '../value-objects/TicketId'
import { TicketStatus, TicketStatusValidator } from '../value-objects/TicketStatus'

/**
 * チケットエンティティ
 * ビジネスロジックとライフサイクルを管理
 */
export class Ticket {
  public readonly id: TicketId
  private _title: string
  private _description: string
  private _status: TicketStatus
  public readonly createdAt: Date
  private _updatedAt: Date

  private constructor(
    id: TicketId,
    title: string,
    description: string,
    status: TicketStatus,
    createdAt: Date,
    updatedAt: Date
  ) {
    this.id = id
    this._title = title
    this._description = description
    this._status = status
    this.createdAt = createdAt
    this._updatedAt = updatedAt
    this.validateTitle(title)
    this.validateDescription(description)
  }

  /**
   * 新しいチケットを作成（ファクトリメソッド）
   */
  static create(title: string, description: string = ''): Ticket {
    const now = new Date()
    return new Ticket(
      TicketId.create(),
      title,
      description,
      TicketStatus.TODO,
      now,
      now
    )
  }

  /**
   * 既存データからチケットを復元（リポジトリ用）
   */
  static reconstruct(data: {
    id: string
    title: string
    description: string
    status: TicketStatus
    createdAt: Date
    updatedAt: Date
  }): Ticket {
    return new Ticket(
      TicketId.fromString(data.id),
      data.title,
      data.description,
      data.status,
      data.createdAt,
      data.updatedAt
    )
  }

  /**
   * タイトルのバリデーション
   */
  private validateTitle(title: string): void {
    if (!title || title.trim().length === 0) {
      throw new Error('Title cannot be empty')
    }
    if (title.length > 100) {
      throw new Error('Title cannot exceed 100 characters')
    }
  }

  /**
   * 説明のバリデーション
   */
  private validateDescription(description: string): void {
    if (description.length > 500) {
      throw new Error('Description cannot exceed 500 characters')
    }
  }

  /**
   * チケットのステータスを更新
   */
  updateStatus(newStatus: TicketStatus): void {
    // ステータス遷移のバリデーション
    TicketStatusValidator.validateTransition(this._status, newStatus)

    this._status = newStatus
    this._updatedAt = new Date()
  }

  /**
   * チケットの内容を更新
   */
  updateContent(title: string, description: string): void {
    this.validateTitle(title)
    this.validateDescription(description)

    this._title = title
    this._description = description
    this._updatedAt = new Date()
  }

  /**
   * タイトルのみを更新
   */
  updateTitle(title: string): void {
    this.validateTitle(title)
    this._title = title
    this._updatedAt = new Date()
  }

  /**
   * 説明のみを更新
   */
  updateDescription(description: string): void {
    this.validateDescription(description)
    this._description = description
    this._updatedAt = new Date()
  }

  /**
   * チケットが完了しているかチェック
   */
  isDone(): boolean {
    return this._status === TicketStatus.DONE
  }

  /**
   * チケットが進行中かチェック
   */
  isInProgress(): boolean {
    return this._status === TicketStatus.IN_PROGRESS
  }

  /**
   * チケットが未着手かチェック
   */
  isTodo(): boolean {
    return this._status === TicketStatus.TODO
  }

  // Getters
  get title(): string {
    return this._title
  }

  get description(): string {
    return this._description
  }

  get status(): TicketStatus {
    return this._status
  }

  get updatedAt(): Date {
    return this._updatedAt
  }

  /**
   * エンティティの等価性チェック（IDベース）
   */
  equals(other: Ticket): boolean {
    return this.id.equals(other.id)
  }

  /**
   * プレーンオブジェクトに変換（シリアライズ用）
   */
  toPlainObject(): {
    id: string
    title: string
    description: string
    status: TicketStatus
    createdAt: Date
    updatedAt: Date
  } {
    return {
      id: this.id.toString(),
      title: this._title,
      description: this._description,
      status: this._status,
      createdAt: this.createdAt,
      updatedAt: this._updatedAt,
    }
  }
}
