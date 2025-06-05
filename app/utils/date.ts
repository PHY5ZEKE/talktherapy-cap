import type { CLINICIAN_SCHEDULE } from "types/clinician";
import { SCHEDULE_DAY } from "config/filters";

export function formatDate(date: Date, format: string): string {
  const options: Intl.DateTimeFormatOptions = {};
  if (format.includes("YYYY")) options.year = "numeric";
  if (format.includes("MM")) options.month = "2-digit";
  if (format.includes("DD")) options.day = "2-digit";
  return new Intl.DateTimeFormat("en-US", options).format(date);
}

export function calculateEndDate(startDate: Date, durationWeeks: number): Date {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + durationWeeks * 7);
  return endDate;
}

export function convertToLocalDay(startDate: Date): {
  date: Date;
  dayName: CLINICIAN_SCHEDULE["day"];
} {
  const localDate = new Date(startDate);
  const utcDate = new Date(
    localDate.getUTCFullYear(),
    localDate.getUTCMonth(),
    localDate.getUTCDate(),
    localDate.getUTCHours(),
    localDate.getUTCMinutes(),
    localDate.getUTCSeconds()
  );
  const date = new Date(
    utcDate.getTime() + utcDate.getTimezoneOffset() * 60000
  );
  const dayName = SCHEDULE_DAY[date.getDay()] as CLINICIAN_SCHEDULE["day"];

  return { date, dayName };
}

export function getDayName(date: Date): CLINICIAN_SCHEDULE["day"] {
  const dayIndex = date.getDay();
  return SCHEDULE_DAY[dayIndex] as CLINICIAN_SCHEDULE["day"];
}
