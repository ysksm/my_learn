import type { ITicketRepository } from '../../domain/repositories/ITicketRepository'
import { TicketId } from '../../domain/value-objects/TicketId'
import type { UpdateTicketContentInput } from '../dto/TicketDTO'

/**
 * チケット内容更新ユースケース
 */
export class UpdateTicketContentUseCase {
  private readonly ticketRepository: ITicketRepository

  constructor(ticketRepository: ITicketRepository) {
    this.ticketRepository = ticketRepository
  }

  /**
   * チケットの内容（タイトル・説明）を更新
   * @throws Error チケットが見つからない場合、またはバリデーションエラーの場合
   */
  async execute(input: UpdateTicketContentInput): Promise<void> {
    const ticketId = TicketId.fromString(input.ticketId)

    // チケットを取得
    const ticket = await this.ticketRepository.findById(ticketId)
    if (!ticket) {
      throw new Error(`Ticket with id ${input.ticketId} not found`)
    }

    // 内容更新（ドメインロジック・バリデーション含む）
    ticket.updateContent(input.title, input.description)

    // リポジトリに保存
    await this.ticketRepository.save(ticket)
  }
}
