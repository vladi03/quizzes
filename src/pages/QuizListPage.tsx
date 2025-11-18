import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../components/Card'
import { ExportButtons } from '../components/ExportButtons'
import { StatusMessage } from '../components/StatusMessage'
import { useResponsiveLayout } from '../hooks/useResponsiveLayout'
import { useQuizData } from '../hooks/useQuizData'
import {
  getAttemptsByQuizId,
  getMostRecentAttemptByQuiz,
  getTakenQuizIds,
} from '../utils/attempts'
import { buildGroupCompletionMap } from '../utils/groupCompletion'
import type { Quiz } from '../types/quiz'

type GroupSection = {
  id: string
  label: string
  quizzes: Quiz[]
}

export const GROUP_FILTER_STORAGE_KEY = 'quizActiveGroupFilter'

const attemptsDateFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

const formatGroupLabel = (groupId: string) => {
  if (groupId.includes(' ')) {
    return groupId
  }
  return groupId
    .split('-')
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ')
}

const groupQuizzes = (entries: Quiz[]): GroupSection[] => {
  const grouped = new Map<string, Quiz[]>()
  entries.forEach((quiz) => {
    if (!grouped.has(quiz.groupId)) {
      grouped.set(quiz.groupId, [])
    }
    grouped.get(quiz.groupId)?.push(quiz)
  })
  return Array.from(grouped.entries())
    .map(([id, list]) => ({
      id,
      label: formatGroupLabel(id),
      quizzes: list,
    }))
    .sort((a, b) => a.label.localeCompare(b.label))
}

const readStoredGroupFilter = (): 'all' | string => {
  if (typeof window === 'undefined') {
    return 'all'
  }
  const stored = window.localStorage.getItem(GROUP_FILTER_STORAGE_KEY)
  if (!stored || stored.trim().length === 0) {
    return 'all'
  }
  return stored
}

