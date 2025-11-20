import type { ReactElement } from 'react'
import { render } from '@testing-library/react'
import { HashRouter } from 'react-router-dom'
import { vi } from 'vitest'
import { QuizContext } from './context/QuizContext'
import type { Quiz, QuizAttempt } from './types/quiz'
import type { ImportSummary } from './utils/resultsTransfer'
import type { ImportNotification, SyncStatus } from './hooks/useCloudSync'

type RenderOptions = {
  quizzes?: Quiz[]
  attempts?: QuizAttempt[]
  loading?: boolean
  error?: string
  quizVersion?: number | null
  recordAttempt?: (attempt: QuizAttempt) => void
  refreshQuizzes?: () => Promise<void>
  importAttempts?: (incoming: QuizAttempt[]) => ImportSummary
  cloudSync?: Partial<{
    status: SyncStatus
    isEnabled: boolean
    error?: string
    lastSyncTime?: string
    lastImportedCount: number
    notification: ImportNotification | null
    triggerSync: () => Promise<void>
    dismissNotification: () => void
  }>
}

export function renderWithProviders(
  ui: ReactElement,
  {
    quizzes = [],
    attempts = [],
    loading = false,
    error,
    quizVersion = 1,
    recordAttempt = vi.fn(),
    refreshQuizzes = vi.fn(),
    importAttempts = vi.fn().mockReturnValue({ importedCount: 0, skippedCount: 0 }),
    cloudSync = {},
  }: RenderOptions = {},
) {
  const cloudSyncDefaults = {
    status: 'disabled' as SyncStatus,
    isEnabled: false,
    error: undefined,
    lastSyncTime: undefined,
    lastImportedCount: 0,
    notification: null,
    triggerSync: vi.fn(),
    dismissNotification: vi.fn(),
    ...cloudSync,
  }

  return render(
    <HashRouter>
      <QuizContext.Provider
        value={{
          quizzes,
          quizVersion,
          attempts,
          loading,
          error,
          refreshQuizzes,
          recordAttempt,
          importAttempts,
          cloudSync: cloudSyncDefaults,
        }}
      >
        {ui}
      </QuizContext.Provider>
    </HashRouter>,
  )
}
