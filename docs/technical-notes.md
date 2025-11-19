# Technical Notes

- **Stack**: Vite + React + TypeScript + React Router (hash-based for static hosting). State lives in `QuizContext`, backed by `public/quizzes.json` fetches and localStorage attempts.
- **Data flow**: `QuizProvider` loads quizzes once on boot and seeds attempts from `localStorage`. Consumers use the `useQuizData` hook to keep UI and exports in sync.
- **Quiz UX**: Questions appear sequentially (matching `layout_quiz_question.png`). Each submission reveals correctness and an explanation before navigation.
- **Exports**: Buttons on the main page produce `quizzes-export.json` and `quiz-results-export.json` via `Blob` downloads so users can archive or migrate data offline.
- **Testing**: Vitest + Testing Library cover routing, storage, page rendering, data exports, layout responsiveness (via a `matchMedia` mock), and quiz flows.
- **Styling**: Global CSS uses cards/grids inspired by the provided mockups. The `useResponsiveLayout` hook toggles stacked layouts below 720px.
- **Static updates**: Replace `public/quizzes.json` on any CDN or object storage bucket to refresh questions without a rebuild as long as the schema stays compatible with `docs/schema.md`.

## Active Feature Branch

- **Branch**: `feature/group-quiz-count-display`
- **Purpose**: Show quiz counts beside every group filter entry (desktop pills and the mobile hamburger menu) and surface the total quiz count on the `All` option.
- **Baseline verification (2025-02-08)**:
  - `npm install`
  - `npm test`
  - `npm run build`
- **Implementation notes**:
  - Added `getQuizCountByGroup` (`src/utils/groupCounts.ts`) to derive a `{ [groupId]: number }` map; it returns an empty object for no quizzes and defaults to `0` if a group key is missing.
  - Group filter labels now render as `Group Name (count)` while `All` shows the total quiz count from the loaded catalog. Groups are derived from the dataset, so entries with zero quizzes are not rendered, but the helper supports `(0)` counts if future callers supply empty groups.
  - Completion checkmarks continue to render beside fully completed groups and now sit next to the count text on both desktop and mobile menus.
  - Dev deployment to Firebase was not run in this environment; execute `firebase deploy --only hosting:dev` when credentials are available.
- **Mini changelog & commit suggestions**:
  - Display quiz counts in desktop and mobile group filter labels without altering completion indicators.
  - Added unit coverage for the new helper and updated `QuizListPage` specs to assert the label format and coexistence with completion icons.
  - Suggested commit: `feat: display quiz counts in group list`

## Historical Feature Branch (feature/group-check-remember)

- **Branch**: `feature/group-check-remember`
- **Purpose**: Surface completion status for each quiz group and keep the user-selected group filter sticky across navigation so learners stay in context.
- **Feature goals**:
  - Show a green completion indicator beside any group whose quizzes have all been attempted at least once.
  - Persist the currently selected group filter (including `All`) so visiting a quiz and returning — or even refreshing — keeps the same view applied.
- **Baseline verification (2025-11-18)**:
  - `npm install`
  - `npm test`
  - `npm run build`
- **Baseline coverage additions**:
  - `QuizListPage.test.tsx` now asserts that the desktop pills and mobile hamburger both render every group filter option.
  - A baseline test confirms attempts data moves quizzes into the Completed column, giving us confidence that future completion logic hooks into proven behavior.
- **Documentation checkpoints**:
  1. Record baseline behavior and acceptance tests (this section).
  2. Capture the helper logic and memoization strategy that powers group completion checkmarks.
  3. Describe the filter persistence mechanism (storage key, hydration timing, invalidation) and the dev deployment summary.

### Group completion indicators

- Definition: a group is marked complete only when **every quiz** belonging to that `groupId` has at least one attempt persisted under the `quizAttempts` key.
- Helpers: `src/utils/groupCompletion.ts` introduces `isGroupFullyCompleted` for targeted checks and `buildGroupCompletionMap` for a memoized `groupId -> boolean` lookup that `QuizListPage` reuses for both desktop pills and the mobile hamburger menu.
- Rendering: `group-filter__status` adds a green circular checkmark and comes with an `sr-only` announcement so assistive tech can hear "Completed group" without mutating the button label.
- Tests: dedicated unit coverage for the helpers plus new `QuizListPage` specs ensure the icon appears only on fully completed groups in both layouts.

