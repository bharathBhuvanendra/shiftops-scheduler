import { describe, expect, it, beforeEach } from "vitest";
import { useScheduleStore } from "../store/schedule.store";
import {
  mockEmployees,
  mockFixedRules,
  mockManualShifts,
  mockExceptions,
} from "../data/schedule.mock";
import type { Employee } from "../domain/employee.types";
import type { FixedScheduleRule } from "../domain/fixed-schedule-rule.types";
import type { ManualShift } from "../domain/shift.types";
import type { ScheduleException } from "../domain/schedule-exception.types";

const resetScheduleStore = () => {
  useScheduleStore.setState({
    employees: mockEmployees.map((employee) => ({ ...employee })),
    fixedRules: mockFixedRules.map((rule) => ({ ...rule })),
    manualShifts: mockManualShifts.map((shift) => ({ ...shift })),
    exceptions: mockExceptions.map((exception) => ({ ...exception })),
  });
};

describe("schedule store", () => {
  beforeEach(() => {
    resetScheduleStore();
  });

  it("initializes with mock schedule data", () => {
    const state = useScheduleStore.getState();

    expect(state.employees).toEqual(mockEmployees);
    expect(state.fixedRules).toEqual(mockFixedRules);
    expect(state.manualShifts).toEqual(mockManualShifts);
    expect(state.exceptions).toEqual(mockExceptions);
  });

  it("adds a manual shift", () => {
    const newShift: ManualShift = {
      id: "shift-b",
      employeeId: "person-a",
      date: "2026-07-11",
      startTime: "09:00",
      endTime: "13:00",
      role: "front_desk",
      source: "manual",
    };

    useScheduleStore.getState().addManualShift(newShift);

    expect(useScheduleStore.getState().manualShifts).toContainEqual(newShift);
  });

  it("deletes a manual shift by id", () => {
    useScheduleStore.getState().deleteManualShift("shift-a");

    expect(useScheduleStore.getState().manualShifts).toEqual([]);
  });

  it("adds a schedule exception", () => {
    const newException: ScheduleException = {
      id: "exception-c",
      originalRuleId: "rule-a",
      originalEmployeeId: "person-a",
      dateFrom: "2026-07-12",
      dateTo: "2026-07-12",
      type: "time_off",
      reason: "Personal appointment",
    };

    useScheduleStore.getState().addScheduleException(newException);

    expect(useScheduleStore.getState().exceptions).toContainEqual(newException);
  });

  it("adds a fixed schedule rule", () => {
    const newRule: FixedScheduleRule = {
      id: "rule-c",
      employeeId: "person-c",
      weekdays: [1, 3, 5],
      startTime: "08:00",
      endTime: "16:00",
      role: "staff",
      effectiveFrom: "2026-08-01",
      isActive: true,
    };

    useScheduleStore.getState().addFixedRule(newRule);

    expect(useScheduleStore.getState().fixedRules).toContainEqual(newRule);
  });

  it("adds a new employee", () => {
    const newEmployee: Employee = {
      id: "person-d",
      name: "Person D",
      role: "cleaner",
      color: "#ef4444",
      isActive: true,
    }

    useScheduleStore.getState().addEmployee(newEmployee)

    expect(useScheduleStore.getState().employees).toContainEqual(newEmployee)
  })

  it("toggles employee active status", () => {
    useScheduleStore.getState().toggleEmployeeActive("person-a")

    expect(useScheduleStore.getState().employees).toContainEqual(
      expect.objectContaining({ id: "person-a", isActive: false })
    )

    useScheduleStore.getState().toggleEmployeeActive("person-a")

    expect(useScheduleStore.getState().employees).toContainEqual(
      expect.objectContaining({ id: "person-a", isActive: true })
    )
  })

  it("replaces a fixed rule from a future date", () => {
    const newRule: FixedScheduleRule = {
      id: "rule-a-v2",
      employeeId: "person-a",
      weekdays: [1, 2, 5],
      startTime: "10:00",
      endTime: "18:00",
      role: "front_desk",
      effectiveFrom: "2026-08-01",
      isActive: true,
    };

    useScheduleStore.getState().replaceFixedRuleFromDate({
      oldRuleId: "rule-a",
      effectiveFrom: "2026-08-01",
      newRule,
    });

    const fixedRules = useScheduleStore.getState().fixedRules;
    expect(fixedRules).toContainEqual({
      ...mockFixedRules[0],
      effectiveTo: "2026-07-31",
    });
    expect(fixedRules).toContainEqual(newRule);
  });
});
