import { render, screen } from '@testing-library/react'
import { HashRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { QuizProvider } from './context/QuizContext'
import { sampleQuiz } from './__mocks__/quizSample'

const payload = { version: 1, quizzes: [sampleQuiz] }

function setup() {
  return render(
    <HashRouter>
      <AuthProvider>
        <QuizProvider>
          <App />
        </QuizProvider>
      </AuthProvider>
    </HashRouter>,
  )
}

beforeEach(() => {
  window.localStorage.clear()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('App integration', () => {
  it('renders the quiz list when data loads', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(payload),
    } as Response)

    setup()

    await screen.findByText(/Available Quizzes/i)
    expect(screen.getByText(sampleQuiz.title)).toBeInTheDocument()
  })

  it('surface an error banner when fetching fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(() => {
      throw new Error('boom')
    })

    setup()

    await screen.findByText(/Quiz data unavailable/i)
  })
})
