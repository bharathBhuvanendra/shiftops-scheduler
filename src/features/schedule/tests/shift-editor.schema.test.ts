import { describe, expect, it } from 'vitest'
import { manualShiftFormSchema } from '../components/shift-editor.schema'

describe('manualShiftFormSchema', () => {
  it('accepts valid manual shift input', () => {
    const result = manualShiftFormSchema.safeParse({
      employeeId: 'person-a',
      role: 'front_desk',
      startTime: '08:00',
      endTime: '16:00',
    })

    expect(result.success).toBe(true)
  })

  it('rejects start times that are not before end times', () => {
    const result = manualShiftFormSchema.safeParse({
      employeeId: 'person-a',
      role: 'front_desk',
      startTime: '18:00',
      endTime: '10:00',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.message === 'Start time must be before end time')).toBe(true)
    }
  })
})
