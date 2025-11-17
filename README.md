# QuizSpark SPA

A fully client-side quizzes experience built with Vite, React, and TypeScript. Quizzes are loaded from a static JSON file and all attempt data persists in `localStorage`, making the app ideal for simple CDN or object-storage hosting.

## Scripts

```bash
npm install              # install dependencies
npm run dev              # start the dev server
npm test                 # run the Vitest + RTL suite once
npm run test:watch       # optional watch mode
npm run build            # type-check and build static assets in dist/
npm run preview          # serve the production build locally
npm run deploy:firebase  # build + deploy to Firebase prod site
npm run deploy:firebase:dev # build + deploy to Firebase dev site
```

## Architecture at a Glance

- `QuizProvider` fetches `public/quizzes.json`, seeds attempts from `localStorage`, and exposes quiz data via `useQuizData`.
- Routes:
  - `/` &mdash; dashboard with available and completed quizzes, export tools, and error handling for missing quiz data.
  - `/quiz/:quizId` &mdash; sequential quiz experience with per-question feedback, explanations, and result summaries.
  - `/quiz/:quizId/review/:attemptId` &mdash; read-only review mode to step through a captured attempt. The final question swaps the "Next" button for "Finish Review," which sends you straight back to the dashboard.
- Export buttons create downloadable JSON blobs for quizzes and attempt history without leaving the page.
- Responsive cards/grids mirror the provided mockups (`public/design/layout_*.png`).

## Quizzes & Attempts

- The Available Quizzes list automatically hides any quiz that has at least one attempt stored in `localStorage`. After you finish *all* quizzes, an “All caught up” notice points you toward the Completed section for retakes/reviews.
- Completed quizzes now show:
  - A summary of the most recent score.
  - A responsive table listing every attempt with completion date, `% score`, `X of Y` correctness, and a **Review** action.
- Review mode is read-only: no changes are written to storage, and each question highlights the correct answer plus what the user selected (with explanations on every step). During the live quiz flow, when you check an answer we now surface the same “Correct answer” / “You chose this” pills so the styling stays consistent even when you pick the wrong option.

### Grouping, search, and filters

- Each quiz in `public/quizzes.json` declares a `groupId` from the current taxonomy (`Union with Christ`, `Conversion`, `Regeneration`, `Salvation (Justification and Sanctification)`, `Election`, `Millennial Views`, `Resurrection`, `Judgment`, or `Eternal State`) so the dashboard can cluster cards by topic.
- A live search box filters as you type (case-insensitive across title, description, and group name). When searching, the UI switches to a flat list of matches and displays a friendly “No quizzes found” state if nothing matches.
- Topic filters sit next to the search bar: pill buttons on desktop, a hamburger menu on mobile. Selecting a group applies to both Available and Completed lists, and the `All` option resets the filter. Search always takes precedence over the active group filter.

## Data contracts

The schemas for quiz content and attempt tracking live in `docs/schema.md`. The live quiz catalog sits in `public/quizzes.json`, and attempts are stored under the `quizAttempts` localStorage key.

### Updating quizzes on a static host

1. Edit `public/quizzes.json` locally (follow `docs/schema.md`).
2. Deploy the updated JSON to the same folder on your static host/CDN.
3. No JavaScript rebuild is necessary unless you change the schema version.

### Exporting quiz data/results

Visit the bottom of the dashboard and use **Export Quiz Data** or **Export Quiz Results**. Each button downloads strongly-typed JSON files you can re-import elsewhere or archive for reporting.

## Testing

Vitest + React Testing Library cover application routing, list rendering, quiz-taking flows, localStorage utilities, error guards, export logic, and responsive layout toggles. Run `npm test` to validate before deploying.

## Firebase Hosting

The repo includes `.firebaserc` and `firebase.json` pre-configured for the `netware-326600` project/site (the default Hosting site shares the same ID). To deploy:

1. Authenticate once: `npx firebase login`.
2. Build + deploy to **prod**: `npm run deploy:firebase` (alias for `deploy:firebase:prod`).
3. Build + deploy to **dev**: `npm run deploy:firebase:dev`.

The dev and prod sites are defined in `.firebaserc` (`netware-326600` for prod, `netware-326600-dev` for dev) and targeted via `firebase.json`. Both share the same SPA settings (rewrites to `/index.html`, clean URLs, no trailing slash). Use the dev site for validation and promote to prod once satisfied.
Current dev URL: https://netware-326600-dev.web.app

## CI/CD

- `.github/workflows/deploy-prod-on-main.yml` deploys automatically whenever `main` is updated. The workflow checks out the repo, runs `npm ci`, executes the Vitest suite, builds, installs the Firebase CLI, and deploys to the `prod` hosting target.
- Add a `FIREBASE_TOKEN_PROD` secret to the repository settings (use `firebase login:ci` to generate the token).
- Manual production deploys remain available via `firebase deploy --only hosting:prod`, but the GitHub Action keeps the hosted site in sync with `main`.
