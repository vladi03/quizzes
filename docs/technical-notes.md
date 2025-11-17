# Technical Notes

- **Stack**: Vite + React + TypeScript + React Router (hash-based for static hosting). State lives in `QuizContext`, backed by `public/quizzes.json` fetches and localStorage attempts.
- **Data flow**: `QuizProvider` loads quizzes once on boot and seeds attempts from `localStorage`. Consumers use the `useQuizData` hook to keep UI and exports in sync.
- **Quiz UX**: Questions appear sequentially (matching `layout_quiz_question.png`). Each submission reveals correctness and an explanation before navigation.
- **Exports**: Buttons on the main page produce `quizzes-export.json` and `quiz-results-export.json` via `Blob` downloads so users can archive or migrate data offline.
- **Testing**: Vitest + Testing Library cover routing, storage, page rendering, data exports, layout responsiveness (via a `matchMedia` mock), and quiz flows.
- **Styling**: Global CSS uses cards/grids inspired by the provided mockups. The `useResponsiveLayout` hook toggles stacked layouts below 720px.
- **Static updates**: Replace `public/quizzes.json` on any CDN or object storage bucket to refresh questions without a rebuild as long as the schema stays compatible with `docs/schema.md`.

## In-Progress Feature Branch

- **Branch**: `feature/grouping-search-hamburger-filter`
- **Purpose**: Deliver the grouping, live search, and responsive filter menu requested in `tasks/quizzes-spa-task-grouping and search.md`.
- **Feature goals**:
  1. Extend the quiz schema with a required `groupId` that clusters quizzes by topic/category.
  2. Add a live search input on the quiz list that filters as the user types and renders a flat list of matches.
  3. Provide a responsive group filter menu that becomes a hamburger sheet on mobile, including an `All` option that resets filtering.
- **Baseline verification (branch creation)**:
  - `npm install`, `npm test -- --watch=false`, and `npm run build` all succeeded at 22:28 UTC before any feature code landed.
  - `QuizListPage` currently renders `Available` and `Completed` sections with no search or grouping affordances.
  - Responsive behavior is limited to `useResponsiveLayout`; we will add regression tests to lock in the default layout and search/filter interplay.

Additional implementation details for each feature area will be appended below as they are completed.

### Baseline regression coverage

- Added `baseline: renders quiz sections with default responsive class` in `src/pages/QuizListPage.test.tsx` to assert the main dashboard renders both sections and keeps the default `.quiz-grid--grid` layout when no responsive overrides apply.

### Quiz grouping data model

- Every quiz entry inside `public/quizzes.json` now declares a required `groupId` string. The loader (`loadQuizzes`) trims whitespace and throws a descriptive error if `groupId` is blank or missing.
- The taxonomy mirrors the latest content request:
  - `Union with Christ` -> `union-3a-*` quizzes.
  - `Conversion` -> `conversion-*` quizzes.
  - `Regeneration` -> `regeneration-quiz-1`.
  - `Salvation (Justification and Sanctification)` -> salvation component quizzes.
  - `Election` -> `election-*` quizzes (moved out of the Salvation bucket per the new guidance).
  - `Millennial Views` -> `millennial-*` quizzes.
  - `Resurrection` -> `resurrection-*` quizzes.
  - `Judgment` -> `judgment-*` quizzes (split from Eternal State so judgment theology can be filtered independently).
  - `Eternal State` -> `eternal-state-*` quizzes.
- Tests in `src/utils/quizzes.test.ts` cover successful parsing, trimming behavior, and the failure mode when `groupId` is absent.

### Live search behavior

- The dashboard now includes a search input above the Available/Completed sections. Typing filters both lists on every keystroke (case-insensitive) using `title`, `description`, and `groupId`.
- When a search term is present, the UI ignores grouping and renders flat card stacks to make results easy to scan. Clearing the input restores grouped sections.
- A dedicated `StatusMessage` communicates when no quizzes match the current search, and a clear button resets the term without reloading the page.
- Tests: `filters quizzes using the live search input...`, `shows a no results message when search terms match nothing...`, and `search overrides the currently selected group filter` in `src/pages/QuizListPage.test.tsx`.

### Group filter UX

- Desktop renders group filters as pill buttons (`All` + each `groupId`). Mobile collapses the same options behind a hamburger icon to conserve space.
- Selecting a group applies to both Available and Completed lists simultaneously. The `All` option resets filtering.
- The search hint ("Search overrides the group filter.") appears whenever text is entered so users understand precedence.
- Tests: `filters both sections when selecting a group on desktop` and `renders a hamburger menu for group filters on mobile...` lock in desktop + mobile behavior.

### Dev deployment + QA

- Validation commands: `npm test -- --watch=false` and `npm run build` both succeeded after the new search/filter features landed.
- Firebase dev deploy: `firebase deploy --only hosting:dev` (netware-326600-dev.web.app) published the updated static assets.
- Prod workflow: `.github/workflows/deploy-prod-on-main.yml` now triggers on pushes to `main` **and** any tag named `prod-*`. Tagging (e.g., `git tag prod-2025-11-17 && git push origin prod-2025-11-17`) lets us redeploy manually if a hotfix is needed without touching `main`.
- Suggested commits: `feat: add quiz grouping schema + validation`, `feat: add live search and responsive group filters to dashboard`.
