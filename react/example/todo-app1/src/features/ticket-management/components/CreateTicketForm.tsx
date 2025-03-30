import React, { useState } from 'react';
import { useCreateTicket, useTags, getTicketTypeOptions, getPriorityOptions, getSeverityOptions } from '../hooks';
import { CreateTicketDTO } from '../../../core/application/dtos/ticket-dtos';

interface CreateTicketFormProps {
  onSuccess?: (ticketId: string) => void;
  onCancel?: () => void;
}

export const CreateTicketForm: React.FC<CreateTicketFormProps> = ({ 
  onSuccess, 
  onCancel 
}) => {
  const { createTicket, loading, error } = useCreateTicket();
  const { tags } = useTags();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('TODO');
  const [priority, setPriority] = useState('MEDIUM');
  const [severity, setSeverity] = useState('NORMAL');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      alert('タイトルを入力してください。');
      return;
    }
    
    const ticketData: Partial<CreateTicketDTO> & { 
      title: string; 
      description: string; 
      reporterId: string 
    } = {
      title,
      description,
      type: type as any,
      priority: priority as any,
      severity: severity as any,
      tagIds: selectedTagIds,
      reporterId: 'user1', // In a real app, this would be the current user's ID
    };
    
    if (dueDate) {
      ticketData.dueDate = new Date(dueDate);
    }
    
    if (estimatedHours) {
      ticketData.estimatedHours = parseFloat(estimatedHours);
    }
    
    const ticketId = await createTicket(ticketData);
    
    if (ticketId) {
      onSuccess?.(ticketId);
    }
  };

  const handleTagToggle = (tagId: string) => {
    setSelectedTagIds(prevSelectedTagIds => {
      if (prevSelectedTagIds.includes(tagId)) {
        return prevSelectedTagIds.filter(id => id !== tagId);
      } else {
        return [...prevSelectedTagIds, tagId];
      }
    });
  };

  return (
    <div className="create-ticket-form">
      <h2>新規チケット作成</h2>
      
      {error && <div className="error">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">タイトル *</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">説明</label>
          <textarea
            id="description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={5}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="type">タイプ</label>
          <select
            id="type"
            value={type}
            onChange={e => setType(e.target.value)}
          >
            {getTicketTypeOptions().map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="priority">優先度</label>
          <select
            id="priority"
            value={priority}
            onChange={e => setPriority(e.target.value)}
          >
            {getPriorityOptions().map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="severity">重要度</label>
          <select
            id="severity"
            value={severity}
            onChange={e => setSeverity(e.target.value)}
          >
            {getSeverityOptions().map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label>タグ</label>
          <div className="tag-selection">
            {tags.map(tag => (
              <div 
                key={tag.id} 
                className={`tag-option ${selectedTagIds.includes(tag.id) ? 'selected' : ''}`}
                style={{ backgroundColor: selectedTagIds.includes(tag.id) ? tag.color : 'transparent' }}
                onClick={() => handleTagToggle(tag.id)}
              >
                {tag.name}
              </div>
            ))}
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="dueDate">期日</label>
          <input
            id="dueDate"
            type="date"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="estimatedHours">見積時間（時間）</label>
          <input
            id="estimatedHours"
            type="number"
            min="0"
            step="0.5"
            value={estimatedHours}
            onChange={e => setEstimatedHours(e.target.value)}
          />
        </div>
        
        <div className="form-actions">
          <button type="button" onClick={onCancel} disabled={loading}>
            キャンセル
          </button>
          <button type="submit" disabled={loading}>
            {loading ? '作成中...' : '作成'}
          </button>
        </div>
      </form>
    </div>
  );
};
