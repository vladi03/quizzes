import type { ReactNode } from 'react'
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { Quiz, QuizAttempt } from '../types/quiz'
import { getAttempts, saveAttempt } from '../utils/storage'
import { loadQuizzes } from '../utils/quizzes'

type QuizContextValue = {
  quizzes: Quiz[]
  quizVersion: number | null
  attempts: QuizAttempt[]
  loading: boolean
  error?: string
  refreshQuizzes: () => Promise<void>
  recordAttempt: (attempt: QuizAttempt) => void
}

export const QuizContext = createContext<QuizContextValue | undefined>(undefined)

export function QuizProvider({ children }: { children: ReactNode }) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [quizVersion, setQuizVersion] = useState<number | null>(null)
  const [attempts, setAttempts] = useState<QuizAttempt[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>()

  const refreshQuizzes = useCallback(async () => {
    setLoading(true)
    try {
      const payload = await loadQuizzes()
      setQuizzes(payload.quizzes)
      setQuizVersion(payload.version ?? 1)
      setError(undefined)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to fetch quiz content.',
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    setAttempts(getAttempts())
    refreshQuizzes()
  }, [refreshQuizzes])

  const recordAttempt = useCallback((attempt: QuizAttempt) => {
    setAttempts((prev) => {
      const next = [...prev, attempt]
      return next
    })
    saveAttempt(attempt)
  }, [])

  const value = useMemo<QuizContextValue>(
    () => ({
      quizzes,
      quizVersion,
      attempts,
      loading,
      error,
      refreshQuizzes,
      recordAttempt,
    }),
    [quizzes, quizVersion, attempts, loading, error, refreshQuizzes, recordAttempt],
  )

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>
}
