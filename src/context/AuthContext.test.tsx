import type { ReactNode } from 'react'
import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { AuthProvider } from './AuthContext'
import { useAuth } from '../hooks/useAuth'

const authMocks = vi.hoisted(() => ({
  signIn: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
  setPersistence: vi.fn(() => Promise.resolve()),
}))

vi.mock('../firebase/firebaseClient', () => {
  return {
    auth: {},
    isFirebaseConfigured: true,
  }
})

vi.mock('firebase/auth', async () => {
  const actual: Record<string, unknown> = await vi.importActual(
    'firebase/auth',
  )
  return {
    ...actual,
    browserLocalPersistence: {},
    setPersistence: authMocks.setPersistence,
    onAuthStateChanged: authMocks.onAuthStateChanged,
    signInWithEmailAndPassword: authMocks.signIn,
    createUserWithEmailAndPassword: authMocks.signUp,
    signOut: authMocks.signOut,
  }
})

const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
)

beforeEach(() => {
  vi.clearAllMocks()
})

describe('AuthProvider', () => {
  it('reports authenticated state after firebase emits a user', async () => {
    let authCallback: ((user: unknown) => void) | undefined
    authMocks.onAuthStateChanged.mockImplementation((_auth, callback) => {
      authCallback = callback
      return vi.fn()
    })

    const { result } = renderHook(() => useAuth(), { wrapper })

    expect(result.current.isLoading).toBe(true)
    await waitFor(() => {
      expect(authMocks.onAuthStateChanged).toHaveBeenCalled()
    })
    act(() => {
      authCallback?.({ uid: 'user-1', email: 'test@example.com' })
    })
    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true)
    })
    expect(result.current.user?.uid).toBe('user-1')
    expect(result.current.user?.email).toBe('test@example.com')
  })

  it('signs in with email/password and surfaces the returned user', async () => {
    authMocks.onAuthStateChanged.mockImplementation((_auth, cb) => {
      cb(null)
      return vi.fn()
    })
    authMocks.signIn.mockResolvedValueOnce({
      user: { uid: 'demo', email: 'demo@example.com' },
    })

    const { result } = renderHook(() => useAuth(), { wrapper })
    await act(async () => {
      const user = await result.current.signIn('demo@example.com', 'secret123')
      expect(user.uid).toBe('demo')
    })
    expect(authMocks.signIn).toHaveBeenCalledWith(
      {},
      'demo@example.com',
      'secret123',
    )
  })

  it('creates accounts via signUp and signs out cleanly', async () => {
    authMocks.onAuthStateChanged.mockImplementation((_auth, cb) => {
      cb({ uid: 'existing', email: 'existing@example.com' })
      return vi.fn()
    })
    authMocks.signUp.mockResolvedValue({
      user: { uid: 'new', email: 'new@example.com' },
    })

    const { result } = renderHook(() => useAuth(), { wrapper })
    await act(async () => {
      const user = await result.current.signUp('new@example.com', 'secret123')
      expect(user.uid).toBe('new')
      await result.current.signOut()
    })
    expect(authMocks.signUp).toHaveBeenCalledWith(
      {},
      'new@example.com',
      'secret123',
    )
    expect(authMocks.signOut).toHaveBeenCalledWith({})
    expect(result.current.user).toBeNull()
  })
})
