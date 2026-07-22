import type { VisibleShift } from '../domain/visible-shift.types'

type ShiftActionMenuProps = {
  shift: VisibleShift
  originalEmployeeName?: string
  onAction?: (action: string) => void
}

export function ShiftActionMenu({ shift, originalEmployeeName, onAction }: ShiftActionMenuProps) {
  const actions =
    shift.source === 'manual'
      ? [{ key: 'delete', label: 'Delete shift' }]
      : shift.source === 'fixed_rule'
      ? [
          { key: 'mark_off', label: 'Mark off this day' },
          { key: 'cover_day', label: 'Assign coverage for this day' },
          { key: 'cover_range', label: 'Assign coverage for date range' },
          { key: 'modify_hours', label: 'Modify hours for this day' },
          { key: 'change_rule', label: 'Change recurring schedule from date' },
        ]
      : [{ key: 'review', label: 'Review exception' }]

  return (
    <div className="shift-action-menu" role="menu" aria-label="Shift actions">
      {originalEmployeeName ? (
        <div className="shift-action-menu__context">
          Original employee: {originalEmployeeName}
        </div>
      ) : null}
      <div className="shift-action-menu__actions">
        {actions.map((item) => (
          <button
            key={item.key}
            type="button"
            className="shift-action-menu__action"
            role="menuitem"
            onClick={() => onAction?.(item.key)}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  )
}
