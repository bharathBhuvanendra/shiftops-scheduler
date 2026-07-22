import { beforeEach, describe, expect, it } from 'vitest'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/react'
import { TeamPage } from '../pages/TeamPage'
import { useScheduleStore } from '../store/schedule.store'
import { mockEmployees } from '../data/schedule.mock'

const resetScheduleStore = () => {
  useScheduleStore.setState({
    employees: mockEmployees.map((employee) => ({ ...employee })),
    manualShifts: [],
    fixedRules: [],
    exceptions: [],
    addEmployee: useScheduleStore.getState().addEmployee,
    toggleEmployeeActive: useScheduleStore.getState().toggleEmployeeActive,
    addManualShift: useScheduleStore.getState().addManualShift,
    deleteManualShift: useScheduleStore.getState().deleteManualShift,
    addScheduleException: useScheduleStore.getState().addScheduleException,
    replaceFixedRuleFromDate: useScheduleStore.getState().replaceFixedRuleFromDate,
  })
}

describe('TeamPage', () => {
  beforeEach(() => {
    resetScheduleStore()
  })

  it('allows adding and deactivating employees', async () => {
    render(<TeamPage />)

    const deactivateButtons = screen.getAllByRole('button', { name: /deactivate/i })
    expect(deactivateButtons.length).toBeGreaterThan(0)

    await userEvent.click(deactivateButtons[0])
    expect(screen.getAllByRole('button', { name: /^Activate$/i }).length).toBeGreaterThan(0)

    await userEvent.type(screen.getByRole('textbox', { name: /name/i }), 'New Hire')
    await userEvent.selectOptions(screen.getByRole('combobox', { name: /role/i }), 'cleaner')
    await userEvent.click(screen.getByRole('button', { name: /add employee/i }))

    expect(screen.getByText('New Hire')).toBeInTheDocument()
    expect(screen.getAllByText(/Active/i).length).toBeGreaterThan(0)
  })
})
