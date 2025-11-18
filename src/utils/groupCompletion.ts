import type { Quiz, QuizAttempt } from '../types/quiz'

export function isGroupFullyCompleted(
  groupId: string,
  quizzes: Quiz[],
  attempts: QuizAttempt[],
): boolean {
  if (!groupId) {
    return false
  }
  const groupQuizzes = quizzes.filter((quiz) => quiz.groupId === groupId)
  if (groupQuizzes.length === 0) {
    return false
  }
  const takenIds = new Set(
    attempts
      .map((attempt) => attempt.quizId)
      .filter((quizId): quizId is string => typeof quizId === 'string'),
  )
  return groupQuizzes.every((quiz) => takenIds.has(quiz.id))
}

export function buildGroupCompletionMap(
  quizzes: Quiz[],
  attempts: QuizAttempt[],
): Record<string, boolean> {
  if (quizzes.length === 0) {
    return {}
  }
  const takenIds = new Set(
    attempts
      .map((attempt) => attempt.quizId)
      .filter((quizId): quizId is string => typeof quizId === 'string'),
  )
  const summary = new Map<
    string,
    {
      total: number
      completed: number
    }
  >()

  quizzes.forEach((quiz) => {
    if (!summary.has(quiz.groupId)) {
      summary.set(quiz.groupId, { total: 0, completed: 0 })
    }
    const stats = summary.get(quiz.groupId)
    if (!stats) {
      return
    }
    stats.total += 1
    if (takenIds.has(quiz.id)) {
      stats.completed += 1
    }
  })

  const result: Record<string, boolean> = {}
  summary.forEach((value, groupId) => {
    result[groupId] = value.total > 0 && value.total === value.completed
  })
  return result
}
