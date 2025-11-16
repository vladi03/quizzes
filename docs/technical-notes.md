# Technical Notes

- **Stack**: Vite + React + TypeScript + React Router (hash-based for static hosting). State lives in `QuizContext`, backed by `public/quizzes.json` fetches and localStorage attempts.
- **Data flow**: `QuizProvider` loads quizzes once on boot and seeds attempts from `localStorage`. Consumers use the `useQuizData` hook to keep UI and exports in sync.
- **Quiz UX**: Questions appear sequentially (matching `layout_quiz_question.png`). Each submission reveals correctness and an explanation before navigation.
- **Exports**: Buttons on the main page produce `quizzes-export.json` and `quiz-results-export.json` via `Blob` downloads so users can archive or migrate data offline.
- **Testing**: Vitest + Testing Library cover routing, storage, page rendering, data exports, layout responsiveness (via a `matchMedia` mock), and quiz flows.
- **Styling**: Global CSS uses cards/grids inspired by the provided mockups. The `useResponsiveLayout` hook toggles stacked layouts below 720px.
- **Static updates**: Replace `public/quizzes.json` on any CDN or object storage bucket to refresh questions without a rebuild (documented inline and in README).

## In-Progress Feature Branch

- **Branch**: `feature/review-finish-answer-styling-prod-deploy`
- **Purpose**: Implement the follow-up task defined in `tasks/quizzes-spa-task-review-answer-styling-prod-deploy.md`.
- **Feature goals**:
  1. Improve the quiz **review navigation** so the final question shows a “Finish Review” action that returns to the dashboard.
  2. Align **in-quiz wrong-answer feedback** with the styling/text already used on the review page (`Correct answer` / `You chose this` pills).
  3. Add an automated **GitHub Actions workflow** that deploys to Firebase **prod** anytime `main` is updated (post-merge).
- **Baseline verification (this branch)**:
  - `npm install`, `npm test`, and `npm run build` all succeed on branch creation (see commands from 18:58 UTC).
  - Current review behavior: “Previous”/“Next” buttons are always shown; reaching the last question still displays “Next” (no return to home).
  - Current in-quiz feedback: after an incorrect submission we show plain text (“Incorrect. Keep going!” + explanation) without the pill styling (only review mode shows `Correct answer` / `You chose this`).
  - Deployment process so far is manual (`npm run deploy:firebase:dev` for testing; prod deploy must be run locally).

Additional implementation details will be captured below as the work progresses.

### Review navigation updates

- `QuizReviewPage` now checks whether the current slide is the last one. When it is:
  - The “Next” button label changes to **Finish Review** and clicking it calls `navigate('/')`.
  - Previous/Next buttons remain accessible for earlier questions so users can still backtrack before finishing.
- Tests in `QuizReviewPage.test.tsx` cover:
  - Rendering of `Previous`/`Next` on initial load.
  - Transition to the last question and visibility of `Finish Review`.
  - Successful navigation back to the dashboard after finishing (MemoryRouter renders a stub `<p>Home dashboard</p>` during the test).

### In-quiz feedback styling alignment

- When a player checks an answer:
  - We reuse the `.pill`, `.pill--correct`, `.pill--selected`, and `.option-tags` classes already defined for review mode so the inline badges match.
  - Correct options receive the **Correct answer** pill; whichever option the player picked receives **You chose this** (or **You chose this (correct)** if it was a match).
  - The existing feedback alert (“Correct!” / “Incorrect. Keep going!”) and explanations remain below the options.
- The quiz detail tests now confirm that a wrong submission displays both pills, keeping parity with the review page rendering.

### Prod deployment workflow

- `.github/workflows/deploy-prod-on-main.yml` runs on every push to `main`. Steps:
  1. `npm ci`
  2. `npm test`
  3. `npm run build`
  4. Install Firebase CLI globally
  5. `firebase deploy --only hosting:prod --non-interactive`
- Assumes secrets:
  - `FIREBASE_TOKEN_PROD` — Firebase CI token with permission to deploy project `netware-326600`.
- Dev deployments remain manual/local via `npm run deploy:firebase:dev`, while prod deploys are now gated behind passing tests/build on GitHub Actions.
