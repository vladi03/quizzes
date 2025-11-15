import userEvent from '@testing-library/user-event'
import { screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { sampleQuiz } from '../__mocks__/quizSample'
import { renderWithProviders } from '../test-utils'
import type { QuizAttempt } from '../types/quiz'
import { QuizListPage } from './QuizListPage'

const baseAttempt: QuizAttempt = {
  attemptId: '1',
  quizId: sampleQuiz.id,
  quizTitle: sampleQuiz.title,
  startedAt: new Date().toISOString(),
  completedAt: new Date().toISOString(),
  scorePercent: 50,
  correctCount: 1,
  totalCount: 2,
  answers: [],
}

describe('QuizListPage', () => {
  afterEach(() => {
    window.location.hash = '#/'
  })

  it('renders every available quiz entry', () => {
    renderWithProviders(<QuizListPage />, {
      quizzes: [sampleQuiz],
    })

    expect(screen.getByText(sampleQuiz.title)).toBeInTheDocument()
    expect(screen.getByText(/2 questions/i)).toBeInTheDocument()
  })

  it('summarizes completed quizzes with latest attempt data', () => {
    renderWithProviders(<QuizListPage />, {
      quizzes: [sampleQuiz],
      attempts: [baseAttempt],
    })

    expect(screen.getByText(/50%/)).toBeInTheDocument()
    expect(screen.getByText(/1 of 2 correct/)).toBeInTheDocument()
  })

  it('navigates when Start Quiz is clicked', async () => {
    window.location.hash = '#/'
    const user = userEvent.setup()

    renderWithProviders(<QuizListPage />, {
      quizzes: [sampleQuiz],
    })

    await user.click(screen.getByText(/Start Quiz/i))
    expect(window.location.hash.endsWith(`/quiz/${sampleQuiz.id}`)).toBe(true)
  })

  it('shows friendly empty state when no attempts exist', () => {
    renderWithProviders(<QuizListPage />, {
      quizzes: [sampleQuiz],
    })
    expect(screen.getByText(/No attempts yet/i)).toBeInTheDocument()
  })

  it('applies stacked layout class for narrow screens', () => {
    const original = window.matchMedia
    window.matchMedia = vi.fn().mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }) as unknown as typeof window.matchMedia

    renderWithProviders(<QuizListPage />, {
      quizzes: [sampleQuiz],
    })

    expect(document.querySelector('.quiz-grid--stack')).toBeTruthy()
    window.matchMedia = original
  })
})
