import { format, isAfter, isBefore, isValid, parseISO, subDays } from "date-fns";
import { timeToMinutes } from "./schedule-time";
import type { FixedScheduleRule } from "./fixed-schedule-rule.types";
import type { ScheduleException } from "./schedule-exception.types";

export type CreateScheduleExceptionParams = Omit<ScheduleException, "id" | "dateTo"> & {
  id?: string;
  dateTo?: string;
};

export function createScheduleException(
  params: CreateScheduleExceptionParams
): ScheduleException {
  const dateFrom = parseISO(params.dateFrom);
  const dateTo = parseISO(params.dateTo ?? params.dateFrom);

  if (!isValid(dateFrom) || !isValid(dateTo)) {
    throw new Error("Invalid exception dates.");
  }

  if (isAfter(dateFrom, dateTo)) {
    throw new Error("Exception end date must not be before start date.");
  }

  if (params.type === "coverage" && !params.replacementEmployeeId) {
    throw new Error("Coverage exceptions require a replacement employee.");
  }

  if (params.type === "modified_hours") {
    if (
      params.replacementStartTime == null &&
      params.replacementEndTime == null &&
      params.replacementRole == null
    ) {
      throw new Error(
        "Modified hours exceptions require at least one replacement field."
      );
    }
  }

  if (params.replacementStartTime != null) {
    timeToMinutes(params.replacementStartTime);
  }

  if (params.replacementEndTime != null) {
    timeToMinutes(params.replacementEndTime);
  }

  if (
    params.replacementStartTime != null &&
    params.replacementEndTime != null &&
    timeToMinutes(params.replacementStartTime) >=
      timeToMinutes(params.replacementEndTime)
  ) {
    throw new Error(
      "Exception replacement start time must be before replacement end time."
    );
  }

  const id =
    params.id ??
    globalThis.crypto?.randomUUID?.() ??
    `exception-${Math.random().toString(36).slice(2, 8)}`;

  return {
    id,
    originalRuleId: params.originalRuleId,
    originalEmployeeId: params.originalEmployeeId,
    dateFrom: params.dateFrom,
    dateTo: params.dateTo ?? params.dateFrom,
    type: params.type,
    replacementEmployeeId: params.replacementEmployeeId,
    replacementStartTime: params.replacementStartTime,
    replacementEndTime: params.replacementEndTime,
    replacementRole: params.replacementRole,
    reason: params.reason,
  };
}

export function replaceFixedRuleFromDate(params: {
  fixedRules: FixedScheduleRule[];
  oldRuleId: string;
  effectiveFrom: string;
  newRule: FixedScheduleRule;
}): FixedScheduleRule[] {
  const oldRule = params.fixedRules.find(
    (rule) => rule.id === params.oldRuleId
  );

  if (!oldRule) {
    throw new Error(`Fixed rule ${params.oldRuleId} not found.`);
  }

  if (params.newRule.effectiveFrom !== params.effectiveFrom) {
    throw new Error(
      "New rule effectiveFrom must match the replacement effectiveFrom."
    );
  }

  const effectiveFromDate = parseISO(params.effectiveFrom);
  const oldRuleStart = parseISO(oldRule.effectiveFrom);

  if (!isValid(effectiveFromDate) || !isValid(oldRuleStart)) {
    throw new Error("Invalid effectiveFrom date.");
  }

  const previousDay = subDays(effectiveFromDate, 1);
  const shouldDisableOldRule = isBefore(previousDay, oldRuleStart);
  const updatedRules = params.fixedRules.map((rule) => {
    if (rule.id !== params.oldRuleId) {
      return rule;
    }

    if (shouldDisableOldRule) {
      return {
        ...rule,
        isActive: false,
      };
    }

    const ruleEnd = rule.effectiveTo ? parseISO(rule.effectiveTo) : null;

    if (!rule.effectiveTo || ruleEnd === null || isAfter(ruleEnd, previousDay)) {
      return {
        ...rule,
        effectiveTo: format(previousDay, "yyyy-MM-dd"),
      };
    }

    return rule;
  });

  return [...updatedRules, params.newRule];
}
