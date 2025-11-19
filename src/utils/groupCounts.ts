import type { Quiz } from '../types/quiz'

export type QuizCountByGroup = Record<string, number>

export const getQuizCountByGroup = (quizzes: Quiz[]): QuizCountByGroup => {
  const counts: QuizCountByGroup = {}

  quizzes.forEach((quiz) => {
    counts[quiz.groupId] = (counts[quiz.groupId] ?? 0) + 1
  })

  return counts
}
