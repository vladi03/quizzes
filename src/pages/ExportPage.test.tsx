import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import type { QuizAttempt } from '../types/quiz'
import { renderWithProviders } from '../test-utils'
import { ExportPage } from './ExportPage'
import { downloadJson } from '../utils/download'

vi.mock('../utils/download', async () => {
  const actual = await vi.importActual<typeof import('../utils/download')>(
    '../utils/download',
  )
  return {
    ...actual,
    downloadJson: vi.fn(),
  }
})

const sampleAttempt: QuizAttempt = {
  attemptId: 'attempt-1',
  quizId: 'doctrine',
  quizTitle: 'Doctrine Basics',
  startedAt: '2025-01-01T00:00:00.000Z',
  completedAt: '2025-01-01T00:05:00.000Z',
  scorePercent: 80,
  correctCount: 4,
  totalCount: 5,
  answers: [],
}

describe('ExportPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('downloads the export payload with the latest attempts', async () => {
    renderWithProviders(<ExportPage />, { attempts: [sampleAttempt] })

    await userEvent.click(
      screen.getByRole('button', { name: /Download Export File/i }),
    )

    expect(downloadJson).toHaveBeenCalledWith(
      expect.objectContaining({
        attempts: [sampleAttempt],
        version: expect.any(Number),
      }),
      'quizspark-results-export.json',
    )
    expect(
      screen.getByText(/Download started — 1 attempt bundled./i),
    ).toBeInTheDocument()
  })

  it('copies the JSON to the clipboard when requested', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, {
      clipboard: {
        writeText,
      },
    })
    renderWithProviders(<ExportPage />, { attempts: [] })

    await userEvent.click(
      screen.getByRole('button', { name: /Copy JSON to Clipboard/i }),
    )

    expect(writeText).toHaveBeenCalledWith(
      expect.stringContaining('"attempts": []'),
    )
    expect(
      await screen.findByText(/Export JSON copied to your clipboard/i),
    ).toBeInTheDocument()
  })
})
