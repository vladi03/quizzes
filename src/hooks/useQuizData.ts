import { useContext } from 'react'
import { QuizContext } from '../context/QuizContext'

export function useQuizData() {
  const context = useContext(QuizContext)
  if (!context) {
    throw new Error('useQuizData must be used within a QuizProvider')
  }
  return context
}
