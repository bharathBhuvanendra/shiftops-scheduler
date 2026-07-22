import { describe, expect, it } from 'vitest'
import { recurringRuleChangeSchema } from '../components/rule-change.schema'

describe('recurringRuleChangeSchema', () => {
  it('accepts a valid recurring rule change', () => {
    const result = recurringRuleChangeSchema.safeParse({
      effectiveFrom: '2026-07-13',
      weekdays: ['1', '2', '5'],
      startTime: '10:00',
      endTime: '18:00',
    })

    expect(result.success).toBe(true)
  })

  it('rejects a recurring rule change with an invalid start/end range', () => {
    const result = recurringRuleChangeSchema.safeParse({
      effectiveFrom: '2026-07-13',
      weekdays: ['1', '2', '5'],
      startTime: '18:00',
      endTime: '10:00',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.message === 'Start time must be before end time')).toBe(true)
    }
  })
})
