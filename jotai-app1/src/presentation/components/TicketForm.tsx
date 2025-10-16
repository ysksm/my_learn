import { useState, type FormEvent } from 'react'
import { useTicketOperations } from '../hooks/useTicketOperations'

/**
 * チケット作成フォームコンポーネント
 */
export const TicketForm: React.FC = () => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const { createTicket } = useTicketOperations()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      alert('Title is required')
      return
    }

    try {
      await createTicket({ title, description })
      setTitle('')
      setDescription('')
      setIsOpen(false)
    } catch (error) {
      console.error('Failed to create ticket:', error)
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          padding: '12px 24px',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: '600',
          cursor: 'pointer',
          marginBottom: '24px',
        }}
      >
        + New Ticket
      </button>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        padding: '20px',
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        marginBottom: '24px',
      }}
    >
      <h3 style={{ marginTop: 0, marginBottom: '16px' }}>Create New Ticket</h3>

      <div style={{ marginBottom: '16px' }}>
        <label
          htmlFor="title"
          style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: '600',
            color: '#374151',
          }}
        >
          Title *
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
          placeholder="Enter ticket title..."
          required
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px',
            boxSizing: 'border-box',
          }}
        />
        <small style={{ color: '#6b7280' }}>
          {title.length}/100 characters
        </small>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label
          htmlFor="description"
          style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: '600',
            color: '#374151',
          }}
        >
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={500}
          placeholder="Enter ticket description..."
          rows={4}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px',
            fontFamily: 'inherit',
            resize: 'vertical',
            boxSizing: 'border-box',
          }}
        />
        <small style={{ color: '#6b7280' }}>
          {description.length}/500 characters
        </small>
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          type="submit"
          style={{
            padding: '10px 20px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          Create Ticket
        </button>
        <button
          type="button"
          onClick={() => {
            setIsOpen(false)
            setTitle('')
            setDescription('')
          }}
          style={{
            padding: '10px 20px',
            backgroundColor: 'white',
            color: '#6b7280',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
