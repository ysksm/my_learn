import { useAtom, useSetAtom } from 'jotai'
import { notificationsAtom, removeNotificationAtom, type Notification } from '../state/notificationAtoms'

/**
 * トースト通知コンポーネント
 */
export const ToastNotification: React.FC = () => {
  const [notifications] = useAtom(notificationsAtom)

  if (notifications.length === 0) {
    return null
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      {notifications.map((notification) => (
        <ToastItem key={notification.id} notification={notification} />
      ))}
    </div>
  )
}

/**
 * 個別のトーストアイテム
 */
const ToastItem: React.FC<{ notification: Notification }> = ({ notification }) => {
  const removeNotification = useSetAtom(removeNotificationAtom)

  const colors = {
    info: { bg: '#eff6ff', border: '#3b82f6', text: '#1e40af' },
    success: { bg: '#f0fdf4', border: '#10b981', text: '#065f46' },
    warning: { bg: '#fffbeb', border: '#f59e0b', text: '#92400e' },
    error: { bg: '#fef2f2', border: '#ef4444', text: '#991b1b' },
  }

  const color = colors[notification.type]

  return (
    <div
      style={{
        minWidth: '300px',
        padding: '16px',
        backgroundColor: color.bg,
        border: `2px solid ${color.border}`,
        borderRadius: '8px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        animation: 'slideIn 0.3s ease-out',
      }}
    >
      <span style={{ color: color.text, fontWeight: '500' }}>
        {notification.message}
      </span>
      <button
        onClick={() => removeNotification(notification.id)}
        style={{
          marginLeft: '16px',
          padding: '4px 8px',
          backgroundColor: 'transparent',
          border: 'none',
          color: color.text,
          cursor: 'pointer',
          fontSize: '18px',
          lineHeight: '1',
        }}
      >
        ×
      </button>
      <style>
        {`
          @keyframes slideIn {
            from {
              transform: translateX(400px);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}
      </style>
    </div>
  )
}
