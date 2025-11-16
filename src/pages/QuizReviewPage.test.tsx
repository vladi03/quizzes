import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { sampleQuiz } from '../__mocks__/quizSample'
import { QuizContext } from '../context/QuizContext'
import type { QuizAttempt } from '../types/quiz'
import { QuizReviewPage } from './QuizReviewPage'

const attempt: QuizAttempt = {
  attemptId: 'attempt-1',
  quizId: sampleQuiz.id,
  quizTitle: sampleQuiz.title,
  startedAt: '2024-03-01T00:00:00.000Z',
  completedAt: '2024-03-01T00:10:00.000Z',
  scorePercent: 100,
  correctCount: 2,
  totalCount: 2,
  answers: [
    {
      questionId: 'q1',
      questionNumber: 1,
      selectedOptionId: 'a',
      correctOptionId: 'a',
      isCorrect: true,
    },
    {
      questionId: 'q2',
      questionNumber: 2,
      selectedOptionId: 'true',
      correctOptionId: 'true',
      isCorrect: true,
    },
  ],
}

function renderWithRouter(quizAttempts: QuizAttempt[]) {
  return render(
    <MemoryRouter
      initialEntries={[`/quiz/${sampleQuiz.id}/review/${attempt.attemptId}`]}
    >
      <QuizContext.Provider
        value={{
          quizzes: [sampleQuiz],
          attempts: quizAttempts,
          quizVersion: 1,
          loading: false,
          error: undefined,
          refreshQuizzes: vi.fn(),
          recordAttempt: vi.fn(),
        }}
      >
        <Routes>
          <Route
            path="/quiz/:quizId/review/:attemptId"
            element={<QuizReviewPage />}
          />
          <Route path="/" element={<p>Home dashboard</p>} />
        </Routes>
      </QuizContext.Provider>
    </MemoryRouter>,
  )
}

describe('QuizReviewPage', () => {
  it('renders previous/next navigation controls across questions', () => {
    renderWithRouter([attempt])

    const previous = screen.getByRole('button', { name: /Previous/i })
    const next = screen.getByRole('button', { name: /Next/i })

    expect(previous).toBeInTheDocument()
    expect(previous).toBeDisabled()
    expect(next).toBeInTheDocument()
  })

  it('renders the review details for a valid quiz/attempt', () => {
    renderWithRouter([attempt])

    expect(
      screen.getByText(`${sampleQuiz.title} - Review`),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Read-only review of attempt completed/i),
    ).toBeInTheDocument()
    expect(screen.getByText(/What color is the sky/i)).toBeInTheDocument()
    const pill = screen.getByText(/Correct answer/).closest('.pill')
    expect(pill).toHaveClass('pill--correct')
  })

  it('allows navigating through questions without mutating storage', async () => {
    const user = userEvent.setup()
    const setItemSpy = vi.spyOn(window.localStorage, 'setItem')
    renderWithRouter([attempt])

    await user.click(screen.getByRole('button', { name: /Next/i }))
    expect(
      screen.getByText(/Water is wet/i),
    ).toBeInTheDocument()
    expect(setItemSpy).not.toHaveBeenCalled()
    setItemSpy.mockRestore()
  })

  it('shows Finish Review on the last question and returns home', async () => {
    const user = userEvent.setup()
    renderWithRouter([attempt])

    await user.click(screen.getByRole('button', { name: /Next/i }))
    const finishButton = screen.getByRole('button', { name: /Finish Review/i })
    expect(finishButton).toBeInTheDocument()

    await user.click(finishButton)
    expect(screen.getByText(/Home dashboard/i)).toBeInTheDocument()
  })

  it('shows an error state when the attempt is missing', () => {
    renderWithRouter([])
    expect(screen.getByText(/Review unavailable/i)).toBeInTheDocument()
  })
})
