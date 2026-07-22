import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  addDays,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { useScheduleStore } from '../store/schedule.store'
import { getVisibleShiftsForDate } from '../domain/schedule-generator'

const weekdayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function buildCalendarGrid(monthStart: Date) {
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const calendarEnd = endOfWeek(endOfMonth(monthStart), { weekStartsOn: 0 })
  const days: Date[] = []
  let current = calendarStart

  while (current <= calendarEnd) {
    days.push(current)
    current = addDays(current, 1)
  }

  return days
}

function getShiftSummary(shiftsLength: number, shifts: { startTime: string; endTime: string }[]) {
  if (shiftsLength === 0) {
    return 'No shifts scheduled'
  }

  const firstShift = shifts[0]
  const basicText = shiftsLength === 1 ? '1 shift scheduled' : `${shiftsLength} shifts scheduled`

  return `${basicText} — ${firstShift.startTime} to ${firstShift.endTime}`
}

export function ScheduleCalendar() {
  const { manualShifts, fixedRules, exceptions } = useScheduleStore()
  const monthStart = useMemo(() => startOfMonth(new Date()), [])
  const monthLabel = format(monthStart, 'MMMM yyyy')
  const calendarDays = useMemo(() => buildCalendarGrid(monthStart), [monthStart])

  const cells = useMemo(
    () =>
      calendarDays.map((day) => {
        const isoDate = format(day, 'yyyy-MM-dd')
        const visibleShifts = getVisibleShiftsForDate({
          date: isoDate,
          manualShifts,
          fixedRules,
          exceptions,
        })

        return {
          day,
          isoDate,
          isCurrentMonth: isSameMonth(day, monthStart),
          visibleShifts,
        }
      }),
    [calendarDays, fixedRules, manualShifts, exceptions, monthStart]
  )

  return (
    <section className="schedule-calendar" aria-labelledby="schedule-calendar-heading">
      <div className="schedule-calendar__header">
        <h2 id="schedule-calendar-heading">{monthLabel}</h2>
      </div>

      <div className="schedule-calendar__grid" role="grid" aria-label={`Monthly schedule for ${monthLabel}`}>
        <div className="schedule-calendar__row schedule-calendar__heading-row" role="row">
          {weekdayHeaders.map((weekday) => (
            <div key={weekday} className="schedule-calendar__weekday" role="columnheader">
              {weekday}
            </div>
          ))}
        </div>

        {Array.from({ length: cells.length / 7 }, (_, weekIndex) => (
          <div key={weekIndex} className="schedule-calendar__row" role="row">
            {cells.slice(weekIndex * 7, weekIndex * 7 + 7).map((cell) => {
              const dayLabel = format(cell.day, 'EEEE, MMMM d, yyyy')
              const shiftSummary = getShiftSummary(cell.visibleShifts.length, cell.visibleShifts)
              const cellLabel = `${dayLabel}. ${shiftSummary}.`

              return (
                <div
                  key={cell.isoDate}
                  className={`schedule-calendar__cell ${cell.isCurrentMonth ? '' : 'schedule-calendar__cell--outside-month'}`}
                  role="gridcell"
                >
                  <div className="schedule-calendar__date-label">{format(cell.day, 'd')}</div>
                  {cell.isCurrentMonth ? (
                    <Link
                      to={`/schedule/${cell.isoDate}`}
                      className="schedule-calendar__day-link"
                      aria-label={`${cellLabel} View the day schedule.`}
                    >
                      <div className="schedule-calendar__shift-count">
                        {cell.visibleShifts.length === 0
                          ? 'No shifts'
                          : `${cell.visibleShifts.length} shift${cell.visibleShifts.length > 1 ? 's' : ''}`}
                      </div>
                      {cell.visibleShifts.length > 0 ? (
                        <div className="schedule-calendar__shift-time">
                          {`${cell.visibleShifts[0].startTime}–${cell.visibleShifts[0].endTime}`}
                        </div>
                      ) : null}
                    </Link>
                  ) : (
                    <div className="schedule-calendar__day-placeholder" aria-hidden="true">
                      {cell.visibleShifts.length > 0 ? `${cell.visibleShifts.length} shift${cell.visibleShifts.length > 1 ? 's' : ''}` : null}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </section>
  )
}
