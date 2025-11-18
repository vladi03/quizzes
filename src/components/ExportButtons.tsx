import { type ChangeEvent, useRef, useState } from 'react'
import { Card } from './Card'
import { useQuizData } from '../hooks/useQuizData'
import { downloadJson } from '../utils/download'
import {
  buildResultsExportPayload,
  parseResultsTransferJson,
} from '../utils/resultsTransfer'

type ImportStatus = 'idle' | 'success' | 'error'

async function readFileContents(file: File): Promise<string> {
  if (typeof file.text === 'function') {
    return file.text()
  }

  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Unable to read file.'))
    reader.onload = () => resolve(reader.result as string)
    reader.readAsText(file)
  })
}

export function ExportButtons() {
  const { quizzes, quizVersion, attempts, importAttempts } = useQuizData()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importMessage, setImportMessage] = useState('')
  const [importStatus, setImportStatus] = useState<ImportStatus>('idle')
  const [isImporting, setImporting] = useState(false)

  const handleExportQuizzes = () => {
    downloadJson(
      { version: quizVersion ?? 1, quizzes },
      'quizzes-export.json',
    )
  }

  const handleExportResults = () => {
    downloadJson(buildResultsExportPayload(attempts), 'quiz-results-export.json')
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleImportChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.target
    const file = input.files?.[0]
    if (!file) return
    setImporting(true)
    setImportStatus('idle')
    setImportMessage('')
    try {
      const text = await readFileContents(file)
      const payload = parseResultsTransferJson(text)
      const summary = importAttempts(payload.attempts)
      if (summary.importedCount === 0) {
        setImportMessage('No new attempts were imported (everything was a duplicate).')
      } else {
        const duplicateText =
          summary.skippedCount > 0
            ? ` Skipped ${summary.skippedCount} duplicate attempt${summary.skippedCount === 1 ? '' : 's'}.`
            : ''
        setImportMessage(
          `Imported ${summary.importedCount} attempt${summary.importedCount === 1 ? '' : 's'}.${duplicateText}`,
        )
      }
      setImportStatus('success')
    } catch (error) {
      console.error(error)
      setImportMessage('Invalid results file. Please export from this app and try again.')
      setImportStatus('error')
    } finally {
      setImporting(false)
      input.value = ''
    }
  }

  return (
    <Card
      id="export-tools"
      className="export-tools"
      title="Export Tools"
      footer={
        <div className="export-footer">
          <div className="export-actions">
            <button type="button" onClick={handleExportQuizzes}>
              Export Quiz Data
            </button>
            <button type="button" onClick={handleExportResults}>
              Export Quiz Results
            </button>
          </div>
          <div className="import-actions">
            <div className="import-actions__controls">
              <button type="button" onClick={handleImportClick} disabled={isImporting}>
                {isImporting ? 'Importing...' : 'Import Results'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json"
                onChange={handleImportChange}
                style={{ display: 'none' }}
              />
              <p className="import-actions__hint">
                Import results exported from this app on another device.
              </p>
            </div>
            {importMessage && (
              <p
                className={`import-actions__status import-actions__status--${importStatus}`}
                role={importStatus === 'error' ? 'alert' : 'status'}
              >
                {importMessage}
              </p>
            )}
          </div>
        </div>
      }
    >
      <p>
        Download the latest quiz catalog or every attempt captured in
        localStorage. Upload the files to another deployment to share quizzes or
        analytics snapshots.
      </p>
      <p>
        Imports merge immediately with completed quizzes using <code>attemptId</code>
        so duplicates are ignored safely.
      </p>
    </Card>
  )
}
