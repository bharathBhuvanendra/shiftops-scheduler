import { describe, expect, it } from "vitest";
import { createScheduleException, replaceFixedRuleFromDate } from "../domain/schedule-management";
import type { FixedScheduleRule } from "../domain/fixed-schedule-rule.types";

const baseRule: FixedScheduleRule = {
  id: "rule-a",
  employeeId: "person-a",
  weekdays: [1, 2, 5],
  startTime: "09:00",
  endTime: "17:00",
  role: "front_desk",
  effectiveFrom: "2026-07-01",
  isActive: true,
};

const nextRule: FixedScheduleRule = {
  id: "rule-a-v2",
  employeeId: "person-a",
  weekdays: [1, 2, 5],
  startTime: "10:00",
  endTime: "18:00",
  role: "front_desk",
  effectiveFrom: "2026-08-01",
  isActive: true,
};

describe("replaceFixedRuleFromDate", () => {
  it("creates a historical end date for the original rule and appends the new rule", () => {
    const result = replaceFixedRuleFromDate({
      fixedRules: [baseRule],
      oldRuleId: "rule-a",
      effectiveFrom: "2026-08-01",
      newRule: nextRule,
    });

    expect(result).toHaveLength(2);
    const oldRule = result.find((rule) => rule.id === "rule-a");
    expect(oldRule).toEqual({
      ...baseRule,
      effectiveTo: "2026-07-31",
    });
    expect(result).toContainEqual(nextRule);
  });

  it("disables the old rule when the replacement starts on the same day", () => {
    const result = replaceFixedRuleFromDate({
      fixedRules: [baseRule],
      oldRuleId: "rule-a",
      effectiveFrom: "2026-07-01",
      newRule: {
        ...nextRule,
        id: "rule-a-v2",
        effectiveFrom: "2026-07-01",
      },
    });

    expect(result).toHaveLength(2);
    expect(result).toContainEqual({
      ...baseRule,
      isActive: false,
    });
  });
});

describe("createScheduleException", () => {
  it("fills a missing dateTo with dateFrom for a one-day exception", () => {
    const exception = createScheduleException({
      id: "exception-1",
      originalEmployeeId: "person-a",
      dateFrom: "2026-07-06",
      type: "time_off",
    });

    expect(exception).toMatchObject({
      id: "exception-1",
      originalEmployeeId: "person-a",
      dateFrom: "2026-07-06",
      dateTo: "2026-07-06",
      type: "time_off",
    });
  });

  it("requires a replacement employee for coverage exceptions", () => {
    expect(() =>
      createScheduleException({
        id: "exception-2",
        originalEmployeeId: "person-a",
        dateFrom: "2026-07-06",
        type: "coverage",
      })
    ).toThrow("Coverage exceptions require a replacement employee.");
  });

  it("requires replacement data for modified_hours exceptions", () => {
    expect(() =>
      createScheduleException({
        id: "exception-3",
        originalEmployeeId: "person-a",
        dateFrom: "2026-07-06",
        type: "modified_hours",
      })
    ).toThrow("Modified hours exceptions require at least one replacement field.");
  });
});
