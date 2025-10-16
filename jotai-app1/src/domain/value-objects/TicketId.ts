/**
 * チケットIDを表すバリューオブジェクト
 * UUIDを使用してチケットを一意に識別
 */
export class TicketId {
  private readonly value: string

  private constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('TicketId cannot be empty')
    }
    this.value = value
  }

  /**
   * 新しいTicketIdを生成
   */
  static create(): TicketId {
    return new TicketId(crypto.randomUUID())
  }

  /**
   * 既存の文字列からTicketIdを復元
   */
  static fromString(value: string): TicketId {
    return new TicketId(value)
  }

  /**
   * 文字列表現を取得
   */
  toString(): string {
    return this.value
  }

  /**
   * 等価性の比較
   */
  equals(other: TicketId): boolean {
    return this.value === other.value
  }

  /**
   * 生の値を取得（シリアライズ用）
   */
  get rawValue(): string {
    return this.value
  }
}
