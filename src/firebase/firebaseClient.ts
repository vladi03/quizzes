import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'

type FirebaseConfig = {
  apiKey: string
  authDomain: string
  projectId: string
  storageBucket: string
  messagingSenderId: string
  appId: string
  measurementId?: string
}

const env = import.meta.env ?? ({} as Record<string, string>)

const rawConfig: Partial<FirebaseConfig> = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID,
}

const requiredKeys: Array<keyof FirebaseConfig> = [
  'apiKey',
  'authDomain',
  'projectId',
  'storageBucket',
  'messagingSenderId',
  'appId',
]

const hasFullConfig = requiredKeys.every(
  (key) => typeof rawConfig[key] === 'string' && rawConfig[key],
)

let firebaseApp: FirebaseApp | undefined
let firebaseAuth: Auth | undefined
let firestoreDb: Firestore | undefined

if (hasFullConfig) {
  const config = rawConfig as FirebaseConfig
  const existing = getApps()
  firebaseApp = existing.length > 0 ? getApp() : initializeApp(config)
  firebaseAuth = getAuth(firebaseApp)
  firestoreDb = getFirestore(firebaseApp)
} else if (import.meta.env?.DEV) {
  // eslint-disable-next-line no-console
  console.warn(
    'Firebase environment variables missing. Cloud sync features are disabled.',
  )
}

export const isFirebaseConfigured = Boolean(firebaseApp)
export const app = firebaseApp
export const auth = firebaseAuth
export const db = firestoreDb

export function getFirebaseApp(): FirebaseApp {
  if (!firebaseApp) {
    throw new Error(
      'Firebase is not configured. Define the VITE_FIREBASE_* env vars to enable cloud sync.',
    )
  }
  return firebaseApp
}

export function getFirebaseAuth(): Auth {
  if (!firebaseAuth) {
    throw new Error(
      'Firebase Auth unavailable. Provide env vars before using cloud sync.',
    )
  }
  return firebaseAuth
}

export function getFirestoreDb(): Firestore {
  if (!firestoreDb) {
    throw new Error(
      'Firestore unavailable. Provide env vars before using cloud sync.',
    )
  }
  return firestoreDb
}
