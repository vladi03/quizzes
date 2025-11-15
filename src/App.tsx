import { Link, Route, Routes } from 'react-router-dom'
import './App.css'
import { AppLayout } from './components/AppLayout'
import { StatusMessage } from './components/StatusMessage'
import { QuizDetailPage } from './pages/QuizDetailPage'
import { QuizListPage } from './pages/QuizListPage'
import { QuizReviewPage } from './pages/QuizReviewPage'

export default function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<QuizListPage />} />
        <Route path="/quiz/:quizId" element={<QuizDetailPage />} />
        <Route
          path="/quiz/:quizId/review/:attemptId"
          element={<QuizReviewPage />}
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AppLayout>
  )
}

function NotFoundPage() {
  return (
    <div className="not-found">
      <StatusMessage
        title="Page not found"
        message="Return to the quiz list to continue."
        variant="error"
      />
      <Link className="button" to="/">
        Go home
      </Link>
    </div>
  )
}
