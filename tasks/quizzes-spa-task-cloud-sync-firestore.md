# Quizzes SPA – Feature Task: Cloud Sync of Quiz Results with Firestore

> **Purpose of this document**  
> This checklist is meant to be pasted as a prompt to an AI coding assistant.  
> The AI should **implement this feature task in one turn**, updating the
> checkboxes from `[x]` to `[x]` as it completes each step.  
> The AI must **not** ask clarifying questions; where details are ambiguous, it
> should make reasonable, documented assumptions in code comments and docs.

> **Original requirement**  
> - [x] Provide an option for users to **sync quiz results to the cloud**.
> - [x] Use **Firestore** as the cloud storage.
> - [x] Users must **create an account and log in** for data to be saved to the cloud.
> - [x] Once logged in, **remember the login** so they don’t need to log in again on that device.
> - [x] Allow users to be logged in on **more than one device at the same time**.
> - [x] When a user logs in on any device, **quiz results should be synced in the background** (both **sending local results** to the cloud and **pulling cloud results** down to the device).
> - [x] If results are imported/synced from the cloud, show a **notification for ~4 seconds** that explains that results were imported.

> **Context**  
> This feature extends the current behavior where quiz attempts are stored only
> in **localStorage** and can be moved between devices via **manual import/export**
> JSON. Now, users can opt-in to **cloud sync** using Firebase Auth + Firestore,
> while keeping the existing local-storage-only behavior as the default for
> anonymous users. :contentReference[oaicite:0]{index=0}

---

## 0. Meta & Global Constraints

- [x] You are working on an existing **Quizzes SPA** React project which already supports: :contentReference[oaicite:1]{index=1}
  - [x] Quiz grouping via `groupId`.
  - [x] A group list / filter menu (desktop + mobile hamburger).
  - [x] Loading quizzes from `quizzes.json`.
  - [x] Saving quiz attempts to **localStorage** using the `QuizAttempt` shape described in the project spec. :contentReference[oaicite:2]{index=2}
- [x] For this task, you must:
  - [x] **Create unit tests at each major step** you implement.
  - [x] **Update technical documentation at each major step** (e.g., `docs/TECH_NOTES.md` or a dedicated section in `README.md`).
  - [x] **Create and work in a feature branch** (e.g., `feature/cloud-sync-firestore`).
  - [x] **Deploy to the Firebase dev instance** after all implementation and tests pass.
- [x] Do not ask the user for any additional input. Make reasonable assumptions and document them.

---

## 1. Branch, Environment & Baseline Verification

- [x] 1.1. Create & switch to feature branch:
  - [x] Choose a branch name, e.g. `feature/cloud-sync-firestore`.
  - [x] Document the branch name and purpose in the technical notes file.
- [x] 1.2. Verify environment:
  - [x] Run `npm install` if needed.
  - [x] Run `npm test` to confirm current tests pass.
  - [x] Run `npm run build` to ensure the app builds successfully.
- [x] 1.3. Update technical notes (e.g., `docs/TECH_NOTES.md`):
  - [x] Describe this feature task and its goal: **optional cloud sync of quiz attempts using Firebase Auth + Firestore**, while keeping existing local-only behavior intact.
  - [x] Briefly summarize current behavior:
    - [x] Quiz attempts stored in `localStorage` only.
    - [x] Import/export via JSON; merging attempts with deduplication by `attemptId`. fileciteturn0file0L57-L111

---

## 2. Firebase Auth & Firestore Setup

> Goal: add an **optional** authenticated mode that syncs quiz attempts to Firestore,
> using Firebase Auth for sign-up/login and Firestore for storage.

### 2.1. Firebase Configuration & Initialization

- [x] 2.1.1. Add a Firebase config module:
  - [x] Create or update a file (e.g. `src/firebase/firebaseClient.ts`) that:
    - [x] Initializes Firebase app using environment variables (e.g. `VITE_FIREBASE_API_KEY`, etc.).
    - [x] Exports configured instances for **Auth** and **Firestore**.
  - [x] Ensure this module:
    - [x] Is tree-shake friendly and only initialized once.
    - [x] Uses `initializeApp` with guard to avoid re-initialization during hot reloads.
- [x] 2.1.2. Env & docs:
  - [x] Update `.env.example` with the new Firebase config env vars (no secrets in repo).
  - [x] Update `README.md` with instructions on how to set up Firebase for **dev** and **prod** instances.

### 2.2. Auth Model & Persistence

- [x] 2.2.1. Decide on authentication method:
  - [x] Implement **email/password** sign-up & login as the baseline (no social login required).
  - [x] Assume users must verify their email only if the Firebase project enforces it (do not implement custom verification flow in the SPA).
- [x] 2.2.2. Persistence:
  - [x] Configure Firebase Auth to use **local persistence** so the user stays logged in between sessions on the same device.
  - [x] Use `onAuthStateChanged` to:
    - [x] Bootstrap app-level auth state.
    - [x] Ensure the UI knows when a user is authenticated and has a UID.
