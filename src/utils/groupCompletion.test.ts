import { describe, expect, it } from 'vitest'
import type { Quiz, QuizAttempt } from '../types/quiz'
import {
  buildGroupCompletionMap,
  isGroupFullyCompleted,
} from './groupCompletion'

const makeQuiz = (overrides: Partial<Quiz>): Quiz => ({
  id: overrides.id ?? 'quiz-1',
  title: overrides.title ?? 'Sample Quiz',
  description: overrides.description ?? 'Description',
  groupId: overrides.groupId ?? 'default-group',
  questions: overrides.questions ?? [],
})

const baseAttempt: QuizAttempt = {
  attemptId: 'attempt-1',
  quizId: 'quiz-1',
  quizTitle: 'Sample Quiz',
  startedAt: '2025-01-01T00:00:00.000Z',
  completedAt: '2025-01-01T00:05:00.000Z',
  scorePercent: 100,
  correctCount: 2,
  totalCount: 2,
  answers: [],
}

const makeAttempt = (overrides: Partial<QuizAttempt>): QuizAttempt => ({
  ...baseAttempt,
  ...overrides,
})

describe('group completion helpers', () => {
  it('returns true when every quiz in the group has attempts', () => {
    const quizzes = [
      makeQuiz({ id: 'grace', groupId: 'soteriology' }),
      makeQuiz({ id: 'atonement', groupId: 'soteriology' }),
    ]
    const attempts = [
      makeAttempt({ attemptId: '1', quizId: 'grace' }),
      makeAttempt({ attemptId: '2', quizId: 'atonement' }),
    ]

    expect(isGroupFullyCompleted('soteriology', quizzes, attempts)).toBe(true)
  })

  it('returns false when a quiz in the group is missing attempts', () => {
    const quizzes = [
      makeQuiz({ id: 'grace', groupId: 'soteriology' }),
      makeQuiz({ id: 'atonement', groupId: 'soteriology' }),
    ]
    const attempts = [makeAttempt({ attemptId: '1', quizId: 'grace' })]

    expect(isGroupFullyCompleted('soteriology', quizzes, attempts)).toBe(false)
  })

  it('returns false when the group has no quizzes', () => {
    const quizzes = [
      makeQuiz({ id: 'grace', groupId: 'soteriology' }),
      makeQuiz({ id: 'hope', groupId: 'eschatology' }),
    ]
    const attempts = [makeAttempt({ attemptId: '1', quizId: 'grace' })]

    expect(isGroupFullyCompleted('ethics', quizzes, attempts)).toBe(false)
  })

  it('builds a completion map for every group', () => {
    const quizzes = [
      makeQuiz({ id: 'grace', groupId: 'soteriology' }),
      makeQuiz({ id: 'atonement', groupId: 'soteriology' }),
      makeQuiz({ id: 'hope', groupId: 'eschatology' }),
    ]
    const attempts = [
      makeAttempt({ attemptId: '1', quizId: 'grace' }),
      makeAttempt({ attemptId: '2', quizId: 'atonement' }),
    ]

    const map = buildGroupCompletionMap(quizzes, attempts)
    expect(map.soteriology).toBe(true)
    expect(map.eschatology).toBe(false)
  })
})
