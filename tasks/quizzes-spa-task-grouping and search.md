# Quizzes SPA – Feature Task: Question Grouping, Search, and Group Filter Menu

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
> Work in a **feature branch** and deploy to the **Firebase dev instance** when the feature is complete.

Original requirements:

- [x] 1 - Question Grouping. Modify the existing quizzes.json file to add "group id"  
- [x] 2 - Create a quiz search feature that searches as it is being typed by the user the quizzes are displayed without grouping  
- [x] 3 - add a menu option that will be a hamburger on mobile that shows the grouping names for filtering. have an option for "All" that just shows all of the quizzes.  
- [x] 4 - All filters and grouping should filter both “Available Quizzes” and “Completed Quizzes” lists.

---

## 0. Meta & Global Constraints

- [x] You are working on an existing **Quizzes SPA** React project (Vite or similar) which already supports:
  - [x] Loading quizzes from `quizzes.json`.
  - [x] Displaying an “Available Quizzes” list (and possibly “Completed Quizzes”).
  - [x] Basic responsive layout.
- [x] For this task, you must:
  - [x] **Create unit tests at each major step** you implement.
  - [x] **Update technical documentation at each major step** (e.g., `TECH_NOTES.md` or a dedicated section in `README.md`).
  - [x] **Create and work in a feature branch** (e.g., `feature/grouping-search-hamburger-filter`).
  - [x] **Deploy to the Firebase dev instance** after all implementation and tests pass.
- [x] Do not ask the user for any additional input. Make reasonable assumptions and document them.

---

## 1. Branch, Environment & Baseline Verification

- [x] 1.1. Create & switch to feature branch:
  - [x] Choose a branch name, e.g. `feature/grouping-search-hamburger-filter`.
  - [x] Document the branch name and purpose in the technical notes file.
- [x] 1.2. Verify environment:
  - [x] Run `npm install` if needed.
  - [x] Run `npm test` to confirm current tests pass.
  - [x] Run `npm run build` to ensure the app builds successfully.
- [x] 1.3. Update technical notes (e.g., `docs/TECH_NOTES.md`):
  - [x] Describe this feature task and its three main goals:
    - [x] Add `groupId` to quizzes.
    - [x] Add live search for quizzes.
    - [x] Add a grouping filter menu (hamburger on mobile).
- [x] 1.4. Add/update a baseline test (if not present) that:
  - [x] Confirms quizzes currently load and display on the main page.
  - [x] Confirms responsive behavior for the main quiz list page (basic structure).

---

## 2. Feature 1 – Question Grouping via `groupId` in quizzes.json

> Requirement:  
> **[x] 1 - Question Grouping. Modify the existing quizzes.json file to add "group id"**

### 2.1. Data Schema Update

- [x] 2.1.1. Extend the quiz schema to include a grouping field:
  - [x] Add property `groupId` (string) to each quiz object in `quizzes.json`.
  - [x] In `TECH_NOTES.md`, define:
    - [x] What `groupId` represents (e.g., category/tag: “soteriology”, “hermeneutics”, “general”, etc.).
    - [x] That `groupId` is required for all quizzes going forward.
- [x] 2.1.2. Update TypeScript types or JS JSDoc:
  - [x] Extend the `Quiz` type/interface to include `groupId: string`.

### 2.2. Update Sample quizzes.json

- [x] 2.2.1. Modify the existing `quizzes.json`:
  - [x] Ensure **every quiz** has a `groupId`.
  - [x] Use a simple, clear set of grouping ids (e.g., `"theology"`, `"bible-basics"`, `"greek"`, etc.).
- [x] 2.2.2. If there is a sample or seed quiz:
  - [x] Add `groupId` there as well (to keep docs and samples in sync).

### 2.3. Tests for GroupId Presence

- [x] 2.3.1. Add unit tests for the quiz loading logic:
  - [x] Assert that all loaded quizzes include a non-empty `groupId`.
  - [x] If `groupId` is missing in JSON (simulated), the loader:
    - [x] Either throws a clear error, or
    - [x] Logs a warning and defaults to a fallback `groupId` (document behavior).
- [x] 2.3.2. Update docs:
  - [x] Document the `groupId` field in the quiz JSON schema section.

---

## 3. Feature 2 – Live Quiz Search (No Grouping in Results)

> Requirement:  
> **[x] 2 - Create a quiz search feature that searches as it is being typed by the user the quizzes are displayed without grouping**

### 3.1. Search UI Design

- [x] 3.1.1. Add a search input to the main quiz list page (e.g., `QuizListPage`):
  - [x] Place it above the “Available Quizzes” list.
  - [x] Use placeholder text like `"Search quizzes..."`.
  - [x] Search should trigger **on every keystroke** (debouncing optional but not required).
- [x] 3.1.2. Decide search scope:
  - [x] At minimum, search within:
    - [x] `title`
    - [x] `description`
  - [x] Optionally include `groupId` in the search as well (document if you do).

### 3.2. Search Behavior (Without Grouping)

- [x] 3.2.1. Implement search filtering:
  - [x] Maintain a `searchTerm` state in the main quiz list component.
  - [x] Compute a filtered array of quizzes:
    - [x] If `searchTerm` is empty → show default list logic (respect grouping/filter state—see Section 4).
    - [x] If `searchTerm` is non-empty → show **only the quizzes matching the search**, ignoring group visual grouping.
