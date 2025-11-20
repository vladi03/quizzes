import {
  collection,
  doc,
  getDocs,
  writeBatch,
  type Firestore,
} from 'firebase/firestore'
import type { QuizAttempt } from '../types/quiz'
import { db } from '../firebase/firebaseClient'
import { mergeImportedAttempts } from '../utils/resultsTransfer'

const USERS_COLLECTION = 'users'
const ATTEMPTS_COLLECTION = 'quizAttempts'
const BATCH_WRITE_LIMIT = 400

function assertDb(): Firestore {
  if (!db) {
    throw new Error(
      'Firestore is not configured. Provide VITE_FIREBASE_* env vars.',
    )
  }
  return db
}

export async function fetchRemoteAttempts(uid: string): Promise<QuizAttempt[]> {
  if (!uid) {
    throw new Error('Cannot fetch attempts without a uid.')
  }
  if (!db) {
    return []
  }
  const attemptsRef = collection(
    db,
    USERS_COLLECTION,
    uid,
    ATTEMPTS_COLLECTION,
  )
  const snapshot = await getDocs(attemptsRef)
  return snapshot.docs.map((entry) => entry.data() as QuizAttempt)
}

export async function pushAttempts(
  uid: string,
  attempts: QuizAttempt[],
): Promise<void> {
  if (!uid) {
    throw new Error('Cannot push attempts without a uid.')
  }
  if (attempts.length === 0 || !db) {
    return
  }
  const database = assertDb()
  for (let index = 0; index < attempts.length; index += BATCH_WRITE_LIMIT) {
    const chunk = attempts.slice(index, index + BATCH_WRITE_LIMIT)
    const batch = writeBatch(database)
    chunk.forEach((attempt) => {
      const ref = doc(
        database,
        USERS_COLLECTION,
        uid,
        ATTEMPTS_COLLECTION,
        attempt.attemptId,
      )
      batch.set(ref, attempt, { merge: true })
    })
    await batch.commit()
  }
}

export function mergeLocalAndRemote(
  localAttempts: QuizAttempt[],
  remoteAttempts: QuizAttempt[],
): { merged: QuizAttempt[]; importedCount: number } {
  const { merged, summary } = mergeImportedAttempts(
    localAttempts,
    remoteAttempts,
  )
  return { merged, importedCount: summary.importedCount }
}
