interface ErrorMessageProps {
  message: string
}

/**
 * エラーメッセージコンポーネント
 */
export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return (
    <div
      style={{
        padding: '16px',
        margin: '16px 0',
        backgroundColor: '#fee',
        border: '1px solid #fcc',
        borderRadius: '8px',
        color: '#c33',
      }}
    >
      <strong>Error:</strong> {message}
    </div>
  )
}