- [x] 3.2.2. “Without grouping” behavior:
  - [x] When searching, display quizzes as a **simple flat list** (no group headings, no group clustering).
  - [x] When the search term is cleared:
    - [x] Return to normal grouped display (with filters, see Section 4).
  - [x] Document this behavior in `TECH_NOTES.md`.

### 3.3. Tests for Live Search

- [x] 3.3.1. Unit tests:
  - [x] Render the main quiz list with multiple quizzes.
  - [x] Type into the search input:
    - [x] Assert that only matching quizzes are shown.
    - [x] Assert that the list is “flat” (no group headers) while searching (if group headers exist).
  - [x] Clear the search term:
    - [x] Assert that the default grouping/filtering behavior is restored.
- [x] 3.3.2. Edge cases:
  - [x] No results found → show a “No quizzes found” message.
  - [x] Case-insensitive search (document in tests and docs).

---

## 4. Feature 3 – Group Filter Menu with Hamburger on Mobile

> Requirement:  
> **[x] 3 - add a menu option that will be a hamburger on mobile that shows the grouping names for filtering. have an option for "All" that just shows all of the quizzes.**

### 4.1. Group Detection & Data

- [x] 4.1.1. Derive group names from `quizzes`:
  - [x] Compute a unique list of `groupId` values from all quizzes.
  - [x] Optionally map `groupId` → display label if you want more friendly names (e.g., `soteriology` → `Soteriology`).
  - [x] Document this mapping in `TECH_NOTES.md`.
- [x] 4.1.2. Define filter state:
  - [x] Add state for `activeGroupId` (e.g., `"all"` as default).
  - [x] `activeGroupId` determines which quizzes are shown when **not** searching.

### 4.2. Menu & Hamburger Behavior

- [x] 4.2.1. Desktop / larger screens:
  - [x] Show a horizontal filter menu or simple buttons for:
    - [x] `"All"` plus each group name.
  - [x] Clicking a group:
    - [x] Sets `activeGroupId` to that group.
    - [x] Filters the quiz list to only quizzes with that `groupId`.
  - [x] Clicking `"All"`:
    - [x] Sets `activeGroupId` to `"all"` and shows all quizzes.
- [x] 4.2.2. Mobile / small screens:
  - [x] Collapse the group filter into a **hamburger menu**:
    - [x] Show a hamburger icon (☰) in the header or near the search bar.
    - [x] On click, open a menu panel (dropdown, drawer, or popover) listing:
      - [x] `"All"`
      - [x] Each group name.
  - [x] Selecting a group:
    - [x] Updates `activeGroupId`.
    - [x] Closes the menu.
  - [x] Document how “mobile vs desktop” is determined (CSS media queries, responsive layout) in `TECH_NOTES.md`.

### 4.3. Interaction with Search

- [x] 4.3.1. Define clear precedence between **search** and **group filter**:
  - [x] Recommended behavior (documented in notes):
    - [x] When `searchTerm` is non-empty → **search takes precedence**, ignore group filter for the visible list.
    - [x] When `searchTerm` is empty → group filter controls what is shown.
- [x] 4.3.2. Ensure the UI makes sense:
  - [x] Group filter remains visible/active even while searching, but the text can note that search overrides grouping, or simply let the behavior be implicit.

### 4.4. Tests for Group Filter Menu

- [x] 4.4.1. Unit tests:
  - [x] With multiple quizzes in different groups:
    - [x] Click `"All"` → all quizzes shown.
    - [x] Click a specific group → only quizzes in that group shown.
  - [x] On mobile layout (test by mocking a prop or class, not actual viewport):
    - [x] Hamburger button is rendered.
    - [x] Clicking hamburger shows list of groups including `"All"`.
    - [x] Clicking a group filters quizzes and closes the menu.
- [x] 4.4.2. Interaction tests with search:
  - [x] Set a group filter, then type into search:
    - [x] Assert that search results are based on all quizzes, not just filtered group (if that’s the chosen behavior), or vice versa, but document which behavior is expected.
  - [x] Clear search term:
    - [x] Assert that the group filter is applied again.

---

## 5. Final Verification, Docs & Dev Deployment

- [x] 5.1. Full test & build:
  - [x] Run `npm test` and ensure all tests (old + new) pass locally.
  - [x] Run `npm run build` to ensure the app builds successfully.
- [x] 5.2. Dev deployment (Firebase):
  - [x] Build the project for production.
  - [x] Deploy to **Firebase dev** instance (e.g., `firebase deploy --only hosting:dev`).
  - [x] Verify on the dev URL that:
    - [x] `groupId`-based filtering works.
    - [x] Live search works and shows a flat list.
    - [x] Hamburger menu and filtering behave correctly on mobile.
- [x] 5.3. Documentation updates:
  - [x] Ensure `TECH_NOTES.md` is up to date for:
    - [x] `groupId` semantics and usage.
    - [x] Search behavior (including precedence with group filter).
    - [x] Group filter menu behavior for desktop and mobile.
  - [x] Ensure `README.md` has:
    - [x] A brief description of quiz grouping, search, and group filters.
- [x] 5.4. Branch completion:
  - [x] Summarize key changes in technical notes (mini changelog).
  - [x] Suggest example commit messages (e.g., `feat: add quiz grouping and search`, `feat: add responsive hamburger group filter`).
  - [x] Indicate that the feature branch is ready for PR/merge.

---


