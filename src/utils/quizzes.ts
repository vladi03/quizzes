import type { QuizCollection } from '../types/quiz'

const QUIZ_MANIFEST_URL = '/quizzes_manifest.json'

type QuizManifest = {
  files: string[]
}

async function parseJsonResponse<T>(
  response: Response,
  errorMessage: string,
): Promise<T> {
  try {
    return (await response.json()) as T
  } catch {
    throw new Error(errorMessage)
  }
}

function validateCollection(payload: QuizCollection, source: string): QuizCollection {
  if (!payload?.quizzes) {
    throw new Error(`Malformed quiz payload in ${source}`)
  }

  payload.quizzes.forEach((quiz) => {
    if (typeof quiz.groupId !== 'string' || quiz.groupId.trim().length === 0) {
      throw new Error(
        `Quiz "${quiz.title}" in ${source} is missing the required groupId field.`,
      )
    }
    quiz.groupId = quiz.groupId.trim()
  })

  return payload
}

export async function loadQuizzes(): Promise<QuizCollection> {
  const manifestResponse = await fetch(QUIZ_MANIFEST_URL)
  if (!manifestResponse.ok) {
    throw new Error('Unable to load quiz manifest. Please try again later.')
  }

  const manifest = await parseJsonResponse<QuizManifest>(
    manifestResponse,
    'Quiz manifest could not be parsed.',
  )

  if (!Array.isArray(manifest.files) || manifest.files.length === 0) {
    throw new Error('No quiz files were found in the quiz manifest.')
  }

  const collections = await Promise.all(
    manifest.files.map(async (fileName) => {
      const response = await fetch(`/${fileName}`)
      if (!response.ok) {
        throw new Error(`Unable to load quiz file "${fileName}".`)
      }

      const payload = await parseJsonResponse<QuizCollection>(
        response,
        `Quiz data in "${fileName}" could not be parsed.`,
      )
      return validateCollection(payload, fileName)
    }),
  )

  const merged = collections.reduce<QuizCollection>(
    (acc, collection) => {
      acc.version = Math.max(acc.version, collection.version ?? 1)
      acc.quizzes.push(...collection.quizzes)
      return acc
    },
    { version: 1, quizzes: [] },
  )

  return merged
}

/**
 * Quizzes are fetched at runtime from every `public/quizzes_*.json` file listed
 * in `public/quizzes_manifest.json`, which is generated during dev/build.
 */
