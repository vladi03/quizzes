import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Card } from '../components/Card'
import { StatusMessage } from '../components/StatusMessage'
import { useQuizData } from '../hooks/useQuizData'

export function QuizReviewPage() {
  const { quizId = '', attemptId = '' } = useParams()
  const { quizzes, attempts } = useQuizData()
  const [currentIndex, setCurrentIndex] = useState(0)
  const navigate = useNavigate()

  const quiz = useMemo(
    () => quizzes.find((item) => item.id === quizId),
    [quizzes, quizId],
  )
  const attempt = useMemo(
    () => attempts.find((item) => item.attemptId === attemptId),
    [attempts, attemptId],
  )

  useEffect(() => {
    setCurrentIndex(0)
  }, [quizId, attemptId])

  if (!quiz || !attempt) {
    return (
      <div className="quiz-detail-page quiz-review-page">
        <StatusMessage
          title="Review unavailable"
          message="We couldn't find that quiz attempt."
          variant="error"
        />
        <Link className="button" to="/">
          Back to dashboard
        </Link>
      </div>
    )
  }

  const questions = quiz.questions
  const currentQuestion = questions[currentIndex]
  const answer = attempt.answers.find(
    (item) => item.questionId === currentQuestion?.id,
  )
  const totalQuestions = questions.length
  const isLastQuestion = currentIndex === totalQuestions - 1
  const completedDate = new Date(attempt.completedAt).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

  const goToPrevious = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0))
  }

  const goForward = () => {
    if (isLastQuestion) {
      navigate('/')
    } else {
      setCurrentIndex((prev) => Math.min(prev + 1, totalQuestions - 1))
    }
  }

  return (
    <div className="quiz-detail-page quiz-review-page">
      <Link className="back-link" to="/">
        &lt; Back to Completed Quizzes
      </Link>
      <Card title={`${quiz.title} - Review`}>
        <p className="quiz-description">
          Read-only review of attempt completed on {completedDate}.
        </p>
        <div className="progress-indicator">
          Question {currentQuestion?.number} of {totalQuestions}
        </div>
        <div className="question-card question-card--review">
          <h3>
            {currentQuestion?.number}. {currentQuestion?.question}
          </h3>
          <div className="options-list options-list--review">
            {currentQuestion?.options.map((option) => {
              const isCorrect = option.id === answer?.correctOptionId
              const isSelected = option.id === answer?.selectedOptionId
              return (
                <div
                  key={option.id}
                  className={`option option--review ${isCorrect ? 'option--correct' : ''} ${
                    isSelected ? 'option--selected' : ''
                  }`.trim()}
                >
                  <span className="badge">{option.letter}</span>
                  <span>{option.text}</span>
                  <div className="option-tags">
                    {isCorrect && <span className="pill pill--correct">Correct answer</span>}
                    {isSelected && (
                      <span className="pill pill--selected">
                        {answer?.isCorrect ? 'You chose this (correct)' : 'You chose this'}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          <div className="review-explanation">
            <h4>Explanation</h4>
            <p>{currentQuestion?.explanation}</p>
          </div>
          <div className="review-navigation">
            <button
              type="button"
              onClick={goToPrevious}
              disabled={currentIndex === 0}
            >
              Previous
            </button>
            <button
              type="button"
              onClick={goForward}
              aria-label={isLastQuestion ? 'Finish Review' : 'Next'}
              disabled={false}
            >
              {isLastQuestion ? 'Finish Review' : 'Next'}
            </button>
          </div>
        </div>
      </Card>
    </div>
  )
}
