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
  - `/export` &mdash; a dedicated export console that highlights how many attempts are ready, lets you download the JSON, copy it to the clipboard, and preview the payload before moving to another device.
- Export buttons create downloadable JSON blobs for quizzes and attempt history without leaving the page.
- Responsive cards/grids mirror the provided mockups (`public/design/layout_*.png`).
- Screenshot-backed UI behavior notes live in [`docs/ui-functional-description.md`](docs/ui-functional-description.md).

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
- Group filters now persist after you navigate away/refresh, and completed groups are indicated with a green checkmark for quick scanning.
- Each group filter label shows the number of quizzes for that topic (e.g., `Soteriology (6)`), and the `All` option shows the total quiz count.

## Data contracts

The schemas for quiz content and attempt tracking live in `docs/schema.md`. The live quiz catalog sits in `public/quizzes.json`, and attempts are stored under the `quizAttempts` localStorage key.

### Updating quizzes on a static host

1. Edit `public/quizzes.json` locally (follow `docs/schema.md`).
2. Deploy the updated JSON to the same folder on your static host/CDN.
3. No JavaScript rebuild is necessary unless you change the schema version.

### Exporting quiz data/results

Open the **Export** link in the top navigation (or scroll to the dashboard's **Export Tools** card) to grab your data. The Export page highlights how many attempts are bundled, downloads the JSON (`quizspark-results-export.json`), and also lets you copy the payload straight to your clipboard after previewing it so you can paste into issue trackers or cloud storage.

### Transferring results between devices

1. **On Device A:** open the dashboard, click **Export Quiz Results**, and keep the downloaded `quiz-results-export.json`.
2. **On Device B:** load the SPA, scroll to the Export Tools card, and click **Import Results**. Pick the exported JSON file.
3. The importer validates the payload shape, merges attempts into localStorage, and reports how many attempts were added or skipped as duplicates.

Notes:

- Deduplication is keyed on `attemptId`, so importing the same file multiple times is safe.
- Transfer files include a `"version": 1` field. Future versions will continue to import as long as the `attempts[]` structure matches.
- Everything runs client-side; importing hundreds of attempts is supported but can briefly pause the UI while the browser parses the file.

## Testing

Vitest + React Testing Library cover application routing, list rendering, quiz-taking flows, localStorage utilities, error guards, export logic, and responsive layout toggles. Run `npm test` to validate before deploying.

## Firebase Hosting

The repo includes `.firebaserc` and `firebase.json` pre-configured for the `netware-326600` project/site (the default Hosting site shares the same ID). To deploy:

1. Authenticate once: `npx firebase login`.
2. Build + deploy to **prod**: `npm run deploy:firebase` (alias for `deploy:firebase:prod`).
3. Build + deploy to **dev**: `npm run deploy:firebase:dev`.

The dev and prod sites are defined in `.firebaserc` (`netware-326600` for prod, `netware-326600-dev` for dev) and targeted via `firebase.json`. Both share the same SPA settings (rewrites to `/index.html`, clean URLs, no trailing slash). Use the dev site for validation and promote to prod once satisfied.
Current dev URL: https://netware-326600-dev.web.app

## Firebase Auth + Firestore Setup

Cloud sync relies on Firebase Auth (email/password) and Firestore. Configure them once per environment (dev + prod):

1. **Create Firebase projects** for dev and prod (or add an additional web app under an existing project) and enable the **Email/Password** provider inside the Authentication tab.
2. **Create a Firestore database** (Native mode). Security rules should scope every user to their own document path, e.g.:
   ```rules
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId}/quizAttempts/{attemptId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ```
3. From the project settings screen, copy the **Web App config** values and add them to `.env` (or `.env.local`). Required keys are listed in `.env.example`:
   ```bash
   VITE_FIREBASE_API_KEY="..."
   VITE_FIREBASE_AUTH_DOMAIN="..."
   VITE_FIREBASE_PROJECT_ID="..."
   VITE_FIREBASE_STORAGE_BUCKET="..."
   VITE_FIREBASE_MESSAGING_SENDER_ID="..."
   VITE_FIREBASE_APP_ID="..."
   VITE_FIREBASE_MEASUREMENT_ID="" # optional
   ```
4. Use the dev project's values for day-to-day development and the prod project's values on the production build pipeline (e.g., via GitHub Actions secrets). The SPA reads these keys at build time, so swapping environments only requires updating the env file or CI secrets.
5. After the env vars are defined, restart `npm run dev`. The **Cloud Sync** entry in the header will show the sign-in form, and authenticated users will be synced to Firestore in the background.

## Cloud Sync UX

- Cloud sync is **opt-in**. Anonymous visitors stay entirely local (same behavior as before), while authenticated users mirror quiz attempts to Firestore in the background.
- After you log in, any quiz attempts that already live in the cloud hydrate this device automatically, and the Firestore listener keeps streaming new attempts from other devices without a refresh.
- The header now includes a **Cloud Sync** menu: sign up or log in with email/password, then you can sign out or review your sync status (`Synced`, `Syncing`, `Using local data`, or `Cloud disabled` if env vars are missing).
- Sync triggers on login, on startup when a session is already authenticated, and immediately after completing a quiz. The dedup logic matches the manual import/export flow (keyed on `attemptId`), so the same attempt never lands twice.
- If remote-only attempts are imported, a toast appears for ~4 seconds (desktop and mobile friendly) letting you know how many results were pulled down.
- Sync failures leave the app usable (localStorage remains the source of truth). The status badge flips to “Using local data,” and you can hover/tap for the latest error message.

## CI/CD

- `.github/workflows/deploy-prod-on-main.yml` deploys automatically whenever `main` is updated or a tag named `prod-*` is pushed. Use the tag trigger as a manual fallback (`git tag prod-YYYY-MM-DD && git push origin prod-YYYY-MM-DD`) if you need to redeploy a known-good build without touching `main`. You can also run the workflow manually from the Actions tab and supply any branch/tag (e.g., select `prod-2025-11-17`) via the `target_ref` input.
- Add a `FIREBASE_TOKEN_PROD` secret to the repository settings (use `firebase login:ci` to generate the token).
- Manual production deploys remain available via `firebase deploy --only hosting:prod`, but the GitHub Action keeps the hosted site in sync with `main`.
