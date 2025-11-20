import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { AuthContextValue } from '../context/AuthContext'
import type { QuizAttempt } from '../types/quiz'
import {
  fetchRemoteAttempts,
  mergeLocalAndRemote,
  pushAttempts,
  subscribeToRemoteAttempts,
} from '../services/quizSyncService'
import { writeAttempts } from '../utils/storage'

export type SyncStatus = 'disabled' | 'idle' | 'syncing' | 'success' | 'error'

export type ImportNotification = {
  id: number
  count: number
}

type UseCloudSyncArgs = {
  attempts: QuizAttempt[]
  setAttempts: React.Dispatch<React.SetStateAction<QuizAttempt[]>>
  auth: AuthContextValue
}

export function useCloudSync({
  attempts,
  setAttempts,
  auth,
}: UseCloudSyncArgs) {
  const [status, setStatus] = useState<SyncStatus>(
    auth.isEnabled ? 'idle' : 'disabled',
  )
  const [error, setError] = useState<string>()
  const [lastSyncTime, setLastSyncTime] = useState<string>()
  const [lastImportedCount, setLastImportedCount] = useState(0)
  const [notification, setNotification] = useState<ImportNotification | null>(
    null,
  )
  const attemptsRef = useRef(attempts)
  const syncPromiseRef = useRef<Promise<void> | null>(null)
  const unsubscribeRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    attemptsRef.current = attempts
  }, [attempts])

  useEffect(() => {
    if (!auth.isEnabled) {
      setStatus('disabled')
      setError(undefined)
      setNotification(null)
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
        unsubscribeRef.current = null
      }
      return
    }
    setStatus((prev) => (prev === 'disabled' ? 'idle' : prev))
  }, [auth.isEnabled])

  useEffect(() => {
    if (auth.isEnabled && !auth.user) {
      setStatus('idle')
      setError(undefined)
      setNotification(null)
      setLastImportedCount(0)
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
        unsubscribeRef.current = null
      }
    }
  }, [auth.isEnabled, auth.user])

  const replaceAttempts = useCallback(
    (next: QuizAttempt[]) => {
      attemptsRef.current = next
      setAttempts(() => {
        writeAttempts(next)
        return next
      })
    },
    [setAttempts],
  )

  const performSync = useCallback(async () => {
    if (!auth.isEnabled || !auth.user) {
      return
    }
    setStatus('syncing')
    setError(undefined)
    try {
      const currentLocal = attemptsRef.current
      const remoteAttempts = await fetchRemoteAttempts(auth.user.uid)
      const { merged, importedCount } = mergeLocalAndRemote(
        currentLocal,
        remoteAttempts,
      )
      if (importedCount > 0) {
        setLastImportedCount(importedCount)
        replaceAttempts(merged)
        setNotification({ id: Date.now(), count: importedCount })
      }
      const remoteIds = new Set(
        remoteAttempts.map((attempt) => attempt.attemptId),
      )
      const localOnly = currentLocal.filter(
        (attempt) => !remoteIds.has(attempt.attemptId),
      )
      if (localOnly.length > 0) {
        await pushAttempts(auth.user.uid, localOnly)
      }
      setStatus('success')
      setLastSyncTime(new Date().toISOString())
    } catch (err) {
      setStatus('error')
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to sync attempts at this time.',
      )
      throw err
    }
  }, [auth.isEnabled, auth.user, replaceAttempts])

  const triggerSync = useCallback(async () => {
    if (!auth.isEnabled || !auth.user) {
      return
    }
    if (syncPromiseRef.current) {
      return syncPromiseRef.current
    }
    const promise = performSync().finally(() => {
      syncPromiseRef.current = null
    })
    syncPromiseRef.current = promise
    return promise
  }, [auth.isEnabled, auth.user, performSync])

  useEffect(() => {
    if (!auth.isEnabled || !auth.user) {
      return
    }
    const unsubscribe = subscribeToRemoteAttempts(
      auth.user.uid,
      (remoteAttempts) => {
        const currentLocal = attemptsRef.current
        const { merged, importedCount } = mergeLocalAndRemote(
          currentLocal,
          remoteAttempts,
        )
        if (importedCount > 0) {
          setLastImportedCount(importedCount)
          // Remote attempts are immutable; attemptId is globally unique so deduplication
          // can rely on it (documented in TECH_NOTES.md).
          replaceAttempts(merged)
          setNotification({ id: Date.now(), count: importedCount })
        }
        setStatus((prev) => (prev === 'disabled' ? 'idle' : 'success'))
        setError(undefined)
        setLastSyncTime(new Date().toISOString())
      },
      (error) => {
        setStatus('error')
        setError(
          error instanceof Error
            ? error.message
            : 'Unable to listen for cloud updates.',
        )
      },
    )
    unsubscribeRef.current = unsubscribe
    return () => {
      unsubscribe()
      if (unsubscribeRef.current === unsubscribe) {
        unsubscribeRef.current = null
      }
    }
  }, [auth.isEnabled, auth.user, replaceAttempts])

  useEffect(() => {
    if (auth.isEnabled && auth.user) {
      void triggerSync()
    }
  }, [auth.isEnabled, auth.user, triggerSync])

  const pushAttempt = useCallback(
    async (attempt: QuizAttempt) => {
      if (!auth.isEnabled || !auth.user) {
        return
      }
      try {
        await pushAttempts(auth.user.uid, [attempt])
        setStatus('success')
        setLastSyncTime(new Date().toISOString())
      } catch (err) {
        setStatus('error')
        setError('Unable to sync attempts at this time.')
      }
    },
    [auth.isEnabled, auth.user],
  )

  const dismissNotification = useCallback(() => {
    setNotification(null)
  }, [])

  return useMemo(
    () => ({
      status,
      isEnabled: auth.isEnabled,
      error,
      lastSyncTime,
      lastImportedCount,
      notification,
      triggerSync,
      pushAttempt,
      dismissNotification,
    }),
    [
      auth.isEnabled,
      dismissNotification,
      error,
      lastImportedCount,
      lastSyncTime,
      notification,
      pushAttempt,
      status,
      triggerSync,
    ],
  )
}
