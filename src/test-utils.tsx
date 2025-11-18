import type { ReactElement } from 'react'
import { render } from '@testing-library/react'
import { HashRouter } from 'react-router-dom'
import { vi } from 'vitest'
import { QuizContext } from './context/QuizContext'
import type { Quiz, QuizAttempt } from './types/quiz'
import type { ImportSummary } from './utils/resultsTransfer'

type RenderOptions = {
  quizzes?: Quiz[]
  attempts?: QuizAttempt[]
  loading?: boolean
  error?: string
  quizVersion?: number | null
  recordAttempt?: (attempt: QuizAttempt) => void
  refreshQuizzes?: () => Promise<void>
  importAttempts?: (incoming: QuizAttempt[]) => ImportSummary
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
  }: RenderOptions = {},
) {
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
        }}
      >
        {ui}
      </QuizContext.Provider>
    </HashRouter>,
  )
}
