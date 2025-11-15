# Quizzes SPA – One-Turn Build Instructions Checklist

> **Purpose of this document**  
> This checklist is meant to be the prompt to an AI coding assistant.  
> The AI should **implement the entire quizzes SPA in one turn**, updating the
> checkboxes from `[ ]` to `[x]` as it completes each step.  
> The AI must **not** ask clarifying questions; where details are ambiguous, it
> should make reasonable, documented assumptions.
> - Create and update technical docuemntation (markdown files) at each step.
> - Unit test should be create at each step to confirm code changes are operational and functioning as expected.
> - all json schema should be documneted in a schema file on creation and modificaiton for each step.
> - a sampple landing page is "layout_landing_example.png"
> - a smaple quiz page is "layout_quiz_question.png"

---

## 0. Meta & Constraints

- [x] You are an AI coding assistant. Your task is to **design and implement** a complete quizzes SPA web site (React, static hosting, localStorage) following these instructions in a **single turn**.
- [x] As you complete each step, **edit this markdown** and change `[ ]` to `[x]` for the completed tasks so the user can see progress and, if needed, resume later.
- [x] Do **not** ask the user any clarifying questions. Make reasonable assumptions and briefly note them in comments in the code where relevant.
- [x] Ensure the final output includes:
  - [x] All required source code (React SPA).
  - [x] JSON data structures and at least one sample quiz JSON.
  - [x] Unit tests (incrementally covering the app).
  - [x] Instructions or notes on how to build and run the app.
  - [x] Mechanism to export quiz data and results.
  - [x] A brief note on how to update the quiz JSON periodically on a static host.

---

## 1. Project Setup

### 1.1 Base Tooling & Project Structure

- [x] Create a **React SPA** project using a modern build tool (e.g., **Vite + React**).
- [x] Use **JavaScript or TypeScript** (choose one and stay consistent; TypeScript preferred for better structure).
- [x] Ensure the project can be built into **static files** (HTML, JS, CSS) suitable for static hosting (e.g., GitHub Pages, Netlify, S3).
- [x] Define a sensible folder structure, e.g.:
  - [x] `src/` – application source
    - [x] `components/` – reusable UI components
    - [x] `pages/` – top-level views (Quiz List, Quiz Detail, etc.)
    - [x] `hooks/` – custom hooks (e.g., for localStorage)
    - [x] `types/` – shared TypeScript types (if using TS)
    - [x] `utils/` – helper functions
    - [x] `data/` – (optional) local sample JSON for development
  - [x] `public/` – static assets (including quizzes JSON, styled design image if provided)
- [x] Configure **npm scripts** in `package.json` at minimum:
  - [x] `"dev"` – run dev server
  - [x] `"build"` – build for production
  - [x] `"preview"` – preview built app (if using Vite)
  - [x] `"test"` – run unit tests

### 1.2 Testing Framework

- [x] Set up a **unit testing framework**:
  - [x] Use **Vitest** or **Jest**, plus **React Testing Library**.
- [x] Confirm one trivial test runs successfully (e.g., `"it('true is true', ...)"`).

---

## 2. Data Modeling (Quizzes & Results)

### 2.1 Quiz JSON Schema

- [x] Design a JSON schema for quizzes, based on these required fields:

  For each **quiz**:

  - `id` (string) – unique quiz id (storage id).
  - `title` (string) – quiz title.
  - `description` (string) – short description of the quiz.
  - `questions` (array of question objects).

  For each **question**:

  - `id` (string) – question id (for result tracking).
  - `number` (number) – question sequence/order.
  - `question` (string) – question text.
  - `type` (string) – `"multiple_choice"` or `"true_false"`.
  - `options` (array of options):
    - Each option:
      - `id` (string) – option id (e.g., `"a"`, `"b"`, `"true"`, `"false"`).
      - `letter` (string) – label (e.g., `"A"`, `"B"`, `"T"`, `"F"`).
      - `text` (string) – option text.
  - `answer` (string) – the **correct option id** (e.g., `"b"`, `"true"`).
  - `explanation` (string) – explanation of the correct answer.

