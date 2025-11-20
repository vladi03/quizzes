import type { FormEvent } from 'react'
import { useState } from 'react'
import type { SyncStatus } from '../hooks/useCloudSync'
import { useAuth } from '../hooks/useAuth'
import { useQuizData } from '../hooks/useQuizData'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type Mode = 'signin' | 'signup'

export function AccountMenu() {
  const { user, isAuthenticated, isLoading, signIn, signUp, signOut, isEnabled } =
    useAuth()
  const { cloudSync } = useQuizData()
  const [mode, setMode] = useState<Mode>('signin')
  const [isPanelOpen, setPanelOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [formError, setFormError] = useState<string>()
  const [pending, setPending] = useState(false)

  const toggleMode = () => {
    setMode((prev) => (prev === 'signin' ? 'signup' : 'signin'))
    setFormError(undefined)
  }

  const resetForm = () => {
    setEmail('')
    setPassword('')
    setFormError(undefined)
    setPending(false)
  }

  const closePanel = () => {
    setPanelOpen(false)
    resetForm()
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!isEnabled) {
      setFormError('Cloud sync is disabled by the current build.')
      return
    }
    const trimmedEmail = email.trim()
    if (!emailRegex.test(trimmedEmail)) {
      setFormError('Enter a valid email address.')
      return
    }
    if (password.length < 6) {
      setFormError('Password must be at least 6 characters.')
      return
    }
    try {
      setPending(true)
      if (mode === 'signin') {
        await signIn(trimmedEmail, password)
      } else {
        await signUp(trimmedEmail, password)
      }
      closePanel()
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unable to complete the request.'
      setFormError(message)
    } finally {
      setPending(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
  }

  const openButtonLabel = isAuthenticated ? 'Account' : 'Sign in to Sync'

  return (
    <div className="account-menu">
      {isAuthenticated ? (
        <div className="account-pill">
          <div className="account-pill__line">
            <span className="account-pill__status">Cloud Sync</span>
            <span
              className={`cloud-status cloud-status--${cloudSync.status}`}
              title={cloudSync.error}
            >
              {formatSyncLabel(cloudSync.status)}
            </span>
          </div>
          <div className="account-pill__line">
            <span className="account-pill__email">
              {user?.email ?? 'Signed in'}
            </span>
            <button className="link-button" onClick={handleSignOut}>
              Sign out
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="button button--ghost"
          onClick={() => setPanelOpen((prev) => !prev)}
          aria-expanded={isPanelOpen}
        >
          {isLoading ? 'Checking account...' : openButtonLabel}
        </button>
      )}
      {!isAuthenticated && isPanelOpen && (
        <div
          className="account-panel"
          role="dialog"
          aria-label="Cloud sync account"
        >
          <div className="account-panel__header">
            <div>
              <p className="account-panel__title">Cloud Sync</p>
              <p className="account-panel__subtitle">
                {mode === 'signin'
                  ? 'Sign in to sync quiz results between devices.'
                  : 'Create an account to enable background sync.'}
              </p>
            </div>
            <button
              type="button"
              className="link-button"
              onClick={closePanel}
            >
              Close
            </button>
          </div>

          <form className="account-form" onSubmit={handleSubmit}>
            <label className="account-form__field">
              <span>Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
              />
            </label>
            <label className="account-form__field">
              <span>Password</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={6}
                placeholder="At least 6 characters"
                required
              />
            </label>
            {formError && <p className="form-error">{formError}</p>}
            {!isEnabled && (
              <p className="form-error">
                Firebase env vars missing. Cloud sync unavailable.
              </p>
            )}
            <button
              className="button button--primary"
              type="submit"
              disabled={pending || !isEnabled}
            >
              {pending
                ? 'Working...'
                : mode === 'signin'
                ? 'Sign in'
                : 'Create account'}
            </button>
          </form>

          <p className="account-panel__footer">
            {mode === 'signin' ? "Don't have an account?" : 'Already signed up?'}{' '}
            <button type="button" className="link-button" onClick={toggleMode}>
              {mode === 'signin' ? 'Create one' : 'Sign in'}
            </button>
          </p>
        </div>
      )}
    </div>
  )
}

function formatSyncLabel(status: SyncStatus) {
  switch (status) {
    case 'syncing':
      return 'Syncing'
    case 'success':
      return 'Synced'
    case 'error':
      return 'Using local data'
    case 'disabled':
      return 'Cloud disabled'
    default:
      return 'Ready'
  }
}
