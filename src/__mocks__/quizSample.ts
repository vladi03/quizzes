import type { Quiz } from '../types/quiz'

export const sampleQuiz: Quiz = {
  id: 'sample-quiz',
  title: 'Sample Quiz',
  description: 'Demo quiz for tests',
  questions: [
    {
      id: 'q1',
      number: 1,
      question: 'What color is the sky?',
      type: 'multiple_choice',
      options: [
        { id: 'a', letter: 'A', text: 'Blue' },
        { id: 'b', letter: 'B', text: 'Green' },
      ],
      answer: 'a',
      explanation: 'Rayleigh scattering makes the sky blue.',
    },
    {
      id: 'q2',
      number: 2,
      question: 'True or False: Water is wet.',
      type: 'true_false',
      options: [
        { id: 'true', letter: 'T', text: 'True' },
        { id: 'false', letter: 'F', text: 'False' },
      ],
      answer: 'true',
      explanation: 'Water molecules create a liquid surface, so yes.',
    },
  ],
}