- [x] Decide **one JSON file that contains all quizzes**, e.g. `public/quizzes.json`:
  - Top-level shape example:
    ```json
    {
      "version": 1,
      "quizzes": [ /* quiz objects */ ]
    }
    ```

### 2.2 Results JSON Schema (Stored in Local Storage)

- [x] Define a schema for **quiz attempts/results** that supports reporting:

  For each **quiz attempt**:

  - `attemptId` (string) – unique id (e.g., UUID or timestamp-based).
  - `quizId` (string).
  - `quizTitle` (string) – cached to avoid lookup changes.
  - `startedAt` (ISO string timestamp).
  - `completedAt` (ISO string timestamp).
  - `scorePercent` (number) – percentage correct (0–100).
  - `correctCount` (number).
  - `totalCount` (number).
  - `answers` (array of per-question records):
    - `questionId` (string).
    - `questionNumber` (number).
    - `selectedOptionId` (string).
    - `correctOptionId` (string).
    - `isCorrect` (boolean).

- [x] Decide to store all attempts in **localStorage** under a key, e.g.:
  - `"quizAttempts"` → JSON-encoded array of attempts.

- [x] Decide how to compute **“completed quizzes”**:
  - [x] For main page summary, use the **most recent attempt per quiz** to show:
    - `% correct`
    - `"# of #"` correct, e.g., `"7 of 10"`.

---

## 3. Sample Quiz JSON

### 3.1 Provide a Sample `quizzes.json`

- [x] Include a **complete sample JSON** for at least one quiz, containing both:
  - [x] A **multiple-choice** question, and
  - [x] A **true/false** question.

Example (adapt as needed, but keep structure aligned to the schema above):

```json
{
  "version": 1,
  "quizzes": [
    {
      "id": "sample-theology-1",
      "title": "Sample Theology Basics",
      "description": "A small demo quiz to test the quiz engine.",
      "questions": [
        {
          "id": "q1",
          "number": 1,
          "question": "According to John 3:16, God so loved the...",
          "type": "multiple_choice",
          "options": [
            { "id": "a", "letter": "A", "text": "Church" },
            { "id": "b", "letter": "B", "text": "World" },
            { "id": "c", "letter": "C", "text": "Disciples" },
            { "id": "d", "letter": "D", "text": "Angels" }
          ],
          "answer": "b",
          "explanation": "John 3:16 states that God so loved the world."
        },
        {
          "id": "q2",
          "number": 2,
          "question": "True or False: In a static SPA deployment, quizzes can be loaded from a JSON file hosted alongside the app.",
          "type": "true_false",
          "options": [
            { "id": "true", "letter": "T", "text": "True" },
            { "id": "false", "letter": "F", "text": "False" }
          ],
          "answer": "true",
          "explanation": "A static SPA can fetch JSON files from the same origin using a simple HTTP request."
        }
      ]
    }
  ]
}
```

- [x] Place this `quizzes.json` sample in an appropriate location (e.g., `public/quizzes.json`) and ensure it will be served by the static host.

---

## 4. Static JSON Loading Strategy

- [x] Implement a **data loading function** (e.g., `loadQuizzes` in `src/utils/quizzes.ts`) that:
  - [x] Fetches `"/quizzes.json"` at runtime.
  - [x] Parses JSON and returns an array of quizzes.
  - [x] Has basic error handling (network error, parse error).
- [x] Add logic so that:
  - [x] On initial load of the SPA, quizzes are fetched and stored in state (e.g., React context or top-level state in `App`).
- [x] Include a comment or small note explaining that **to update quizzes on a static host**, the user can:
  - [x] Replace/modify `quizzes.json` on the server without changing the JavaScript bundle, as long as the structure remains compatible.

---

## 5. Application Architecture & Routing

### 5.1 High-Level Views

- [x] Decide on SPA structure with (for example) views:
  - [x] `QuizListPage` (main page).
  - [x] `QuizDetailPage` (quiz-taking view).
  - [x] (Optional) `ExportPage` or modal for exporting data.
- [x] Use **React Router** (or a simple custom router) for:
  - [x] `/` – quiz list and completed quizzes.
  - [x] `/quiz/:quizId` – quiz detail and question UI.
  - [x] `/export` – optional export page (or handle export on `/`).

### 5.2 App Component

