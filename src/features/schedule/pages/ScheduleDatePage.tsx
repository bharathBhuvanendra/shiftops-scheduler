import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { format, isValid, parseISO } from 'date-fns'
import type { FixedScheduleRule } from '../domain/fixed-schedule-rule.types'
import type { VisibleShift } from '../domain/visible-shift.types'
import type { ScheduleExceptionAction } from '../components/schedule-exception.schema'
import { useScheduleStore } from '../store/schedule.store'
import { getVisibleShiftsForDate } from '../domain/schedule-generator'
import { DayTimeline } from '../components/DayTimeline'
import { RecurringRuleChangeForm } from '../components/RecurringRuleChangeForm'
import { ScheduleExceptionForm } from '../components/ScheduleExceptionForm'
import { ShiftEditorForm } from '../components/ShiftEditorForm'

export function ScheduleDatePage() {
  const { date } = useParams<{ date: string }>()
  const {
    manualShifts,
    fixedRules,
    exceptions,
    employees,
    addManualShift,
    deleteManualShift,
    addScheduleException,
    replaceFixedRuleFromDate,
  } = useScheduleStore()

  const selectedDate = useMemo(() => {
    if (!date) return null
    const parsed = parseISO(date)
    return isValid(parsed) ? parsed : null
  }, [date])

  const formattedDate = selectedDate ? format(selectedDate, 'EEEE, MMMM d, yyyy') : ''
  const isoDate = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''

  const [exceptionTarget, setExceptionTarget] = useState<{
    shift: VisibleShift
    action: ScheduleExceptionAction
  } | null>(null)

  const [ruleChangeTarget, setRuleChangeTarget] = useState<{
    shift: VisibleShift
    rule: FixedScheduleRule
  } | null>(null)

  const visibleShifts = useMemo(
    () =>
      selectedDate
        ? getVisibleShiftsForDate({
            date: isoDate,
            manualShifts,
            fixedRules,
            exceptions,
          })
        : [],
    [selectedDate, isoDate, manualShifts, fixedRules, exceptions]
  )

  const isExceptionAction = (value: string): value is ScheduleExceptionAction =>
    ['mark_off', 'cover_day', 'cover_range', 'modify_hours'].includes(value)

  return (
    <main>
      {selectedDate ? (
        <>
          <h1>Schedule for {formattedDate}</h1>
          <ShiftEditorForm date={isoDate} employees={employees} onCreate={addManualShift} />
          {exceptionTarget ? (
            <ScheduleExceptionForm
              date={isoDate}
              action={exceptionTarget.action}
              shift={exceptionTarget.shift}
              employees={employees}
              onCancel={() => setExceptionTarget(null)}
              onCreate={(exception) => {
                addScheduleException(exception)
                setExceptionTarget(null)
              }}
            />
          ) : null}
          {ruleChangeTarget ? (
            <RecurringRuleChangeForm
              date={isoDate}
              rule={ruleChangeTarget.rule}
              onCancel={() => setRuleChangeTarget(null)}
              onApply={(newRule) => {
                replaceFixedRuleFromDate({
                  oldRuleId: ruleChangeTarget.rule.id,
                  effectiveFrom: newRule.effectiveFrom,
                  newRule,
                })
                setRuleChangeTarget(null)
              }}
            />
          ) : null}
          <DayTimeline
            dateLabel={formattedDate}
            shifts={visibleShifts}
            employees={employees}
            onDeleteShift={deleteManualShift}
            onShiftAction={(action, shift) => {
              if (isExceptionAction(action)) {
                setExceptionTarget({ action, shift })
                setRuleChangeTarget(null)
                return
              }

              if (action === 'change_rule') {
                const matchingRule = fixedRules.find((rule) => rule.id === shift.originalRuleId)
                if (matchingRule) {
                  setRuleChangeTarget({ shift, rule: matchingRule })
                  setExceptionTarget(null)
                }
              }
            }}
          />
        </>
      ) : (
        <>
          <h1>Schedule date</h1>
          <p>Invalid schedule date.</p>
        </>
      )}
    </main>
  )
}
