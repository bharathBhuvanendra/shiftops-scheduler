import { z } from 'zod'
import { parseISO, isAfter, isValid } from 'date-fns'
import { employeeRoleOptions } from './shift-editor.schema'

export const scheduleExceptionActionOptions = [
  'mark_off',
  'cover_day',
  'cover_range',
  'modify_hours',
] as const

export type ScheduleExceptionAction = typeof scheduleExceptionActionOptions[number]

const timePattern = /^\d{2}:\d{2}$/
const datePattern = /^\d{4}-\d{2}-\d{2}$/

export function scheduleExceptionFormSchema(dateFrom: string) {
  return z
    .object({
      action: z.enum(scheduleExceptionActionOptions),
      replacementEmployeeId: z.string().optional(),
      dateTo: z.string().optional(),
      replacementStartTime: z.string().optional(),
      replacementEndTime: z.string().optional(),
      replacementRole: z.string().optional(),
      reason: z.string().max(200, 'Reason must be 200 characters or less').optional(),
    })
    .superRefine((value, ctx) => {
      if (value.action === 'cover_day' && !value.replacementEmployeeId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Replacement employee is required for coverage.',
          path: ['replacementEmployeeId'],
        })
      }

      if (value.action === 'cover_range') {
        if (!value.replacementEmployeeId) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Replacement employee is required for coverage.',
            path: ['replacementEmployeeId'],
          })
        }

        if (!value.dateTo) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'End date is required for a date-range coverage exception.',
            path: ['dateTo'],
          })
        } else if (!datePattern.test(value.dateTo) || !isValid(parseISO(value.dateTo))) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'End date must be a valid date.',
            path: ['dateTo'],
          })
        } else if (isAfter(parseISO(dateFrom), parseISO(value.dateTo))) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'End date cannot be before the selected date.',
            path: ['dateTo'],
          })
        }
      }

      if (value.action === 'modify_hours') {
        const hasReplacementField =
          !!value.replacementStartTime ||
          !!value.replacementEndTime ||
          !!value.replacementRole

        if (value.replacementRole && !employeeRoleOptions.includes(value.replacementRole as never)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Role must be a valid employee role.',
            path: ['replacementRole'],
          })
        }

        if (!hasReplacementField) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'At least one updated shift field is required.',
            path: ['replacementStartTime'],
          })
        }

        if (value.replacementStartTime && !timePattern.test(value.replacementStartTime)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Start time must be a valid time.',
            path: ['replacementStartTime'],
          })
        }

        if (value.replacementEndTime && !timePattern.test(value.replacementEndTime)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'End time must be a valid time.',
            path: ['replacementEndTime'],
          })
        }

        if (
          value.replacementStartTime &&
          value.replacementEndTime &&
          timePattern.test(value.replacementStartTime) &&
          timePattern.test(value.replacementEndTime) &&
          parseISO(`1970-01-01T${value.replacementStartTime}:00`) >=
            parseISO(`1970-01-01T${value.replacementEndTime}:00`)
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Start time must be before end time.',
            path: ['replacementEndTime'],
          })
        }
      }
    })
}

export type ScheduleExceptionFormValues = z.infer<ReturnType<typeof scheduleExceptionFormSchema>>
