import { create } from "zustand";
import type { Employee } from "../domain/employee.types";
import type { FixedScheduleRule } from "../domain/fixed-schedule-rule.types";
import type { ManualShift } from "../domain/shift.types";
import type { ScheduleException } from "../domain/schedule-exception.types";
import {
  mockEmployees,
  mockExceptions,
  mockFixedRules,
  mockManualShifts,
} from "../data/schedule.mock";

type ScheduleState = {
  employees: Employee[];
  manualShifts: ManualShift[];
  fixedRules: FixedScheduleRule[];
  exceptions: ScheduleException[];

  addManualShift: (shift: ManualShift) => void;
  deleteManualShift: (shiftId: string) => void;
  addException: (exception: ScheduleException) => void;
  replaceFixedRuleFromDate: (params: {
    oldRuleId: string;
    effectiveFrom: string;
    newRule: FixedScheduleRule;
  }) => void;
};

export const useScheduleStore = create<ScheduleState>((set) => ({
  employees: mockEmployees,
  manualShifts: mockManualShifts,
  fixedRules: mockFixedRules,
  exceptions: mockExceptions,

  addManualShift: (shift) =>
    set((state) => ({
      manualShifts: [...state.manualShifts, shift],
    })),

  deleteManualShift: (shiftId) =>
    set((state) => ({
      manualShifts: state.manualShifts.filter((shift) => shift.id !== shiftId),
    })),

  addException: (exception) =>
    set((state) => ({
      exceptions: [...state.exceptions, exception],
    })),

  replaceFixedRuleFromDate: ({ oldRuleId, effectiveFrom, newRule }) =>
    set((state) => ({
      fixedRules: state.fixedRules
        .map((rule) =>
          rule.id === oldRuleId
            ? {
                ...rule,
                effectiveTo: effectiveFrom,
                isActive: false,
              }
            : rule
        )
        .concat(newRule),
    })),
}));
