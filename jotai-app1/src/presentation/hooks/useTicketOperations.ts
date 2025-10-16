import { useAtom, useSetAtom } from 'jotai'
import { ticketsAtom, isLoadingAtom, errorAtom } from '../state/ticketAtoms'
import { addNotificationAtom } from '../state/notificationAtoms'
import { DIContainer } from '../../infrastructure/di/DIContainer'
import { BroadcastService } from '../../infrastructure/services/BroadcastService'
import type { CreateTicketInput } from '../../application/dto/TicketDTO'
import type { TicketStatus } from '../../domain/value-objects/TicketStatus'

/**
 * チケット操作フック
 * CRUD操作を提供
 */
export const useTicketOperations = () => {
  const [tickets, setTickets] = useAtom(ticketsAtom)
  const setIsLoading = useSetAtom(isLoadingAtom)
  const setError = useSetAtom(errorAtom)
  const addNotification = useSetAtom(addNotificationAtom)

  const container = DIContainer.getInstance()
  const broadcastService = new BroadcastService()
  broadcastService.initialize()

  /**
   * チケットを作成
   */
  const createTicket = async (input: CreateTicketInput) => {
    setIsLoading(true)
    setError(null)

    try {
      const useCase = container.getCreateTicketUseCase()
      const newTicket = await useCase.execute(input)

      // 楽観的UI更新
      setTickets([newTicket, ...tickets])

      // 他のタブに通知
      broadcastService.send('TICKETS_REFRESHED', newTicket.id.toString())

      // 成功通知
      addNotification({
        type: 'success',
        message: 'チケットを作成しました',
      })

      return newTicket
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to create ticket'
      setError(errorMessage)
      addNotification({
        type: 'error',
        message: errorMessage,
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * チケットのステータスを更新
   */
  const updateTicketStatus = async (ticketId: string, newStatus: TicketStatus) => {
    setIsLoading(true)
    setError(null)

    try {
      const useCase = container.getUpdateTicketStatusUseCase()
      await useCase.execute({ ticketId, newStatus })

      // 楽観的UI更新
      setTickets(
        tickets.map((ticket) => {
          if (ticket.id.toString() === ticketId) {
            ticket.updateStatus(newStatus)
          }
          return ticket
        })
      )

      // 他のタブに通知
      broadcastService.send('TICKETS_REFRESHED', ticketId)

      // 成功通知
      addNotification({
        type: 'success',
        message: 'ステータスを更新しました',
      })
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to update ticket status'
      setError(errorMessage)
      addNotification({
        type: 'error',
        message: errorMessage,
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * チケットの内容を更新
   */
  const updateTicketContent = async (
    ticketId: string,
    title: string,
    description: string
  ) => {
    setIsLoading(true)
    setError(null)

    try {
      const useCase = container.getUpdateTicketContentUseCase()
      await useCase.execute({ ticketId, title, description })

      // 楽観的UI更新
      setTickets(
        tickets.map((ticket) => {
          if (ticket.id.toString() === ticketId) {
            ticket.updateContent(title, description)
          }
          return ticket
        })
      )
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to update ticket content'
      setError(errorMessage)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * チケットを削除
   */
  const deleteTicket = async (ticketId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const useCase = container.getDeleteTicketUseCase()
      await useCase.execute(ticketId)

      // 楽観的UI更新
      setTickets(tickets.filter((ticket) => ticket.id.toString() !== ticketId))

      // 他のタブに通知
      broadcastService.send('TICKETS_REFRESHED', ticketId)

      // 成功通知
      addNotification({
        type: 'success',
        message: 'チケットを削除しました',
      })
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to delete ticket'
      setError(errorMessage)
      addNotification({
        type: 'error',
        message: errorMessage,
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return {
    createTicket,
    updateTicketStatus,
    updateTicketContent,
    deleteTicket,
  }
}
