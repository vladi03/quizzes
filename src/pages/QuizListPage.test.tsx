import userEvent from '@testing-library/user-event'
import { render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useState } from 'react'
import { HashRouter } from 'react-router-dom'
import { sampleQuiz } from '../__mocks__/quizSample'
import { QuizContext } from '../context/QuizContext'
import { renderWithProviders } from '../test-utils'
import type { Quiz, QuizAttempt } from '../types/quiz'
import { mergeImportedAttempts } from '../utils/resultsTransfer'
import { ATTEMPTS_STORAGE_KEY } from '../utils/storage'
import { GROUP_FILTER_STORAGE_KEY, QuizListPage } from './QuizListPage'

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

const makeQuiz = (overrides: Partial<Quiz>): Quiz => ({
  ...sampleQuiz,
  ...overrides,
  questions: overrides.questions ?? sampleQuiz.questions,
})

const buildResultsFile = (data: unknown) =>
  new File([JSON.stringify(data)], 'results.json', {
    type: 'application/json',
  })

function ResultsImportHarness({
  initialAttempts = [],
  quizzes = [sampleQuiz],
}: {
  initialAttempts?: QuizAttempt[]
  quizzes?: Quiz[]
}) {
  const [attempts, setAttempts] = useState<QuizAttempt[]>(initialAttempts)
  const importAttempts = (incoming: QuizAttempt[]) => {
    let summary = { importedCount: 0, skippedCount: incoming.length }
    setAttempts((prev) => {
      const { merged, summary: mergeSummary } = mergeImportedAttempts(
        prev,
        incoming,
      )
      summary = mergeSummary
      if (mergeSummary.importedCount > 0) {
        window.localStorage.setItem(
          ATTEMPTS_STORAGE_KEY,
          JSON.stringify(merged),
        )
      }
      return merged
    })
    return summary
  }

  return (
    <HashRouter>
      <QuizContext.Provider
        value={{
          quizzes,
          quizVersion: 1,
          attempts,
          loading: false,
          error: undefined,
          refreshQuizzes: async () => {},
          recordAttempt: () => {},
          importAttempts,
        }}
      >
        <QuizListPage />
      </QuizContext.Provider>
    </HashRouter>
  )
}

