import { readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const publicDir = path.resolve(process.cwd(), 'public')
const manifestPath = path.join(publicDir, 'quizzes_manifest.json')
const quizFilePattern = /^quizzes_.*\.json$/i
const manifestFileName = path.basename(manifestPath)

const entries = await readdir(publicDir, { withFileTypes: true })
const files = entries
  .filter(
    (entry) =>
      entry.isFile() &&
      quizFilePattern.test(entry.name) &&
      entry.name !== manifestFileName,
  )
  .map((entry) => entry.name)
  .sort((left, right) => left.localeCompare(right))

const payload = {
  generatedAt: new Date().toISOString(),
  files,
}

await writeFile(manifestPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')

console.log(
  `Wrote ${path.relative(process.cwd(), manifestPath)} with ${files.length} quiz file${files.length === 1 ? '' : 's'}.`,
)
