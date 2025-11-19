perform task of the instructions in one turn. taking your time to get it right. save the markdown file to the repo first to use as a checklist:

# Quizzes SPA – Feature Task: Group Quiz Count Display

> **Purpose of this document**  
> This checklist is meant to be pasted as a prompt to an AI coding assistant.  
> The AI should **implement this feature task in one turn**, updating the
> checkboxes from `[ ]` to `[x]` as it completes each step.  
> The AI must **not** ask clarifying questions; where details are ambiguous, it
> should make reasonable, documented assumptions in code comments and docs.

> **Original requirement**  
> - [ ] 1 - In the group list in parenthesis put the number of quizzes in the group like: `(6)`

> **General Instruction**  
> At each step:
> - Create or update **unit tests**.  
> - Update **technical documentation**.  
> Work in a **feature branch** and deploy to the **Firebase dev instance** when the feature is complete.

---

## 0. Meta & Global Constraints

- [x] You are working on an existing **Quizzes SPA** React project which already supports:
  - [x] Quiz grouping via `groupId`.
  - [x] A group list / filter menu (desktop + mobile hamburger).
  - [x] Loading quizzes from `quizzes.json`.
- [x] For this task, you must:
  - [x] **Create unit tests at each major step** you implement.
  - [x] **Update technical documentation at each major step** (e.g., `TECH_NOTES.md` or a dedicated section in `README.md`).
  - [x] **Create and work in a feature branch** (e.g., `feature/group-quiz-count-display`).
  - [ ] **Deploy to the Firebase dev instance** after all implementation and tests pass.
- [x] Do not ask the user for any additional input. Make reasonable assumptions and document them.

---

## 1. Branch, Environment & Baseline Verification

- [x] 1.1. Create & switch to feature branch:
  - [x] Choose a branch name, e.g. `feature/group-quiz-count-display`.
  - [x] Document the branch name and purpose in the technical notes file.
- [x] 1.2. Verify environment:
  - [x] Run `npm install` if needed.
  - [x] Run `npm test` to confirm current tests pass.
  - [x] Run `npm run build` to ensure the app builds successfully.
- [x] 1.3. Update technical notes (e.g., `docs/TECH_NOTES.md`):
  - [x] Describe this feature task and its goal: show the **number of quizzes per group** in the group list.
  - [x] Note current behavior of the group list (e.g., group name, checkmarks, filter behavior).

---

## 2. Feature – Show Quiz Count in Group List

> Requirement:  
> **[x] 1 - In the group list in parenthesis put the number of quizzes in the group like: `(6)`**

### 2.1. Compute Quiz Count per Group

- [x] 2.1.1. Implement a helper to derive counts:
  - [x] Create a helper function (or extend an existing selector), e.g. `getQuizCountByGroup(quizzes)` that returns:
    - [x] A map or object: `{ [groupId: string]: number }`.
  - [x] The count for each `groupId` should be the number of quizzes whose `groupId` matches.
- [x] 2.1.2. Edge cases:
  - [x] If a group has **zero** quizzes, decide behavior (typically show `(0)` or do not render group; document choice).
  - [x] Document the chosen behavior in `TECH_NOTES.md`.

### 2.2. Update Group List Rendering

- [x] 2.2.1. In the group list UI (desktop):
  - [x] For each group entry that currently shows the group name (e.g., `Soteriology`):
    - [x] Append the quiz count in parentheses, e.g. `Soteriology (6)`.
    - [x] Ensure this is done for:
      - [x] All named groups derived from `groupId`.
  - [x] Decide how to handle `All`:
    - [x] Recommended: show total quiz count: `All (N)` (document this in `TECH_NOTES.md`).
- [x] 2.2.2. In the mobile hamburger menu:
  - [x] Apply the same label formatting:
    - [x] `GroupName (count)` for each entry.
    - [x] `All (totalCount)` for the “All” option.
- [x] 2.2.3. Styling:
  - [x] Ensure the count in parentheses is readable but not overpowering:
    - [x] Same font size as group name or slightly smaller.
    - [x] Use spacing like `GroupName (6)` (with a space before `(`).
  - [x] Confirm that the layout still works on small screens (no overflow or wrapping issues beyond what’s acceptable).

### 2.3. Tests for Group Quiz Count

- [x] 2.3.1. Helper/unit tests:
  - [x] Given a quiz array with known `groupId`s:
    - [x] `getQuizCountByGroup` returns correct counts for each `groupId`.
    - [x] Total count for "All" equals the length of the quizzes array.
- [x] 2.3.2. Component tests:
  - [x] Render the group list with a mock set of quizzes:
    - [x] Assert that each group label contains the group name followed by the correct count in parentheses.
    - [x] Assert that the “All” option shows the total quiz count if that behavior is implemented.
  - [x] If group completion checkmarks exist:
    - [x] Verify that adding counts does not remove or break the checkmarks (both should be visible).

---

## 3. Final Verification, Docs & Dev Deployment

- [x] 3.1. Full test & build:
  - [x] Run `npm test` and ensure all tests (old + new) pass locally.
  - [x] Run `npm run build` to ensure the app builds successfully.
- [ ] 3.2. Dev deployment (Firebase):
  - [ ] Build the project for production.
  - [ ] On the dev URL, manually verify:
    - [ ] Each group entry shows the correct quiz count in parentheses (e.g., `GroupName (6)`).
    - [ ] The “All” option shows the correct overall number of quizzes, if implemented.
    - [ ] The UI remains usable on both desktop and mobile (including hamburger menu).
  - Note: deployment not run in this environment; see `docs/technical-notes.md` for follow-up command.
- [x] 3.3. Documentation updates:
  - [x] Ensure `TECH_NOTES.md` covers:
    - [x] How quiz counts per group are computed.
    - [x] Label format (e.g., `GroupName (count)` and `All (count)`).
  - [x] Update `README.md` with a brief note that:
    - [x] “Group filters now show the number of quizzes in each group, e.g., `Soteriology (6)`.”
- [x] 3.4. Branch completion:
  - [x] Summarize key changes in technical notes (mini changelog).
  - [x] Suggest example commit messages (e.g., `feat: display quiz counts in group list`).
  - [x] Commit and push your changes to the feature branch.
  - [x] Provide a PR summary in this file below :
  - [x] Create PR

### PR Summary:
    - Display quiz counts next to every group filter option (desktop pills + mobile hamburger) and show the total on the All option.
    - Added a getQuizCountByGroup helper plus unit and integration tests verifying label counts while preserving completion checkmarks.
    - Documented the behavior in README and technical notes; Firebase dev deployment remains pending credentials.
