import React from 'react';
import { useTickets } from '../hooks';
import { TicketListItem } from './TicketListItem';
import { TicketFilter } from '../../../core/domain/repositories/ticket-repository';

interface TicketListProps {
  initialFilter?: TicketFilter;
  onTicketClick?: (ticketId: string) => void;
}

export const TicketList: React.FC<TicketListProps> = ({ 
  initialFilter = {},
  onTicketClick 
}) => {
  const { 
    tickets, 
    loading, 
    error, 
    filter, 
    updateFilter, 
    resetFilter,
    refreshTickets 
  } = useTickets(initialFilter);

  if (loading) {
    return <div className="loading">読み込み中...</div>;
  }

  if (error) {
    return (
      <div className="error">
        <p>{error}</p>
        <button onClick={refreshTickets}>再試行</button>
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="empty-state">
        <p>チケットがありません。</p>
        <button onClick={resetFilter}>フィルターをリセット</button>
      </div>
    );
  }

  return (
    <div className="ticket-list">
      <div className="ticket-list-header">
        <h2>チケット一覧</h2>
        <button onClick={refreshTickets}>更新</button>
      </div>
      <div className="ticket-list-items">
        {tickets.map(ticket => (
          <TicketListItem 
            key={ticket.id} 
            ticket={ticket} 
            onClick={() => onTicketClick?.(ticket.id)} 
          />
        ))}
      </div>
    </div>
  );
};
