import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ShiftEditorForm } from '../components/ShiftEditorForm'
import type { Employee } from '../domain/employee.types'

const employees: Employee[] = [
  { id: 'person-a', name: 'Person A', role: 'trainer', color: '#16a34a', isActive: true },
  { id: 'person-b', name: 'Person B', role: 'staff', color: '#9333ea', isActive: false },
]

describe('ShiftEditorForm', () => {
  it('only shows active employees in the assignment dropdown', () => {
    render(<ShiftEditorForm date="2026-07-10" employees={employees} onCreate={() => {}} />)

    const employeeSelect = screen.getByRole('combobox', { name: /employee/i })
    expect(employeeSelect).toHaveValue('person-a')
    expect(screen.queryByRole('option', { name: /Person B/i })).not.toBeInTheDocument()
  })

  it('disables submission when there are no active employees', () => {
    const inactiveOnly: Employee[] = [
      { id: 'person-c', name: 'Person C', role: 'staff', color: '#9333ea', isActive: false },
    ]

    render(<ShiftEditorForm date="2026-07-10" employees={inactiveOnly} onCreate={() => {}} />)

    expect(screen.getByRole('button', { name: /Add manual shift/i })).toBeDisabled()
    expect(screen.getByText(/No active employees available for new shifts/i)).toBeInTheDocument()
  })
})
