import type { ITicketRepository } from '../../domain/repositories/ITicketRepository'
import { Ticket } from '../../domain/entities/Ticket'
import type { CreateTicketInput } from '../dto/TicketDTO'

/**
 * チケット作成ユースケース
 */
export class CreateTicketUseCase {
  private readonly ticketRepository: ITicketRepository

  constructor(ticketRepository: ITicketRepository) {
    this.ticketRepository = ticketRepository
  }

  /**
   * 新しいチケットを作成
   */
  async execute(input: CreateTicketInput): Promise<Ticket> {
    // ドメインエンティティの作成（バリデーション含む）
    const ticket = Ticket.create(input.title, input.description || '')

    // リポジトリに保存
    await this.ticketRepository.save(ticket)

    return ticket
  }
}
