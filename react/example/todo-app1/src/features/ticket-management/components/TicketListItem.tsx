import React from 'react';
import { TicketListItemViewModel } from '../view-models';

interface TicketListItemProps {
  ticket: TicketListItemViewModel;
  onClick?: () => void;
}

export const TicketListItem: React.FC<TicketListItemProps> = ({ ticket, onClick }) => {
  return (
    <div className="ticket-list-item" onClick={onClick}>
      <div className="ticket-header">
        <div className="ticket-id">#{ticket.id.substring(0, 8)}</div>
        <div 
          className="ticket-priority" 
          style={{ backgroundColor: ticket.priorityColor }}
        >
          {ticket.priorityLabel}
        </div>
      </div>
      <div className="ticket-title">{ticket.title}</div>
      <div className="ticket-meta">
        <div className="ticket-type">{ticket.typeLabel}</div>
        <div className="ticket-status">{ticket.statusLabel}</div>
      </div>
      <div className="ticket-tags">
        {ticket.tags.map(tag => (
          <span 
            key={tag.id} 
            className="ticket-tag" 
            style={{ backgroundColor: tag.color }}
          >
            {tag.name}
          </span>
        ))}
      </div>
      {ticket.dueDate && (
        <div className={`ticket-due-date ${ticket.isOverdue ? 'overdue' : ''}`}>
          期日: {ticket.dueDateFormatted}
        </div>
      )}
    </div>
  );
};
