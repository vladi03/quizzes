import type { QuizCollection } from '../types/quiz'

const QUIZ_URL = '/quizzes.json'

export async function loadQuizzes(): Promise<QuizCollection> {
  const response = await fetch(QUIZ_URL)
  if (!response.ok) {
    throw new Error('Unable to load quizzes. Please try again later.')
  }

  try {
    const payload = (await response.json()) as QuizCollection
    if (!payload?.quizzes) {
      throw new Error('Malformed quiz payload')
    }
    return payload
  } catch (error) {
    throw new Error('Quiz data could not be parsed.')
  }
}

/**
 * Quizzes are fetched at runtime so a static host only needs to replace
 * `public/quizzes.json` when new questions are available -- no rebuild required
 * as long as the structure remains compatible with the schema documented
 * in `docs/schema.md`.
 */
