import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ScheduleRulesPage } from '../pages/ScheduleRulesPage'
import { mockEmployees, mockFixedRules } from '../data/schedule.mock'
import { useScheduleStore } from '../store/schedule.store'

describe('ScheduleRulesPage', () => {
  beforeEach(() => {
    vi.setSystemTime(new Date('2026-07-22T12:00:00'))
    useScheduleStore.setState({
      employees: mockEmployees.map((employee) => ({ ...employee })),
      fixedRules: mockFixedRules.map((rule) => ({ ...rule })),
      manualShifts: [],
      exceptions: [],
    })
  })

  it('lists fixed rules with their schedule details', () => {
    render(<ScheduleRulesPage />)

    expect(screen.getByText('Person A')).toBeInTheDocument()
    expect(screen.getByText('Mon, Tue, Fri')).toBeInTheDocument()
    expect(screen.getByText('09:00–17:00')).toBeInTheDocument()
    expect(screen.getByText('Front Desk')).toBeInTheDocument()
    expect(screen.getAllByText('Active')).toHaveLength(2)
  })

  it('creates a recurring rule', async () => {
    const user = userEvent.setup()
    render(<ScheduleRulesPage />)

    await user.click(screen.getByRole('button', { name: 'Add recurring rule' }))
    await user.selectOptions(screen.getByLabelText('Employee'), 'person-c')
    await user.click(screen.getByLabelText('Mon'))
    await user.selectOptions(screen.getByLabelText('Role'), 'staff')
    fireEvent.change(screen.getByLabelText('Effective from'), { target: { value: '2026-08-01' } })
    await user.click(screen.getByRole('button', { name: 'Create recurring rule' }))

    expect(useScheduleStore.getState().fixedRules).toContainEqual(
      expect.objectContaining({
        employeeId: 'person-c',
        weekdays: [1],
        role: 'staff',
        effectiveFrom: '2026-08-01',
        isActive: true,
      })
    )
  })

  it('changes a recurring rule from a future date', async () => {
    const user = userEvent.setup()
    render(<ScheduleRulesPage />)

    await user.click(screen.getAllByRole('button', { name: 'Change from date' })[0])
    fireEvent.change(screen.getByLabelText('Effective from'), { target: { value: '2026-08-15' } })
    fireEvent.change(screen.getByLabelText('Start time'), { target: { value: '10:00' } })
    await user.click(screen.getByRole('button', { name: 'Save recurring rule change' }))

    expect(useScheduleStore.getState().fixedRules).toContainEqual(
      expect.objectContaining({
        employeeId: 'person-a',
        effectiveFrom: '2026-08-15',
        startTime: '10:00',
      })
    )
    expect(useScheduleStore.getState().fixedRules).toContainEqual(
      expect.objectContaining({ id: 'rule-a', effectiveTo: '2026-08-14' })
    )
  })
})
