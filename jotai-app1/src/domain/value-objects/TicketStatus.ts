/**
 * チケットのステータスを表すバリューオブジェクト
 */
export const TicketStatus = {
  TODO: 'TODO',
  IN_PROGRESS: 'IN_PROGRESS',
  DONE: 'DONE',
} as const

export type TicketStatus = (typeof TicketStatus)[keyof typeof TicketStatus]

/**
 * ステータス遷移のバリデーション
 */
export class TicketStatusValidator {
  private static readonly VALID_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
    [TicketStatus.TODO]: [TicketStatus.IN_PROGRESS, TicketStatus.DONE],
    [TicketStatus.IN_PROGRESS]: [TicketStatus.TODO, TicketStatus.DONE],
    [TicketStatus.DONE]: [TicketStatus.TODO, TicketStatus.IN_PROGRESS],
  }

  static canTransition(from: TicketStatus, to: TicketStatus): boolean {
    return this.VALID_TRANSITIONS[from].includes(to)
  }

  static validateTransition(from: TicketStatus, to: TicketStatus): void {
    if (!this.canTransition(from, to)) {
      throw new Error(`Invalid status transition from ${from} to ${to}`)
    }
  }
}

/**
 * ステータスの表示名を取得
 */
export function getTicketStatusLabel(status: TicketStatus): string {
  const labels: Record<TicketStatus, string> = {
    [TicketStatus.TODO]: 'To Do',
    [TicketStatus.IN_PROGRESS]: 'In Progress',
    [TicketStatus.DONE]: 'Done',
  }
  return labels[status]
}

/**
 * ステータスの色を取得（UI用）
 */
export function getTicketStatusColor(status: TicketStatus): string {
  const colors: Record<TicketStatus, string> = {
    [TicketStatus.TODO]: '#6b7280', // gray
    [TicketStatus.IN_PROGRESS]: '#3b82f6', // blue
    [TicketStatus.DONE]: '#10b981', // green
  }
  return colors[status]
}