describe('QuizListPage', () => {
  afterEach(() => {
    window.localStorage.clear()
    window.location.hash = '#/'
  })

  it('baseline: renders quiz sections with default responsive class', () => {
    const { container } = renderWithProviders(<QuizListPage />, {
      quizzes: [sampleQuiz],
    })

    expect(
      screen.getByRole('heading', { name: /Available Quizzes/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: /Completed Quizzes/i }),
    ).toBeInTheDocument()
    expect(container.querySelector('.quiz-grid')).toHaveClass('quiz-grid--grid')
  })

  it('renders every available quiz entry', () => {
    renderWithProviders(<QuizListPage />, {
      quizzes: [sampleQuiz],
    })

    expect(screen.getByText(sampleQuiz.title)).toBeInTheDocument()
    expect(screen.getByText(/2 questions/i)).toBeInTheDocument()
  })

  it('baseline: renders the group filter pills with all topics on desktop', () => {
    const graceQuiz = makeQuiz({
      id: 'grace-alone',
      title: 'Grace Alone',
      groupId: 'soteriology',
    })
    const hopeQuiz = makeQuiz({
      id: 'millennial-hope',
      title: 'Millennial Hope',
      groupId: 'eschatology',
    })

    renderWithProviders(<QuizListPage />, { quizzes: [graceQuiz, hopeQuiz] })

    const filterPills = screen.getByRole('group', {
      name: /Filter quizzes by group/i,
    })
    const pillButtons = within(filterPills).getAllByRole('button')
    expect(pillButtons).toHaveLength(3)
    expect(within(filterPills).getByRole('button', { name: /All/i })).toBeInTheDocument()
    expect(
      within(filterPills).getByRole('button', { name: /Soteriology/i }),
    ).toBeInTheDocument()
    expect(
      within(filterPills).getByRole('button', { name: /Eschatology/i }),
    ).toBeInTheDocument()
  })

  it('baseline: exposes group filters inside the hamburger menu on mobile', async () => {
    const originalMatchMedia = window.matchMedia
    window.matchMedia = vi.fn().mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }) as unknown as typeof window.matchMedia

    try {
      const user = userEvent.setup()
      const graceQuiz = makeQuiz({
        id: 'grace-alone',
        title: 'Grace Alone',
        groupId: 'soteriology',
      })
      const hopeQuiz = makeQuiz({
        id: 'millennial-hope',
        title: 'Millennial Hope',
        groupId: 'eschatology',
      })

      renderWithProviders(<QuizListPage />, { quizzes: [graceQuiz, hopeQuiz] })

      await user.click(
        screen.getByRole('button', { name: /Toggle group filter menu/i }),
      )
      const menu = screen.getByRole('menu')
      const options = within(menu).getAllByRole('menuitem')
      expect(options).toHaveLength(3)
      expect(
        within(menu).getByRole('menuitem', { name: /All/i }),
      ).toBeInTheDocument()
      expect(
        within(menu).getByRole('menuitem', { name: /Soteriology/i }),
      ).toBeInTheDocument()
      expect(
        within(menu).getByRole('menuitem', { name: /Eschatology/i }),
      ).toBeInTheDocument()
    } finally {
      window.matchMedia = originalMatchMedia
    }
  })

  it('baseline: uses attempts data to move quizzes into the completed column', () => {
    const availableQuiz = makeQuiz({
      id: 'resurrection-timeline',
      title: 'Resurrection Timeline',
      groupId: 'eschatology',
    })
    const completedQuiz = makeQuiz({
      id: 'grace-alone',
      title: 'Grace Alone',
      groupId: 'soteriology',
    })

    renderWithProviders(<QuizListPage />, {
      quizzes: [availableQuiz, completedQuiz],
      attempts: [
        {
          ...baseAttempt,
          quizId: completedQuiz.id,
          quizTitle: completedQuiz.title,
        },
      ],
    })

    const completedHeading = screen.getByRole('heading', {
      name: /Completed Quizzes/i,
    })
    const completedColumn =
      completedHeading.closest('.section-heading')?.parentElement
    expect(completedColumn).not.toBeNull()
    expect(
      within(completedColumn as HTMLElement).getByText('Grace Alone'),
    ).toBeInTheDocument()

    const availableHeading = screen.getByRole('heading', {
      name: /Available Quizzes/i,
    })
    const availableColumn =
      availableHeading.closest('.section-heading')?.parentElement
    expect(availableColumn).not.toBeNull()
    expect(
      within(availableColumn as HTMLElement).queryByText('Grace Alone'),
    ).not.toBeInTheDocument()
  })

  it('shows completion checkmarks next to fully completed groups on desktop', () => {
    const graceQuiz = makeQuiz({
      id: 'grace-alone',
      title: 'Grace Alone',
      groupId: 'soteriology',
    })
    const atonementQuiz = makeQuiz({
      id: 'atonement',
      title: 'Atonement',
      groupId: 'soteriology',
    })
    const hopeQuiz = makeQuiz({
      id: 'millennial-hope',
      title: 'Millennial Hope',
      groupId: 'millennial-views',
    })

    renderWithProviders(<QuizListPage />, {
      quizzes: [graceQuiz, atonementQuiz, hopeQuiz],
      attempts: [
        { ...baseAttempt, attemptId: 'a', quizId: graceQuiz.id, quizTitle: graceQuiz.title },
        { ...baseAttempt, attemptId: 'b', quizId: atonementQuiz.id, quizTitle: atonementQuiz.title },
      ],
    })

    const completedButton = screen.getByRole('button', { name: /Soteriology/i })
    const incompleteButton = screen.getByRole('button', {
      name: /Millennial Views/i,
    })
    expect(
      completedButton.querySelector('.group-filter__status'),
    ).not.toBeNull()
    expect(
      incompleteButton.querySelector('.group-filter__status'),
    ).toBeNull()
  })

  it('persists the selected group filter across remounts', async () => {
    const user = userEvent.setup()
    const graceQuiz = makeQuiz({
      id: 'grace-alone',
      title: 'Grace Alone',
      groupId: 'soteriology',
    })
    const hopeQuiz = makeQuiz({
      id: 'millennial-hope',
      title: 'Millennial Hope',
      groupId: 'millennial-views',
    })

    const renderResult = renderWithProviders(<QuizListPage />, {
      quizzes: [graceQuiz, hopeQuiz],
    })

    await user.click(
      screen.getByRole('button', {
        name: /Millennial Views/i,
      }),
    )

    expect(window.localStorage.getItem(GROUP_FILTER_STORAGE_KEY)).toBe(
      'millennial-views',
    )

    renderResult.unmount()
    renderWithProviders(<QuizListPage />, { quizzes: [graceQuiz, hopeQuiz] })
    const retainedButton = screen.getByRole('button', {
      name: /Millennial Views/i,
    })

    expect(retainedButton).toHaveAttribute('aria-pressed', 'true')
  })

  it('falls back to the All filter when the stored group is missing', () => {
    window.localStorage.setItem(GROUP_FILTER_STORAGE_KEY, 'retired-group')
    const graceQuiz = makeQuiz({
      id: 'grace-alone',
      title: 'Grace Alone',
      groupId: 'soteriology',
    })

    renderWithProviders(<QuizListPage />, {
      quizzes: [graceQuiz],
    })

    const allButton = screen.getByRole('button', { name: /All/i })
    expect(allButton).toHaveAttribute('aria-pressed', 'true')
    expect(window.localStorage.getItem(GROUP_FILTER_STORAGE_KEY)).toBe('all')
  })

  it('shows completion checkmarks inside the mobile hamburger menu', async () => {
    const originalMatchMedia = window.matchMedia
    window.matchMedia = vi.fn().mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }) as unknown as typeof window.matchMedia

    try {
      const user = userEvent.setup()
      const graceQuiz = makeQuiz({
        id: 'grace-alone',
        title: 'Grace Alone',
        groupId: 'soteriology',
      })
      const atonementQuiz = makeQuiz({
        id: 'atonement',
        title: 'Atonement',
        groupId: 'soteriology',
      })
      const hopeQuiz = makeQuiz({
        id: 'millennial-hope',
        title: 'Millennial Hope',
        groupId: 'millennial-views',
      })

      renderWithProviders(<QuizListPage />, {
        quizzes: [graceQuiz, atonementQuiz, hopeQuiz],
        attempts: [
          { ...baseAttempt, attemptId: 'a', quizId: graceQuiz.id, quizTitle: graceQuiz.title },
          { ...baseAttempt, attemptId: 'b', quizId: atonementQuiz.id, quizTitle: atonementQuiz.title },
        ],
      })

      await user.click(
        screen.getByRole('button', { name: /Toggle group filter menu/i }),
      )

      const completedMenuItem = screen.getByRole('menuitem', {
        name: /Soteriology/i,
      })
      const incompleteMenuItem = screen.getByRole('menuitem', {
        name: /Millennial Views/i,
      })
      expect(
        completedMenuItem.querySelector('.group-filter__status'),
      ).not.toBeNull()
      expect(
        incompleteMenuItem.querySelector('.group-filter__status'),
      ).toBeNull()
    } finally {
      window.matchMedia = originalMatchMedia
    }
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

  it('filters quizzes using the live search input and hides grouping during search', async () => {
    const user = userEvent.setup()
    const soteriologyQuiz = makeQuiz({
      id: 'grace-alone',
      title: 'Grace Alone',
      description: 'Soteriology overview',
      groupId: 'Salvation (Justification and Sanctification)',
    })
    const eschatologyQuiz = makeQuiz({
      id: 'millennial-hope',
      title: 'Millennial Hope',
      description: 'Eschatology walkthrough',
      groupId: 'Millennial Views',
    })

    renderWithProviders(<QuizListPage />, {
      quizzes: [soteriologyQuiz, eschatologyQuiz],
    })

    expect(
      screen.getByRole('heading', {
        name: /Salvation \(Justification and Sanctification\)/i,
      }),
    ).toBeInTheDocument()

    const input = screen.getByPlaceholderText(/Search quizzes/i)
    await user.type(input, 'hope')

    expect(screen.getByText('Millennial Hope')).toBeInTheDocument()
    expect(screen.queryByText('Grace Alone')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('heading', {
        name: /Salvation \(Justification and Sanctification\)/i,
      }),
    ).not.toBeInTheDocument()

    await user.clear(input)
    expect(
      screen.getByRole('heading', {
        name: /Salvation \(Justification and Sanctification\)/i,
      }),
    ).toBeInTheDocument()
  })

  it('shows a no results message when search terms match nothing (case-insensitive)', async () => {
    const user = userEvent.setup()
    const resurrectionQuiz = makeQuiz({
      id: 'resurrection-timeline',
      title: 'Resurrection Timeline',
      description: 'Walk through the resurrection passages',
      groupId: 'Resurrection',
    })

    renderWithProviders(<QuizListPage />, { quizzes: [resurrectionQuiz] })

    const input = screen.getByPlaceholderText(/Search quizzes/i)
    await user.type(input, 'RESURRECTION')
    expect(screen.getByText('Resurrection Timeline')).toBeInTheDocument()

    await user.clear(input)
    await user.type(input, 'no matches please')
    expect(screen.getByText(/No quizzes found/i)).toBeInTheDocument()
  })

  it('filters both sections when selecting a group on desktop', async () => {
    const user = userEvent.setup()
    const graceQuiz = makeQuiz({
      id: 'grace-alone',
      title: 'Grace Alone',
      description: 'Soteriology overview',
      groupId: 'Salvation (Justification and Sanctification)',
    })
    const hopeQuiz = makeQuiz({
      id: 'millennial-hope',
      title: 'Millennial Hope',
      description: 'Eschatology walkthrough',
      groupId: 'Millennial Views',
    })
    const atonementQuiz = makeQuiz({
      id: 'atonement',
      title: 'Atonement Quiz',
      description: 'Completed soteriology quiz',
      groupId: 'Salvation (Justification and Sanctification)',
    })
    const judgmentQuiz = makeQuiz({
      id: 'judgment-seat',
      title: 'Judgment Seat',
      description: 'Completed judgment quiz',
      groupId: 'Judgment',
    })

    renderWithProviders(<QuizListPage />, {
      quizzes: [graceQuiz, hopeQuiz, atonementQuiz, judgmentQuiz],
      attempts: [
        { ...baseAttempt, attemptId: 'atonement', quizId: atonementQuiz.id, quizTitle: atonementQuiz.title },
        { ...baseAttempt, attemptId: 'judgment', quizId: judgmentQuiz.id, quizTitle: judgmentQuiz.title },
      ],
    })

    await user.click(
      screen.getByRole('button', {
        name: /Salvation \(Justification and Sanctification\)/i,
      }),
    )

    expect(screen.getByText('Grace Alone')).toBeInTheDocument()
    expect(screen.getByText('Atonement Quiz')).toBeInTheDocument()
    expect(screen.queryByText('Millennial Hope')).not.toBeInTheDocument()
    expect(screen.queryByText('Judgment Seat')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /All/i }))
    expect(screen.getByText('Millennial Hope')).toBeInTheDocument()
    expect(screen.getByText('Judgment Seat')).toBeInTheDocument()
  })

  it('search overrides the currently selected group filter', async () => {
    const user = userEvent.setup()
    const graceQuiz = makeQuiz({
      id: 'grace-alone',
      title: 'Grace Alone',
      description: 'Soteriology overview',
      groupId: 'Salvation (Justification and Sanctification)',
    })
    const hopeQuiz = makeQuiz({
      id: 'millennial-hope',
      title: 'Millennial Hope',
      description: 'Eschatology walkthrough',
      groupId: 'Millennial Views',
    })

    renderWithProviders(<QuizListPage />, {
      quizzes: [graceQuiz, hopeQuiz],
    })

    await user.click(
      screen.getByRole('button', {
        name: /Salvation \(Justification and Sanctification\)/i,
      }),
    )
    expect(screen.queryByText('Millennial Hope')).not.toBeInTheDocument()

    const input = screen.getByPlaceholderText(/Search quizzes/i)
    await user.type(input, 'millennial')
    expect(screen.getByText('Millennial Hope')).toBeInTheDocument()
  })

  it('renders a hamburger menu for group filters on mobile and closes after selection', async () => {
    const original = window.matchMedia
    window.matchMedia = vi.fn().mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }) as unknown as typeof window.matchMedia

    const user = userEvent.setup()
    const graceQuiz = makeQuiz({
      id: 'grace-alone',
      title: 'Grace Alone',
      description: 'Soteriology overview',
      groupId: 'Salvation (Justification and Sanctification)',
    })
    const hopeQuiz = makeQuiz({
      id: 'millennial-hope',
      title: 'Millennial Hope',
      description: 'Eschatology walkthrough',
      groupId: 'Millennial Views',
    })

    renderWithProviders(<QuizListPage />, {
      quizzes: [graceQuiz, hopeQuiz],
    })

    const toggle = screen.getByRole('button', {
      name: /Toggle group filter menu/i,
    })
    await user.click(toggle)

    const eschatologyOption = screen.getByRole('menuitem', {
      name: /Millennial Views/i,
    })
    await user.click(eschatologyOption)

    expect(screen.getByText('Millennial Hope')).toBeInTheDocument()
    expect(
      screen.queryByRole('menuitem', { name: /Millennial Views/i }),
    ).not.toBeInTheDocument()

    window.matchMedia = original
  })

  it('imports attempts through the UI and updates completed quizzes', async () => {
    window.localStorage.clear()
    const user = userEvent.setup()
    render(<ResultsImportHarness initialAttempts={[]} />)

    expect(screen.getByText(/No attempts yet/i)).toBeInTheDocument()
    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement
    await user.upload(
      input,
      buildResultsFile({ version: 1, attempts: [baseAttempt] }),
    )

    expect(
      await screen.findByText(/Imported 1 attempt/i),
    ).toBeInTheDocument()
    expect(screen.queryByText(/No attempts yet/i)).not.toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: /Start Quiz/i }),
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /Retake Quiz/i }),
    ).toBeInTheDocument()
    const stored = JSON.parse(
      window.localStorage.getItem(ATTEMPTS_STORAGE_KEY) ?? '[]',
    )
    expect(stored).toHaveLength(1)
    expect(stored[0].attemptId).toBe(baseAttempt.attemptId)
  })

  it('skips duplicate attemptIds on repeated imports', async () => {
    window.localStorage.setItem(
      ATTEMPTS_STORAGE_KEY,
      JSON.stringify([baseAttempt]),
    )
    const user = userEvent.setup()
    render(<ResultsImportHarness initialAttempts={[baseAttempt]} />)

    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement
    await user.upload(
      input,
      buildResultsFile({ version: 1, attempts: [baseAttempt] }),
    )

    expect(
      await screen.findByText(/No new attempts were imported/i),
    ).toBeInTheDocument()
    const stored = JSON.parse(
      window.localStorage.getItem(ATTEMPTS_STORAGE_KEY) ?? '[]',
    )
    expect(stored).toHaveLength(1)
  })
})
