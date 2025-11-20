import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth'
import type { ReactNode } from 'react'
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { auth, isFirebaseConfigured } from '../firebase/firebaseClient'

export type AuthUser = {
  uid: string
  email: string | null
}

export type AuthContextValue = {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  isReady: boolean
  signIn: (email: string, password: string) => Promise<AuthUser>
  signUp: (email: string, password: string) => Promise<AuthUser>
  signOut: () => Promise<void>
  isEnabled: boolean
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
)

const disabledValue: AuthContextValue = {
  user: null,
  isLoading: false,
  isAuthenticated: false,
  isReady: false,
  isEnabled: false,
  signIn: async () => {
    throw new Error('Cloud sync is disabled because Firebase is not configured.')
  },
  signUp: async () => {
    throw new Error('Cloud sync is disabled because Firebase is not configured.')
  },
  signOut: async () => {},
}

function toAuthUser(user: User | null): AuthUser | null {
  if (!user) return null
  return { uid: user.uid, email: user.email ?? null }
}

let persistencePromise: Promise<void> | null = null

function ensurePersistenceConfigured() {
  if (!auth) {
    return Promise.reject(
      new Error('Firebase Auth is not initialized. Provide env vars first.'),
    )
  }
  const authInstance = auth
  if (!persistencePromise) {
    persistencePromise = setPersistence(
      authInstance,
      browserLocalPersistence,
    ).catch(
      (error) => {
        // eslint-disable-next-line no-console
        console.error('Unable to configure Firebase Auth persistence', error)
        throw error
      },
    )
  }
  return persistencePromise
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setLoading] = useState(isFirebaseConfigured)
  const [isReady, setReady] = useState(false)
  const readyRef = useRef(false)

  useEffect(() => {
    if (!auth || !isFirebaseConfigured) {
      setReady(false)
      setLoading(false)
      return
    }
    const authInstance = auth
    let unsubscribe = () => {}
    let cancelled = false
    ensurePersistenceConfigured()
      .catch(() => {
        // Already logged in error above; keep app usable
      })
      .finally(() => {
        unsubscribe = onAuthStateChanged(authInstance, (firebaseUser) => {
          if (cancelled) return
          readyRef.current = true
          setUser(toAuthUser(firebaseUser))
          setLoading(false)
          setReady(true)
        })
      })
    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [])

  const runWithPersistence = useCallback(
    async <T,>(
      action: (email: string, password: string) => Promise<T>,
      email: string,
      password: string,
    ): Promise<T> => {
      if (!auth || !isFirebaseConfigured) {
        throw new Error(
          'Cloud sync is unavailable because Firebase is not configured.',
        )
      }
      await ensurePersistenceConfigured()
      return action(email, password)
    },
    [],
  )

  const signIn = useCallback(
    async (email: string, password: string) => {
      const credential = await runWithPersistence(
        (emailArg, passwordArg) =>
          signInWithEmailAndPassword(auth!, emailArg, passwordArg),
        email,
        password,
      )
      return toAuthUser(credential.user)!
    },
    [runWithPersistence],
  )

  const signUp = useCallback(
    async (email: string, password: string) => {
      const credential = await runWithPersistence(
        (emailArg, passwordArg) =>
          createUserWithEmailAndPassword(auth!, emailArg, passwordArg),
        email,
        password,
      )
      return toAuthUser(credential.user)!
    },
    [runWithPersistence],
  )

  const signOut = useCallback(async () => {
    if (!auth || !isFirebaseConfigured) {
      return
    }
    await firebaseSignOut(auth)
    setUser(null)
  }, [])

  const value = useMemo<AuthContextValue>(() => {
    if (!isFirebaseConfigured || !auth) {
      return disabledValue
    }
    return {
      user,
      isLoading,
      isReady,
      isEnabled: true,
      isAuthenticated: Boolean(user),
      signIn,
      signUp,
      signOut,
    }
  }, [user, isLoading, isReady, signIn, signUp, signOut])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
