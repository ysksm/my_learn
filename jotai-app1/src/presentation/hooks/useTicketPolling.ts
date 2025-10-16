import { useEffect } from 'react'
import { useSetAtom } from 'jotai'
import { ticketsAtom, errorAtom } from '../state/ticketAtoms'
import { lastUpdatedAtom, addNotificationAtom } from '../state/notificationAtoms'
import { DIContainer } from '../../infrastructure/di/DIContainer'
import { PollingService } from '../../infrastructure/services/PollingService'
import { BroadcastService } from '../../infrastructure/services/BroadcastService'

/**
 * チケットポーリングフック
 * 5秒間隔でチケット一覧を自動更新
 * BroadcastChannelで複数タブ間で同期
 */
export const useTicketPolling = () => {
  const setTickets = useSetAtom(ticketsAtom)
  const setError = useSetAtom(errorAtom)
  const setLastUpdated = useSetAtom(lastUpdatedAtom)
  const addNotification = useSetAtom(addNotificationAtom)

  useEffect(() => {
    const container = DIContainer.getInstance()
    const getTicketsUseCase = container.getGetTicketsUseCase()
    const pollingService = new PollingService()
    const broadcastService = new BroadcastService()

    // BroadcastChannelを初期化
    broadcastService.initialize()

    let isFirstFetch = true

    const fetchTickets = async (showNotification = false) => {
      try {
        const tickets = await getTicketsUseCase.execute()
        setTickets(tickets)
        setError(null)
        setLastUpdated(new Date())

        // 初回以外で通知を表示
        if (!isFirstFetch && showNotification) {
          addNotification({
            type: 'success',
            message: 'チケットが更新されました',
          })
        }

        isFirstFetch = false
      } catch (error) {
        console.error('[useTicketPolling] Failed to fetch tickets:', error)
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to fetch tickets'
        setError(errorMessage)
        addNotification({
          type: 'error',
          message: errorMessage,
        })
      }
    }

    // 他のタブからの更新を受信
    const unsubscribe = broadcastService.on('TICKETS_REFRESHED', (message) => {
      console.log('[useTicketPolling] Received update from another tab:', message)
      fetchTickets(true)
    })

    // 5秒間隔でポーリング
    pollingService.start(() => fetchTickets(false), 5000)

    // クリーンアップ
    return () => {
      pollingService.stop()
      broadcastService.close()
      unsubscribe()
    }
  }, [setTickets, setError, setLastUpdated, addNotification])
}
