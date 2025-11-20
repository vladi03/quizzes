# Quiz & Attempt Schemas

This SPA expects JSON payloads that match the following structures. They are intentionally compact so the quizzes can be updated on any static host by swapping `public/quizzes.json`.

## `public/quizzes.json`

```json
{
  "version": 1,
  "quizzes": [
    {
      "id": "bible-basics",
      "title": "Bible Basics",
      "description": "Short teaser",
      "groupId": "Millennial Views",
      "questions": [
        {
          "id": "bb-q1",
          "number": 1,
          "question": "Prompt text",
          "type": "multiple_choice",
          "options": [
            { "id": "a", "letter": "A", "text": "Answer text" }
          ],
          "answer": "a",
          "explanation": "Why this response is correct."
        }
      ]
    }
  ]
}
```

**Field reference**

| Field | Type | Notes |
| --- | --- | --- |
| `version` | number | Increase when changing shape so clients can react. |
| `quizzes` | `Quiz[]` | Each quiz contains metadata and ordered questions. |
| `groupId` | string | **Required.** Category label (e.g., `Millennial Views`, `Resurrection`, `Salvation (Justification and Sanctification)`, `Election`, `Judgment`) that powers grouping and filters. |
| `questions[].type` | enum | `multiple_choice` or `true_false`. |
| `questions[].options` | `Option[]` | Each option has a stable `id`, display `letter`, and `text`. |
| `questions[].answer` | string | The `id` of the correct option. |
| `questions[].explanation` | string | Rendered after the user submits an answer. |

## Local Storage Attempts

Attempts live under the `quizAttempts` key in `localStorage`. Every completed run appends a record shaped as:

```json
{
  "attemptId": "uuid",
  "quizId": "bible-basics",
  "quizTitle": "Bible Basics",
  "startedAt": "2025-11-15T21:10:00.000Z",
  "completedAt": "2025-11-15T21:15:00.000Z",
  "scorePercent": 80,
  "correctCount": 4,
  "totalCount": 5,
  "answers": [
    {
      "questionId": "bb-q1",
      "questionNumber": 1,
      "selectedOptionId": "b",
      "correctOptionId": "a",
      "isCorrect": false
    }
  ]
}
```

Clients derive the “Completed quizzes” dashboard by grouping attempts by `quizId` and keeping the record with the latest `completedAt` timestamp.

## Firestore Cloud Sync

When Firebase is enabled, attempts mirror to Firestore so multiple devices stay in sync. Storage layout:

- Collection path: `users/{uid}/quizAttempts`
- Document ID: `attemptId` (same UUID used locally)
- Document body: identical to the `quizAttempts` entry above (`quizId`, `quizTitle`, timestamps, aggregate scores, and `answers[]`)

Because the schema matches local storage, the importer/exporter and deduplication logic (`attemptId` uniqueness) apply unchanged on the server. Security rules should restrict access to `users/{uid}/quizAttempts/{attemptId}` so each authenticated user can only read/write their own attempts.
