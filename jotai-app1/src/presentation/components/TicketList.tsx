import { useAtom } from 'jotai'
import { filteredTicketsAtom } from '../state/ticketAtoms'
import { TicketCard } from './TicketCard'
import { useTicketPolling } from '../hooks/useTicketPolling'

/**
 * チケット一覧コンポーネント
 */
export const TicketList: React.FC = () => {
  const [filteredTickets] = useAtom(filteredTicketsAtom)

  // ポーリング開始
  useTicketPolling()

  if (filteredTickets.length === 0) {
    return (
      <div
        style={{
          padding: '40px',
          textAlign: 'center',
          color: '#6b7280',
          backgroundColor: '#f9fafb',
          border: '2px dashed #d1d5db',
          borderRadius: '8px',
        }}
      >
        <p style={{ fontSize: '16px', margin: 0 }}>
          No tickets found. Create your first ticket!
        </p>
      </div>
    )
  }

  return (
    <div>
      {filteredTickets.map((ticket) => (
        <TicketCard key={ticket.id.toString()} ticket={ticket} />
      ))}
    </div>
  )
}