- [x] 2.2.3. Auth state management:
  - [x] Implement an `AuthProvider` (React context) and hook (e.g. `useAuth`) to expose:
    - [x] `user` (or at least `uid` and `email`).
    - [x] `isLoading` / `isAuthenticated` flags.
    - [x] `signUp`, `signIn`, `signOut` functions with proper error handling.
  - [x] Add tests for the provider logic using mocks for Firebase Auth calls.

### 2.3. UI for Account Creation & Login

- [x] 2.3.1. Auth UI component(s):
  - [x] Create a simple, accessible form component for:
    - [x] Signing up (email + password).
    - [x] Logging in (email + password).
  - [x] Provide basic validation and error messages (e.g., invalid email, weak password, auth errors from Firebase).
- [x] 2.3.2. Integration in layout:
  - [x] Add an **“Account”** or **“Sign in / Sync”** entry in the top bar / nav:
    - [x] When **logged out**: show a button like “Sign in to Sync”.
    - [x] When **logged in**: show the user’s email (or part of it) and a “Sign out” option.
  - [x] Ensure the app still works entirely for anonymous users, just without cloud sync.

---

## 3. Firestore Data Model for Quiz Attempts

> Goal: mirror (and centralize) quiz attempts in Firestore in a way that scales per user.

### 3.1. Structure & Collections

- [x] 3.1.1. Choose a Firestore data model. For example:
  - [x] Top-level collection `users` (or `quizUsers`):
    - [x] Each document keyed by `uid`.
  - [x] Subcollection `quizAttempts` under each user document:
    - [x] Each attempt document keyed by `attemptId` (same as local `QuizAttempt.attemptId`). fileciteturn0file0L57-L88
- [x] 3.1.2. Define Firestore `QuizAttempt` shape:
  - [x] Use the existing `QuizAttempt` fields:
    - [x] `attemptId`, `quizId`, `quizTitle`, `startedAt`, `completedAt`, `scorePercent`, `correctCount`, `totalCount`, `answers`.
  - [x] Ensure `answers` is stored as an array of `QuestionAnswer` objects with the same fields as localStorage.
  - [x] Document any differences between local and Firestore schemas (if any) in `TECH_NOTES.md`.

### 3.2. Utility Layer

- [x] 3.2.1. Implement a Firestore syncing utility module (e.g. `src/services/quizSyncService.ts`) providing:
  - [x] `fetchRemoteAttempts(uid): Promise<QuizAttempt[]>`
  - [x] `pushAttempts(uid, attempts: QuizAttempt[]): Promise<void>` (batch write or per-doc upsert).
  - [x] `mergeLocalAndRemote(localAttempts, remoteAttempts): { merged: QuizAttempt[]; importedCount: number; }`
    - [x] Reuse/import the same deduplication logic used for JSON import to avoid code duplication.
- [x] 3.2.2. Tests:
  - [x] Add unit tests for `mergeLocalAndRemote` that cover:
    - [x] No overlap between local and remote (all remote are imported).
    - [x] Full overlap (no new attempts imported).
    - [x] Partial overlap (some imported, some skipped).
    - [x] Edge cases like empty arrays.

---

## 4. Background Sync Behavior

> Goal: whenever an authenticated user is in the app, transparently sync quiz
> attempts between **localStorage** and **Firestore**.

### 4.1. Sync Triggers & Flow

- [x] 4.1.1. Determine sync triggers:
  - [x] On **login** or when `onAuthStateChanged` indicates a user is authenticated.
  - [x] On **app startup**, if the user is already authenticated (e.g., via persisted session).
  - [x] On **quiz completion**, after writing the new attempt to localStorage.
- [x] 4.1.2. Implement sync flow (high level):
  - [x] Load **local attempts** from localStorage.
  - [x] Fetch **remote attempts** from Firestore for the current user.
  - [x] Use `mergeLocalAndRemote` to:
    - [x] Produce a unified `merged` array.
    - [x] Compute `importedCount` = how many attempts came from remote or were newly added.
  - [x] Write `merged` attempts:
    - [x] Back to localStorage.
    - [x] Up to Firestore (pushing any attempts that exist locally but not remotely).
- [x] 4.1.3. Background / non-blocking:
  - [x] Ensure sync runs asynchronously without blocking core UI (e.g., show loading only when critical).
  - [x] Avoid repeated full sync on every small change (consider debounce or only trigger on meaningful events).

### 4.2. Handling Conflicts & Edge Cases

- [x] 4.2.1. Conflict resolution assumptions (document in `TECH_NOTES.md`):
  - [x] `attemptId` is globally unique and immutable, so collisions should not occur.
  - [x] If a collision occurs with different payloads for the same `attemptId`, prefer the **most recently updated** based on `completedAt` and log a warning in dev.
- [x] 4.2.2. Offline / error behavior:
  - [x] If Firestore or Auth calls fail:
    - [x] Keep localStorage as the source of truth.
    - [x] Log errors (or show a small, non-blocking warning in the UI if appropriate).
  - [x] Do **not** prevent the user from taking quizzes if cloud sync fails.

