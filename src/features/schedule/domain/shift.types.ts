import type { EmployeeRole } from "./employee.types";

export type ShiftSource = "manual" | "fixed_rule" | "exception";

export type ManualShift = {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  role: EmployeeRole;
  source: "manual";
};