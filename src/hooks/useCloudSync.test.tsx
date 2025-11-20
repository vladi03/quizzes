import { act, renderHook, waitFor } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import type { AuthContextValue } from '../context/AuthContext'
import type { QuizAttempt } from '../types/quiz'
import { useCloudSync } from './useCloudSync'

const syncMocks = vi.hoisted(() => ({
  fetchRemoteAttempts: vi.fn(),
  pushAttempts: vi.fn(),
  writeAttempts: vi.fn(),
}))

vi.mock('../services/quizSyncService', async () => {
  const actual = await vi.importActual<typeof import('../services/quizSyncService')>(
    '../services/quizSyncService',
  )
  return {
    ...actual,
    fetchRemoteAttempts: syncMocks.fetchRemoteAttempts,
    pushAttempts: syncMocks.pushAttempts,
  }
})

vi.mock('../utils/storage', () => ({
  writeAttempts: syncMocks.writeAttempts,
}))

function buildAttempt(id: string): QuizAttempt {
  return {
    attemptId: id,
    quizId: `quiz-${id}`,
    quizTitle: `Quiz ${id}`,
    startedAt: '2025-01-01T00:00:00.000Z',
    completedAt: '2025-01-01T00:00:10.000Z',
    scorePercent: 90,
    correctCount: 9,
    totalCount: 10,
    answers: [
      {
        questionId: 'q1',
        questionNumber: 1,
        selectedOptionId: 'a',
        correctOptionId: 'a',
        isCorrect: true,
      },
    ],
  }
}

const baseAuth: AuthContextValue = {
  user: { uid: 'user-1', email: 'user@example.com' },
  isLoading: false,
  isAuthenticated: true,
  isReady: true,
  isEnabled: true,
  signIn: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useCloudSync', () => {
  it('merges remote attempts and pushes local-only results', async () => {
    const localAttempt = buildAttempt('local')
    const remoteAttempt = buildAttempt('remote')
    syncMocks.fetchRemoteAttempts.mockResolvedValueOnce([remoteAttempt])
    syncMocks.pushAttempts.mockResolvedValueOnce(undefined)

    const { result } = renderHook(() => {
      const [attempts, setAttempts] = useState([localAttempt])
      return useCloudSync({ attempts, setAttempts, auth: baseAuth })
    })

    await waitFor(() => {
      expect(syncMocks.pushAttempts).toHaveBeenCalled()
    })
    expect(syncMocks.writeAttempts).toHaveBeenCalledWith(
      expect.arrayContaining([localAttempt, remoteAttempt]),
    )
    expect(syncMocks.pushAttempts).toHaveBeenCalledWith(
      'user-1',
      expect.arrayContaining([localAttempt]),
    )
    expect(result.current.notification).not.toBeNull()
    expect(result.current.lastImportedCount).toBe(1)
    expect(result.current.status).toBe('success')
  })

  it('pushes individual attempts and surfaces errors', async () => {
    syncMocks.fetchRemoteAttempts.mockResolvedValue([])
    syncMocks.pushAttempts.mockRejectedValueOnce(new Error('offline'))

    const { result } = renderHook(() => {
      const [attempts, setAttempts] = useState<QuizAttempt[]>([])
      return useCloudSync({ attempts, setAttempts, auth: baseAuth })
    })

    const attempt = buildAttempt('solo')
    await act(async () => {
      await result.current.pushAttempt(attempt)
    })
    expect(result.current.status).toBe('error')
    expect(result.current.error).toMatch(/Unable to sync/)
  })

  it('disables sync when auth is not enabled', async () => {
    const disabledAuth: AuthContextValue = {
      ...baseAuth,
      isEnabled: false,
      user: null,
      isAuthenticated: false,
    }
    const { result } = renderHook(() => {
      const [attempts, setAttempts] = useState<QuizAttempt[]>([])
      return useCloudSync({ attempts, setAttempts, auth: disabledAuth })
    })

    await act(async () => {
      await result.current.triggerSync()
    })
    expect(syncMocks.fetchRemoteAttempts).not.toHaveBeenCalled()
    expect(result.current.status).toBe('disabled')
  })
})
