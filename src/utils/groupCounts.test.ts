import { describe, expect, it } from 'vitest'
import type { Quiz } from '../types/quiz'
import { getQuizCountByGroup } from './groupCounts'

const makeQuiz = (overrides: Partial<Quiz> = {}): Quiz => ({
  id: overrides.id ?? 'quiz-1',
  title: overrides.title ?? 'Sample Quiz',
  description: overrides.description ?? 'A sample quiz',
  groupId: overrides.groupId ?? 'doctrine',
  questions: overrides.questions ?? [],
})

describe('getQuizCountByGroup', () => {
  it('counts quizzes for each group', () => {
    const quizzes: Quiz[] = [
      makeQuiz({ id: 'justification', groupId: 'soteriology' }),
      makeQuiz({ id: 'atonement', groupId: 'soteriology' }),
      makeQuiz({ id: 'millennium', groupId: 'eschatology' }),
    ]

    const counts = getQuizCountByGroup(quizzes)

    expect(counts.soteriology).toBe(2)
    expect(counts.eschatology).toBe(1)
  })

  it('returns an empty object when no quizzes are present', () => {
    expect(getQuizCountByGroup([])).toEqual({})
  })

  it('allows computing the total count for the All filter', () => {
    const quizzes: Quiz[] = [
      makeQuiz({ id: 'incarnation', groupId: 'christology' }),
      makeQuiz({ id: 'trinity', groupId: 'theology-proper' }),
      makeQuiz({ id: 'spirit', groupId: 'pneumatology' }),
    ]

    const counts = getQuizCountByGroup(quizzes)
    const total = quizzes.length

    expect(total).toBe(3)
    expect(Object.values(counts).reduce((sum, value) => sum + value, 0)).toBe(
      total,
    )
  })
})
