import { useMemo, useState } from 'react'
import { Card } from '../components/Card'
import { useQuizData } from '../hooks/useQuizData'
import { downloadJson, stringifyJson } from '../utils/download'
import { buildResultsExportPayload } from '../utils/resultsTransfer'

const EXPORT_FILENAME = 'quizspark-results-export.json'

type CopyStatus = { variant: 'success' | 'error'; message: string } | null

export function ExportPage() {
  const { attempts } = useQuizData()
  const exportPayload = useMemo(
    () => buildResultsExportPayload(attempts),
    [attempts],
  )
  const exportJson = useMemo(
    () => stringifyJson(exportPayload),
    [exportPayload],
  )
  const [downloadMessage, setDownloadMessage] = useState('')
  const [copyStatus, setCopyStatus] = useState<CopyStatus>(null)

  const attemptCountLabel =
    attempts.length === 0
      ? 'No completed quizzes yet.'
      : `${attempts.length} attempt${attempts.length === 1 ? '' : 's'} ready to export.`

  const handleDownload = () => {
    downloadJson(exportPayload, EXPORT_FILENAME)
    setDownloadMessage(
      `Download started — ${attempts.length} attempt${attempts.length === 1 ? '' : 's'} bundled.`,
    )
  }

  const handleCopy = async () => {
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error('clipboard-unavailable')
      }
      await navigator.clipboard.writeText(exportJson)
      setCopyStatus({
        variant: 'success',
        message: 'Export JSON copied to your clipboard.',
      })
    } catch {
      setCopyStatus({
        variant: 'error',
        message: 'Clipboard unavailable. Download the file instead.',
      })
    }
  }

  return (
    <div className="export-page" role="region" aria-label="Export quiz data">
      <Card title="Export Quiz Data" className="export-page__card">
        <p>
          Create a portable backup of every quiz attempt stored in this browser.
          Use the file to migrate to another device or keep an archive for reporting.
        </p>
        <p className="export-page__summary">{attemptCountLabel}</p>
        <div className="export-page__actions">
          <button type="button" onClick={handleDownload}>
            Download Export File
          </button>
          <button
            type="button"
            className="button button--secondary"
            onClick={handleCopy}
          >
            Copy JSON to Clipboard
          </button>
        </div>
        {downloadMessage && (
          <p className="export-page__status" role="status">
            {downloadMessage}
          </p>
        )}
        {copyStatus && (
          <p
            className={`export-page__status export-page__status--${copyStatus.variant}`}
            role="status"
          >
            {copyStatus.message}
          </p>
        )}
      </Card>

      <Card title="Export Preview" className="export-page__card">
        <p>
          The JSON mirrors the import/export schema ({' '}
          <code>version {exportPayload.version}</code> ) so you can re-import it
          safely later. Remote sync uses the same structure.
        </p>
        <label className="sr-only" htmlFor="export-preview">
          Export JSON preview
        </label>
        <textarea
          id="export-preview"
          className="export-page__preview"
          readOnly
          value={exportJson}
        />
      </Card>
    </div>
  )
}
