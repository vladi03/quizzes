import type { QuestionAnswer, Quiz, QuizAttempt } from '../types/quiz'

export function getMostRecentAttemptByQuiz(
  attempts: QuizAttempt[],
): Record<string, QuizAttempt> {
  return attempts.reduce<Record<string, QuizAttempt>>((acc, attempt) => {
    const existing = acc[attempt.quizId]
    if (
      !existing ||
      new Date(attempt.completedAt).getTime() >
        new Date(existing.completedAt).getTime()
    ) {
      acc[attempt.quizId] = attempt
    }
    return acc
  }, {})
}

export function getTakenQuizIds(attempts: QuizAttempt[]): Set<string> {
  return attempts.reduce((set, attempt) => {
    if (attempt.quizId) {
      set.add(attempt.quizId)
    }
    return set
  }, new Set<string>())
}

export function getAttemptsByQuizId(
  attempts: QuizAttempt[],
  quizId: string,
): QuizAttempt[] {
  return attempts
    .filter((attempt) => attempt.quizId === quizId)
    .sort(
      (a, b) =>
        new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
    )
}

export function scoreAnswers(
  quiz: Quiz,
  answers: Record<string, QuestionAnswer>,
) {
  const answerList = Object.values(answers).sort(
    (a, b) => a.questionNumber - b.questionNumber,
  )
  const correctCount = answerList.filter((answer) => answer.isCorrect).length
  const totalCount = quiz.questions.length
  const scorePercent = totalCount
    ? Math.round((correctCount / totalCount) * 100)
    : 0
  return { answerList, correctCount, totalCount, scorePercent }
}
