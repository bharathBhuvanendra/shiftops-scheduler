import type { VisibleShift } from "./visible-shift.types";
import { timeToMinutes } from "./schedule-time";

export type ScheduleConflict = {
  employeeId: string;
  shiftAId: string;
  shiftBId: string;
  reason: "overlapping_shift";
};

function shiftsOverlap(a: VisibleShift, b: VisibleShift): boolean {
  const aStart = timeToMinutes(a.startTime);
  const aEnd = timeToMinutes(a.endTime);
  const bStart = timeToMinutes(b.startTime);
  const bEnd = timeToMinutes(b.endTime);

  return aStart < bEnd && bStart < aEnd;
}

export function detectScheduleConflicts(shifts: VisibleShift[]): ScheduleConflict[] {
  const conflicts: ScheduleConflict[] = [];

  for (let i = 0; i < shifts.length; i++) {
    for (let j = i + 1; j < shifts.length; j++) {
      const shiftA = shifts[i];
      const shiftB = shifts[j];

      if (shiftA.employeeId !== shiftB.employeeId) continue;
      if (shiftA.date !== shiftB.date) continue;

      if (shiftsOverlap(shiftA, shiftB)) {
        conflicts.push({
          employeeId: shiftA.employeeId,
          shiftAId: shiftA.id,
          shiftBId: shiftB.id,
          reason: "overlapping_shift",
        });
      }
    }
  }

  return conflicts;
}