- [x] Implement `App` to:
  - [x] Initialize quiz data (fetch from JSON).
  - [x] Initialize existing attempts from localStorage.
  - [x] Provide context or props for children to access quizzes and attempts.
  - [x] Set up routes for the pages.

- [x] Write a **unit test** that:
  - [x] Renders `App`.
  - [x] Mocks quiz loading.
  - [x] Asserts that the main quiz list page is shown (e.g., sees heading “Available Quizzes”).

---

## 6. Main Page UI – Quiz List & Completed Quizzes

### 6.1 “Available Quizzes” List

- [x] Implement `QuizListPage` with two main sections:
  - [x] **Available Quizzes** – list of all quizzes from `quizzes.json`.
  - [x] **Completed Quizzes** – list of quizzes with at least one attempt.
- [x] For each quiz in **Available Quizzes**:
  - [x] Show title, description, number of questions.
  - [x] Include a button/link “Start Quiz” that navigates to `/quiz/:quizId`.

### 6.2 “Completed Quizzes” Summary

- [x] For each quiz that has at least one attempt:
  - [x] Show title.
  - [x] Show **most recent attempt’s** score:
    - [x] Percentage (e.g., “80%”).
    - [x] Count text (e.g., “8 of 10 correct”).
  - [x] Provide a “Retake Quiz” button that navigates to `/quiz/:quizId`.
  - [x] Optionally show number of attempts total.

### 6.3 Tests for Quiz List Page

- [x] Unit tests for `QuizListPage` to verify:
  - [x] It renders all quizzes from provided data.
  - [x] It correctly shows completed quizzes with summary stats when attempts exist.
  - [x] Clicking “Start Quiz” navigates to the correct quiz route (can be tested with React Router testing utilities).

---

## 7. Quiz-Taking Experience

### 7.1 Quiz Detail Page Layout

- [x] Implement `QuizDetailPage` that:
  - [x] Loads quiz by `quizId` from URL.
  - [x] Displays quiz title and description.
  - [x] Shows questions one at a time **or** all at once (choose one and stay consistent; note in comments).
  - [x] For each question:
    - [x] Show question number and text.
    - [x] Show options as radio buttons (or toggle buttons).
    - [x] Allow the user to select an option.

### 7.2 Immediate Feedback & Explanation

- [x] When the user finalizes an answer for a question (e.g., clicks “Submit answer” or “Next”):
  - [x] Immediately determine if it is **correct** or **incorrect**.
  - [x] Display a feedback message:
    - [x] e.g., “Correct!” or “Incorrect.”
  - [x] Display the **explanation** text for that question.
- [x] Ensure that after answering a question:
  - [x] The selected choice and correctness state are stored in component state, to be later persisted as part of an attempt.

### 7.3 Completing a Quiz

- [x] When all questions are answered:
  - [x] Calculate total `correctCount`, `totalCount`, and `scorePercent`.
  - [x] Show a summary view:
    - [x] “You scored X of Y correct (Z%).”
    - [x] Option to:
      - [x] Return to the main page.
      - [x] Retake the quiz immediately (reset state).
- [x] At completion, **persist a new quiz attempt** into localStorage using the schema defined in section 2.2.

### 7.4 Tests for Quiz Detail Page

- [x] Unit tests covering:
  - [x] Loading a quiz and rendering its first question.
  - [x] Selecting an answer, submitting, and seeing correct/incorrect feedback.
  - [x] Seeing the explanation displayed after answering.
  - [x] Completing the quiz and writing a new attempt to localStorage (mocked).

---

## 8. Local Storage Persistence Logic

### 8.1 Storage Utility

- [x] Implement a reusable **localStorage utility**, e.g. `src/utils/storage.ts`:
  - [x] Functions for:
    - `getAttempts(): QuizAttempt[]`
    - `saveAttempt(attempt: QuizAttempt): void`
  - [x] Handle absence of data gracefully (return empty array).
  - [x] Wrap `JSON.parse` in `try/catch` to avoid runtime errors.

### 8.2 Integration with App State

- [x] On app load:
  - [x] Read all attempts from localStorage.
- [x] When a new attempt is saved:
  - [x] Update in-memory state so the main page instantly reflects new scores.
