import type { QuizAttempt, QuestionAnswer } from '../types/quiz'

export const RESULTS_TRANSFER_VERSION = 1

export type ResultsTransferFile = {
  version: number
  exportedAt?: string
  attempts: QuizAttempt[]
}

export type ImportSummary = {
  importedCount: number
  skippedCount: number
}

export type MergeResult = {
  merged: QuizAttempt[]
  summary: ImportSummary
}

type RawAttempt = Partial<QuizAttempt> & {
  answers?: QuestionAnswer[]
}

const requiredStringFields: Array<keyof QuizAttempt> = [
  'attemptId',
  'quizId',
  'quizTitle',
  'startedAt',
  'completedAt',
]

const requiredNumberFields: Array<keyof QuizAttempt> = [
  'scorePercent',
  'correctCount',
  'totalCount',
]

function isQuestionAnswer(value: QuestionAnswer): value is QuestionAnswer {
  return (
    typeof value.questionId === 'string' &&
    typeof value.questionNumber === 'number' &&
    typeof value.selectedOptionId === 'string' &&
    typeof value.correctOptionId === 'string' &&
    typeof value.isCorrect === 'boolean'
  )
}

function normalizeAttempt(input: unknown, index: number): QuizAttempt {
  if (!input || typeof input !== 'object') {
    throw new Error(`Attempt at index ${index} is not an object.`)
  }
  const candidate = input as RawAttempt
  for (const field of requiredStringFields) {
    if (typeof candidate[field] !== 'string' || candidate[field]!.length === 0) {
      throw new Error(`Attempt at index ${index} is missing ${field}.`)
    }
  }
  for (const field of requiredNumberFields) {
    if (typeof candidate[field] !== 'number' || Number.isNaN(candidate[field])) {
      throw new Error(`Attempt at index ${index} has invalid ${field}.`)
    }
  }
  if (!Array.isArray(candidate.answers)) {
    throw new Error(`Attempt at index ${index} is missing answers.`)
  }
  candidate.answers.forEach((answer, answerIndex) => {
    if (!isQuestionAnswer(answer)) {
      throw new Error(
        `Answer at index ${answerIndex} in attempt ${index} is invalid.`,
      )
    }
  })

  return candidate as QuizAttempt
}

export function buildResultsExportPayload(
  attempts: QuizAttempt[],
): ResultsTransferFile {
  return {
    version: RESULTS_TRANSFER_VERSION,
    exportedAt: new Date().toISOString(),
    attempts,
  }
}

export function parseResultsTransferJson(
  rawText: string,
): ResultsTransferFile {
  let parsed: unknown
  try {
    parsed = JSON.parse(rawText)
  } catch {
    throw new Error('Unable to parse JSON.')
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Results file must be an object.')
  }

  const record = parsed as Record<string, unknown>
  if (!Array.isArray(record.attempts)) {
    throw new Error('Results file is missing an attempts array.')
  }

  const attempts = record.attempts.map((entry, index) =>
    normalizeAttempt(entry, index),
  )

  const version =
    typeof record.version === 'number' && Number.isFinite(record.version)
      ? record.version
      : RESULTS_TRANSFER_VERSION

  const exportedAt =
    typeof record.exportedAt === 'string' ? record.exportedAt : undefined

  return {
    version,
    exportedAt,
    attempts,
  }
}

export function mergeImportedAttempts(
  existing: QuizAttempt[],
  incoming: QuizAttempt[],
): MergeResult {
  const dedupeMap = new Map(existing.map((attempt) => [attempt.attemptId, true]))
  const merged = [...existing]
  let importedCount = 0
  incoming.forEach((attempt) => {
    if (dedupeMap.has(attempt.attemptId)) {
      return
    }
    dedupeMap.set(attempt.attemptId, true)
    merged.push(attempt)
    importedCount += 1
  })
  return {
    merged,
    summary: {
      importedCount,
      skippedCount: incoming.length - importedCount,
    },
  }
}
