/**
 * BroadcastChannelサービス
 * 同じブラウザの複数タブ間でメッセージを送受信
 */

export type BroadcastMessageType =
  | 'TICKET_CREATED'
  | 'TICKET_UPDATED'
  | 'TICKET_DELETED'
  | 'TICKETS_REFRESHED'

export interface BroadcastMessage {
  type: BroadcastMessageType
  ticketId?: string
  timestamp: number
}

export class BroadcastService {
  private channel: BroadcastChannel | null = null
  private listeners: Map<BroadcastMessageType, Set<(message: BroadcastMessage) => void>> =
    new Map()

  /**
   * BroadcastChannelを初期化
   */
  initialize(): void {
    if (this.channel) {
      return // 既に初期化済み
    }

    try {
      this.channel = new BroadcastChannel('ticket-updates')

      this.channel.onmessage = (event: MessageEvent<BroadcastMessage>) => {
        const message = event.data
        console.log('[BroadcastService] Received message:', message)

        // 登録されたリスナーを呼び出し
        const listeners = this.listeners.get(message.type)
        if (listeners) {
          listeners.forEach((listener) => listener(message))
        }
      }

      console.log('[BroadcastService] Initialized')
    } catch (error) {
      console.error('[BroadcastService] Failed to initialize:', error)
    }
  }

  /**
   * メッセージを送信
   */
  send(type: BroadcastMessageType, ticketId?: string): void {
    if (!this.channel) {
      console.warn('[BroadcastService] Channel not initialized')
      return
    }

    const message: BroadcastMessage = {
      type,
      ticketId,
      timestamp: Date.now(),
    }

    try {
      this.channel.postMessage(message)
      console.log('[BroadcastService] Sent message:', message)
    } catch (error) {
      console.error('[BroadcastService] Failed to send message:', error)
    }
  }

  /**
   * メッセージリスナーを登録
   */
  on(
    type: BroadcastMessageType,
    listener: (message: BroadcastMessage) => void
  ): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set())
    }

    this.listeners.get(type)!.add(listener)

    // アンサブスクライブ関数を返す
    return () => {
      const listeners = this.listeners.get(type)
      if (listeners) {
        listeners.delete(listener)
      }
    }
  }

  /**
   * BroadcastChannelをクローズ
   */
  close(): void {
    if (this.channel) {
      this.channel.close()
      this.channel = null
      this.listeners.clear()
      console.log('[BroadcastService] Closed')
    }
  }

  /**
   * チャンネルがアクティブかどうか
   */
  isActive(): boolean {
    return this.channel !== null
  }
}
