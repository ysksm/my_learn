import type { ITicketRepository } from '../../domain/repositories/ITicketRepository'
import { TicketId } from '../../domain/value-objects/TicketId'

/**
 * チケット削除ユースケース
 */
export class DeleteTicketUseCase {
  private readonly ticketRepository: ITicketRepository

  constructor(ticketRepository: ITicketRepository) {
    this.ticketRepository = ticketRepository
  }

  /**
   * チケットを削除
   */
  async execute(ticketId: string): Promise<void> {
    const id = TicketId.fromString(ticketId)

    // チケットの存在確認（オプショナル）
    const ticket = await this.ticketRepository.findById(id)
    if (!ticket) {
      throw new Error(`Ticket with id ${ticketId} not found`)
    }

    // リポジトリから削除
    await this.ticketRepository.delete(id)
  }
}
