import { useMemo } from 'react'
import type { Employee } from '../domain/employee.types'
import type { VisibleShift } from '../domain/visible-shift.types'
import { ShiftBar } from './ShiftBar'

const timelineHours = Array.from({ length: 18 }, (_, index) => 6 + index)

function formatHour(hour: number) {
  const paddedHour = hour.toString().padStart(2, '0')
  return `${paddedHour}:00`
}

type DayTimelineProps = {
  dateLabel: string
  shifts: VisibleShift[]
  employees: Employee[]
  onDeleteShift?: (shiftId: string) => void
  onShiftAction?: (action: string, shift: VisibleShift) => void
}

export function DayTimeline({ dateLabel, shifts, employees, onDeleteShift, onShiftAction }: DayTimelineProps) {
  const shiftRows = useMemo(
    () =>
      shifts.map((shift) => ({
        shift,
        employee: employees.find((employee) => employee.id === shift.employeeId) ?? {
          id: shift.employeeId,
          name: shift.employeeId,
          role: 'staff' as const,
          color: '#999',
          isActive: false,
        },
        originalEmployeeName: shift.originalEmployeeId
          ? employees.find((employee) => employee.id === shift.originalEmployeeId)?.name
          : undefined,
      })),
    [shifts, employees]
  )

  return (
    <section className="day-timeline" aria-labelledby="day-timeline-heading">
      <div className="day-timeline__header">
        <div>
          <p className="day-timeline__label">Selected day</p>
          <h2 id="day-timeline-heading">{dateLabel}</h2>
        </div>
      </div>

      <div className="day-timeline__timeline" role="region" aria-label={`Schedule timeline for ${dateLabel}`}>
        <div className="day-timeline__ruler" aria-hidden="true">
          {timelineHours.map((hour) => (
            <div key={hour} className="day-timeline__ruler-hour">
              {formatHour(hour)}
            </div>
          ))}
        </div>

        {shiftRows.length === 0 ? (
          <div className="day-timeline__empty">No shifts scheduled for this day.</div>
        ) : (
          <div className="day-timeline__shifts" role="list">
            {shiftRows.map(({ shift, employee, originalEmployeeName }) => (
              <ShiftBar
                key={shift.id}
                shift={shift}
                employee={employee}
                originalEmployeeName={originalEmployeeName}
                onDelete={() => onDeleteShift?.(shift.id)}
                onAction={(action) => onShiftAction?.(action, shift)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
