import { useAtomValue } from 'jotai'
import { lastUpdatedAtom } from '../state/notificationAtoms'

/**
 * 最終更新時刻表示コンポーネント
 */
export const LastUpdated: React.FC = () => {
  const lastUpdated = useAtomValue(lastUpdatedAtom)

  if (!lastUpdated) {
    return (
      <div
        style={{
          fontSize: '12px',
          color: '#9ca3af',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <span>●</span>
        <span>初期化中...</span>
      </div>
    )
  }

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date)
  }

  return (
    <div
      style={{
        fontSize: '12px',
        color: '#10b981',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
      }}
    >
      <span
        style={{
          animation: 'pulse 2s ease-in-out infinite',
        }}
      >
        ●
      </span>
      <span>最終更新: {formatTime(lastUpdated)}</span>
      <style>
        {`
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.5;
            }
          }
        `}
      </style>
    </div>
  )
}
