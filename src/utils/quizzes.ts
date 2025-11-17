import type { QuizCollection } from '../types/quiz'

const QUIZ_URL = '/quizzes.json'

export async function loadQuizzes(): Promise<QuizCollection> {
  const response = await fetch(QUIZ_URL)
  if (!response.ok) {
    throw new Error('Unable to load quizzes. Please try again later.')
  }

  let payload: QuizCollection
  try {
    payload = (await response.json()) as QuizCollection
  } catch {
    throw new Error('Quiz data could not be parsed.')
  }

  if (!payload?.quizzes) {
    throw new Error('Malformed quiz payload')
  }

  payload.quizzes.forEach((quiz) => {
    if (typeof quiz.groupId !== 'string' || quiz.groupId.trim().length === 0) {
      throw new Error(
        `Quiz "${quiz.title}" is missing the required groupId field.`,
      )
    }
    quiz.groupId = quiz.groupId.trim()
  })

  return payload
}

/**
 * Quizzes are fetched at runtime so a static host only needs to replace
 * `public/quizzes.json` when new questions are available -- no rebuild required
 * as long as the structure remains compatible with the schema documented
 * in `docs/schema.md`.
 */
