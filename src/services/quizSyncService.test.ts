import { describe, expect, it } from 'vitest'
import type { QuizAttempt } from '../types/quiz'
import { mergeLocalAndRemote } from './quizSyncService'

function buildAttempt(
  id: string,
  overrides: Partial<QuizAttempt> = {},
): QuizAttempt {
  return {
    attemptId: id,
    quizId: 'quiz-' + id,
    quizTitle: 'Quiz ' + id,
    startedAt: '2025-01-01T00:00:00.000Z',
    completedAt: `2025-01-01T00:00:0${id}Z`,
    scorePercent: 80,
    correctCount: 4,
    totalCount: 5,
    answers: [
      {
        questionId: 'q1',
        questionNumber: 1,
        selectedOptionId: 'a',
        correctOptionId: 'a',
        isCorrect: true,
      },
    ],
    ...overrides,
  }
}

describe('mergeLocalAndRemote', () => {
  it('imports every remote attempt when local storage is empty', () => {
    const remote = [buildAttempt('1'), buildAttempt('2')]
    const result = mergeLocalAndRemote([], remote)
    expect(result.importedCount).toBe(2)
    expect(result.merged).toHaveLength(2)
  })

  it('ignores remote attempts that already exist locally', () => {
    const attempt = buildAttempt('1')
    const result = mergeLocalAndRemote([attempt], [attempt])
    expect(result.importedCount).toBe(0)
    expect(result.merged).toHaveLength(1)
  })

  it('imports only unique remote attempts when there is overlap', () => {
    const local = [buildAttempt('1'), buildAttempt('2')]
    const remote = [buildAttempt('2'), buildAttempt('3')]
    const result = mergeLocalAndRemote(local, remote)
    expect(result.importedCount).toBe(1)
    const ids = result.merged.map((attempt) => attempt.attemptId)
    expect(ids).toContain('3')
    expect(ids).toHaveLength(3)
  })

  it('handles empty arrays gracefully', () => {
    const result = mergeLocalAndRemote([], [])
    expect(result.importedCount).toBe(0)
    expect(result.merged).toHaveLength(0)
  })
})
