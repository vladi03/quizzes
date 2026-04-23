import { afterEach, describe, expect, it, vi } from 'vitest'
import type { QuizCollection } from '../types/quiz'
import { loadQuizzes } from './quizzes'

describe('loadQuizzes', () => {
  const originalFetch = globalThis.fetch
  const manifest = {
    files: ['quizzes_a.json', 'quizzes_b.json'],
  }

  afterEach(() => {
    globalThis.fetch = originalFetch
    vi.restoreAllMocks()
  })

  function mockFetch(payloads: Record<string, unknown>) {
    globalThis.fetch = vi.fn(async (input: string | URL | Request) => {
      const url =
        typeof input === 'string'
          ? input
          : input instanceof URL
            ? input.pathname
            : input.url

      const payload = payloads[url]
      if (!payload) {
        return {
          ok: false,
          json: () => Promise.resolve(undefined),
        } as Response
      }

      return {
        ok: true,
        json: () => Promise.resolve(payload),
      } as Response
    }) as unknown as typeof fetch
  }

  it('returns quizzes merged from every manifest entry when every entry contains a groupId', async () => {
    const payloadA: QuizCollection = {
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
    const payloadB: QuizCollection = {
      version: 2,
      quizzes: [
        {
          id: 'sample-2',
          title: 'Sample Quiz 2',
          description: 'Demo 2',
          groupId: 'Election',
          questions: [],
        },
      ],
    }

    mockFetch({
      '/quizzes_manifest.json': manifest,
      '/quizzes_a.json': payloadA,
      '/quizzes_b.json': payloadB,
    })

    const result = await loadQuizzes()
    expect(result.version).toBe(2)
    expect(result.quizzes).toHaveLength(2)
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

    mockFetch({
      '/quizzes_manifest.json': { files: ['quizzes_a.json'] },
      '/quizzes_a.json': payload,
    })

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

    mockFetch({
      '/quizzes_manifest.json': { files: ['quizzes_a.json'] },
      '/quizzes_a.json': payload,
    })

    await expect(loadQuizzes()).rejects.toThrow(/groupId/)
  })

  it('throws when the manifest contains no matching files', async () => {
    mockFetch({
      '/quizzes_manifest.json': { files: [] },
    })

    await expect(loadQuizzes()).rejects.toThrow(/No quiz files/)
  })
})
