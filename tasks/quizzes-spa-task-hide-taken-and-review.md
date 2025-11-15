# Quizzes SPA – Feature Task: Hide Taken Quizzes & Review Attempts

> **Purpose of this document**  
> This checklist is meant to be pasted as a prompt to an AI coding assistant.  
> The AI should **implement this feature task in one turn**, updating the
> checkboxes from `[ ]` to `[x]` as it completes each step.  
> The AI must **not** ask clarifying questions; where details are ambiguous, it
> should make reasonable, documented assumptions in code comments and docs.

---

## 0. Meta & Global Constraints

- [x] You are working on an existing **Quizzes SPA** React project (Vite or similar).
- [x] For this task, you must:
  - [x] **Create unit tests at each major step** you implement.
  - [x] **Update technical documentation at each major step** (e.g., `TECH_NOTES.md` or a dedicated section in `README.md`).
  - [x] **Create and work in a feature branch** (e.g., `feature/hide-taken-quizzes-and-review`).
  - [x] **Deploy to the Firebase dev instance** after all implementation and tests pass.
- [x] Do not ask the user for any additional input. Make reasonable assumptions and document them.

---

## 1. Branch, Environment & Baseline Verification

- [x] 1.1. Create & switch to feature branch:
  - [x] Decide on a branch name (e.g., `feature/hide-taken-quizzes-and-review`).
  - [x] Document the branch name in the technical notes file.
- [x] 1.2. Install dependencies (if needed) and ensure:
  - [x] `npm install`
  - [x] `npm test` passes (existing tests).
  - [x] `npm run build` succeeds.
- [x] 1.3. Add/update a technical notes file (e.g., `docs/TECH_NOTES.md`):
  - [x] Describe the purpose of this feature task.
  - [x] Describe the two main features:
    - [x] (1) Hide quizzes already taken from “Available Quizzes”.
    - [x] (2) Show detailed attempts table and review mode in “Completed Quizzes”.
- [x] 1.4. Add/update a small unit test confirming the current behavior of:
  - [x] “Available Quizzes” list showing all quizzes.
  - [x] “Completed Quizzes” showing only the latest summary per quiz (pre-change baseline).

---

## 2. Feature 1 – Hide Quizzes Already Taken from “Available Quizzes”

> Original requirement:  
> **[x] 1 - remove quizes that have already been taken from the "Available Quizzes" list after they are taken. this should use the memory on page refresh to only show quizzes that have not been taken.**

### 2.1. Data & State Modeling

- [x] 2.1.1. Decide how to determine “already taken”:
  - [x] Use existing **quiz attempts** data in localStorage (e.g., `quizAttempts`).
  - [x] A quiz is considered “taken” if there is at least **one attempt** for that `quizId`.
  - [x] Document this rule in `TECH_NOTES.md`.
- [x] 2.1.2. Implement a selector/helper function:
  - [x] Add a function like `getTakenQuizIds(attempts)` that returns a `Set`/array of `quizId`s with attempts.
  - [x] Add tests for:
    - [x] No attempts + empty result.
    - [x] Multiple attempts on one quiz + quiz appears once.
    - [x] Attempts across multiple quizzes + all relevant `quizId`s are included.

### 2.2. Update “Available Quizzes” List

- [x] 2.2.1. In `QuizListPage` (or equivalent component), change the logic:
  - [x] Filter the **Available Quizzes** list so that it **excludes** quizzes whose `id` is in the “taken” set.
  - [x] Ensure this uses attempts loaded from localStorage so that **page refresh** honors previously completed quizzes.
- [x] 2.2.2. Handle empty state:
  - [x] If all quizzes have been taken, show a friendly message such as:
    - “You’ve completed all available quizzes. You can still retake them from the Completed section.”
- [x] 2.2.3. Unit tests:
  - [x] Test that a quiz with at least one attempt does **not** appear in “Available Quizzes”.
  - [x] Test that quizzes with no attempts **do** appear.
  - [x] Test that the “all done” empty state is rendered when every quiz has at least one attempt.
- [x] 2.2.4. Update technical docs:
  - [x] Document the behavior change for “Available Quizzes”.
  - [x] Describe how the app uses localStorage to hide completed quizzes after refresh.

---

## 3. Feature 2 – Attempts Table & Review Mode in “Completed Quizzes”

> Original requirement:  
> **[x] 2 - for each quiz completed in the "Completed Quizzes" section, show the results as a table - % Score, correct, Review. this way we can see all of the attempts .keep the "Retake" button as it is. The review button should provide a read only version of the quiz that shows the answer and explanation where the user can step through each question.**

### 3.1. Extend Data Access for Attempts per Quiz

