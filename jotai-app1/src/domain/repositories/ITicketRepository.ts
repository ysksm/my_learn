import { Ticket } from '../entities/Ticket'
import { TicketId } from '../value-objects/TicketId'

/**
 * チケットリポジトリのインターフェース
 * 依存性逆転原則（DIP）を適用
 * ドメイン層がインターフェースを定義し、インフラ層が実装する
 */
export interface ITicketRepository {
  /**
   * すべてのチケットを取得
   */
  findAll(): Promise<Ticket[]>

  /**
   * IDでチケットを検索
   * @param id チケットID
   * @returns チケット、見つからない場合はnull
   */
  findById(id: TicketId): Promise<Ticket | null>

  /**
   * チケットを保存（作成または更新）
   * @param ticket 保存するチケット
   */
  save(ticket: Ticket): Promise<void>

  /**
   * チケットを削除
   * @param id 削除するチケットのID
   */
  delete(id: TicketId): Promise<void>
}
