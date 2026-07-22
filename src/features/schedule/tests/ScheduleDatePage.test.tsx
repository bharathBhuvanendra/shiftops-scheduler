import { beforeEach, describe, expect, it } from 'vitest'
import userEvent from '@testing-library/user-event'
import { render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { ScheduleDatePage } from '../pages/ScheduleDatePage'
import { useScheduleStore } from '../store/schedule.store'
import {
  mockEmployees,
  mockFixedRules,
  mockManualShifts,
  mockExceptions,
} from '../data/schedule.mock'

const resetScheduleStore = () => {
  useScheduleStore.setState({
    employees: mockEmployees.map((employee) => ({ ...employee })),
    fixedRules: mockFixedRules.map((rule) => ({ ...rule })),
    manualShifts: mockManualShifts.map((shift) => ({ ...shift })),
    exceptions: mockExceptions.map((exception) => ({ ...exception })),
  })
}

describe('ScheduleDatePage', () => {
  beforeEach(() => {
    resetScheduleStore()
  })

  it('renders the selected date and opens the shift action menu when a shift is clicked', async () => {
    render(
      <MemoryRouter initialEntries={['/schedule/2026-07-10']}>
        <Routes>
          <Route path="/schedule/:date" element={<ScheduleDatePage />} />
        </Routes>
      </MemoryRouter>
    )

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /Schedule for Friday, July 10, 2026/i,
      })
    ).toBeInTheDocument()

    const shiftButton = screen.getByRole('button', { name: /Actions for Person C shift from 12:00 to 20:00/i })
    await userEvent.click(shiftButton)

    expect(screen.getByRole('menu', { name: /Shift actions/i })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /Delete shift/i })).toBeInTheDocument()
  })

  it('shows fixed-rule exception actions for a fixed shift', async () => {
    render(
      <MemoryRouter initialEntries={['/schedule/2026-07-06']}>
        <Routes>
          <Route path="/schedule/:date" element={<ScheduleDatePage />} />
        </Routes>
      </MemoryRouter>
    )

    const shiftButton = screen.getByRole('button', {
      name: /Actions for Person A shift from 09:00 to 17:00/i,
    })
    await userEvent.click(shiftButton)

    expect(screen.getByRole('menuitem', { name: /Mark off this day/i })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /Assign coverage for this day/i })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /Assign coverage for date range/i })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /Modify hours for this day/i })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /Change recurring schedule from date/i })).toBeInTheDocument()
  })

  it('changes the recurring schedule from a future date and preserves the old rule history', async () => {
    render(
      <MemoryRouter initialEntries={['/schedule/2026-07-06']}>
        <Routes>
          <Route path="/schedule/:date" element={<ScheduleDatePage />} />
        </Routes>
      </MemoryRouter>
    )

    const shiftButton = screen.getByRole('button', {
      name: /Actions for Person A shift from 09:00 to 17:00/i,
    })
    await userEvent.click(shiftButton)
    await userEvent.click(screen.getByRole('menuitem', { name: /Change recurring schedule from date/i }))

    const form = screen.getByRole('heading', {
      name: /Change recurring schedule from date/i,
    }).closest('section')

    if (!form) {
      throw new Error('Expected form section to be present.')
    }

    const effectiveFromInput = form.querySelector('input[type="date"]') as HTMLInputElement
    await userEvent.clear(effectiveFromInput)
    await userEvent.type(effectiveFromInput, '2026-07-13')

    const timeInputs = Array.from(form.querySelectorAll('input[type="time"]')) as HTMLInputElement[]
    const startTimeInput = timeInputs[0]
    const endTimeInput = timeInputs[1]
    await userEvent.clear(startTimeInput)
    await userEvent.type(startTimeInput, '10:00')
    await userEvent.clear(endTimeInput)
    await userEvent.type(endTimeInput, '18:00')

    await userEvent.click(within(form).getByRole('button', { name: /Save recurring rule change/i }))

    const fixedRules = useScheduleStore.getState().fixedRules
    const oldRule = fixedRules.find((rule) => rule.id === 'rule-a')
    const newRule = fixedRules.find((rule) => rule.id.startsWith('rule-a-v'))

    expect(oldRule?.effectiveTo).toBe('2026-07-12')
    expect(newRule).toMatchObject({
      employeeId: 'person-a',
      effectiveFrom: '2026-07-13',
      startTime: '10:00',
      endTime: '18:00',
      weekdays: [1, 2, 5],
    })
  })

  it('creates a manual shift for the selected date and adds it to the timeline immediately', async () => {
    render(
      <MemoryRouter initialEntries={['/schedule/2026-07-10']}>
        <Routes>
          <Route path="/schedule/:date" element={<ScheduleDatePage />} />
        </Routes>
      </MemoryRouter>
    )

    await userEvent.selectOptions(screen.getByLabelText(/Employee/i), 'person-b')
    await userEvent.selectOptions(screen.getByLabelText(/Role/i), 'trainer')
    const startTimeInput = screen.getByLabelText(/Start time/i)
    const endTimeInput = screen.getByLabelText(/End time/i)

    await userEvent.clear(startTimeInput)
    await userEvent.type(startTimeInput, '08:00')
    await userEvent.clear(endTimeInput)
    await userEvent.type(endTimeInput, '16:00')

    await userEvent.click(screen.getByRole('button', { name: /Add manual shift/i }))

    expect(
      await screen.findByRole('button', {
        name: /Actions for Person B shift from 08:00 to 16:00/i,
      })
    ).toBeInTheDocument()
  })

  it('marks a fixed shift off for the selected date and removes it from the timeline', async () => {
    render(
      <MemoryRouter initialEntries={['/schedule/2026-07-06']}>
        <Routes>
          <Route path="/schedule/:date" element={<ScheduleDatePage />} />
        </Routes>
      </MemoryRouter>
    )

    const shiftButton = screen.getByRole('button', {
      name: /Actions for Person A shift from 09:00 to 17:00/i,
    })
    await userEvent.click(shiftButton)
    await userEvent.click(screen.getByRole('menuitem', { name: /Mark off this day/i }))
    await userEvent.click(screen.getByRole('button', { name: /Apply exception/i }))

    expect(
      screen.queryByRole('button', {
        name: /Actions for Person A shift from 09:00 to 17:00/i,
      })
    ).not.toBeInTheDocument()
  })

  it('assigns one-day coverage and replaces the fixed shift employee', async () => {
    render(
      <MemoryRouter initialEntries={['/schedule/2026-07-06']}>
        <Routes>
          <Route path="/schedule/:date" element={<ScheduleDatePage />} />
        </Routes>
      </MemoryRouter>
    )

    const shiftButton = screen.getByRole('button', {
      name: /Actions for Person A shift from 09:00 to 17:00/i,
    })
    await userEvent.click(shiftButton)
    await userEvent.click(screen.getByRole('menuitem', { name: /Assign coverage for this day/i }))
    await userEvent.selectOptions(screen.getByLabelText(/Replacement employee/i), 'person-c')
    await userEvent.click(screen.getByRole('button', { name: /Apply exception/i }))

    expect(
      await screen.findByRole('button', {
        name: /Actions for Person C shift from 09:00 to 17:00/i,
      })
    ).toBeInTheDocument()
    expect(screen.queryByRole('button', {
      name: /Actions for Person A shift from 09:00 to 17:00/i,
    })).not.toBeInTheDocument()
  })

  it('shows a validation error when the time range is invalid', async () => {
    render(
      <MemoryRouter initialEntries={['/schedule/2026-07-10']}>
        <Routes>
          <Route path="/schedule/:date" element={<ScheduleDatePage />} />
        </Routes>
      </MemoryRouter>
    )

    await userEvent.selectOptions(screen.getByLabelText(/Employee/i), 'person-b')
    const startTimeInput = screen.getByLabelText(/Start time/i)
    const endTimeInput = screen.getByLabelText(/End time/i)

    await userEvent.clear(startTimeInput)
    await userEvent.type(startTimeInput, '18:00')
    await userEvent.clear(endTimeInput)
    await userEvent.type(endTimeInput, '10:00')

    await userEvent.click(screen.getByRole('button', { name: /Add manual shift/i }))

    expect(await screen.findByText(/Start time must be before end time/i)).toBeInTheDocument()
    expect(
      screen.queryByRole('button', {
        name: /Actions for Person B shift from 18:00 to 10:00/i,
      })
    ).not.toBeInTheDocument()
  })

  it('deletes a manual shift from the timeline action menu', async () => {
    render(
      <MemoryRouter initialEntries={['/schedule/2026-07-10']}>
        <Routes>
          <Route path="/schedule/:date" element={<ScheduleDatePage />} />
        </Routes>
      </MemoryRouter>
    )

    const shiftButton = screen.getByRole('button', { name: /Actions for Person C shift from 12:00 to 20:00/i })
    await userEvent.click(shiftButton)
    await userEvent.click(screen.getByRole('menuitem', { name: /Delete shift/i }))

    expect(
      screen.queryByRole('button', { name: /Actions for Person C shift from 12:00 to 20:00/i })
    ).not.toBeInTheDocument()
  })
})
