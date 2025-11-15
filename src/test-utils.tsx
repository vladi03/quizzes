import type { ReactElement } from 'react'
import { render } from '@testing-library/react'
import { HashRouter } from 'react-router-dom'
import { vi } from 'vitest'
import { QuizContext } from './context/QuizContext'
import type { Quiz, QuizAttempt } from './types/quiz'

type RenderOptions = {
  quizzes?: Quiz[]
  attempts?: QuizAttempt[]
  loading?: boolean
  error?: string
  quizVersion?: number | null
  recordAttempt?: (attempt: QuizAttempt) => void
  refreshQuizzes?: () => Promise<void>
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
        }}
      >
        {ui}
      </QuizContext.Provider>
    </HashRouter>,
  )
}
