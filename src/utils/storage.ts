import type { QuizAttempt } from '../types/quiz'

export const ATTEMPTS_STORAGE_KEY = 'quizAttempts'

export function getAttempts(): QuizAttempt[] {
  if (typeof window === 'undefined') {
    return []
  }

  const raw = window.localStorage.getItem(ATTEMPTS_STORAGE_KEY)
  if (!raw) {
    return []
  }

  try {
    const parsed = JSON.parse(raw) as QuizAttempt[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function writeAttempts(attempts: QuizAttempt[]): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(ATTEMPTS_STORAGE_KEY, JSON.stringify(attempts))
}

export function saveAttempt(attempt: QuizAttempt): void {
  const attempts = getAttempts()
  attempts.push(attempt)
  writeAttempts(attempts)
}
