import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createScheduleException } from '../domain/schedule-management'
import type { Employee } from '../domain/employee.types'
import type { ScheduleException } from '../domain/schedule-exception.types'
import type { VisibleShift } from '../domain/visible-shift.types'
import { scheduleExceptionFormSchema, type ScheduleExceptionAction, type ScheduleExceptionFormValues } from './schedule-exception.schema'
import { employeeRoleOptions } from './shift-editor.schema'

const actionLabels: Record<ScheduleExceptionAction, string> = {
  mark_off: 'Mark off this day',
  cover_day: 'Assign coverage for this day',
  cover_range: 'Assign coverage for date range',
  modify_hours: 'Modify hours for this day',
}

const actionDescriptions: Record<ScheduleExceptionAction, string> = {
  mark_off: 'Remove the original assigned employee from this fixed shift for the selected date.',
  cover_day: 'Replace the original fixed shift employee with a replacement for this single day.',
  cover_range: 'Replace the original fixed shift employee for a span of dates.',
  modify_hours: 'Change the hours or role for this fixed shift on the selected date.',
}

type ScheduleExceptionFormProps = {
  date: string
  action: ScheduleExceptionAction
  shift: VisibleShift
  employees: Employee[]
  onCancel: () => void
  onCreate: (exception: ScheduleException) => void
}

export function ScheduleExceptionForm({
  date,
  action,
  shift,
  employees,
  onCancel,
  onCreate,
}: ScheduleExceptionFormProps) {
  const schema = useMemo(() => scheduleExceptionFormSchema(date), [date])

  const replacementCandidates = useMemo(
    () => employees.filter(
      (employee) => employee.isActive && employee.id !== shift.employeeId
    ),
    [employees, shift.employeeId]
  )

  const defaultValues: ScheduleExceptionFormValues = {
    action,
    replacementEmployeeId: replacementCandidates[0]?.id ?? '',
    dateTo: date,
    replacementStartTime: '',
    replacementEndTime: '',
    replacementRole: undefined,
    reason: '',
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ScheduleExceptionFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  const isCoverageAction = action === 'cover_day' || action === 'cover_range'
  const isModifyHoursAction = action === 'modify_hours'
  const hasCoverageCandidates = !isCoverageAction || replacementCandidates.length > 0

  const handleCreate = (values: ScheduleExceptionFormValues) => {
    const type =
      action === 'mark_off'
        ? 'time_off'
        : action === 'modify_hours'
        ? 'modified_hours'
        : 'coverage'

    const replacementRole =
      values.replacementRole && employeeRoleOptions.includes(values.replacementRole as typeof employeeRoleOptions[number])
        ? (values.replacementRole as typeof employeeRoleOptions[number])
        : undefined

    const exception = createScheduleException({
      originalRuleId: shift.originalRuleId,
      originalEmployeeId: shift.employeeId,
      dateFrom: date,
      dateTo: action === 'cover_range' ? values.dateTo : date,
      type,
      replacementEmployeeId: values.replacementEmployeeId || undefined,
      replacementStartTime: values.replacementStartTime || undefined,
      replacementEndTime: values.replacementEndTime || undefined,
      replacementRole,
      reason: values.reason || undefined,
    })

    onCreate(exception)
  }

  return (
    <section className="schedule-exception-form" aria-labelledby="exception-form-heading">
      <div className="schedule-exception-form__header">
        <div>
          <p className="schedule-exception-form__label">Temporary exception</p>
          <h2 id="exception-form-heading">{actionLabels[action]}</h2>
        </div>
        <button type="button" className="schedule-exception-form__cancel" onClick={onCancel}>
          Cancel
        </button>
      </div>
      <p className="schedule-exception-form__description">{actionDescriptions[action]}</p>
      <form className="schedule-exception-form__inner" onSubmit={handleSubmit(handleCreate)}>
        {isCoverageAction ? (
          <div className="schedule-exception-form__field">
            <label htmlFor="replacementEmployeeId">Replacement employee</label>
            <select id="replacementEmployeeId" {...register('replacementEmployeeId')}>
              {replacementCandidates.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name}
                </option>
              ))}
            </select>
            {errors.replacementEmployeeId ? (
              <div className="schedule-exception-form__error">{errors.replacementEmployeeId.message}</div>
            ) : null}
            {!hasCoverageCandidates ? (
              <div className="schedule-exception-form__error">
                No active employees are available for coverage.
              </div>
            ) : null}
          </div>
        ) : null}

        {action === 'cover_range' ? (
          <div className="schedule-exception-form__field">
            <label htmlFor="dateTo">End date</label>
            <input id="dateTo" type="date" {...register('dateTo')} />
            {errors.dateTo ? (
              <div className="schedule-exception-form__error">{errors.dateTo.message}</div>
            ) : null}
          </div>
        ) : null}

        {isModifyHoursAction ? (
          <div className="schedule-exception-form__row">
            <div className="schedule-exception-form__field">
              <label htmlFor="replacementStartTime">New start time</label>
              <input id="replacementStartTime" type="time" {...register('replacementStartTime')} />
              {errors.replacementStartTime ? (
                <div className="schedule-exception-form__error">{errors.replacementStartTime.message}</div>
              ) : null}
            </div>

            <div className="schedule-exception-form__field">
              <label htmlFor="replacementEndTime">New end time</label>
              <input id="replacementEndTime" type="time" {...register('replacementEndTime')} />
              {errors.replacementEndTime ? (
                <div className="schedule-exception-form__error">{errors.replacementEndTime.message}</div>
              ) : null}
            </div>
          </div>
        ) : null}

        {isModifyHoursAction ? (
          <div className="schedule-exception-form__field">
            <label htmlFor="replacementRole">Role</label>
            <select id="replacementRole" {...register('replacementRole')}>
              <option value="">Keep current role</option>
              {employeeRoleOptions.map((role) => (
                <option key={role} value={role}>
                  {role.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <div className="schedule-exception-form__field">
          <label htmlFor="reason">Reason (optional)</label>
          <input id="reason" type="text" {...register('reason')} />
          {errors.reason ? (
            <div className="schedule-exception-form__error">{errors.reason.message}</div>
          ) : null}
        </div>

        <div className="schedule-exception-form__actions">
          <button
            type="submit"
            className="schedule-exception-form__submit"
            disabled={!hasCoverageCandidates}
          >
            Apply exception
          </button>
        </div>
      </form>
    </section>
  )
}
