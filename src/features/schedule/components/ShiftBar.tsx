import { useMemo, useRef, useState, useEffect } from 'react'
import type { Employee, EmployeeRole } from '../domain/employee.types'
import type { VisibleShift } from '../domain/visible-shift.types'
import { ShiftActionMenu } from './ShiftActionMenu'
import { calculateShiftPosition } from '../domain/schedule-time'

const roleLabels: Record<EmployeeRole, string> = {
  manager: 'Manager',
  front_desk: 'Front Desk',
  trainer: 'Trainer',
  cleaner: 'Cleaner',
  staff: 'Staff',
}

type ShiftBarProps = {
  shift: VisibleShift
  employee: Employee
  originalEmployeeName?: string
  onDelete?: () => void
  onAction?: (action: string, shift: VisibleShift) => void
}

export function ShiftBar({ shift, employee, originalEmployeeName, onDelete, onAction }: ShiftBarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const buttonRef = useRef<HTMLButtonElement | null>(null)

  const position = useMemo(
    () =>
      calculateShiftPosition({
        startTime: shift.startTime,
        endTime: shift.endTime,
        timelineStart: '06:00',
        timelineEnd: '23:00',
      }),
    [shift.startTime, shift.endTime]
  )

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        isMenuOpen &&
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [isMenuOpen])

  return (
    <div className="shift-bar" role="listitem">
      <div className="shift-bar__meta">
        <div className="shift-bar__employee">{employee.name}</div>
        <div className="shift-bar__details">
          {roleLabels[employee.role]} · {shift.startTime}–{shift.endTime}
        </div>
      </div>
      <div className="shift-bar__track">
        <button
          type="button"
          ref={buttonRef}
          className="shift-bar__button"
          aria-haspopup="menu"
          aria-expanded={isMenuOpen}
          aria-label={`Actions for ${employee.name} shift from ${shift.startTime} to ${shift.endTime}`}
          onClick={() => setIsMenuOpen((current) => !current)}
          style={{ left: `${position.leftPercent}%`, width: `${position.widthPercent}%` }}
        >
          <span className="shift-bar__button-title">{employee.name}</span>
          <span className="shift-bar__button-subtitle">{roleLabels[employee.role]}</span>
          <span className="shift-bar__button-time">{shift.startTime}–{shift.endTime}</span>
        </button>
        {isMenuOpen ? (
          <div ref={menuRef} className="shift-bar__menu-anchor">
            <ShiftActionMenu
              shift={shift}
              originalEmployeeName={originalEmployeeName}
              onAction={(action) => {
                if (action === 'delete') {
                  onDelete?.()
                } else {
                  onAction?.(action, shift)
                }
                setIsMenuOpen(false)
              }}
            />
          </div>
        ) : null}
      </div>
    </div>
  )
}
