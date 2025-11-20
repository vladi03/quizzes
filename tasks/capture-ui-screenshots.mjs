import { spawn } from 'node:child_process'
import fs from 'node:fs'
import net from 'node:net'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..')
const PREVIEW_HOST = '127.0.0.1'
const DEFAULT_PREVIEW_PORT = 4173
const outputDir = path.join(repoRoot, 'docs', 'images', 'ui')
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const npmCliPath = process.env.npm_execpath
const useNpmCliProxy = Boolean(npmCliPath && npmCliPath.endsWith('.js'))

fs.mkdirSync(outputDir, { recursive: true })

const quizzesPath = path.join(repoRoot, 'public', 'quizzes.json')
const quizzesData = JSON.parse(fs.readFileSync(quizzesPath, 'utf8'))
const sampleAttempts = buildSampleAttempts(quizzesData.quizzes)

async function captureScreenshots() {
  await runNpmCommand(['run', 'build'])
  const previewPort = await findAvailablePort(DEFAULT_PREVIEW_PORT)
  const baseOrigin = `http://${PREVIEW_HOST}:${previewPort}`
  const baseUrl = `${baseOrigin}/#`
  const previewProcess = startPreviewServer(previewPort)
  try {
    await waitForServerReady(previewProcess, baseOrigin)
    const browser = await chromium.launch()
    try {
      const context = await browser.newContext({
        viewport: { width: 1440, height: 900 },
        deviceScaleFactor: 1,
      })
      await context.addInitScript((attempts) => {
        window.localStorage.setItem('quizAttempts', JSON.stringify(attempts))
        window.localStorage.setItem('quizActiveGroupFilter', 'all')
      }, sampleAttempts)
      const page = await context.newPage()

      await captureDashboard(page, baseUrl, path.join(outputDir, 'dashboard.png'))
      await captureQuizQuestion(
        page,
        baseUrl,
        path.join(outputDir, 'quiz-question.png'),
      )
      await captureReview(page, baseUrl, path.join(outputDir, 'quiz-review.png'))
    } finally {
      await browser.close()
    }
  } finally {
    previewProcess.kill()
  }
}

async function captureDashboard(page, baseUrl, outputPath) {
  await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' })
  await page.waitForSelector('.quiz-list-page')
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'auto' }))
  const syncButton = page
    .getByRole('button', { name: /Sign in to Sync/i })
    .first()
  if (await syncButton.isVisible()) {
    await syncButton.click()
    await page.waitForSelector('.account-panel')
  }
  await page.waitForTimeout(500)
  await page.screenshot({ path: outputPath, fullPage: false })
  console.log(`Saved dashboard screenshot to ${outputPath}`)
}

async function captureQuizQuestion(page, baseUrl, outputPath) {
  await page.goto(`${baseUrl}/quiz/millennial-quiz-1`, {
    waitUntil: 'networkidle',
  })
  await page.waitForSelector('.quiz-detail-page')
  await page.waitForSelector('.question-card')
  const firstOption = page.locator('.question-card .option').first()
  await firstOption.click()
  await page.getByRole('button', { name: /Check answer/i }).click()
  await page.waitForSelector('.feedback')
  await page.waitForTimeout(500)
  await page.screenshot({ path: outputPath, fullPage: false })
  console.log(`Saved quiz question screenshot to ${outputPath}`)
}

async function captureReview(page, baseUrl, outputPath) {
  await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' })
  await page.waitForSelector('.attempts-table')
  const reviewLink = page.getByRole('link', { name: 'Review' }).first()
  await reviewLink.click()
  await page.waitForSelector('.quiz-review-page')
  const navButton = page
    .getByRole('button', { name: /(Next|Finish Review)/i })
    .first()
  if (await navButton.isVisible()) {
    await navButton.click()
  }
  await page.waitForTimeout(500)
  await page.screenshot({ path: outputPath, fullPage: false })
  console.log(`Saved review screenshot to ${outputPath}`)
}

