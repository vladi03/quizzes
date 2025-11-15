import userEvent from '@testing-library/user-event'
import { screen, within } from '@testing-library/react'
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

    const completedCard = screen.getByText(sampleQuiz.title).closest('.card')
    expect(completedCard).toBeTruthy()
    const cardQueries = within(completedCard as HTMLElement)
    const summaryPercent = cardQueries.getByText((content, element) => {
      return Boolean(
        element?.tagName === 'SPAN' &&
          element.parentElement?.classList.contains('score') &&
          content.includes('%'),
      )
    })
    const summaryDetail = cardQueries.getByText((content, element) => {
      return Boolean(
        element?.tagName === 'SMALL' &&
          element.parentElement?.classList.contains('score') &&
          content.includes('1 of 2 correct'),
      )
    })

    expect(summaryPercent).toHaveTextContent('50%')
    expect(summaryDetail).toBeInTheDocument()
  })

  it('hides quizzes from the available list once they have an attempt', () => {
    renderWithProviders(<QuizListPage />, {
      quizzes: [sampleQuiz],
      attempts: [baseAttempt],
    })

    expect(screen.queryByRole('link', { name: /Start Quiz/i })).not.toBeInTheDocument()
  })

  it('shows the most recent attempt summary in completed quizzes (baseline)', () => {
    const olderAttempt: QuizAttempt = {
      ...baseAttempt,
      attemptId: 'old',
      completedAt: '2024-01-01T00:00:00.000Z',
      scorePercent: 25,
      correctCount: 0,
    }
    const recentAttempt: QuizAttempt = {
      ...baseAttempt,
      attemptId: 'recent',
      completedAt: '2024-02-01T00:00:00.000Z',
      scorePercent: 75,
      correctCount: 1,
      totalCount: 2,
    }

    renderWithProviders(<QuizListPage />, {
      quizzes: [sampleQuiz],
      attempts: [olderAttempt, recentAttempt],
    })

    const completedCard = screen.getByText(sampleQuiz.title).closest('.card')
    const cardQueries = within(completedCard as HTMLElement)
    const summaryPercent = cardQueries.getByText((content, element) =>
      Boolean(
        element?.tagName === 'SPAN' &&
          element.parentElement?.classList.contains('score') &&
          content.includes('%'),
      ),
    )

    expect(summaryPercent).toHaveTextContent('75%')
    expect(
      cardQueries.queryByText((content, element) =>
        Boolean(
          element?.tagName === 'SPAN' &&
            element.parentElement?.classList.contains('score') &&
            content.includes('25%'),
        ),
      ),
    ).not.toBeInTheDocument()
  })

  it('shows an "all caught up" message when every quiz has been taken', () => {
    renderWithProviders(<QuizListPage />, {
      quizzes: [sampleQuiz],
      attempts: [baseAttempt],
    })

    expect(
      screen.getByText(/You've completed every quiz/i),
    ).toBeInTheDocument()
  })

  it('renders a table with every attempt plus review actions', () => {
    const attempts: QuizAttempt[] = [
      {
        ...baseAttempt,
        attemptId: 'recent',
        completedAt: '2024-03-02T12:00:00.000Z',
        scorePercent: 80,
        correctCount: 2,
        totalCount: 2,
      },
      {
        ...baseAttempt,
        attemptId: 'older',
        completedAt: '2024-01-15T09:00:00.000Z',
        scorePercent: 40,
        correctCount: 1,
        totalCount: 2,
      },
    ]

    renderWithProviders(<QuizListPage />, {
      quizzes: [sampleQuiz],
      attempts,
    })

    const table = screen.getByRole('table', {
      name: /Sample Quiz completed attempts/i,
    })
    const rows = within(table).getAllByRole('row')
    expect(rows).toHaveLength(attempts.length + 1)

    const reviewLinks = within(table).getAllByRole('link', { name: /Review/i })
    expect(reviewLinks).toHaveLength(2)
    expect(reviewLinks[0]).toHaveAttribute(
      'href',
      `#/quiz/${sampleQuiz.id}/review/recent`,
    )
    expect(reviewLinks[1]).toHaveAttribute(
      'href',
      `#/quiz/${sampleQuiz.id}/review/older`,
    )
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
