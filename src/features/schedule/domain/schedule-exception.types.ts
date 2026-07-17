import type { EmployeeRole } from "./employee.types";

export type ScheduleExceptionType =
  | "time_off"
  | "coverage"
  | "modified_hours"
  | "cancelled";

export type ScheduleException = {
  id: string;
  originalRuleId?: string;
  originalEmployeeId: string;
  dateFrom: string;
  dateTo: string;
  type: ScheduleExceptionType;
  replacementEmployeeId?: string;
  replacementStartTime?: string;
  replacementEndTime?: string;
  replacementRole?: EmployeeRole;
  reason?: string;
};