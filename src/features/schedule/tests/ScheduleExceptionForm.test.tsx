import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ScheduleExceptionForm } from '../components/ScheduleExceptionForm'
import type { Employee } from '../domain/employee.types'
import type { VisibleShift } from '../domain/visible-shift.types'

const employees: Employee[] = [
  { id: 'person-a', name: 'Person A', role: 'trainer', color: '#16a34a', isActive: true },
  { id: 'person-b', name: 'Person B', role: 'staff', color: '#9333ea', isActive: false },
  { id: 'person-c', name: 'Person C', role: 'staff', color: '#2563eb', isActive: true },
]

const shift: VisibleShift = {
  id: 'fixed-rule-a-2026-07-10',
  employeeId: 'person-a',
  date: '2026-07-10',
  startTime: '09:00',
  endTime: '17:00',
  role: 'trainer',
  source: 'fixed_rule',
  originalRuleId: 'rule-a',
}

describe('ScheduleExceptionForm', () => {
  it('only shows active employees other than the original assignee for coverage', () => {
    render(
      <ScheduleExceptionForm
        date="2026-07-10"
        action="cover_day"
        shift={shift}
        employees={employees}
        onCancel={() => {}}
        onCreate={() => {}}
      />
    )

    const replacementSelect = screen.getByRole('combobox', {
      name: /replacement employee/i,
    })

    expect(replacementSelect).toHaveValue('person-c')
    expect(screen.queryByRole('option', { name: 'Person A' })).not.toBeInTheDocument()
    expect(screen.queryByRole('option', { name: 'Person B' })).not.toBeInTheDocument()
  })

  it('disables coverage submission when no active replacement is available', () => {
    render(
      <ScheduleExceptionForm
        date="2026-07-10"
        action="cover_day"
        shift={shift}
        employees={employees.filter((employee) => employee.id !== 'person-c')}
        onCancel={() => {}}
        onCreate={() => {}}
      />
    )

    expect(screen.getByRole('button', { name: /apply exception/i })).toBeDisabled()
    expect(screen.getByText(/no active employees are available for coverage/i)).toBeInTheDocument()
  })
})
