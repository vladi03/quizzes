import { describe, expect, it } from 'vitest'
import type { QuizAttempt } from '../types/quiz'
import { getAttemptsByQuizId, getTakenQuizIds } from './attempts'

const attemptFactory = (overrides: Partial<QuizAttempt>): QuizAttempt => ({
  attemptId: 'test',
  quizId: 'quiz-a',
  quizTitle: 'Quiz A',
  startedAt: '2024-01-01T00:00:00.000Z',
  completedAt: '2024-01-01T00:00:10.000Z',
  scorePercent: 50,
  correctCount: 1,
  totalCount: 2,
  answers: [],
  ...overrides,
})

describe('getAttemptsByQuizId', () => {
  const quizId = 'quiz-a'

  it('filters attempts for the requested quiz id only', () => {
    const attempts: QuizAttempt[] = [
      attemptFactory({ attemptId: 'a', quizId }),
      attemptFactory({ attemptId: 'b', quizId: 'other' }),
    ]

    const result = getAttemptsByQuizId(attempts, quizId)
    expect(result).toHaveLength(1)
    expect(result[0].attemptId).toBe('a')
  })

  it('sorts attempts by most recent completedAt first', () => {
    const attempts: QuizAttempt[] = [
      attemptFactory({ attemptId: 'old', quizId, completedAt: '2024-01-01T00:00:00.000Z' }),
      attemptFactory({ attemptId: 'new', quizId, completedAt: '2024-02-01T00:00:00.000Z' }),
    ]

    const result = getAttemptsByQuizId(attempts, quizId)
    expect(result[0].attemptId).toBe('new')
    expect(result[1].attemptId).toBe('old')
  })
})

describe('getTakenQuizIds', () => {
  it('returns an empty set when there are no attempts', () => {
    expect(getTakenQuizIds([]).size).toBe(0)
  })

  it('only lists each quiz id once even with multiple attempts', () => {
    const attempts: QuizAttempt[] = [
      attemptFactory({ attemptId: 'a', quizId: 'quiz-a' }),
      attemptFactory({ attemptId: 'b', quizId: 'quiz-a' }),
    ]

    const result = getTakenQuizIds(attempts)
    expect(result.size).toBe(1)
    expect(result.has('quiz-a')).toBe(true)
  })

  it('includes all quizzes that have at least one attempt', () => {
    const attempts: QuizAttempt[] = [
      attemptFactory({ attemptId: 'a', quizId: 'quiz-a' }),
      attemptFactory({ attemptId: 'b', quizId: 'quiz-b' }),
      attemptFactory({ attemptId: 'c', quizId: 'quiz-c' }),
    ]

    const result = getTakenQuizIds(attempts)
    expect(result.size).toBe(3)
    expect(result.has('quiz-a')).toBe(true)
    expect(result.has('quiz-b')).toBe(true)
    expect(result.has('quiz-c')).toBe(true)
  })
})
