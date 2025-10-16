import type { ITicketRepository } from '../../domain/repositories/ITicketRepository'
import { Ticket } from '../../domain/entities/Ticket'
import { TicketId } from '../../domain/value-objects/TicketId'

/**
 * チケット詳細取得ユースケース
 */
export class GetTicketByIdUseCase {
  private readonly ticketRepository: ITicketRepository

  constructor(ticketRepository: ITicketRepository) {
    this.ticketRepository = ticketRepository
  }

  /**
   * IDでチケットを取得
   * @throws Error チケットが見つからない場合
   */
  async execute(ticketId: string): Promise<Ticket> {
    const id = TicketId.fromString(ticketId)
    const ticket = await this.ticketRepository.findById(id)

    if (!ticket) {
      throw new Error(`Ticket with id ${ticketId} not found`)
    }

    return ticket
  }
}
