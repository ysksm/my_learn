import type { ITicketRepository } from '../../domain/repositories/ITicketRepository'
import { TicketId } from '../../domain/value-objects/TicketId'
import type { UpdateTicketStatusInput } from '../dto/TicketDTO'

/**
 * チケットステータス更新ユースケース
 */
export class UpdateTicketStatusUseCase {
  private readonly ticketRepository: ITicketRepository

  constructor(ticketRepository: ITicketRepository) {
    this.ticketRepository = ticketRepository
  }

  /**
   * チケットのステータスを更新
   * @throws Error チケットが見つからない場合、または不正なステータス遷移の場合
   */
  async execute(input: UpdateTicketStatusInput): Promise<void> {
    const ticketId = TicketId.fromString(input.ticketId)

    // チケットを取得
    const ticket = await this.ticketRepository.findById(ticketId)
    if (!ticket) {
      throw new Error(`Ticket with id ${input.ticketId} not found`)
    }

    // ステータス更新（ドメインロジック・バリデーション含む）
    ticket.updateStatus(input.newStatus)

    // リポジトリに保存
    await this.ticketRepository.save(ticket)
  }
}
