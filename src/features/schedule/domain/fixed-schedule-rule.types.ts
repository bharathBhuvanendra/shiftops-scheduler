import type { EmployeeRole } from "./employee.types";

export type FixedScheduleRule = {
  id: string;
  employeeId: string;
  weekdays: number[]; // 0 Sunday, 1 Monday, etc.
  startTime: string;
  endTime: string;
  role: EmployeeRole;
  effectiveFrom: string; // YYYY-MM-DD
  effectiveTo?: string; // YYYY-MM-DD
  isActive: boolean;
};