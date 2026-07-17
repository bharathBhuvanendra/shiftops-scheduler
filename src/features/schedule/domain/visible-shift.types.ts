import type { EmployeeRole } from "./employee.types";
import type { ShiftSource } from "./shift.types";

export type VisibleShift = {
  id: string;
  employeeId: string;
  date: string;
  startTime: string;
  endTime: string;
  role: EmployeeRole;
  source: ShiftSource;
  originalRuleId?: string;
  originalEmployeeId?: string;
  exceptionId?: string;
};