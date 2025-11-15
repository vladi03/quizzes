type StatusMessageProps = {
  title: string
  message: string
  variant?: 'info' | 'error'
}

export function StatusMessage({
  title,
  message,
  variant = 'info',
}: StatusMessageProps) {
  return (
    <div className={`status-message status-message--${variant}`}>
      <h3>{title}</h3>
      <p>{message}</p>
    </div>
  )
}
