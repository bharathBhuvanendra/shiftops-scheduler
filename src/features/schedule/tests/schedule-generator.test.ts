import { describe, expect, it } from "vitest";
import { getVisibleShiftsForDate } from "../domain/schedule-generator";
import type { FixedScheduleRule } from "../domain/fixed-schedule-rule.types";
import type { ScheduleException } from "../domain/schedule-exception.types";
import type { ManualShift } from "../domain/shift.types";

const fixedRules: FixedScheduleRule[] = [
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
];

describe("getVisibleShiftsForDate", () => {
  it("generates fixed-rule shifts for an active weekday", () => {
    const shifts = getVisibleShiftsForDate({
      date: "2026-07-06",
      fixedRules,
      manualShifts: [],
      exceptions: [],
    });

    expect(shifts).toHaveLength(1);
    expect(shifts[0].employeeId).toBe("person-a");
  });

  it("does not generate fixed-rule shifts for a non-working weekday", () => {
    const shifts = getVisibleShiftsForDate({
      date: "2026-07-08",
      fixedRules,
      manualShifts: [],
      exceptions: [],
    });

    expect(shifts).toHaveLength(0);
  });

  it("adds manual shifts", () => {
    const manualShifts: ManualShift[] = [
      {
        id: "manual-1",
        employeeId: "person-b",
        date: "2026-07-06",
        startTime: "12:00",
        endTime: "20:00",
        role: "staff",
        source: "manual",
      },
    ];

    const shifts = getVisibleShiftsForDate({
      date: "2026-07-06",
      fixedRules,
      manualShifts,
      exceptions: [],
    });

    expect(shifts).toHaveLength(2);
  });

  it("applies one-day coverage exception", () => {
    const exceptions: ScheduleException[] = [
      {
        id: "exception-1",
        originalRuleId: "rule-a",
        originalEmployeeId: "person-a",
        dateFrom: "2026-07-06",
        dateTo: "2026-07-06",
        type: "coverage",
        replacementEmployeeId: "person-b",
      },
    ];

    const shifts = getVisibleShiftsForDate({
      date: "2026-07-06",
      fixedRules,
      manualShifts: [],
      exceptions,
    });

    expect(shifts).toHaveLength(1);
    expect(shifts[0].employeeId).toBe("person-b");
    expect(shifts[0].originalEmployeeId).toBe("person-a");
  });

  it("applies date-range time off exception", () => {
    const exceptions: ScheduleException[] = [
      {
        id: "exception-2",
        originalRuleId: "rule-a",
        originalEmployeeId: "person-a",
        dateFrom: "2026-07-06",
        dateTo: "2026-07-10",
        type: "time_off",
      },
    ];

    const shifts = getVisibleShiftsForDate({
      date: "2026-07-07",
      fixedRules,
      manualShifts: [],
      exceptions,
    });

    expect(shifts).toHaveLength(0);
  });
});