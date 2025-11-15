import { Card } from './Card'
import { useQuizData } from '../hooks/useQuizData'
import { downloadJson } from '../utils/download'

export function ExportButtons() {
  const { quizzes, quizVersion, attempts } = useQuizData()

  const handleExportQuizzes = () => {
    downloadJson(
      { version: quizVersion ?? 1, quizzes },
      'quizzes-export.json',
    )
  }

  const handleExportResults = () => {
    downloadJson(
      { exportedAt: new Date().toISOString(), attempts },
      'quiz-results-export.json',
    )
  }

  return (
    <Card
      id="export-tools"
      className="export-tools"
      title="Export Tools"
      footer={
        <div className="export-actions">
          <button type="button" onClick={handleExportQuizzes}>
            Export Quiz Data
          </button>
          <button type="button" onClick={handleExportResults}>
            Export Quiz Results
          </button>
        </div>
      }
    >
      <p>
        Download the latest quiz catalog or every attempt captured in
        localStorage. Upload the files to another deployment to share quizzes or
        analytics snapshots.
      </p>
    </Card>
  )
}
