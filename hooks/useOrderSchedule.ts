import { useCallback, useEffect, useMemo } from "react";
import { OrderSettings } from "@/types";

type UseOrderScheduleArgs = {
  settings: OrderSettings | null;
  scheduledAt: Date;
  setScheduledAt: (next: Date) => void;
};

const isSameCalendarDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const parseTimeParts = (value?: string) => {
  const [hour, minute] = String(value ?? "0:0").split(":").map(Number);
  return {
    hour: Number.isFinite(hour) ? hour : 0,
    minute: Number.isFinite(minute) ? minute : 0,
  };
};

const buildMinAllowed = (now: Date, settings: OrderSettings) => {
  const minimumMinutes = Math.max(0, Number(settings.minimum_minutes ?? 0));
  return new Date(now.getTime() + minimumMinutes * 60 * 1000);
};

export function computeAllowedHours(
  settings: OrderSettings | null,
  scheduledAt: Date,
  now: Date = new Date()
): number[] {
  if (!settings) {
    return Array.from({ length: 24 }, (_, i) => i);
  }

  const minAllowed = buildMinAllowed(now, settings);
  const isToday = isSameCalendarDay(scheduledAt, now);
  const start = parseTimeParts(settings.start_time);
  const end = parseTimeParts(settings.end_time);

  const minHour = isToday ? minAllowed.getHours() : start.hour;
  const startHour = Math.max(start.hour, minHour);
  const endHour = Math.min(23, Math.max(0, end.hour));

  if (endHour < startHour) {
    return [];
  }

  const hours: number[] = [];
  for (let h = startHour; h <= endHour; h += 1) {
    hours.push(h);
  }
  return hours;
}

export function computeAllowedMinutes(
  settings: OrderSettings | null,
  scheduledAt: Date,
  hour: number,
  allowedHours: number[],
  now: Date = new Date()
): number[] {
  if (!settings) {
    return Array.from({ length: 60 }, (_, i) => i).filter((value) => value % 5 === 0);
  }

  if (allowedHours.length === 0) {
    return [];
  }

  const minAllowed = buildMinAllowed(now, settings);
  const isToday = isSameCalendarDay(scheduledAt, now);
  const start = parseTimeParts(settings.start_time);
  const end = parseTimeParts(settings.end_time);

  let minMinute = 0;
  if (hour === allowedHours[0]) {
    minMinute = start.minute;
  }
  if (isToday && hour === minAllowed.getHours()) {
    minMinute = Math.max(minMinute, minAllowed.getMinutes());
  }

  let maxMinute = 59;
  if (hour === allowedHours[allowedHours.length - 1]) {
    maxMinute = end.minute;
  }

  if (maxMinute < minMinute) {
    return [];
  }

  return Array.from({ length: maxMinute - minMinute + 1 }, (_, i) => i + minMinute).filter(
    (value) => value % 5 === 0
  );
}

export function computeRolledScheduleDate(
  settings: OrderSettings | null,
  scheduledAt: Date,
  now: Date = new Date()
): Date | null {
  if (!settings) return null;

  const minAllowed = buildMinAllowed(now, settings);
  const start = parseTimeParts(settings.start_time);
  const end = parseTimeParts(settings.end_time);
  const endLimit = new Date(now);
  endLimit.setHours(end.hour, end.minute, 0, 0);
  endLimit.setMinutes(endLimit.getMinutes() - 5);

  const isToday = isSameCalendarDay(scheduledAt, now);
  if (!(isToday && minAllowed > endLimit)) {
    return null;
  }

  const nextDay = new Date(now);
  nextDay.setDate(now.getDate() + 1);
  nextDay.setHours(start.hour, start.minute, 0, 0);
  return nextDay;
}

export function normalizeScheduledAtToAllowedWindow(
  scheduledAt: Date,
  allowedHours: number[],
  getAllowedMinutesForHour: (hour: number) => number[]
): Date | null {
  if (allowedHours.length === 0) return null;

  const currentHour = scheduledAt.getHours();
  const currentMinutes = scheduledAt.getMinutes();
  const next = new Date(scheduledAt);

  if (!allowedHours.includes(currentHour)) {
    next.setHours(allowedHours[0], 0, 0, 0);
    return next;
  }

  const minutes = getAllowedMinutesForHour(currentHour);
  if (minutes.length > 0 && !minutes.includes(currentMinutes)) {
    next.setMinutes(minutes[0] ?? 0, 0, 0);
    return next;
  }

  return null;
}

export function useOrderSchedule({
  settings,
  scheduledAt,
  setScheduledAt,
}: UseOrderScheduleArgs) {
  const minimumDate = useMemo(() => new Date(), []);

  const allowedHours = useMemo(() => {
    return computeAllowedHours(settings, scheduledAt);
  }, [scheduledAt, settings]);

  const allowedMinutes = useCallback(
    (hour: number) => {
      return computeAllowedMinutes(settings, scheduledAt, hour, allowedHours);
    },
    [allowedHours, scheduledAt, settings]
  );

  useEffect(() => {
    const rolled = computeRolledScheduleDate(settings, scheduledAt);
    if (rolled && rolled.getTime() !== scheduledAt.getTime()) {
      setScheduledAt(rolled);
    }
  }, [scheduledAt, setScheduledAt, settings]);

  useEffect(() => {
    const next = normalizeScheduledAtToAllowedWindow(
      scheduledAt,
      allowedHours,
      allowedMinutes
    );
    if (next && next.getTime() !== scheduledAt.getTime()) {
      setScheduledAt(next);
    }
  }, [allowedHours, allowedMinutes, scheduledAt, setScheduledAt]);

  return {
    minimumDate,
    allowedHours,
    allowedMinutes,
  };
}
