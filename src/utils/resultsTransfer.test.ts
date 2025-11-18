import { describe, expect, it } from 'vitest'
import type { QuizAttempt } from '../types/quiz'
import { mergeImportedAttempts } from './resultsTransfer'

const baseAttempt: QuizAttempt = {
  attemptId: 'a',
  quizId: 'theology-101',
  quizTitle: 'Systematic Theology Basics',
  startedAt: '2025-01-01T00:00:00.000Z',
  completedAt: '2025-01-01T00:10:00.000Z',
  scorePercent: 90,
  correctCount: 9,
  totalCount: 10,
  answers: [],
}

const makeAttempt = (id: string, quizId = 'theology-101'): QuizAttempt => ({
  ...baseAttempt,
  attemptId: id,
  quizId,
})

describe('mergeImportedAttempts', () => {
  it('appends all attempts when no overlap exists', () => {
    const existing = [makeAttempt('1')]
    const incoming = [makeAttempt('2'), makeAttempt('3')]
    const { merged, summary } = mergeImportedAttempts(existing, incoming)
    expect(merged).toHaveLength(3)
    expect(summary).toEqual({ importedCount: 2, skippedCount: 0 })
  })

  it('skips duplicates based on attemptId', () => {
    const existing = [makeAttempt('same'), makeAttempt('unique')]
    const incoming = [makeAttempt('same'), makeAttempt('new')]
    const { merged, summary } = mergeImportedAttempts(existing, incoming)
    expect(merged).toHaveLength(3)
    expect(summary).toEqual({ importedCount: 1, skippedCount: 1 })
    expect(merged.some((attempt) => attempt.attemptId === 'new')).toBe(true)
  })

  it('reports when every incoming attempt is already present', () => {
    const existing = [makeAttempt('alpha')]
    const incoming = [makeAttempt('alpha')]
    const { merged, summary } = mergeImportedAttempts(existing, incoming)
    expect(merged).toEqual(existing)
    expect(summary).toEqual({ importedCount: 0, skippedCount: 1 })
  })
})