- [x] 3.1.1. Implement a selector/helper:
  - [x] Add a helper like `getAttemptsByQuizId(attempts, quizId)` that returns an array of attempts, sorted by `completedAt` descending (most recent first).
  - [x] Add tests for:
    - [x] Correct filtering by `quizId`.
    - [x] Correct sorting order (most recent first).
- [x] 3.1.2. Update “Completed Quizzes” section:
  - [x] For each quiz that has attempts:
    - [x] Show quiz title and existing **Retake** button.
    - [x] Below that, render a **table of all attempts** for that quiz with columns:
      - [x] Attempt date/time (e.g., formatted `completedAt`).
      - [x] `% Score` (scorePercent).
      - [x] `Correct` as “X of Y”.
      - [x] `Review` button/link for each attempt.

### 3.2. Review Mode – Read-Only Quiz Review

- [x] 3.2.1. Routing / UI entry point:
  - [x] Decide on a route pattern such as: `/quiz/:quizId/review/:attemptId`.
  - [x] Add route to router configuration.
  - [x] Document the route in `TECH_NOTES.md`.
- [x] 3.2.2. Implement `QuizReviewPage` (or similar component):
  - [x] Loads the **quiz** data by `quizId`.
  - [x] Loads the **attempt** data by `attemptId` from localStorage.
  - [x] If either is not found, show an error and a link back to the main page.
- [x] 3.2.3. Read-only question display:
  - [x] Show quiz title and a label like “Review (read-only)”.
  - [x] For each question (one at a time, step-through) OR all at once:
    - [x] Show question number and text.
    - [x] Show all options, with visual indication for:
      - [x] The **correct** option.
      - [x] The **selected** option from the stored attempt (if different).
    - [x] Show the explanation text for the question.
  - [x] Add navigation controls:
    - [x] “Previous” / “Next” buttons if using step-through mode.
    - [x] A “Back to Completed Quizzes” button or link.
- [x] 3.2.4. Ensure **no changes** are written to localStorage in review mode:
  - [x] Review is strictly read-only.
  - [x] Document this behavior in `TECH_NOTES.md`.

### 3.3. Unit Tests for Completed Quizzes & Review

- [x] 3.3.1. Tests for “Completed Quizzes” list:
  - [x] Assert that, for a quiz with multiple attempts, a table renders all attempts.
  - [x] Assert that each attempt row includes `% Score`, “X of Y”, and a “Review” action.
- [x] 3.3.2. Tests for `QuizReviewPage`:
  - [x] Renders when provided a valid `quizId` and `attemptId`.
  - [x] Shows correct question count and navigable structure if step-through.
  - [x] Correctly marks the right answer and the selected answer.
  - [x] Displays the explanation text.
  - [x] Does **not** modify localStorage (can verify by mocking and asserting no `setItem` call).

- [x] 3.3.3. Update technical docs:
  - [x] Add a section describing:
    - [x] The attempts table (columns & behavior).
    - [x] The review route and read-only behavior.
    - [x] Any assumptions (e.g., max attempts shown, sorting order).

---

## 4. UI & UX Adjustments

- [x] 4.1. Styling:
  - [x] Ensure the attempts table is readable on **desktop and mobile**:
    - [x] On small screens, consider stacking cells or using responsive styles.
    - [x] Maintain consistency with the existing SPA design (cards, colors, typography).
- [x] 4.2. Visual indicators:
  - [x] In review mode, use clear visual markers:
    - [x] For the **correct answer** (e.g., green border/label).
    - [x] For the **selected answer** (e.g., underline or icon).
  - [x] Confirm that the distinction holds in light/dark or typical themes.
- [x] 4.3. Tests (lightweight):
  - [x] Add at least one test that asserts presence of key CSS classnames or structural elements to ensure the table and review markup exist.

---

## 5. Final Verification, Docs & Deployment

- [x] 5.1. Full test & build:
  - [x] Run `npm test` and ensure all tests (old + new) pass.
  - [x] Run `npm run build` to ensure the app builds successfully.
- [x] 5.2. Documentation:
  - [x] Update `README.md` (or main docs) to:
    - [x] Describe hiding behavior for already-taken quizzes.
    - [x] Describe how users can see multiple attempts and enter review mode.
    - [x] Note the new review route pattern.
- [x] 5.3. Firebase dev deployment:
  - [x] Build the project for production.
  - [x] Deploy the built app to the **Firebase dev instance** (e.g., `firebase deploy --only hosting:dev`).
  - [x] Document the deployment command and dev URL in `TECH_NOTES.md`.
- [x] 5.4. Branch completion:
  - [x] Summarize in technical notes what changed in this branch (short changelog).
  - [x] Optionally, provide suggested commit message examples.
  - [x] Indicate that the feature branch is ready for review/merge (e.g., `feature/hide-taken-quizzes-and-review`).

---


