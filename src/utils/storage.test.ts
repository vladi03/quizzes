import { beforeEach, describe, expect, it } from 'vitest'
import type { QuizAttempt } from '../types/quiz'
import {
  ATTEMPTS_STORAGE_KEY,
  getAttempts,
  saveAttempt,
  writeAttempts,
} from './storage'

const attempt: QuizAttempt = {
  attemptId: '1',
  quizId: 'sample-quiz',
  quizTitle: 'Sample Quiz',
  startedAt: new Date().toISOString(),
  completedAt: new Date().toISOString(),
  scorePercent: 50,
  correctCount: 1,
  totalCount: 2,
  answers: [],
}

describe('storage utilities', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('returns an empty array when localStorage is empty', () => {
    expect(getAttempts()).toEqual([])
  })

  it('gracefully handles corrupted JSON', () => {
    window.localStorage.setItem(ATTEMPTS_STORAGE_KEY, '{bad json')
    expect(getAttempts()).toEqual([])
  })

  it('saves and retrieves attempts', () => {
    saveAttempt(attempt)
    const stored = getAttempts()
    expect(stored).toHaveLength(1)
    expect(stored[0].quizId).toBe('sample-quiz')
  })

  it('overwrites attempts when writeAttempts is called', () => {
    saveAttempt(attempt)
    writeAttempts([])
    expect(getAttempts()).toEqual([])
  })
})
