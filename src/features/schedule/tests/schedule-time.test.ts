import { describe, expect, it } from "vitest";
import {
  calculateShiftPosition,
  isValidShiftRange,
  timeToMinutes,
} from "../domain/schedule-time";

describe("schedule-time", () => {
  it("converts HH:mm time to minutes", () => {
    expect(timeToMinutes("09:30")).toBe(570);
  });

  it("validates shift ranges", () => {
    expect(isValidShiftRange("09:00", "17:00")).toBe(true);
    expect(isValidShiftRange("17:00", "09:00")).toBe(false);
  });

  it("throws a useful error for invalid time inputs", () => {
    expect(() => timeToMinutes("24:00")).toThrow(
      "Invalid time format: 24:00"
    );
  });

  it("calculates shift position within a timeline", () => {
    const result = calculateShiftPosition({
      startTime: "09:00",
      endTime: "17:00",
      timelineStart: "06:00",
      timelineEnd: "23:00",
    });

    expect(result.leftPercent).toBeCloseTo(17.64, 1);
    expect(result.widthPercent).toBeCloseTo(47.05, 1);
  });
});