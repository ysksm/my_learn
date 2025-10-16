import { atom } from 'jotai'

export interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  message: string
  timestamp: number
}

/**
 * 通知一覧のatom
 */
export const notificationsAtom = atom<Notification[]>([])

/**
 * 最終更新時刻のatom
 */
export const lastUpdatedAtom = atom<Date | null>(null)

/**
 * 通知を追加するatom（write-only）
 */
export const addNotificationAtom = atom(
  null,
  (get, set, notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    }

    const notifications = get(notificationsAtom)
    set(notificationsAtom, [...notifications, newNotification])

    // 3秒後に自動削除
    setTimeout(() => {
      const current = get(notificationsAtom)
      set(
        notificationsAtom,
        current.filter((n) => n.id !== newNotification.id)
      )
    }, 3000)
  }
)

/**
 * 通知を削除するatom（write-only）
 */
export const removeNotificationAtom = atom(null, (get, set, id: string) => {
  const notifications = get(notificationsAtom)
  set(
    notificationsAtom,
    notifications.filter((n) => n.id !== id)
  )
})
