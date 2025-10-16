import { Ticket } from '../../domain/entities/Ticket'
import { TicketStatus } from '../../domain/value-objects/TicketStatus'
import { TicketStatusBadge } from './TicketStatusBadge'
import { useTicketOperations } from '../hooks/useTicketOperations'

interface TicketCardProps {
  ticket: Ticket
}

/**
 * チケットカードコンポーネント
 */
export const TicketCard: React.FC<TicketCardProps> = ({ ticket }) => {
  const { updateTicketStatus, deleteTicket } = useTicketOperations()

  const handleStatusChange = async (newStatus: TicketStatus) => {
    try {
      await updateTicketStatus(ticket.id.toString(), newStatus)
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this ticket?')) {
      try {
        await deleteTicket(ticket.id.toString())
      } catch (error) {
        console.error('Failed to delete ticket:', error)
      }
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  return (
    <div
      style={{
        padding: '20px',
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        marginBottom: '16px',
        transition: 'box-shadow 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '12px',
        }}
      >
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#111827' }}>
            {ticket.title}
          </h3>
          <TicketStatusBadge status={ticket.status} />
        </div>
        <button
          onClick={handleDelete}
          style={{
            padding: '6px 12px',
            backgroundColor: '#fee',
            color: '#c33',
            border: '1px solid #fcc',
            borderRadius: '6px',
            fontSize: '12px',
            cursor: 'pointer',
          }}
        >
          Delete
        </button>
      </div>

      {ticket.description && (
        <p
          style={{
            margin: '12px 0',
            color: '#6b7280',
            fontSize: '14px',
            lineHeight: '1.5',
          }}
        >
          {ticket.description}
        </p>
      )}

      <div
        style={{
          fontSize: '12px',
          color: '#9ca3af',
          marginTop: '12px',
          paddingTop: '12px',
          borderTop: '1px solid #e5e7eb',
        }}
      >
        <div>Created: {formatDate(ticket.createdAt)}</div>
        <div>Updated: {formatDate(ticket.updatedAt)}</div>
      </div>

      <div
        style={{
          marginTop: '16px',
          display: 'flex',
          gap: '8px',
        }}
      >
        <span style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>
          Change status:
        </span>
        {Object.values(TicketStatus).map((status) => (
          <button
            key={status}
            onClick={() => handleStatusChange(status)}
            disabled={ticket.status === status}
            style={{
              padding: '4px 12px',
              fontSize: '12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              backgroundColor: ticket.status === status ? '#f3f4f6' : 'white',
              color: ticket.status === status ? '#9ca3af' : '#374151',
              cursor: ticket.status === status ? 'not-allowed' : 'pointer',
            }}
          >
            {status}
          </button>
        ))}
      </div>
    </div>
  )
}
