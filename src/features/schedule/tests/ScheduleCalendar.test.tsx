import { describe, expect, it, vi, afterEach, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ScheduleCalendar } from '../components/ScheduleCalendar'

describe('ScheduleCalendar', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-01T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders a monthly calendar and links each current-month date to the day schedule route', () => {
    render(
      <MemoryRouter>
        <ScheduleCalendar />
      </MemoryRouter>
    )

    expect(screen.getByRole('grid', { name: /Monthly schedule for July 2026/ })).toBeInTheDocument()
    const julyTenLink = screen.getByRole('link', { name: /July 10, 2026/ })
    expect(julyTenLink).toHaveAttribute('href', '/schedule/2026-07-10')
  })
})
