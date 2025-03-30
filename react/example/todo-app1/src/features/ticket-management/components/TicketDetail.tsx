import React from 'react';
import { useTicketDetail } from '../hooks';

interface TicketDetailProps {
  ticketId: string;
  onBack?: () => void;
  onEdit?: (ticketId: string) => void;
  onDelete?: (ticketId: string) => void;
}

export const TicketDetail: React.FC<TicketDetailProps> = ({ 
  ticketId, 
  onBack, 
  onEdit, 
  onDelete 
}) => {
  const { 
    ticket, 
    loading, 
    error, 
    refreshTicket 
  } = useTicketDetail(ticketId);

  if (loading) {
    return <div className="loading">読み込み中...</div>;
  }

  if (error) {
    return (
      <div className="error">
        <p>{error}</p>
        <button onClick={refreshTicket}>再試行</button>
        <button onClick={onBack}>戻る</button>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="not-found">
        <p>チケットが見つかりませんでした。</p>
        <button onClick={onBack}>戻る</button>
      </div>
    );
  }

  return (
    <div className="ticket-detail">
      <div className="ticket-detail-header">
        <button onClick={onBack}>戻る</button>
        <h2>{ticket.title}</h2>
        <div className="ticket-detail-actions">
          <button onClick={() => onEdit?.(ticketId)}>編集</button>
          <button onClick={() => onDelete?.(ticketId)}>削除</button>
        </div>
      </div>

      <div className="ticket-detail-meta">
        <div className="ticket-detail-id">#{ticketId.substring(0, 8)}</div>
        <div 
          className="ticket-detail-priority" 
          style={{ backgroundColor: ticket.priorityColor }}
        >
          {ticket.priorityLabel}
        </div>
        <div className="ticket-detail-type">{ticket.typeLabel}</div>
        <div className="ticket-detail-status">{ticket.statusLabel}</div>
        <div className="ticket-detail-severity">{ticket.severityLabel}</div>
      </div>

      <div className="ticket-detail-description">
        <h3>説明</h3>
        <p>{ticket.description}</p>
      </div>

      <div className="ticket-detail-tags">
        <h3>タグ</h3>
        <div className="tag-list">
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
      </div>

      <div className="ticket-detail-dates">
        <div className="ticket-detail-created">
          <h3>作成日</h3>
          <p>{ticket.createdAtFormatted}</p>
        </div>
        <div className="ticket-detail-updated">
          <h3>更新日</h3>
          <p>{ticket.updatedAtFormatted}</p>
        </div>
        {ticket.dueDate && (
          <div className={`ticket-detail-due-date ${ticket.isOverdue ? 'overdue' : ''}`}>
            <h3>期日</h3>
            <p>{ticket.dueDateFormatted}</p>
          </div>
        )}
      </div>

      <div className="ticket-detail-people">
        {ticket.assignee && (
          <div className="ticket-detail-assignee">
            <h3>担当者</h3>
            <p>{ticket.assignee.name}</p>
          </div>
        )}
        <div className="ticket-detail-reporter">
          <h3>報告者</h3>
          <p>{ticket.reporter.name}</p>
        </div>
      </div>

      {ticket.estimatedHours !== undefined && (
        <div className="ticket-detail-estimate">
          <h3>見積時間</h3>
          <p>{ticket.estimatedHours}時間</p>
        </div>
      )}

      {ticket.sprint && (
        <div className="ticket-detail-sprint">
          <h3>スプリント</h3>
          <p>{ticket.sprint.name}</p>
        </div>
      )}

      {ticket.parent && (
        <div className="ticket-detail-parent">
          <h3>親チケット</h3>
          <p>{ticket.parent.title}</p>
        </div>
      )}

      {ticket.children && ticket.children.length > 0 && (
        <div className="ticket-detail-children">
          <h3>子チケット</h3>
          <ul>
            {ticket.children.map(child => (
              <li key={child.id}>
                <span>{child.title}</span>
                <span className="ticket-detail-child-status">{child.statusLabel}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
