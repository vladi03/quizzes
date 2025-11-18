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

const buildFile = (data: unknown) =>
  new File([JSON.stringify(data)], 'results.json', {
    type: 'application/json',
  })

describe('ExportButtons', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    window.localStorage.clear()
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

  it('exports quiz results with transfer metadata', async () => {
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
    const payload = spy.mock.calls[0]?.[0] as {
      version?: number
      attempts?: QuizAttempt[]
    }
    expect(payload?.version).toBeGreaterThanOrEqual(1)
    expect(payload?.attempts?.length).toBe(1)
    expect(payload?.attempts?.[0]?.attemptId).toBeTruthy()
  })

  it('renders import controls', () => {
    renderWithProviders(<ExportButtons />)
    expect(
      screen.getByRole('button', { name: /Import Results/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Import results exported from this app/i),
    ).toBeInTheDocument()
  })

  it('imports attempts from a valid file and shows success message', async () => {
    const user = userEvent.setup()
    const importAttempts = vi
      .fn()
      .mockReturnValue({ importedCount: 1, skippedCount: 0 })
    renderWithProviders(<ExportButtons />, { importAttempts })
    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement
    await user.upload(
      input,
      buildFile({ version: 1, attempts: [attempt] }),
    )

    expect(importAttempts).toHaveBeenCalledWith([
      expect.objectContaining({ attemptId: attempt.attemptId }),
    ])
    expect(
      await screen.findByText(/Imported 1 attempt/i),
    ).toBeInTheDocument()
  })

  it('shows an error for invalid JSON', async () => {
    const user = userEvent.setup()
    const importAttempts = vi.fn()
    renderWithProviders(<ExportButtons />, { importAttempts })
    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement
    const badFile = new File(['not valid'], 'invalid.json', {
      type: 'application/json',
    })
    await user.upload(input, badFile)
    expect(importAttempts).not.toHaveBeenCalled()
    expect(
      await screen.findByText(/Invalid results file/i),
    ).toBeInTheDocument()
  })

  it('shows an error when attempts array is missing', async () => {
    const user = userEvent.setup()
    const importAttempts = vi.fn()
    renderWithProviders(<ExportButtons />, { importAttempts })
    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement
    await user.upload(input, buildFile({ version: 1 }))
    expect(importAttempts).not.toHaveBeenCalled()
    expect(
      await screen.findByText(/Invalid results file/i),
    ).toBeInTheDocument()
  })
})
