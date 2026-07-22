import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { FixedScheduleRule } from '../domain/fixed-schedule-rule.types'
import { recurringRuleChangeSchema, type RecurringRuleChangeFormValues } from './rule-change.schema'

const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

type RecurringRuleChangeFormProps = {
  date: string
  rule: FixedScheduleRule
  onCancel: () => void
  onApply: (newRule: FixedScheduleRule) => void
}

export function RecurringRuleChangeForm({ date, rule, onCancel, onApply }: RecurringRuleChangeFormProps) {
  const defaultValues = useMemo<RecurringRuleChangeFormValues>(
    () => ({
      effectiveFrom: date,
      weekdays: rule.weekdays.map((weekday) => weekday.toString()),
      startTime: rule.startTime,
      endTime: rule.endTime,
    }),
    [date, rule]
  )

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RecurringRuleChangeFormValues>({
    resolver: zodResolver(recurringRuleChangeSchema),
    defaultValues,
  })

  const handleApply = (values: RecurringRuleChangeFormValues) => {
    const nextRule: FixedScheduleRule = {
      ...rule,
      id: `${rule.id}-v${values.effectiveFrom}`,
      weekdays: values.weekdays.map((weekday) => Number(weekday)),
      startTime: values.startTime,
      endTime: values.endTime,
      effectiveFrom: values.effectiveFrom,
      effectiveTo: undefined,
      isActive: true,
    }

    onApply(nextRule)
  }

  return (
    <section className="recurring-rule-change-form" aria-labelledby="recurring-rule-change-form-heading">
      <div className="recurring-rule-change-form__header">
        <div>
          <p className="recurring-rule-change-form__label">Permanent rule change</p>
          <h2 id="recurring-rule-change-form-heading">Change recurring schedule from date</h2>
        </div>
        <button type="button" className="recurring-rule-change-form__cancel" onClick={onCancel}>
          Cancel
        </button>
      </div>

      <form className="recurring-rule-change-form__inner" onSubmit={handleSubmit(handleApply)}>
        <div className="recurring-rule-change-form__field">
          <label htmlFor="effectiveFrom">Effective from</label>
          <input id="effectiveFrom" type="date" {...register('effectiveFrom')} />
          {errors.effectiveFrom ? (
            <div className="recurring-rule-change-form__error">{errors.effectiveFrom.message}</div>
          ) : null}
        </div>

        <fieldset className="recurring-rule-change-form__field recurring-rule-change-form__weekdays">
          <legend>Weekdays</legend>
          <div className="recurring-rule-change-form__weekday-grid">
            {weekdayLabels.map((label, index) => (
              <label key={label} className="recurring-rule-change-form__weekday-option">
                <input type="checkbox" value={index} {...register('weekdays')} />
                <span>{label}</span>
              </label>
            ))}
          </div>
          {errors.weekdays ? (
            <div className="recurring-rule-change-form__error">{errors.weekdays.message}</div>
          ) : null}
        </fieldset>

        <div className="recurring-rule-change-form__row">
          <div className="recurring-rule-change-form__field">
            <label htmlFor="startTime">Start time</label>
            <input id="startTime" type="time" {...register('startTime')} />
            {errors.startTime ? (
              <div className="recurring-rule-change-form__error">{errors.startTime.message}</div>
            ) : null}
          </div>

          <div className="recurring-rule-change-form__field">
            <label htmlFor="endTime">End time</label>
            <input id="endTime" type="time" {...register('endTime')} />
            {errors.endTime ? (
              <div className="recurring-rule-change-form__error">{errors.endTime.message}</div>
            ) : null}
          </div>
        </div>

        <div className="recurring-rule-change-form__actions">
          <button type="submit" className="recurring-rule-change-form__submit">
            Save recurring rule change
          </button>
        </div>
      </form>
    </section>
  )
}
