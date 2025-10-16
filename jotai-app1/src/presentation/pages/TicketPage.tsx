import { useAtom } from 'jotai'
import { isLoadingAtom, errorAtom } from '../state/ticketAtoms'
import { TicketForm } from '../components/TicketForm'
import { TicketFilter } from '../components/TicketFilter'
import { TicketList } from '../components/TicketList'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { ErrorMessage } from '../components/ErrorMessage'
import { ToastNotification } from '../components/ToastNotification'
import { LastUpdated } from '../components/LastUpdated'

/**
 * チケット管理ページ
 * メインページコンポーネント
 */
export const TicketPage: React.FC = () => {
  const [isLoading] = useAtom(isLoadingAtom)
  const [error] = useAtom(errorAtom)

  return (
    <div
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '40px 20px',
      }}
    >
      {/* トースト通知 */}
      <ToastNotification />

      {/* ヘッダー */}
      <header style={{ marginBottom: '32px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '12px',
          }}
        >
          <div>
            <h1
              style={{
                fontSize: '32px',
                fontWeight: '700',
                color: '#111827',
                margin: '0 0 8px 0',
              }}
            >
              Ticket Management
            </h1>
            <p style={{ color: '#6b7280', margin: 0 }}>
              DDD + Layered Architecture + Jotai + LocalStorage
            </p>
          </div>
          <LastUpdated />
        </div>
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '8px',
            fontSize: '13px',
            color: '#1e40af',
          }}
        >
          <div style={{ fontWeight: '600', marginBottom: '4px' }}>✨ 実装機能</div>
          <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
            <li>データはLocalStorageに永続化されます</li>
            <li>5秒間隔で自動更新</li>
            <li>複数タブ間で自動同期（BroadcastChannel）</li>
            <li>更新時にトースト通知を表示</li>
          </ul>
        </div>
      </header>

      {/* エラー表示 */}
      {error && <ErrorMessage message={error} />}

      {/* チケット作成フォーム */}
      <TicketForm />

      {/* フィルター */}
      <TicketFilter />

      {/* ローディング表示 */}
      {isLoading && <LoadingSpinner />}

      {/* チケット一覧 */}
      <TicketList />
    </div>
  )
}
