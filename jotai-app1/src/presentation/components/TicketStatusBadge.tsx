import { TicketStatus, getTicketStatusLabel, getTicketStatusColor } from '../../domain/value-objects/TicketStatus'

interface TicketStatusBadgeProps {
  status: TicketStatus
}

/**
 * チケットステータスバッジコンポーネント
 */
export const TicketStatusBadge: React.FC<TicketStatusBadgeProps> = ({ status }) => {
  const label = getTicketStatusLabel(status)
  const color = getTicketStatusColor(status)

  return (
    <span
      style={{
        display: 'inline-block',
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '600',
        color: 'white',
        backgroundColor: color,
      }}
    >
      {label}
    </span>
  )
}
