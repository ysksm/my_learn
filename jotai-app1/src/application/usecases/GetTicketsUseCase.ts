import type { ITicketRepository } from '../../domain/repositories/ITicketRepository'
import { Ticket } from '../../domain/entities/Ticket'

/**
 * チケット一覧取得ユースケース
 */
export class GetTicketsUseCase {
  private readonly ticketRepository: ITicketRepository

  constructor(ticketRepository: ITicketRepository) {
    this.ticketRepository = ticketRepository
  }

  /**
   * すべてのチケットを取得
   */
  async execute(): Promise<Ticket[]> {
    return await this.ticketRepository.findAll()
  }
}
