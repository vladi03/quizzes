import userEvent from '@testing-library/user-event'
import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { sampleQuiz } from '../__mocks__/quizSample'
import { renderWithProviders } from '../test-utils'
import type { QuizAttempt } from '../types/quiz'
import * as downloadModule from '../utils/download'
import { ExportButtons } from './ExportButtons'

const attempt: QuizAttempt = {
  attemptId: '2',
  quizId: sampleQuiz.id,
  quizTitle: sampleQuiz.title,
  startedAt: new Date().toISOString(),
  completedAt: new Date().toISOString(),
  scorePercent: 80,
  correctCount: 2,
  totalCount: 2,
  answers: [],
}

describe('ExportButtons', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('exports quiz catalog', async () => {
    const user = userEvent.setup()
    const spy = vi.spyOn(downloadModule, 'downloadJson').mockImplementation(
      () => {},
    )
    renderWithProviders(<ExportButtons />, {
      quizzes: [sampleQuiz],
      attempts: [attempt],
      quizVersion: 5,
    })

    await user.click(screen.getByText(/Export Quiz Data/i))
    expect(spy).toHaveBeenCalledWith(
      { version: 5, quizzes: [sampleQuiz] },
      'quizzes-export.json',
    )
  })

  it('exports quiz results', async () => {
    const user = userEvent.setup()
    const spy = vi.spyOn(downloadModule, 'downloadJson').mockImplementation(
      () => {},
    )
    renderWithProviders(<ExportButtons />, {
      quizzes: [sampleQuiz],
      attempts: [attempt],
    })

    await user.click(screen.getByText(/Export Quiz Results/i))
    expect(spy.mock.lastCall?.[1]).toBe('quiz-results-export.json')
    expect(spy.mock.calls[0][0]).toMatchObject({
      attempts: [attempt],
    })
  })
})
