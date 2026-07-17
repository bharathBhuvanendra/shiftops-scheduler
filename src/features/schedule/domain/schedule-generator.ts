import { getDay, isWithinInterval, parseISO } from "date-fns";
import type { FixedScheduleRule } from "./fixed-schedule-rule.types";
import type { ManualShift } from "./shift.types";
import type { ScheduleException } from "./schedule-exception.types";
import type { VisibleShift } from "./visible-shift.types";

function isDateWithinRange(date: string, from: string, to?: string): boolean {
  const currentDate = parseISO(date);
  const startDate = parseISO(from);
  const endDate = to ? parseISO(to) : parseISO("9999-12-31");

  return isWithinInterval(currentDate, {
    start: startDate,
    end: endDate,
  });
}

function isExceptionActiveOnDate(exception: ScheduleException, date: string): boolean {
  return isDateWithinRange(date, exception.dateFrom, exception.dateTo);
}

function generateFixedRuleShiftsForDate(
  date: string,
  fixedRules: FixedScheduleRule[]
): VisibleShift[] {
  const weekday = getDay(parseISO(date));

  return fixedRules
    .filter((rule) => rule.isActive)
    .filter((rule) => rule.weekdays.includes(weekday))
    .filter((rule) => isDateWithinRange(date, rule.effectiveFrom, rule.effectiveTo))
    .map((rule) => ({
      id: `fixed-${rule.id}-${date}`,
      employeeId: rule.employeeId,
      date,
      startTime: rule.startTime,
      endTime: rule.endTime,
      role: rule.role,
      source: "fixed_rule" as const,
      originalRuleId: rule.id,
    }));
}

function applyExceptionsToShifts(params: {
  date: string;
  shifts: VisibleShift[];
  exceptions: ScheduleException[];
}): VisibleShift[] {
  const activeExceptions = params.exceptions.filter((exception) =>
    isExceptionActiveOnDate(exception, params.date)
  );

  let visibleShifts = [...params.shifts];

  for (const exception of activeExceptions) {
    const matchesOriginalEmployee = (shift: VisibleShift) =>
      shift.employeeId === exception.originalEmployeeId &&
      (!exception.originalRuleId || shift.originalRuleId === exception.originalRuleId);

    if (exception.type === "time_off" || exception.type === "cancelled") {
      visibleShifts = visibleShifts.filter((shift) => !matchesOriginalEmployee(shift));
    }

    if (exception.type === "coverage") {
      const originalShift = visibleShifts.find(matchesOriginalEmployee);

      visibleShifts = visibleShifts.filter((shift) => !matchesOriginalEmployee(shift));

      if (originalShift && exception.replacementEmployeeId) {
        visibleShifts.push({
          id: `exception-${exception.id}-${params.date}`,
          employeeId: exception.replacementEmployeeId,
          date: params.date,
          startTime: exception.replacementStartTime ?? originalShift.startTime,
          endTime: exception.replacementEndTime ?? originalShift.endTime,
          role: exception.replacementRole ?? originalShift.role,
          source: "exception",
          originalRuleId: originalShift.originalRuleId,
          originalEmployeeId: originalShift.employeeId,
          exceptionId: exception.id,
        });
      }
    }

    if (exception.type === "modified_hours") {
      visibleShifts = visibleShifts.map((shift) => {
        if (!matchesOriginalEmployee(shift)) return shift;

        return {
          ...shift,
          startTime: exception.replacementStartTime ?? shift.startTime,
          endTime: exception.replacementEndTime ?? shift.endTime,
          source: "exception",
          exceptionId: exception.id,
        };
      });
    }
  }

  return visibleShifts;
}

export function getVisibleShiftsForDate(params: {
  date: string;
  manualShifts: ManualShift[];
  fixedRules: FixedScheduleRule[];
  exceptions: ScheduleException[];
}): VisibleShift[] {
  const fixedShifts = generateFixedRuleShiftsForDate(params.date, params.fixedRules);

  const manualVisibleShifts: VisibleShift[] = params.manualShifts
    .filter((shift) => shift.date === params.date)
    .map((shift) => ({
      ...shift,
      source: "manual",
    }));

  const fixedWithExceptions = applyExceptionsToShifts({
    date: params.date,
    shifts: fixedShifts,
    exceptions: params.exceptions,
  });

  return [...fixedWithExceptions, ...manualVisibleShifts].sort((a, b) =>
    a.startTime.localeCompare(b.startTime)
  );
}