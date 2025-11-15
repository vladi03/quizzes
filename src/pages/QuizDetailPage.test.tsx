import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { sampleQuiz } from '../__mocks__/quizSample'
import { QuizContext } from '../context/QuizContext'
import type { Quiz, QuizAttempt } from '../types/quiz'
import { QuizDetailPage } from './QuizDetailPage'

function renderForQuiz({
  recordAttempt = vi.fn(),
  route = `/quiz/${sampleQuiz.id}`,
  quizzes = [sampleQuiz],
}: {
  recordAttempt?: (attempt: QuizAttempt) => void
  route?: string
  quizzes?: Quiz[]
} = {}) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <QuizContext.Provider
        value={{
          quizzes,
          quizVersion: 1,
          attempts: [],
          loading: false,
          error: undefined,
          refreshQuizzes: vi.fn(),
          recordAttempt,
        }}
      >
        <Routes>
          <Route path="/quiz/:quizId" element={<QuizDetailPage />} />
        </Routes>
      </QuizContext.Provider>
    </MemoryRouter>,
  )
}

describe('QuizDetailPage', () => {
  it('renders the first question for the selected quiz', () => {
    renderForQuiz()
    expect(screen.getByText(/What color is the sky/i)).toBeInTheDocument()
  })

  it('shows feedback and explanation after submitting an answer', async () => {
    const user = userEvent.setup()
    renderForQuiz()

    await user.click(screen.getByLabelText(/Blue/i))
    await user.click(screen.getByText(/Check answer/i))

    expect(screen.getByText(/Correct!/i)).toBeInTheDocument()
    expect(
      screen.getByText(/Rayleigh scattering makes the sky blue/i),
    ).toBeInTheDocument()
  })

  it('records an attempt after finishing every question', async () => {
    const user = userEvent.setup()
    const recordAttempt = vi.fn()
    renderForQuiz({ recordAttempt })

    await user.click(screen.getByLabelText(/Blue/i))
    await user.click(screen.getByText(/Check answer/i))
    await user.click(screen.getByText(/Next question/i))

    await user.click(screen.getByLabelText(/True/i))
    await user.click(screen.getByText(/Check answer/i))
    await user.click(screen.getByText(/Finish quiz/i))

    expect(recordAttempt).toHaveBeenCalledTimes(1)
    expect(recordAttempt.mock.calls[0][0]).toMatchObject({
      quizId: sampleQuiz.id,
      scorePercent: 100,
      correctCount: 2,
      totalCount: 2,
    })
  })

  it('shows an error when the quiz id is invalid', () => {
    renderForQuiz({ route: '/quiz/unknown' })
    expect(screen.getByText(/Quiz not found/i)).toBeInTheDocument()
  })
})
