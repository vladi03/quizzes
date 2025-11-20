import { useEffect } from 'react'
import { useQuizData } from '../hooks/useQuizData'

const TOAST_DURATION_MS = 4000

export function CloudSyncToast() {
  const {
    cloudSync: { notification, dismissNotification },
  } = useQuizData()

  useEffect(() => {
    if (!notification) {
      return
    }
    const timer = window.setTimeout(() => {
      dismissNotification()
    }, TOAST_DURATION_MS)
    return () => window.clearTimeout(timer)
  }, [notification, dismissNotification])

  if (!notification) {
    return null
  }

  const { count } = notification
  return (
    <div className="cloud-toast" role="status" aria-live="polite">
      <span>
        Imported {count}{' '}
        {count === 1 ? 'quiz result' : 'quiz results'} from the cloud.
      </span>
      <button
        type="button"
        className="link-button"
        onClick={dismissNotification}
        aria-label="Dismiss cloud sync notification"
      >
        Dismiss
      </button>
    </div>
  )
}
