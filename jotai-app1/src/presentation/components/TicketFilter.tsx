import { useAtom } from 'jotai'
import { filterAtom, ticketCountsByStatusAtom, type FilterType } from '../state/ticketAtoms'
import { TicketStatus } from '../../domain/value-objects/TicketStatus'

/**
 * チケットフィルターコンポーネント
 */
export const TicketFilter: React.FC = () => {
  const [filter, setFilter] = useAtom(filterAtom)
  const [counts] = useAtom(ticketCountsByStatusAtom)

  const filters: { label: string; value: FilterType; count: number }[] = [
    { label: 'All', value: 'ALL', count: counts.total },
    { label: 'To Do', value: TicketStatus.TODO, count: counts.todo },
    { label: 'In Progress', value: TicketStatus.IN_PROGRESS, count: counts.inProgress },
    { label: 'Done', value: TicketStatus.DONE, count: counts.done },
  ]

  return (
    <div
      style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '24px',
        flexWrap: 'wrap',
      }}
    >
      {filters.map(({ label, value, count }) => (
        <button
          key={value}
          onClick={() => setFilter(value)}
          style={{
            padding: '8px 16px',
            border: filter === value ? '2px solid #3b82f6' : '1px solid #d1d5db',
            borderRadius: '8px',
            backgroundColor: filter === value ? '#eff6ff' : 'white',
            color: filter === value ? '#3b82f6' : '#6b7280',
            fontWeight: filter === value ? '600' : '400',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {label} <span style={{ marginLeft: '4px' }}>({count})</span>
        </button>
      ))}
    </div>
  )
}
