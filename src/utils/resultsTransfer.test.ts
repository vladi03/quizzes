import { describe, expect, it, vi, afterEach } from 'vitest'
import type { QuizAttempt } from '../types/quiz'
import { buildResultsExportPayload, mergeImportedAttempts } from './resultsTransfer'

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

afterEach(() => {
  vi.useRealTimers()
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

describe('buildResultsExportPayload', () => {
  it('wraps attempts with metadata', () => {
    const fixedDate = new Date('2025-01-02T00:00:00.000Z')
    vi.useFakeTimers()
    vi.setSystemTime(fixedDate)
    const payload = buildResultsExportPayload([makeAttempt('1')])
    expect(payload.version).toBeGreaterThanOrEqual(1)
    expect(payload.exportedAt).toBe(fixedDate.toISOString())
    expect(payload.attempts).toHaveLength(1)
  })

  it('handles empty attempt lists', () => {
    const payload = buildResultsExportPayload([])
    expect(payload.attempts).toEqual([])
    expect(payload.exportedAt).toEqual(expect.any(String))
  })
})