## Historical Feature Branch (feature/import-results)

- **Branch**: `feature/import-results`
- **Purpose**: Implement importing quiz attempts from exported JSON so learners can move progress between devices. Import must deduplicate by `attemptId`.
- **Baseline verification (branch creation)**:
  - Fresh `npm install`, `npm test -- --watch=false`, and `npm run build` all completed successfully at 21:02 UTC before feature work.
  - Export tools currently ship two actions: `Export Quiz Data` (quizzes catalog) and `Export Quiz Results` (wraps attempts with an `exportedAt` timestamp).
  - Attempts are stored in `localStorage` under the `quizAttempts` key via `getAttempts`/`writeAttempts` helpers in `src/utils/storage.ts`.
- **Documentation checkpoints**:
  1. Record baseline behavior and plan (this section).
  2. Capture the export/import data contract once finalized.
  3. Note UI placement, validation, dedup strategy, error messaging, and deployment steps when implemented.

Additional implementation details for this feature will be logged below as they are delivered.

## Results Export/Import Format

- Transfer files are JSON with shape:
  ```json
  {
    "version": 1,
    "exportedAt": "2025-11-17T21:02:00.000Z",
    "attempts": []
  }
  ```
- `version` currently equals `1` and is reserved for future schema migrations. Importers accept any numeric value but treat unknown versions the same while the shape matches.
- Each `attempts[]` entry contains:
  - `attemptId` (string, unique identifier for deduplication across devices)
  - `quizId` / `quizTitle`
  - `startedAt` / `completedAt` ISO timestamps
  - `scorePercent`, `correctCount`, `totalCount`
  - `answers[]` with `{ questionId, questionNumber, selectedOptionId, correctOptionId, isCorrect }`
- Export payloads continue to include an ISO `exportedAt` timestamp for traceability even though only `version` + `attempts` are required to import.

## Import UI & Behavior

- The **Import Results** button lives next to Export Tools on the dashboard card. It opens a hidden `<input type="file" accept="application/json" />` so desktop and mobile users can pick the exported file.
- Helper copy explains the intent (“Import results exported from this app on another device.”) and keeps UX consistent regardless of viewport width.
- Parsing is fully client-side via `File.text()` + `parseResultsTransferJson`. Invalid JSON or any structure missing the `attempts[]` array surface a friendly inline error (“Invalid results file. Please export from this app and try again.”) and leave localStorage untouched.
- Successful imports call the new `importAttempts` function from `QuizContext`, which merges into state/localStorage immediately so the Completed Quizzes section refreshes without reloading.
- Status messaging summarizes the outcome (`Imported 2 attempts. Skipped 1 duplicate attempt.`) or states when every attempt was already present. Large payloads (hundreds of attempts) are handled synchronously, so the note “Import happens entirely in-browser and may briefly freeze on very large files.” was added to README to set expectations.
- Deduplication relies solely on `attemptId`. If the imported file includes attemptIds that already exist locally, those entries are skipped and the counters reflect how many were ignored.
- Version handling: today every export writes `"version": 1`. The importer accepts any numeric `version` and ignores the value unless a breaking schema change ships later.

## Dev deployment + QA

- Validation commands: `npm test -- --watch=false` (Vitest suite including new import/export specs) and `npm run build` (tsc + Vite) both pass on `feature/import-results`.
- Deployment: `firebase deploy --only hosting:dev` published the updated static bundle to `https://netware-326600-dev.web.app`.
- QA coverage:
  - Vitest integration tests (`ExportButtons.test.tsx`, `QuizListPage.test.tsx`) simulate importing a valid export, duplicate files, and invalid JSON to guarantee state + localStorage updates behave as expected.
  - Manual spot-check recommendation: export attempts on one browser profile, load the dev URL in a different profile/incognito window, and import the file twice to confirm duplicates are ignored while Completed Quizzes updates immediately.
- Suggested commit message: `feat: import quiz results with attemptId dedup and docs`.
