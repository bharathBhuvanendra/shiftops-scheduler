export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    throw new Error(`Invalid time format: ${time}`);
  }

  return hours * 60 + minutes;
}

export function isValidShiftRange(startTime: string, endTime: string): boolean {
  return timeToMinutes(startTime) < timeToMinutes(endTime);
}

export function calculateShiftPosition(params: {
  startTime: string;
  endTime: string;
  timelineStart: string;
  timelineEnd: string;
}): { leftPercent: number; widthPercent: number } {
  const shiftStart = timeToMinutes(params.startTime);
  const shiftEnd = timeToMinutes(params.endTime);
  const timelineStart = timeToMinutes(params.timelineStart);
  const timelineEnd = timeToMinutes(params.timelineEnd);

  if (shiftStart < timelineStart || shiftEnd > timelineEnd) {
    throw new Error("Shift is outside visible timeline range.");
  }

  if (shiftStart >= shiftEnd) {
    throw new Error("Shift start time must be before end time.");
  }

  const timelineDuration = timelineEnd - timelineStart;

  return {
    leftPercent: ((shiftStart - timelineStart) / timelineDuration) * 100,
    widthPercent: ((shiftEnd - shiftStart) / timelineDuration) * 100,
  };
}