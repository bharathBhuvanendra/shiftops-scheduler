import { z } from 'zod'
import { parseISO, isValid } from 'date-fns'

export const recurringRuleChangeSchema = z
  .object({
    effectiveFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Effective date is required'),
    weekdays: z.array(z.string()).min(1, 'Select at least one weekday'),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Start time is required'),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, 'End time is required'),
  })
  .refine((value) => isValid(parseISO(value.effectiveFrom)), {
    message: 'Effective date must be a valid date.',
    path: ['effectiveFrom'],
  })
  .refine((value) => value.startTime < value.endTime, {
    message: 'Start time must be before end time',
    path: ['endTime'],
  })

export type RecurringRuleChangeFormValues = z.infer<typeof recurringRuleChangeSchema>
