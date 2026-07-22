import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import type { Employee } from '../domain/employee.types'
import type { FixedScheduleRule } from '../domain/fixed-schedule-rule.types'
import {
  fixedRuleFormSchema,
  type FixedRuleFormValues,
} from './fixed-rule.schema'
import { employeeRoleOptions } from './shift-editor.schema'

const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const roleLabels: Record<(typeof employeeRoleOptions)[number], string> = {
  manager: 'Manager',
  front_desk: 'Front Desk',
  trainer: 'Trainer',
  cleaner: 'Cleaner',
  staff: 'Staff',
}

type FixedScheduleRuleFormProps = {
  employees: Employee[]
  onCancel: () => void
  onCreate: (rule: FixedScheduleRule) => void
}

export function FixedScheduleRuleForm({
  employees,
  onCancel,
  onCreate,
}: FixedScheduleRuleFormProps) {
  const activeEmployees = employees.filter((employee) => employee.isActive)
  const defaultEmployee = activeEmployees[0]
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FixedRuleFormValues>({
    resolver: zodResolver(fixedRuleFormSchema),
    defaultValues: {
      employeeId: defaultEmployee?.id ?? '',
      weekdays: [],
      startTime: '09:00',
      endTime: '17:00',
      role: defaultEmployee?.role ?? 'staff',
      effectiveFrom: new Date().toLocaleDateString('en-CA'),
    },
  })

  const handleCreate = (values: FixedRuleFormValues) => {
    onCreate({
      id: globalThis.crypto.randomUUID(),
      employeeId: values.employeeId,
      weekdays: values.weekdays.map(Number),
      startTime: values.startTime,
      endTime: values.endTime,
      role: values.role,
      effectiveFrom: values.effectiveFrom,
      isActive: true,
    })
  }

  return (
    <section className="fixed-rule-form" aria-labelledby="fixed-rule-form-heading">
      <div className="fixed-rule-form__header">
        <div>
          <p className="fixed-rule-form__label">New recurring schedule</p>
          <h2 id="fixed-rule-form-heading">Create fixed schedule rule</h2>
        </div>
        <button type="button" className="fixed-rule-form__cancel" onClick={onCancel}>
          Cancel
        </button>
      </div>

      <form className="fixed-rule-form__inner" onSubmit={handleSubmit(handleCreate)}>
        <div className="fixed-rule-form__row">
          <div className="fixed-rule-form__field">
            <label htmlFor="fixed-rule-employee">Employee</label>
            <select id="fixed-rule-employee" {...register('employeeId')}>
              {activeEmployees.map((employee) => (
                <option key={employee.id} value={employee.id}>{employee.name}</option>
              ))}
            </select>
            {errors.employeeId ? <div className="fixed-rule-form__error">{errors.employeeId.message}</div> : null}
          </div>

          <div className="fixed-rule-form__field">
            <label htmlFor="fixed-rule-role">Role</label>
            <select id="fixed-rule-role" {...register('role')}>
              {employeeRoleOptions.map((role) => (
                <option key={role} value={role}>{roleLabels[role]}</option>
              ))}
            </select>
          </div>
        </div>

        <fieldset className="fixed-rule-form__field fixed-rule-form__weekdays">
          <legend>Weekdays</legend>
          <div className="fixed-rule-form__weekday-grid">
            {weekdayLabels.map((label, index) => (
              <label key={label} className="fixed-rule-form__weekday-option">
                <input type="checkbox" value={index} {...register('weekdays')} />
                <span>{label}</span>
              </label>
            ))}
          </div>
          {errors.weekdays ? <div className="fixed-rule-form__error">{errors.weekdays.message}</div> : null}
        </fieldset>

        <div className="fixed-rule-form__row">
          <div className="fixed-rule-form__field">
            <label htmlFor="fixed-rule-start">Start time</label>
            <input id="fixed-rule-start" type="time" {...register('startTime')} />
          </div>
          <div className="fixed-rule-form__field">
            <label htmlFor="fixed-rule-end">End time</label>
            <input id="fixed-rule-end" type="time" {...register('endTime')} />
            {errors.endTime ? <div className="fixed-rule-form__error">{errors.endTime.message}</div> : null}
          </div>
          <div className="fixed-rule-form__field">
            <label htmlFor="fixed-rule-effective-from">Effective from</label>
            <input id="fixed-rule-effective-from" type="date" {...register('effectiveFrom')} />
            {errors.effectiveFrom ? <div className="fixed-rule-form__error">{errors.effectiveFrom.message}</div> : null}
          </div>
        </div>

        <button type="submit" className="fixed-rule-form__submit" disabled={activeEmployees.length === 0}>
          Create recurring rule
        </button>
        {activeEmployees.length === 0 ? (
          <p className="fixed-rule-form__notice">Add or activate an employee before creating a rule.</p>
        ) : null}
      </form>
    </section>
  )
}
