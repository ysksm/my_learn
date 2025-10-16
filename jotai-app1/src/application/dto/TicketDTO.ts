import { TicketStatus } from '../../domain/value-objects/TicketStatus'

/**
 * チケット作成時の入力DTO
 */
export interface CreateTicketInput {
  title: string
  description?: string
}

/**
 * チケット更新時の入力DTO
 */
export interface UpdateTicketContentInput {
  ticketId: string
  title: string
  description: string
}

/**
 * ステータス更新時の入力DTO
 */
export interface UpdateTicketStatusInput {
  ticketId: string
  newStatus: TicketStatus
}

/**
 * チケット出力DTO（プレゼンテーション層へ）
 */
export interface TicketOutput {
  id: string
  title: string
  description: string
  status: TicketStatus
  createdAt: Date
  updatedAt: Date
}