- [x] Derive **most recent attempt per quiz** from the attempts list for the “Completed Quizzes” section.

### 8.3 Tests for Storage

- [x] Unit tests for storage utilities:
  - [x] Verify that saving and loading attempts works (with localStorage mocked).
  - [x] Verify that corrupted JSON does not break the app (return empty array).

---

## 9. Exporting Quizzes and Results

### 9.1 Export Mechanism

- [x] Implement an **export feature** on the main page (or a separate export page) that provides:
  - [x] A button “Export Quiz Data”.
  - [x] A button “Export Quiz Results”.
- [x] For **Export Quiz Data**:
  - [x] Package the currently loaded quizzes (the same structure as `quizzes.json`).
  - [x] Create a downloadable JSON file (e.g., `quizzes-export.json`) via `Blob` + `URL.createObjectURL`.
- [x] For **Export Quiz Results**:
  - [x] Package all attempts currently stored in localStorage as JSON (e.g., `quiz-results-export.json`).
  - [x] Provide as a downloadable file using the same mechanism.

### 9.2 Tests for Export Features

- [x] Unit tests (or integration tests) that:
  - [x] Verify clicking the export buttons calls the export logic.
  - [x] Verify the data passed into the blob matches the in-memory quizzes/attempts (assert on stringified JSON or a helper function).

---

## 10. Responsiveness & Styling

### 10.1 Base Styling

- [x] Implement a **responsive layout** suitable for both mobile and desktop:
  - [x] Use flexbox and/or CSS grid.
  - [x] Ensure text and buttons are reasonably sized on small screens.
- [x] Use a light, clean design with:
  - [x] Clear hierarchy for headings and sections.
  - [x] Visual distinction between Available and Completed quizzes.
  - [x] Clearly styled question cards and answer buttons.

### 10.2 Styled Image & Design Direction

- [x] Assume a **styled image (mockup)** is provided. Use it as guidance:
  - [x] Match color palette and general layout as closely as reasonable.
  - [x] Use the image for overall feel (card styles, spacing, typography).
- [x] Implement a reusable `Card` component (if that fits the design) for list items and questions.

### 10.3 Responsiveness Tests (Basic)

- [x] Add at least one test that:
  - [x] Renders the main page and tests a layout-related behavior (e.g., presence of mobile-friendly classes or conditional layout).
  - (Note: unit tests cannot check actual screen width, but can verify classnames or structural differences if any.)

---

## 11. Error Handling & Edge Cases

- [x] Handle the case where `quizzes.json` fails to load:
  - [x] Show a user-friendly error message on the main page.
- [x] Handle the case where a quiz id does not exist:
  - [x] Show “Quiz not found” and a link back to home.
- [x] Handle the case where there are no attempts yet:
  - [x] “Completed Quizzes” section should show a friendly empty state message.

- [x] Write tests to cover:
  - [x] Missing quiz case.
  - [x] No attempts case.
  - [x] Failed quiz loading (mock fetch error).

---

## 12. Final Integration & Verification

- [x] Ensure the entire app builds without errors using `npm run build`.
- [x] Ensure the test suite passes using `npm test`.
- [x] Provide a brief **README-style note** in the final answer describing:
  - [x] How to install dependencies (`npm install`).
  - [x] How to run the dev server (`npm run dev`).
  - [x] How to run tests (`npm test`).
  - [x] How to build for production (`npm run build`).
  - [x] How to update quizzes for a static deployment (replace `quizzes.json`).
  - [x] How to export results and quizzes from the UI.

- [x] In your final answer to the user, present:
  - [x] The **updated version of this markdown** with `[x]` for completed steps.
  - [x] The essential code files (React components, utilities, tests).
  - [x] The sample `quizzes.json`.
  - [x] Any additional small notes that help the user host the SPA as static files.

## 13 Added - Deploy and repo
- [ ] I have create a blank github repo "https://github.com/vladi03/quizzes" commit these changes to thiss repo
- [ ] create a static hosting for firebase that can be deployed to https://console.firebase.google.com/u/0/project/netware-326600/hosting/sites
- [ ] create a filrebase hosting for a dev instance for testing the site before going to the prod instance
