import { describe, expect, it } from 'vitest'
import { fixedRuleFormSchema } from '../components/fixed-rule.schema'

const validRule = {
  employeeId: 'person-a',
  weekdays: ['1', '3', '5'],
  startTime: '09:00',
  endTime: '17:00',
  role: 'front_desk',
  effectiveFrom: '2026-08-01',
}

describe('fixedRuleFormSchema', () => {
  it('accepts a valid fixed rule', () => {
    expect(fixedRuleFormSchema.safeParse(validRule).success).toBe(true)
  })

  it('requires at least one weekday', () => {
    expect(fixedRuleFormSchema.safeParse({ ...validRule, weekdays: [] }).success).toBe(false)
  })

  it('rejects invalid times', () => {
    expect(fixedRuleFormSchema.safeParse({ ...validRule, startTime: '29:00' }).success).toBe(false)
  })
})
