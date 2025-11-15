# QuizSpark SPA

A fully client-side quizzes experience built with Vite, React, and TypeScript. Quizzes are loaded from a static JSON file and all attempt data persists in `localStorage`, making the app ideal for simple CDN or object-storage hosting.

## Scripts

```bash
npm install        # install dependencies
npm run dev        # start the dev server
npm test           # run the Vitest + RTL suite once
npm run test:watch # optional watch mode
npm run build      # type-check and build static assets in dist/
npm run preview    # serve the production build locally
npm run deploy:firebase # build + deploy to Firebase Hosting (requires auth)
```

## Architecture at a Glance

- `QuizProvider` fetches `public/quizzes.json`, seeds attempts from `localStorage`, and exposes quiz data via `useQuizData`.
- Routes:
  - `/` &mdash; dashboard with available and completed quizzes, export tools, and error handling for missing quiz data.
  - `/quiz/:quizId` &mdash; sequential quiz experience with per-question feedback, explanations, and result summaries.
- Export buttons create downloadable JSON blobs for quizzes and attempt history without leaving the page.
- Responsive cards/grids mirror the provided mockups (`public/design/layout_*.png`).

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
2. Build the SPA and deploy: `npm run deploy:firebase`.

The deploy script runs `npm run build` and pushes the `dist/` directory using the Hosting settings (SPA rewrites to `/index.html`, clean URLs, trailing slash removal). If you need to deploy to a different site, change the `site` value inside `firebase.json` accordingly.
