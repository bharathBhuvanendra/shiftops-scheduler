import { describe, expect, it } from 'vitest'
import { scheduleExceptionFormSchema } from '../components/schedule-exception.schema'

describe('scheduleExceptionFormSchema', () => {
  it('rejects date-range coverage where end date is before the selected date', () => {
    const schema = scheduleExceptionFormSchema('2026-07-06')
    const result = schema.safeParse({
      action: 'cover_range',
      replacementEmployeeId: 'person-b',
      dateTo: '2026-07-05',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.message === 'End date cannot be before the selected date.')).toBe(true)
    }
  })

  it('requires a replacement employee for one-day coverage', () => {
    const schema = scheduleExceptionFormSchema('2026-07-06')
    const result = schema.safeParse({
      action: 'cover_day',
      replacementEmployeeId: '',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.message === 'Replacement employee is required for coverage.')).toBe(true)
    }
  })

  it('requires at least one replacement field for modified hours', () => {
    const schema = scheduleExceptionFormSchema('2026-07-06')
    const result = schema.safeParse({
      action: 'modify_hours',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.message === 'At least one updated shift field is required.')).toBe(true)
    }
  })
})
