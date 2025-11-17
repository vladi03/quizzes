export type Option = {
  id: string
  letter: string
  text: string
}

export type QuestionType = 'multiple_choice' | 'true_false'

export type Question = {
  id: string
  number: number
  question: string
  type: QuestionType
  options: Option[]
  answer: string
  explanation: string
}

export type Quiz = {
  id: string
  title: string
  description: string
  groupId: string
  questions: Question[]
}

export type QuizCollection = {
  version: number
  quizzes: Quiz[]
}

export type QuestionAnswer = {
  questionId: string
  questionNumber: number
  selectedOptionId: string
  correctOptionId: string
  isCorrect: boolean
}

export type QuizAttempt = {
  attemptId: string
  quizId: string
  quizTitle: string
  startedAt: string
  completedAt: string
  scorePercent: number
  correctCount: number
  totalCount: number
  answers: QuestionAnswer[]
}
