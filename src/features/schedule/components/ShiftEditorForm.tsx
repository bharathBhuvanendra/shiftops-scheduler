import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Employee } from '../domain/employee.types'
import type { ManualShift } from '../domain/shift.types'
import { manualShiftFormSchema, type ManualShiftFormValues, employeeRoleOptions } from './shift-editor.schema'

const roleLabels: Record<typeof employeeRoleOptions[number], string> = {
  manager: 'Manager',
  front_desk: 'Front Desk',
  trainer: 'Trainer',
  cleaner: 'Cleaner',
  staff: 'Staff',
}

type ShiftEditorFormProps = {
  date: string
  employees: Employee[]
  onCreate: (shift: ManualShift) => void
}

export function ShiftEditorForm({ date, employees, onCreate }: ShiftEditorFormProps) {
  const activeEmployees = useMemo(
    () => employees.filter((employee) => employee.isActive),
    [employees]
  )

  const defaultEmployeeId = activeEmployees[0]?.id ?? ''
  const defaultRole = activeEmployees[0]?.role ?? 'staff'

  const { register, handleSubmit, reset, formState } = useForm<ManualShiftFormValues>({
    resolver: zodResolver(manualShiftFormSchema),
    defaultValues: {
      employeeId: defaultEmployeeId,
      role: defaultRole,
      startTime: '09:00',
      endTime: '17:00',
    },
  })

  const employeeOptions = useMemo(
    () => activeEmployees.map((employee) => ({ id: employee.id, name: employee.name })),
    [activeEmployees]
  )

  const handleCreate = (values: ManualShiftFormValues) => {
    const id = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `manual-${date}-${values.employeeId}-${values.startTime}-${values.endTime}`

    onCreate({
      id,
      employeeId: values.employeeId,
      date,
      startTime: values.startTime,
      endTime: values.endTime,
      role: values.role,
      source: 'manual',
    })

    reset({
      employeeId: values.employeeId,
      role: values.role,
      startTime: values.startTime,
      endTime: values.endTime,
    })
  }

  return (
    <form className="shift-editor-form" onSubmit={handleSubmit(handleCreate)} aria-label="Manual shift creation form">
      <div className="shift-editor-form__row">
        <div className="shift-editor-form__field">
          <label htmlFor="employeeId">Employee</label>
          <select id="employeeId" {...register('employeeId')}>
            {employeeOptions.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.name}
              </option>
            ))}
          </select>
          {formState.errors.employeeId ? (
            <div className="shift-editor-form__error">{formState.errors.employeeId.message}</div>
          ) : null}
        </div>

        <div className="shift-editor-form__field">
          <label htmlFor="role">Role</label>
          <select id="role" {...register('role')}>
            {employeeRoleOptions.map((role) => (
              <option key={role} value={role}>
                {roleLabels[role]}
              </option>
            ))}
          </select>
          {formState.errors.role ? (
            <div className="shift-editor-form__error">{formState.errors.role.message}</div>
          ) : null}
        </div>
      </div>

      <div className="shift-editor-form__row">
        <div className="shift-editor-form__field">
          <label htmlFor="startTime">Start time</label>
          <input id="startTime" type="time" {...register('startTime')} />
          {formState.errors.startTime ? (
            <div className="shift-editor-form__error">{formState.errors.startTime.message}</div>
          ) : null}
        </div>

        <div className="shift-editor-form__field">
          <label htmlFor="endTime">End time</label>
          <input id="endTime" type="time" {...register('endTime')} />
          {formState.errors.endTime ? (
            <div className="shift-editor-form__error">{formState.errors.endTime.message}</div>
          ) : null}
        </div>
      </div>

      <div className="shift-editor-form__actions">
        <button type="submit" className="shift-editor-form__submit" disabled={activeEmployees.length === 0}>
          Add manual shift
        </button>
        {activeEmployees.length === 0 ? (
          <div className="shift-editor-form__notice">No active employees available for new shifts.</div>
        ) : null}
      </div>
    </form>
  )
}
