import { describe, expect, it } from "vitest";
import { detectScheduleConflicts } from "../domain/schedule-conflicts";
import type { VisibleShift } from "../domain/visible-shift.types";

describe("detectScheduleConflicts", () => {
  it("detects overlapping shifts for the same employee", () => {
    const shifts: VisibleShift[] = [
      {
        id: "1",
        employeeId: "person-a",
        date: "2026-07-06",
        startTime: "09:00",
        endTime: "13:00",
        role: "staff",
        source: "manual",
      },
      {
        id: "2",
        employeeId: "person-a",
        date: "2026-07-06",
        startTime: "12:00",
        endTime: "17:00",
        role: "staff",
        source: "manual",
      },
    ];

    expect(detectScheduleConflicts(shifts)).toEqual([
      {
        employeeId: "person-a",
        shiftAId: "1",
        shiftBId: "2",
        reason: "overlapping_shift",
      },
    ]);
  });

  it("does not flag adjacent shifts for the same employee as conflicts", () => {
    const shifts: VisibleShift[] = [
      {
        id: "1",
        employeeId: "person-a",
        date: "2026-07-06",
        startTime: "09:00",
        endTime: "13:00",
        role: "staff",
        source: "manual",
      },
      {
        id: "2",
        employeeId: "person-a",
        date: "2026-07-06",
        startTime: "13:00",
        endTime: "17:00",
        role: "staff",
        source: "manual",
      },
    ];

    expect(detectScheduleConflicts(shifts)).toHaveLength(0);
  });

  it("allows overlapping shifts for different employees", () => {
    const shifts: VisibleShift[] = [
      {
        id: "1",
        employeeId: "person-a",
        date: "2026-07-06",
        startTime: "09:00",
        endTime: "17:00",
        role: "staff",
        source: "manual",
      },
      {
        id: "2",
        employeeId: "person-b",
        date: "2026-07-06",
        startTime: "09:00",
        endTime: "17:00",
        role: "staff",
        source: "manual",
      },
    ];

    expect(detectScheduleConflicts(shifts)).toHaveLength(0);
  });
});
