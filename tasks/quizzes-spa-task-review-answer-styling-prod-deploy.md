# Quizzes SPA – Feature Task: Review Finish Button, Answer Styling, and Prod Deploy

> **Purpose of this document**  
> This checklist is meant to be pasted as a prompt to an AI coding assistant.  
> The AI should **implement this feature task in one turn**, updating the
> checkboxes from `[x]` to `[x]` as it completes each step.  
> The AI must **not** ask clarifying questions; where details are ambiguous, it
> should make reasonable, documented assumptions in code comments and docs.

> **General Instruction**  
> At each step:
> - Create or update **unit tests**.  
> - Update **technical documentation**.  
> Work in a **feature branch** and deploy to the **Firebase dev instance** when the feature is complete. Run the commands yourself. do not ask for them to be run.

Original requirements:

- [x] 1 - On reviewing the questions when you get the the last questions make the button "Finsh Review" and return to the home page.  
- [x] 2 - When taking the quiz and answering the question with a wrong answer, make the "Correct answer" and "You chose this" with the same styling and text like the question review page.  
- [x] 3 - create a guthub action that deploys to PROD when a PR is merged to main  

---

## 0. Meta & Global Constraints

- [x] You are working on an existing **Quizzes SPA** React project (Vite or similar) which already supports:
  - [x] Taking quizzes and storing attempts in localStorage.
  - [x] A review mode that lets users step through past attempts read-only.
  - [x] Firebase hosting for dev and prod environments.
- [x] For this task, you must:
  - [x] **Create unit tests at each major step** you implement.
  - [x] **Update technical documentation at each major step** (e.g., `TECH_NOTES.md` or a dedicated section in `README.md`).
  - [x] **Create and work in a feature branch** (e.g., `feature/review-finish-answer-styling-prod-deploy`).
  - [x] **Deploy to the Firebase dev instance** after all implementation and tests pass.
- [x] Do not ask the user for any additional input. Make reasonable assumptions and document them.

---

## 1. Branch, Environment & Baseline Verification

- [x] 1.1. Create & switch to feature branch:
  - [x] Decide on a branch name (e.g., `feature/review-finish-answer-styling-prod-deploy`).
  - [x] Document the branch name and purpose in the technical notes file.
- [x] 1.2. Verify environment:
  - [x] Run `npm install` if needed.
  - [x] Run `npm test` to confirm current tests pass.
  - [x] Run `npm run build` to ensure the app builds successfully.
- [x] 1.3. Update technical notes (e.g., `docs/TECH_NOTES.md`):
  - [x] Describe this feature task and its three main goals.
  - [x] Note current behavior of:
    - [x] Quiz review navigation (previous/next buttons, last question behavior).
    - [x] In-quiz feedback styling for correct/incorrect answers.
    - [x] Existing CI/CD or deploy process (if any).
- [x] 1.4. Add/update a small baseline test (if not present) that:
  - [x] Confirms the review page currently renders multiple questions and navigation.
  - [x] Confirms that feedback is shown on wrong answers during quiz taking.
  - [x] Confirms the repo builds successfully under test CI config (if applicable).

---

## 2. Feature 1 – “Finish Review” on Last Question

> Requirement:  
> **[x] 1 - On reviewing the questions when you get the the last questions make the button "Finsh Review" and return to the home page.**

### 2.1. Behavior Design

- [x] 2.1.1. Define the behavior for the review navigation:
  - [x] When reviewing, each question can be navigated using “Previous” / “Next” buttons.
  - [x] On the **last question**:
    - [x] The **“Next”** button should be replaced or relabeled as **“Finish Review”**.
    - [x] Clicking **“Finish Review”** should:
      - [x] End the review session.
      - [x] Navigate back to the **home page** (`/`) or main quiz list.
  - [x] Document this behavior clearly in `TECH_NOTES.md`.

### 2.2. Implementation in Review Page

- [x] 2.2.1. Update the review component (e.g., `QuizReviewPage`):
  - [x] Identify the current index of the question being reviewed and the total number of questions.
  - [x] Conditionally render:
    - [x] If **not** on last question: show “Next” button.
    - [x] If on last question: show **“Finish Review”** button.
  - [x] Ensure the “Finish Review” action uses the existing routing mechanism (e.g., React Router `useNavigate`) to go to `/`.
- [x] 2.2.2. Ensure correct accessibility & text:
  - [x] Button label exactly `"Finish Review"` (fix spelling if required).
  - [x] Add `aria-label` if necessary for clarity.

### 2.3. Tests for “Finish Review”

- [x] 2.3.1. Unit tests:
  - [x] Render `QuizReviewPage` with a quiz that has multiple questions.
  - [x] Simulate navigating to the last question.
  - [x] Assert that:
    - [x] The button text is `"Finish Review"`.
    - [x] Clicking `Finish Review` triggers navigation to `/` (mock router and assert).
- [x] 2.3.2. Update technical docs:
  - [x] Document the new “Finish Review” behavior in the review mode description.

---

## 3. Feature 2 – Align Wrong Answer Feedback Styling with Review Page

> Requirement:  
> **[x] 2 - When taking the quiz and answering the question with a wrong answer, make the "Correct answer" and "You chose this" with the same styling and text like the question review page.**

### 3.1. Identify Existing Styling & Text in Review Mode

- [x] 3.1.1. Determine how the review page currently displays:
  - [x] The **correct answer** (e.g., label text, color, background, icon).
  - [x] The **user’s chosen answer** (e.g., “You chose this”, highlight).
