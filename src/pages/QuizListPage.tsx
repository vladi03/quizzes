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

const attemptsDateFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export function QuizListPage() {
  const { quizzes, attempts, loading, error } = useQuizData()
  const layout = useResponsiveLayout()
  const mostRecentAttempt = getMostRecentAttemptByQuiz(attempts)
  const takenQuizIds = getTakenQuizIds(attempts)

  const availableQuizzes = quizzes.filter((quiz) => !takenQuizIds.has(quiz.id))
  const completed = quizzes.filter((quiz) => takenQuizIds.has(quiz.id))

  return (
    <div className="quiz-list-page">
      {error && (
        <StatusMessage
          title="Quiz data unavailable"
          message={error}
          variant="error"
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
            quizzes.length > 0 &&
            availableQuizzes.length === 0 &&
            !error && (
              <StatusMessage
                title="All caught up"
                message="You've completed every quiz. Use the Completed section below to review or retake them."
              />
            )}
          <div className="card-stack">
            {availableQuizzes.map((quiz) => (
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
                  {quiz.questions.length} question
                  {quiz.questions.length === 1 ? '' : 's'}
                </p>
              </Card>
            ))}
          </div>
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
            <div className="card-stack">
              {completed.map((quiz) => {
                const attempt = mostRecentAttempt[quiz.id]
                const attemptsForQuiz = getAttemptsByQuizId(attempts, quiz.id)
                const attemptCount = attempts.filter(
                  (item) => item.quizId === quiz.id,
                ).length
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
                                {attemptsDateFormatter.format(
                                  new Date(item.completedAt),
                                )}
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
              })}
            </div>
          )}
        </div>
      </section>

      <ExportButtons />
    </div>
  )
}