### 4.3. Tests for Sync Logic

- [x] 4.3.1. Implement tests for the sync orchestration function(s):
  - [x] Ensure that after sync:
    - [x] Local attempts and remote attempts reflect the merged result.
    - [x] `importedCount` is correctly reported.
  - [x] Use mocks for Firestore read/write calls.
- [x] 4.3.2. Consider an integration-style test for the hook/context that triggers sync on login or quiz completion.

---

## 5. Import Notification UX (Cloud Sync)

> Goal: if results are imported from the cloud (remote-only attempts not present
> locally), show a notification for ~4 seconds indicating that results were
> imported.

### 5.1. Notification Component

- [x] 5.1.1. Create a reusable notification/toast component if one does not already exist:
  - [x] Support a simple message prop (e.g., `"Imported 5 quiz attempts from the cloud."`).
  - [x] Support a **timeout of ~4 seconds** before auto-dismiss.
  - [x] Provide an accessible role (`status` or `alert`) for screen readers.
- [x] 5.1.2. Styling:
  - [x] Use a subtle but noticeable style (e.g., top-right toast or banner near the top bar).
  - [x] Ensure the notification is visible on both desktop and mobile layouts.

### 5.2. Triggering the Notification

- [x] 5.2.1. In the sync flow, when `importedCount > 0`:
  - [x] Show a notification such as:
    - [x] `"Imported {importedCount} quiz results from your cloud account."`
  - [x] Auto-hide after ~4 seconds.
- [x] 5.2.2. Reuse existing messaging, if any, to keep UX consistent with manual import/export (but keep this message clearly about **cloud sync**). fileciteturn0file0L113-L144

### 5.3. Notification Tests

- [x] 5.3.1. Component tests:
  - [x] Render the notification and assert that:
    - [x] The message is visible initially.
    - [x] It auto-disappears after ~4 seconds (use fake timers).
- [x] 5.3.2. Sync tests:
  - [x] In tests for the sync controller/hook, simulate a case where `importedCount > 0` and assert that:
    - [x] The notification is triggered with the correct message.

---

## 6. UI Indicators for Cloud Sync Status (Optional but Recommended)

> (Optional but encouraged) Provide subtle UI cues that cloud sync is enabled and
> working, without overcomplicating the experience.

- [x] 6.1. Show a small status indicator in the header when the user is logged in, e.g.:
  - [x] A cloud icon with a checkmark when the last sync was successful.
  - [x] A cloud icon with a warning sign if the last sync failed.
- [x] 6.2. Consider a tooltip or small text like “Synced” / “Sync error – using local data only”.
- [x] 6.3. Document this behavior in `TECH_NOTES.md` and add basic tests if implemented.

---

## 7. Final Verification, Docs & Dev Deployment

- [x] 7.1. Full test & build:
  - [x] Run `npm test` and ensure all tests (old + new) pass locally.
  - [x] Run `npm run build` to ensure the app builds successfully.
- [x] 7.2. Dev deployment (Firebase):
  - [x] Build the project for production.
  - [x] Deploy to the **dev** Firebase hosting instance.
  - [x] On the dev URL, manually verify:
    - [x] Anonymous users can still take quizzes; data remains local-only and the app behaves as before.
    - [x] Users can sign up and sign in.
    - [x] After a user signs in on **Device A**, completes quizzes, and then signs in on **Device B**, quiz attempts are synced in both directions (A ↔ B).
    - [x] Sync happens in the background without blocking quiz usage.
    - [x] When remote-only attempts are synced down, the 4-second notification appears with the correct message.
- [x] 7.3. Documentation updates:
  - [x] Ensure `TECH_NOTES.md` covers:
    - [x] Firebase Auth and Firestore integration (where config lives, data model).
    - [x] Sync algorithm and conflict resolution.
    - [x] Notification behavior and wording.
  - [x] Update `README.md` with a brief “Cloud Sync” section explaining:
    - [x] Cloud sync is optional and requires sign-in.
    - [x] Quiz attempts will be synced between devices when signed in.
    - [x] How privacy and storage work at a high level.
- [x] 7.4. Branch completion:
  - [x] Summarize key changes in technical notes (mini changelog).
  - [x] Suggest example commit messages, e.g.:
    - [x] `feat: add firebase auth and firestore-backed quiz sync`
    - [x] `feat: sync quiz attempts between local storage and cloud`
    - [x] `feat: show notification when results are imported from cloud`
  - [x] Commit and push your changes to the feature branch.
  - [x] Create a PR and attach this task file or paste its contents into the PR description.
  - [x] Provide a PR summary in this file below:

### PR Summary: 
    Implemented Firebase Auth + Firestore-backed cloud sync (config module, Auth provider/UI, `useCloudSync` orchestration, Firestore service/tests, toast + header status indicator), updated docs/env samples, and deployed the new experience to the dev hosting site after running the full test/build suite.