- [x] 3.1.2. Extract these styles/text into shared components or shared CSS:
  - [x] Option A: Create a reusable component, e.g., `AnswerHighlight`, that:
    - [x] Accepts props for `isCorrect`, `isSelected`, and optionally `label`.
  - [x] Option B: Centralize CSS utility classes used on both review and in-quiz states.
  - [x] Document the chosen approach in `TECH_NOTES.md`.

### 3.2. Apply Shared Styling When User Answers Wrong In-Quiz

- [x] 3.2.1. In the quiz-taking component (e.g., `QuizDetailPage` or `QuestionCard`):
  - [x] After an answer is submitted and determined **wrong**:
    - [x] Show:
      - [x] The **correct answer** using the same label/text and styling as in review mode.
      - [x] The **chosen wrong answer** with the same “You chose this” styling as review mode.
  - [x] Ensure this does **not** conflict with existing correct-answer feedback behavior.
- [x] 3.2.2. Ensure copy/text is aligned:
  - [x] Use identical phrases as review, such as:
    - [x] `"Correct answer"` for the correct option.
    - [x] `"You chose this"` for the user’s selected option.
- [x] 3.2.3. Confirm this works for:
  - [x] Multiple-choice questions.
  - [x] True/false questions.

### 3.3. Tests for In-Quiz Feedback Styling

- [x] 3.3.1. Unit tests:
  - [x] Render the quiz question component.
  - [x] Simulate selecting a **wrong** option and submitting.
  - [x] Assert that:
    - [x] The correct option is present with `"Correct answer"` label and review-like styling (e.g., CSS class).
    - [x] The chosen wrong option is present with `"You chose this"` label and review-like styling.
- [x] 3.3.2. Optionally, add snapshot tests:
  - [x] One for review mode question rendering.
  - [x] One for in-quiz wrong-answer rendering.
  - [x] Compare structure/classes to ensure consistency.
- [x] 3.3.3. Update docs:
  - [x] Document that in-quiz feedback now mirrors the review styling and wording.

---

## 4. Feature 3 – GitHub Action for PROD Deploy on Merge to Main

> Requirement:  
> **[x] 3 - create a guthub action that deploys to PROD when a PR is merged to main**

### 4.1. Define Deployment Strategy & Secrets

- [x] 4.1.1. Confirm assumptions (documented in code/docs, not via questions):
  - [x] Assume Firebase is used for production hosting (e.g., project `your-firebase-project-prod`).
  - [x] Assume a Firebase token will be stored in GitHub Actions secrets (e.g., `FIREBASE_TOKEN_PROD`).
- [x] 4.1.2. Update `TECH_NOTES.md`:
  - [x] Note which Firebase project is used for **prod**.
  - [x] Note the required GitHub secret names.
  - [x] Note that the workflow triggers on merges to `main`.

### 4.2. Create GitHub Actions Workflow

- [x] 4.2.1. Add a workflow file, e.g. `.github/workflows/deploy-prod-on-main.yml`:
  - [x] Trigger:
    - [x] `on: push` with `branches: [ "main" ]`.
  - [x] Jobs:
    - [x] `build-and-deploy-prod`:
      - [x] Runs on `ubuntu-latest`.
      - [x] Steps:
        - [x] Checkout repo.
        - [x] Set up Node (use LTS version).
        - [x] Install dependencies (`npm ci` or `npm install`).
        - [x] Run tests (`npm test`).
        - [x] Build (`npm run build`).
        - [x] Install Firebase CLI (via `npm` or `curl`).
        - [x] Use `FIREBASE_TOKEN_PROD` from secrets.
        - [x] Run deploy command, e.g.:
          - [x] `firebase deploy --only hosting:prod`.
- [x] 4.2.2. Ensure workflow fails if:
  - [x] Tests fail.
  - [x] Build fails.
  - [x] Deploy command exits with non-zero status.

### 4.3. Tests & Verification for CI

- [x] 4.3.1. Validate workflow syntax locally (e.g., using `act` if available) or via GitHub workflow lints.
- [x] 4.3.2. Create documentation snippet in `README.md` (CI/CD section):
  - [x] Describe that:
    - [x] Merging to `main` triggers GitHub Actions.
    - [x] The pipeline runs tests, builds, and deploys to **PROD** Firebase hosting.
    - [x] It requires `FIREBASE_TOKEN_PROD` configured in repo secrets.
- [x] 4.3.3. Optionally, simulate a test run:
  - [x] Push a test commit to a branch and open a PR to main.
  - [x] After merge (in real use), verify deployment occurs (note: explanation only; actual run is beyond the code).

---

## 5. Final Verification, Docs & Dev Deployment

- [x] 5.1. Full test & build:
  - [x] Run `npm test` and ensure all tests (old + new) pass locally.
  - [x] Run `npm run build` to ensure the app builds successfully.
- [x] 5.2. Dev deployment (Firebase):
  - [x] Build the project for production.
  - [x] Deploy to **Firebase dev** instance (e.g., `firebase deploy --only hosting:dev`).
  - [x] Verify that:
    - [x] “Finish Review” button behavior works on the dev URL.
    - [x] Wrong-answer feedback styling matches review styling on dev.
- [x] 5.3. Documentation updates:
  - [x] Ensure `TECH_NOTES.md` is up to date for:
    - [x] Review navigation behavior.
    - [x] In-quiz feedback styling/sharing.
    - [x] CI/CD for prod deploy.
  - [x] Ensure `README.md` has:
    - [x] Simple instructions for developers regarding review behavior and CI/CD.
- [x] 5.4. Branch completion:
  - [x] Summarize key changes in technical notes (mini changelog).
  - [x] Suggest example commit messages (e.g., `feat: finish review button and answer styling`, `chore: add prod deploy GitHub action`).
  - [x] Indicate that the feature branch is ready for PR/merge.

---
