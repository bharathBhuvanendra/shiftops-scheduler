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
import { replaceFixedRuleFromDate as replaceFixedRuleFromDateInDomain } from "../domain/schedule-management";

type ScheduleState = {
  employees: Employee[];
  manualShifts: ManualShift[];
  fixedRules: FixedScheduleRule[];
  exceptions: ScheduleException[];

  addEmployee: (employee: Employee) => void;
  toggleEmployeeActive: (employeeId: string) => void;
  addFixedRule: (rule: FixedScheduleRule) => void;
  addManualShift: (shift: ManualShift) => void;
  deleteManualShift: (shiftId: string) => void;
  addScheduleException: (exception: ScheduleException) => void;
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

  addEmployee: (employee) =>
    set((state) => ({
      employees: [...state.employees, employee],
    })),

  toggleEmployeeActive: (employeeId) =>
    set((state) => ({
      employees: state.employees.map((employee) =>
        employee.id === employeeId
          ? { ...employee, isActive: !employee.isActive }
          : employee
      ),
    })),

  addFixedRule: (rule) =>
    set((state) => ({
      fixedRules: [...state.fixedRules, rule],
    })),

  addManualShift: (shift) =>
    set((state) => ({
      manualShifts: [...state.manualShifts, shift],
    })),

  deleteManualShift: (shiftId) =>
    set((state) => ({
      manualShifts: state.manualShifts.filter((shift) => shift.id !== shiftId),
    })),

  addScheduleException: (exception) =>
    set((state) => ({
      exceptions: [...state.exceptions, exception],
    })),

  replaceFixedRuleFromDate: ({ oldRuleId, effectiveFrom, newRule }) =>
    set((state) => ({
      fixedRules: replaceFixedRuleFromDateInDomain({
        fixedRules: state.fixedRules,
        oldRuleId,
        effectiveFrom,
        newRule,
      }),
    })),
}));
