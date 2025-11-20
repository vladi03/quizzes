import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { CloudSyncToast } from './CloudSyncToast'
import { renderWithProviders } from '../test-utils'

describe('CloudSyncToast', () => {
  it('renders a message and auto-dismisses after four seconds', async () => {
    vi.useFakeTimers()
    const dismiss = vi.fn()
    renderWithProviders(<CloudSyncToast />, {
      cloudSync: {
        notification: { id: 1, count: 3 },
        dismissNotification: dismiss,
      },
    })

    expect(
      screen.getByText(/Imported 3 quiz results from the cloud/i),
    ).toBeInTheDocument()

    vi.advanceTimersByTime(4000)
    expect(dismiss).toHaveBeenCalled()
    vi.useRealTimers()
  })

  it('allows manual dismissal', async () => {
    const dismiss = vi.fn()
    renderWithProviders(<CloudSyncToast />, {
      cloudSync: {
        notification: { id: 2, count: 1 },
        dismissNotification: dismiss,
      },
    })

    await userEvent.click(screen.getByRole('button', { name: /dismiss/i }))
    expect(dismiss).toHaveBeenCalled()
  })
})
