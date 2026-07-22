import { z } from 'zod'

export const employeeRoleOptions = [
  'manager',
  'front_desk',
  'trainer',
  'cleaner',
  'staff',
] as const

export const manualShiftFormSchema = z
  .object({
    employeeId: z.string().min(1, 'Employee is required'),
    role: z.enum(employeeRoleOptions, 'Role is required'),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Start time is required'),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, 'End time is required'),
  })
  .refine((value) => value.startTime < value.endTime, {
    message: 'Start time must be before end time',
    path: ['endTime'],
  })

export type ManualShiftFormValues = z.infer<typeof manualShiftFormSchema>