function buildSampleAttempts(quizzes) {
  const byId = new Map(quizzes.map((quiz) => [quiz.id, quiz]))
  const schedule = [
    { quizId: 'millennial-quiz-1', suffix: '1', correctCount: 7, minutesAgo: 150 },
    { quizId: 'millennial-quiz-1', suffix: '2', correctCount: 9, minutesAgo: 90 },
    { quizId: 'election-quiz-1', suffix: '1', correctCount: 8, minutesAgo: 30 },
  ]
  return schedule
    .map((entry) => {
      const quiz = byId.get(entry.quizId)
      if (!quiz) return null
      return createAttempt(quiz, entry)
    })
    .filter(Boolean)
}

function createAttempt(quiz, { suffix, correctCount, minutesAgo }) {
  const totalQuestions = quiz.questions.length
  const safeCorrect = Math.max(0, Math.min(correctCount, totalQuestions))
  const completedAt = new Date(Date.now() - minutesAgo * 60 * 1000).toISOString()
  const startedAt = new Date(
    Date.now() - (minutesAgo + 5) * 60 * 1000,
  ).toISOString()
  const answers = quiz.questions.map((question, index) => {
    const isCorrect = index < safeCorrect
    const fallback =
      question.options.find((option) => option.id !== question.answer)?.id ??
      question.answer
    return {
      questionId: question.id,
      questionNumber: question.number,
      selectedOptionId: isCorrect ? question.answer : fallback,
      correctOptionId: question.answer,
      isCorrect,
    }
  })
  return {
    attemptId: `${quiz.id}-sample-${suffix}`,
    quizId: quiz.id,
    quizTitle: quiz.title,
    startedAt,
    completedAt,
    scorePercent: Math.round((safeCorrect / totalQuestions) * 100),
    correctCount: safeCorrect,
    totalCount: totalQuestions,
    answers,
  }
}

captureScreenshots().catch((error) => {
  console.error('Failed to capture screenshots:', error)
  process.exit(1)
})

function startPreviewServer(port) {
  const child = spawnNpmProcess(
    [
      'run',
      'preview',
      '--',
      '--host',
      PREVIEW_HOST,
      '--port',
      String(port),
      '--strictPort',
    ],
    {
      cwd: repoRoot,
      stdio: 'inherit',
    },
  )
  return child
}

async function waitForServerReady(previewProcess, baseOrigin, timeoutMs = 20000) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    if (previewProcess.exitCode !== null) {
      throw new Error('Preview server exited before it became ready.')
    }
    try {
      const response = await fetch(baseOrigin, { method: 'GET' })
      if (response.ok) {
        return
      }
    } catch (error) {
      // swallow until timeout
    }
    await delay(500)
  }
  throw new Error('Preview server did not start within the expected time.')
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function runNpmCommand(args) {
  return new Promise((resolve, reject) => {
    const child = spawnNpmProcess(args, {
      cwd: repoRoot,
      stdio: 'inherit',
    })
    child.on('close', (code) => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`Command "${npmCommand} ${args.join(' ')}" exited with ${code}`))
      }
    })
  })
}

function spawnNpmProcess(args, options) {
  const command = useNpmCliProxy ? process.execPath : npmCommand
  const finalArgs = useNpmCliProxy ? [npmCliPath, ...args] : args
  return spawn(command, finalArgs, options)
}

async function findAvailablePort(preferredPort) {
  let port = preferredPort
  const maxPort = preferredPort + 20
  while (port <= maxPort) {
    if (await canBindPort(port)) {
      return port
    }
    port += 1
  }
  throw new Error('Unable to find an open port for the preview server.')
}

function canBindPort(port) {
  return new Promise((resolve) => {
    const tester = net.createServer()
    tester.unref()
    tester.once('error', () => {
      resolve(false)
    })
    tester.once('listening', () => {
      tester.close(() => resolve(true))
    })
    tester.listen(port, PREVIEW_HOST)
  })
}
