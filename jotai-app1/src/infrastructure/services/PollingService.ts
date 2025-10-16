/**
 * ポーリングサービス
 * 定期的にコールバック関数を実行する
 */
export class PollingService {
  private intervalId: number | null = null
  private isRunning = false

  /**
   * ポーリングを開始
   * @param callback 実行するコールバック関数
   * @param intervalMs ポーリング間隔（ミリ秒）
   */
  start(callback: () => Promise<void>, intervalMs: number): void {
    // 既存のポーリングを停止
    this.stop()

    this.isRunning = true

    // 初回実行
    this.executeCallback(callback)

    // 定期実行
    this.intervalId = window.setInterval(() => {
      this.executeCallback(callback)
    }, intervalMs)

    console.log(`[PollingService] Started polling with interval: ${intervalMs}ms`)
  }

  /**
   * ポーリングを停止
   */
  stop(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId)
      this.intervalId = null
      this.isRunning = false
      console.log('[PollingService] Stopped polling')
    }
  }

  /**
   * ポーリングが実行中かどうか
   */
  isActive(): boolean {
    return this.isRunning
  }

  /**
   * コールバックを実行（エラーハンドリング付き）
   */
  private async executeCallback(callback: () => Promise<void>): Promise<void> {
    try {
      await callback()
    } catch (error) {
      // エラーが発生してもポーリングは継続
      console.error('[PollingService] Error during polling:', error)
    }
  }
}
