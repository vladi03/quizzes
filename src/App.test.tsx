import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HashRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { QuizProvider } from './context/QuizContext'
import { sampleQuiz } from './__mocks__/quizSample'

const payload = { version: 1, quizzes: [sampleQuiz] }
const manifest = { files: ['quizzes_sample.json'] }

function resolveMockUrl(input: string | URL | Request) {
  if (typeof input === 'string') {
    return input
  }

  if (input instanceof URL) {
    return input.pathname
  }

  return input.url
}

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
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const url = resolveMockUrl(input)

      if (url.endsWith('/quizzes_manifest.json')) {
        return {
          ok: true,
          json: () => Promise.resolve(manifest),
        } as Response
      }

      if (url.endsWith('/quizzes_sample.json')) {
        return {
          ok: true,
          json: () => Promise.resolve(payload),
        } as Response
      }

      return {
        ok: false,
        json: () => Promise.resolve(undefined),
      } as Response
    })

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

  it('navigates to the export page from the header link', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const url = resolveMockUrl(input)

      if (url.endsWith('/quizzes_manifest.json')) {
        return {
          ok: true,
          json: () => Promise.resolve(manifest),
        } as Response
      }

      if (url.endsWith('/quizzes_sample.json')) {
        return {
          ok: true,
          json: () => Promise.resolve(payload),
        } as Response
      }

      return {
        ok: false,
        json: () => Promise.resolve(undefined),
      } as Response
    })

    setup()
    await screen.findByText(/Available Quizzes/i)

    await userEvent.click(screen.getByRole('link', { name: /Export/i }))

    await screen.findByText(/Export Quiz Data/i)
    expect(
      screen.getByRole('button', { name: /Download Export File/i }),
    ).toBeInTheDocument()
  })
})
