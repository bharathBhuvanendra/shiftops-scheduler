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

  it("does not generate fixed-rule shifts before effectiveFrom", () => {
    const shifts = getVisibleShiftsForDate({
      date: "2026-06-30",
      fixedRules,
      manualShifts: [],
      exceptions: [],
    });

    expect(shifts).toHaveLength(0);
  });

  it("does not generate fixed-rule shifts after effectiveTo", () => {
    const datedRule: FixedScheduleRule = {
      ...fixedRules[0],
      effectiveTo: "2026-07-06",
    };

    const shifts = getVisibleShiftsForDate({
      date: "2026-07-07",
      fixedRules: [datedRule],
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
    expect(shifts[0].startTime).toBe("09:00");
    expect(shifts[1].startTime).toBe("12:00");
  });

  it("returns visible shifts sorted by start time", () => {
    const manualShifts: ManualShift[] = [
      {
        id: "manual-1",
        employeeId: "person-b",
        date: "2026-07-06",
        startTime: "08:00",
        endTime: "12:00",
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

    expect(shifts.map((shift) => shift.startTime)).toEqual(["08:00", "09:00"]);
  });

  it("does not include manual shifts on a different date", () => {
    const manualShifts: ManualShift[] = [
      {
        id: "manual-1",
        employeeId: "person-b",
        date: "2026-07-07",
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

    expect(shifts).toHaveLength(1);
    expect(shifts[0].source).toBe("fixed_rule");
  });

  it("applies date-range coverage exception only inside the specified range", () => {
    const exceptions: ScheduleException[] = [
      {
        id: "exception-6",
        originalRuleId: "rule-a",
        originalEmployeeId: "person-a",
        dateFrom: "2026-07-06",
        dateTo: "2026-07-08",
        type: "coverage",
        replacementEmployeeId: "person-b",
      },
    ];

    const shiftsOnExceptionDate = getVisibleShiftsForDate({
      date: "2026-07-07",
      fixedRules,
      manualShifts: [],
      exceptions,
    });

    expect(shiftsOnExceptionDate).toHaveLength(1);
    expect(shiftsOnExceptionDate[0].employeeId).toBe("person-b");

    const shiftsOutsideExceptionDate = getVisibleShiftsForDate({
      date: "2026-07-10",
      fixedRules,
      manualShifts: [],
      exceptions,
    });

    expect(shiftsOutsideExceptionDate).toHaveLength(1);
    expect(shiftsOutsideExceptionDate[0].employeeId).toBe("person-a");
  });

  it("does not mutate fixed schedule rules when applying exceptions", () => {
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

    const ruleSnapshot = JSON.parse(JSON.stringify(fixedRules[0]));

    getVisibleShiftsForDate({
      date: "2026-07-06",
      fixedRules,
      manualShifts: [],
      exceptions,
    });

    expect(fixedRules[0]).toEqual(ruleSnapshot);
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

  it("applies one-day time off exception", () => {
    const exceptions: ScheduleException[] = [
      {
        id: "exception-3",
        originalRuleId: "rule-a",
        originalEmployeeId: "person-a",
        dateFrom: "2026-07-06",
        dateTo: "2026-07-06",
        type: "time_off",
      },
    ];

    const shifts = getVisibleShiftsForDate({
      date: "2026-07-06",
      fixedRules,
      manualShifts: [],
      exceptions,
    });

    expect(shifts).toHaveLength(0);
  });

  it("applies modified hours exception only during the exception range", () => {
    const exceptions: ScheduleException[] = [
      {
        id: "exception-4",
        originalRuleId: "rule-a",
        originalEmployeeId: "person-a",
        dateFrom: "2026-07-06",
        dateTo: "2026-07-07",
        type: "modified_hours",
        replacementStartTime: "10:00",
        replacementEndTime: "18:00",
      },
    ];

    const shiftsOnExceptionDate = getVisibleShiftsForDate({
      date: "2026-07-06",
      fixedRules,
      manualShifts: [],
      exceptions,
    });

    expect(shiftsOnExceptionDate).toHaveLength(1);
    expect(shiftsOnExceptionDate[0].startTime).toBe("10:00");
    expect(shiftsOnExceptionDate[0].endTime).toBe("18:00");

    const shiftsAfterExceptionDate = getVisibleShiftsForDate({
      date: "2026-07-10",
      fixedRules,
      manualShifts: [],
      exceptions,
    });

    expect(shiftsAfterExceptionDate).toHaveLength(1);
    expect(shiftsAfterExceptionDate[0].startTime).toBe("09:00");
    expect(shiftsAfterExceptionDate[0].endTime).toBe("17:00");
  });

  it("applies cancelled exception like time off", () => {
    const exceptions: ScheduleException[] = [
      {
        id: "exception-5",
        originalRuleId: "rule-a",
        originalEmployeeId: "person-a",
        dateFrom: "2026-07-06",
        dateTo: "2026-07-06",
        type: "cancelled",
      },
    ];

    const shifts = getVisibleShiftsForDate({
      date: "2026-07-06",
      fixedRules,
      manualShifts: [],
      exceptions,
    });

    expect(shifts).toHaveLength(0);
  });
});
