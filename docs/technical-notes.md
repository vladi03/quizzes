# Technical Notes

- **Stack**: Vite + React + TypeScript + React Router (hash-based for static hosting). State lives in `QuizContext`, backed by `public/quizzes.json` fetches and localStorage attempts.
- **Data flow**: `QuizProvider` loads quizzes once on boot and seeds attempts from `localStorage`. Consumers use the `useQuizData` hook to keep UI and exports in sync.
- **Quiz UX**: Questions appear sequentially (matching `layout_quiz_question.png`). Each submission reveals correctness and an explanation before navigation.
- **Exports**: Buttons on the main page produce `quizzes-export.json` and `quiz-results-export.json` via `Blob` downloads so users can archive or migrate data offline.
- **Testing**: Vitest + Testing Library cover routing, storage, page rendering, data exports, layout responsiveness (via a `matchMedia` mock), and quiz flows.
- **Styling**: Global CSS uses cards/grids inspired by the provided mockups. The `useResponsiveLayout` hook toggles stacked layouts below 720px.
- **Static updates**: Replace `public/quizzes.json` on any CDN or object storage bucket to refresh questions without a rebuild (documented inline and in README).

## In-Progress Feature Branch

- **Branch**: `feature/hide-taken-quizzes-and-review`
- **Purpose**: Implement the "Hide taken quizzes & review attempts" task from `tasks/quizzes-spa-task-hide-taken-and-review.md`.
- **Feature goals**:
  1. Hide quizzes that already have at least one attempt from the **Available Quizzes** list (even after refresh, using localStorage attempts).
  2. Enhance **Completed Quizzes** with a full attempts table and a read-only Review flow so users can step through past submissions.
- **Baseline verification**: On branch creation we ran `npm install`, `npm test`, and `npm run build`. Added regression tests covering the pre-change behavior for Available/Completed quizzes so future steps can safely change expectations.
- **Latest dev deploy**: `npm run deploy:firebase:dev` &rarr; https://netware-326600-dev.web.app

Additional implementation details and decisions for this branch are documented inline as the work progresses.

### Hiding taken quizzes

- Determining if a quiz is "taken" relies on the existing `quizAttempts` entries persisted in `localStorage`.
- A helper, `getTakenQuizIds`, returns a `Set` of quiz ids that appear in the attempts array (one or more attempts qualifies).
- The Available Quizzes list now filters out any quiz whose id is in that set. After page refresh, this still holds because attempts are read from `localStorage`.
- When every quiz is taken, users see an "All caught up" message that points them toward the Completed section for retakes/reviews.

### Attempts table & review route

- `getAttemptsByQuizId(attempts, quizId)` exposes every attempt sorted by `completedAt` (most recent first). This powers the Completed section's table, which shows **Completed**, **% Score**, **Correct**, and a **Review** action for each attempt.
- Each attempts table lives inside the quiz card and carries `aria-label="<quiz title> completed attempts"` for accessibility. Review links route to `/quiz/:quizId/review/:attemptId`.
- `QuizReviewPage` reuses context data to look up the quiz + attempt. The UI:
  - Displays attempt metadata (title, completion date) and steps through questions with Previous/Next actions.
  - Shows all answer options read-only, with badges indicating the correct answer and what the user selected.
  - Presents the explanation per question and never writes to `localStorage` (fully read-only).
- If either the quiz or attempt is missing, the page shows an error message with a link back to the dashboard.
- Styling adjustments:
  - Attempts tables stay scrollable on desktop and collapse into stacked rows on screens < 720px via `data-label` attributes.
  - Review mode highlights correct answers with `.pill--correct` and user selections with `.pill--selected` so the difference remains clear in light themes.

### Branch wrap-up

- Summary:
  - Added helpers/tests for taken quiz tracking and attempts-by-quiz, plus UI changes that hide taken quizzes and surface a responsive attempts table.
  - Introduced `/quiz/:quizId/review/:attemptId` with read-only navigation, highlighting, and dedicated tests.
  - Updated docs + README to describe the new flow and deployed to the Firebase dev site for validation.
- Suggested commit messages for squash/merge:
  1. `feat: hide taken quizzes`
  2. `feat: add attempts table and review mode`
- Branch `feature/hide-taken-quizzes-and-review` is now ready for review/merge.
