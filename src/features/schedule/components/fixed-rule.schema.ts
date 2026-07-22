import { isValid, parseISO } from 'date-fns'
import { z } from 'zod'
import { employeeRoleOptions } from './shift-editor.schema'

const timePattern = /^(?:[01]\d|2[0-3]):[0-5]\d$/

export const fixedRuleFormSchema = z
  .object({
    employeeId: z.string().min(1, 'Employee is required'),
    weekdays: z.array(z.string()).min(1, 'Select at least one weekday'),
    startTime: z.string().regex(timePattern, 'Start time must be valid'),
    endTime: z.string().regex(timePattern, 'End time must be valid'),
    role: z.enum(employeeRoleOptions, 'Role is required'),
    effectiveFrom: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Effective date is required'),
  })
  .refine((value) => isValid(parseISO(value.effectiveFrom)), {
    message: 'Effective date must be valid',
    path: ['effectiveFrom'],
  })
  .refine((value) => value.startTime < value.endTime, {
    message: 'Start time must be before end time',
    path: ['endTime'],
  })

export type FixedRuleFormValues = z.infer<typeof fixedRuleFormSchema>
