import { z } from "zod";

const isoDateTimeSchema = z
  .string()
  .refine((value) => !Number.isNaN(Date.parse(value)), {
    message: "Invalid ISO-8601 datetime",
  });

export function parseIsoDate(value: string): Date {
  const parsed = isoDateTimeSchema.parse(value);
  return new Date(parsed);
}

export function isStartAfterEnd(start: Date, end: Date): boolean {
  return start.getTime() > end.getTime();
}

export function toIsoString(date: Date | null | undefined): string | null {
  if (!date) return null;
  return date.toISOString();
}


