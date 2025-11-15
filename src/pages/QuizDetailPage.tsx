import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Card } from '../components/Card'
import { StatusMessage } from '../components/StatusMessage'
import { useQuizData } from '../hooks/useQuizData'
import type { QuestionAnswer } from '../types/quiz'
import { scoreAnswers } from '../utils/attempts'

type SummaryState = {
  correctCount: number
  totalCount: number
  scorePercent: number
}

export function QuizDetailPage() {
  const { quizId = '' } = useParams()
  const navigate = useNavigate()
  const { quizzes, loading, recordAttempt } = useQuizData()
  const quiz = useMemo(
    () => quizzes.find((item) => item.id === quizId),
    [quizzes, quizId],
  )

  const [currentIndex, setCurrentIndex] = useState(0)
  const [selections, setSelections] = useState<Record<string, string>>({})
  const [answers, setAnswers] = useState<Record<string, QuestionAnswer>>({})
  const [isFeedbackVisible, setIsFeedbackVisible] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [isComplete, setIsComplete] = useState(false)
  const [summary, setSummary] = useState<SummaryState | null>(null)
  const [startedAt, setStartedAt] = useState(() => new Date().toISOString())

  useEffect(() => {
    setCurrentIndex(0)
    setSelections({})
    setAnswers({})
    setIsFeedbackVisible(false)
    setValidationError(null)
    setIsComplete(false)
    setSummary(null)
    setStartedAt(new Date().toISOString())
  }, [quizId])

  const currentQuestion = quiz?.questions[currentIndex]
  const selectedOptionId = currentQuestion
    ? selections[currentQuestion.id] ?? null
    : null
  const currentAnswer = currentQuestion
    ? answers[currentQuestion.id]
    : undefined

  const isLastQuestion = quiz
    ? currentIndex === quiz.questions.length - 1
    : false

  if (loading) {
    return (
      <StatusMessage
        title="Loading quiz"
        message="Fetching questions..."
        variant="info"
      />
    )
  }

  if (!quiz) {
    return (
      <div className="quiz-detail-page">
        <StatusMessage
          title="Quiz not found"
          message="The requested quiz does not exist."
          variant="error"
        />
        <Link className="button" to="/">
          Back to all quizzes
        </Link>
      </div>
    )
  }

  if (isComplete && summary) {
    return (
      <div className="quiz-detail-page">
        <Card title={`${quiz.title} - Results`}>
          <div className="summary-score">
            <p className="summary-score__value">{summary.scorePercent}%</p>
            <p className="summary-score__meta">
              {summary.correctCount} of {summary.totalCount} correct
            </p>
          </div>
          <div className="summary-actions">
            <button type="button" onClick={() => navigate('/')}>
              Return home
            </button>
            <button type="button" className="button button--secondary" onClick={handleRetake}>
              Retake quiz
            </button>
          </div>
        </Card>
      </div>
    )
  }

  function handleOptionChange(optionId: string) {
    if (!currentQuestion || isFeedbackVisible) return
    setSelections((prev) => ({
      ...prev,
      [currentQuestion.id]: optionId,
    }))
  }

  function handleSubmit() {
    if (!currentQuestion) return
    if (!selectedOptionId) {
      setValidationError('Select an answer to continue.')
      return
    }
    setValidationError(null)
    const isCorrect = selectedOptionId === currentQuestion.answer
    const answerRecord: QuestionAnswer = {
      questionId: currentQuestion.id,
      questionNumber: currentQuestion.number,
      selectedOptionId,
      correctOptionId: currentQuestion.answer,
      isCorrect,
    }
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: answerRecord,
    }))
    setIsFeedbackVisible(true)
  }

  function handleNextStep() {
    if (!quiz || !currentQuestion) return
    if (!isFeedbackVisible) return

    if (isLastQuestion) {
      const { answerList, correctCount, totalCount, scorePercent } =
        scoreAnswers(quiz, answers)
      const attemptId =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `attempt-${Date.now()}`
      const timestamp = new Date().toISOString()
      recordAttempt({
        attemptId,
        quizId: quiz.id,
        quizTitle: quiz.title,
        startedAt,
        completedAt: timestamp,
        scorePercent,
        correctCount,
        totalCount,
        answers: answerList,
      })
      setSummary({ correctCount, totalCount, scorePercent })
      setIsComplete(true)
    } else {
      const nextIndex = currentIndex + 1
      setCurrentIndex(nextIndex)
      setIsFeedbackVisible(false)
      setValidationError(null)
    }
  }

  function handleRetake() {
    setSelections({})
    setAnswers({})
    setCurrentIndex(0)
    setIsFeedbackVisible(false)
    setValidationError(null)
    setIsComplete(false)
    setSummary(null)
    setStartedAt(new Date().toISOString())
  }

  // Questions are shown sequentially to match the provided layout mockups.
  return (
    <div className="quiz-detail-page">
      <Link className="back-link" to="/">
        &lt; Back to quizzes
      </Link>
      <Card title={quiz.title}>
        <p className="quiz-description">{quiz.description}</p>
        <div className="progress-indicator">
          Question {currentQuestion?.number} of {quiz.questions.length}
        </div>

        <div className="question-card">
          <h3>
            {currentQuestion?.number}. {currentQuestion?.question}
          </h3>
          <div className="options-list">
            {currentQuestion?.options.map((option) => (
              <label
                key={option.id}
                className={`option ${
                  selectedOptionId === option.id ? 'option--selected' : ''
                } ${isFeedbackVisible ? 'option--disabled' : ''}`}
              >
                <input
                  type="radio"
                  name={`question-${currentQuestion.id}`}
                  value={option.id}
                  checked={selectedOptionId === option.id}
                  onChange={() => handleOptionChange(option.id)}
                  disabled={isFeedbackVisible}
                />
                <span className="badge">{option.letter}</span>
                <span>{option.text}</span>
              </label>
            ))}
          </div>
          {validationError && (
            <p className="form-error" role="alert">
              {validationError}
            </p>
          )}
          {isFeedbackVisible && currentAnswer && (
            <div
              className={`feedback ${
                currentAnswer.isCorrect ? 'feedback--correct' : 'feedback--incorrect'
              }`}
            >
              <p>
                {currentAnswer.isCorrect
                  ? 'Correct!'
                  : 'Incorrect. Keep going!'}
              </p>
              <p>{currentQuestion?.explanation}</p>
            </div>
          )}
          <div className="question-actions">
            {!isFeedbackVisible && (
              <button type="button" onClick={handleSubmit}>
                Check answer
              </button>
            )}
            {isFeedbackVisible && (
              <button type="button" onClick={handleNextStep}>
                {isLastQuestion ? 'Finish quiz' : 'Next question'}
              </button>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
