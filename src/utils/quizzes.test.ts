import { afterEach, describe, expect, it, vi } from 'vitest'
import type { QuizCollection } from '../types/quiz'
import { loadQuizzes } from './quizzes'

describe('loadQuizzes', () => {
  const originalFetch = globalThis.fetch

  afterEach(() => {
    globalThis.fetch = originalFetch
    vi.restoreAllMocks()
  })

  it('returns quizzes when every entry contains a groupId', async () => {
    const payload: QuizCollection = {
      version: 1,
      quizzes: [
        {
          id: 'sample',
          title: 'Sample Quiz',
          description: 'Demo',
          groupId: 'Union with Christ',
          questions: [],
        },
      ],
    }
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(payload),
    }) as unknown as typeof fetch

    const result = await loadQuizzes()
    expect(result.quizzes).toHaveLength(1)
    expect(result.quizzes[0].groupId).toBe('Union with Christ')
  })

  it('trims whitespace from groupId values', async () => {
    const payload: QuizCollection = {
      version: 1,
      quizzes: [
        {
          id: 'sample',
          title: 'Sample Quiz',
          description: 'Demo',
          groupId: '  Millennial Views  ',
          questions: [],
        },
      ],
    }
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(payload),
    }) as unknown as typeof fetch

    const result = await loadQuizzes()
    expect(result.quizzes[0].groupId).toBe('Millennial Views')
  })

  it('throws when a quiz omits the required groupId', async () => {
    const payload = {
      version: 1,
      quizzes: [
        {
          id: 'sample',
          title: 'Sample Quiz',
          description: 'Demo',
          questions: [],
        },
      ],
    }
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(payload),
    }) as unknown as typeof fetch

    await expect(loadQuizzes()).rejects.toThrow(/groupId/)
  })
})