export function QuizListPage() {
  const { quizzes, attempts, loading, error } = useQuizData()
  const layout = useResponsiveLayout()
  const isMobile = layout === 'stack'
  const [searchTerm, setSearchTerm] = useState('')
  const [activeGroupId, setActiveGroupId] = useState<'all' | string>(() =>
    readStoredGroupFilter(),
  )
  const [isGroupMenuOpen, setGroupMenuOpen] = useState(false)

  const normalizedSearch = searchTerm.trim().toLowerCase()
  const hasSearch = normalizedSearch.length > 0

  useEffect(() => {
    if (!isMobile) {
      setGroupMenuOpen(false)
    }
  }, [isMobile])

  const handleGroupSelect = (groupId: string) => {
    setActiveGroupId(groupId)
    setGroupMenuOpen(false)
  }

  const takenQuizIds = useMemo(() => getTakenQuizIds(attempts), [attempts])
  const mostRecentAttempt = useMemo(
    () => getMostRecentAttemptByQuiz(attempts),
    [attempts],
  )

  const availableQuizzes = useMemo(
    () => quizzes.filter((quiz) => !takenQuizIds.has(quiz.id)),
    [quizzes, takenQuizIds],
  )
  const completed = useMemo(
    () => quizzes.filter((quiz) => takenQuizIds.has(quiz.id)),
    [quizzes, takenQuizIds],
  )

  const groupFilterOptions = useMemo(() => {
    const unique = new Map<string, string>()
    quizzes.forEach((quiz) => {
      if (!unique.has(quiz.groupId)) {
        unique.set(quiz.groupId, formatGroupLabel(quiz.groupId))
      }
    })
    const sorted = Array.from(unique.entries()).sort((a, b) =>
      a[1].localeCompare(b[1]),
    )
    return [
      { id: 'all', label: 'All' },
      ...sorted.map(([id, label]) => ({ id, label })),
    ]
  }, [quizzes])

  useEffect(() => {
    if (
      activeGroupId !== 'all' &&
      !groupFilterOptions.some((option) => option.id === activeGroupId)
    ) {
      setActiveGroupId('all')
    }
  }, [groupFilterOptions, activeGroupId])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    window.localStorage.setItem(GROUP_FILTER_STORAGE_KEY, activeGroupId)
  }, [activeGroupId])

  const groupCompletion = useMemo(
    () => buildGroupCompletionMap(quizzes, attempts),
    [quizzes, attempts],
  )

  const renderGroupFilterLabel = (optionId: string, label: string) => {
    const isFullyCompleted =
      optionId !== 'all' && Boolean(groupCompletion[optionId])
    return (
      <>
        <span>{label}</span>
        {isFullyCompleted && (
          <>
            <span className="group-filter__status" aria-hidden="true">
              ✓
            </span>
            <span className="sr-only">Completed group</span>
          </>
        )}
      </>
    )
  }

  const visibleAvailable = useMemo(() => {
    return availableQuizzes.filter((quiz) => {
      const matchesGroup =
        hasSearch || activeGroupId === 'all' || quiz.groupId === activeGroupId
      if (!matchesGroup) return false
      if (!hasSearch) return true
      const haystack = `${quiz.title} ${quiz.description} ${quiz.groupId}`.toLowerCase()
      return haystack.includes(normalizedSearch)
    })
  }, [availableQuizzes, activeGroupId, hasSearch, normalizedSearch])

  const visibleCompleted = useMemo(() => {
    return completed.filter((quiz) => {
      const matchesGroup =
        hasSearch || activeGroupId === 'all' || quiz.groupId === activeGroupId
      if (!matchesGroup) return false
      if (!hasSearch) return true
      const haystack = `${quiz.title} ${quiz.description} ${quiz.groupId}`.toLowerCase()
      return haystack.includes(normalizedSearch)
    })
  }, [completed, activeGroupId, hasSearch, normalizedSearch])

  const groupedAvailable = useMemo(
    () => (hasSearch ? [] : groupQuizzes(visibleAvailable)),
    [hasSearch, visibleAvailable],
  )
  const groupedCompleted = useMemo(
    () => (hasSearch ? [] : groupQuizzes(visibleCompleted)),
    [hasSearch, visibleCompleted],
  )

  const noResults =
    hasSearch &&
    !loading &&
    !error &&
    visibleAvailable.length === 0 &&
    visibleCompleted.length === 0

  const renderAvailableCard = (quiz: Quiz) => (
    <Card
      key={quiz.id}
      title={quiz.title}
      footer={
        <Link className="button" to={`/quiz/${quiz.id}`}>
          Start Quiz
        </Link>
      }
    >
      <p>{quiz.description}</p>
      <p className="meta">
        {quiz.questions.length} question{quiz.questions.length === 1 ? '' : 's'}
      </p>
    </Card>
  )

  const renderCompletedCard = (quiz: Quiz) => {
    const attempt = mostRecentAttempt[quiz.id]
    if (!attempt) return null
    const attemptsForQuiz = getAttemptsByQuizId(attempts, quiz.id)
    const attemptCount = attemptsForQuiz.length

    return (
      <Card
        key={quiz.id}
        title={quiz.title}
        footer={
          <Link className="button button--secondary" to={`/quiz/${quiz.id}`}>
            Retake Quiz
          </Link>
        }
      >
        <p className="score">
          <span>{attempt.scorePercent}%</span>
          <small>
            {attempt.correctCount} of {attempt.totalCount} correct
          </small>
        </p>
        <p className="meta">
          {attemptCount} attempt{attemptCount === 1 ? '' : 's'}
        </p>
        <div className="attempts-table-wrapper">
          <table
            className="attempts-table"
            aria-label={`${quiz.title} completed attempts`}
          >
            <thead>
              <tr>
                <th scope="col">Completed</th>
                <th scope="col">% Score</th>
                <th scope="col">Correct</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {attemptsForQuiz.map((item) => (
                <tr key={item.attemptId}>
                  <td data-label="Completed">
                    {attemptsDateFormatter.format(new Date(item.completedAt))}
                  </td>
                  <td data-label="% Score">{item.scorePercent}%</td>
                  <td data-label="Correct">
                    {item.correctCount} of {item.totalCount}
                  </td>
                  <td data-label="Actions">
                    <Link
                      className="button button--ghost"
                      to={`/quiz/${quiz.id}/review/${item.attemptId}`}
                    >
                      Review
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    )
  }

  return (
    <div className="quiz-list-page">
      {error && (
        <StatusMessage
          title="Quiz data unavailable"
          message={error}
          variant="error"
        />
      )}

      <div className="quiz-controls">
        <div className="quiz-search">
          <label className="sr-only" htmlFor="quiz-search">
            Search quizzes
          </label>
          <input
            id="quiz-search"
            type="search"
            placeholder="Search quizzes..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            autoComplete="off"
          />
          {searchTerm && (
            <button
              type="button"
              className="quiz-search__clear"
              onClick={() => setSearchTerm('')}
              aria-label="Clear search"
            >
              Clear
            </button>
          )}
        </div>

        <div className="group-filter">
          <div className="group-filter__label-row">
            <p className="group-filter__heading">Filter by topic</p>
            {hasSearch && (
              <span className="group-filter__hint">
                Search overrides the group filter.
              </span>
            )}
          </div>
          {isMobile ? (
            <>
              <button
                type="button"
                className="group-filter__hamburger"
                onClick={() => setGroupMenuOpen((prev) => !prev)}
                aria-expanded={isGroupMenuOpen}
                aria-controls="group-filter-menu"
                aria-label="Toggle group filter menu"
              >
                <span className="group-filter__icon" aria-hidden="true" />
                <span>Groups</span>
              </button>
              {isGroupMenuOpen && (
                <div
                  className="group-filter__menu"
                  id="group-filter-menu"
                  role="menu"
                >
                  {groupFilterOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      className={`group-filter__button${
                        activeGroupId === option.id
                          ? ' group-filter__button--active'
                          : ''
                      }`}
                      onClick={() => handleGroupSelect(option.id)}
                      aria-pressed={activeGroupId === option.id}
                      role="menuitem"
                    >
                      {renderGroupFilterLabel(option.id, option.label)}
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div
              className="group-filter__pills"
              role="group"
              aria-label="Filter quizzes by group"
            >
              {groupFilterOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={`group-filter__button${
                    activeGroupId === option.id
                      ? ' group-filter__button--active'
                      : ''
                  }`}
                  onClick={() => handleGroupSelect(option.id)}
                  aria-pressed={activeGroupId === option.id}
                >
                  {renderGroupFilterLabel(option.id, option.label)}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {noResults && (
        <StatusMessage
          title="No quizzes found"
          message="Try another search term or clear filters to see every quiz."
        />
      )}

      <section className={`quiz-grid quiz-grid--${layout}`}>
        <div>
          <div className="section-heading">
            <h2>Available Quizzes</h2>
            <p>Pick a quiz to begin. Scores are saved locally.</p>
          </div>
          {loading && (
            <StatusMessage
              title="Loading quizzes"
              message="Fetching the latest questions..."
            />
          )}
          {!loading && quizzes.length === 0 && !error && (
            <StatusMessage
              title="No quizzes yet"
              message="Upload a quizzes.json file to get started."
            />
          )}
          {!loading &&
            !hasSearch &&
            quizzes.length > 0 &&
            availableQuizzes.length === 0 &&
            !error && (
              <StatusMessage
                title="All caught up"
                message="You've completed every quiz. Use the Completed section below to review or retake them."
              />
            )}
          {!loading &&
            !error &&
            availableQuizzes.length > 0 &&
            visibleAvailable.length === 0 &&
            (hasSearch || activeGroupId !== 'all') && (
              <StatusMessage
                title="No available quizzes match"
                message={
                  hasSearch
                    ? 'No available quizzes match your search.'
                    : 'Pick a different group to see those quizzes.'
                }
              />
            )}

          {hasSearch ? (
            <div className="card-stack">
              {visibleAvailable.map((quiz) => renderAvailableCard(quiz))}
            </div>
          ) : (
            groupedAvailable.map((group) => (
              <div className="group-section" key={group.id}>
                <div className="group-section__heading">
                  <h3>{group.label}</h3>
                  <span className="group-section__count">
                    {group.quizzes.length} quiz
                    {group.quizzes.length === 1 ? '' : 's'}
                  </span>
                </div>
                <div className="card-stack">
                  {group.quizzes.map((quiz) => renderAvailableCard(quiz))}
                </div>
              </div>
            ))
          )}
        </div>

        <div>
          <div className="section-heading">
            <h2>Completed Quizzes</h2>
            <p>Review every attempt or retake a quiz to improve your score.</p>
          </div>
          {completed.length === 0 ? (
            <StatusMessage
              title="No attempts yet"
              message="Finish a quiz to see your summary."
            />
          ) : (
            <>
              {!error &&
                visibleCompleted.length === 0 &&
                (hasSearch || activeGroupId !== 'all') && (
                  <StatusMessage
                    title="No completed quizzes match"
                    message={
                      hasSearch
                        ? 'No completed quizzes match your search.'
                        : 'Try the All filter to review more quizzes.'
                    }
                  />
                )}
              {hasSearch ? (
                <div className="card-stack">
                  {visibleCompleted.map((quiz) => renderCompletedCard(quiz))}
                </div>
              ) : (
                groupedCompleted.map((group) => (
                  <div className="group-section" key={group.id}>
                    <div className="group-section__heading">
                      <h3>{group.label}</h3>
                      <span className="group-section__count">
                        {group.quizzes.length} quiz
                        {group.quizzes.length === 1 ? '' : 's'}
                      </span>
                    </div>
                    <div className="card-stack">
                      {group.quizzes.map((quiz) => renderCompletedCard(quiz))}
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      </section>

      <ExportButtons />
    </div>
  )
}
