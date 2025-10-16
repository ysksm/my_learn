import { atom } from 'jotai'
import { Ticket } from '../../domain/entities/Ticket'
import { TicketStatus } from '../../domain/value-objects/TicketStatus'

/**
 * チケット一覧のatom
 */
export const ticketsAtom = atom<Ticket[]>([])

/**
 * ローディング状態のatom
 */
export const isLoadingAtom = atom<boolean>(false)

/**
 * エラー状態のatom
 */
export const errorAtom = atom<string | null>(null)

/**
 * フィルタ状態のatom
 * ALL: すべて表示
 * それ以外: 特定のステータスのみ表示
 */
export type FilterType = 'ALL' | TicketStatus
export const filterAtom = atom<FilterType>('ALL')

/**
 * フィルタ済みチケット一覧のatom（派生atom）
 */
export const filteredTicketsAtom = atom((get) => {
  const tickets = get(ticketsAtom)
  const filter = get(filterAtom)

  if (filter === 'ALL') {
    return tickets
  }

  return tickets.filter((ticket) => ticket.status === filter)
})

/**
 * ステータス別のチケット数を取得する派生atom
 */
export const ticketCountsByStatusAtom = atom((get) => {
  const tickets = get(ticketsAtom)

  return {
    total: tickets.length,
    todo: tickets.filter((t) => t.status === TicketStatus.TODO).length,
    inProgress: tickets.filter((t) => t.status === TicketStatus.IN_PROGRESS).length,
    done: tickets.filter((t) => t.status === TicketStatus.DONE).length,
  }
})
