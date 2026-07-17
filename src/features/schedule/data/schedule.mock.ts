import type { Employee } from "../domain/employee.types";
import type { FixedScheduleRule } from "../domain/fixed-schedule-rule.types";
import type { ManualShift } from "../domain/shift.types";
import type { ScheduleException } from "../domain/schedule-exception.types";

export const mockEmployees: Employee[] = [
  {
    id: "person-a",
    name: "Person A",
    role: "front_desk",
    color: "#2563eb",
    isActive: true,
  },
  {
    id: "person-b",
    name: "Person B",
    role: "trainer",
    color: "#16a34a",
    isActive: true,
  },
  {
    id: "person-c",
    name: "Person C",
    role: "staff",
    color: "#9333ea",
    isActive: true,
  },
];

export const mockFixedRules: FixedScheduleRule[] = [
  {
    id: "rule-a",
    employeeId: "person-a",
    weekdays: [1, 2, 5],
    startTime: "09:00",
    endTime: "17:00",
    role: "front_desk",
    effectiveFrom: "2026-07-01",
    isActive: true,
  },
  {
    id: "rule-b",
    employeeId: "person-b",
    weekdays: [2, 4],
    startTime: "13:00",
    endTime: "21:00",
    role: "trainer",
    effectiveFrom: "2026-07-01",
    isActive: true,
  },
];

export const mockManualShifts: ManualShift[] = [];

export const mockExceptions: ScheduleException[] = [];
