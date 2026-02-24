import { useCallback, useEffect, useMemo } from "react";
import { OrderSettings } from "@/types";

type UseOrderScheduleArgs = {
  settings: OrderSettings | null;
  scheduledAt: Date;
  setScheduledAt: (next: Date) => void;
};

export function useOrderSchedule({
  settings,
  scheduledAt,
  setScheduledAt,
}: UseOrderScheduleArgs) {
  const minimumDate = useMemo(() => new Date(), []);

  const allowedHours = useMemo(() => {
    if (!settings) {
      return Array.from({ length: 24 }, (_, i) => i);
    }

    const now = new Date();
    const minimumMinutes = Math.max(0, Number(settings.minimum_minutes ?? 0));
    const minAllowed = new Date(now.getTime() + minimumMinutes * 60 * 1000);
    const isToday =
      scheduledAt.getFullYear() === now.getFullYear() &&
      scheduledAt.getMonth() === now.getMonth() &&
      scheduledAt.getDate() === now.getDate();

    const [startHour] = settings.start_time.split(":").map(Number);
    const [endHour] = settings.end_time.split(":").map(Number);
    const safeStart = Number.isFinite(startHour) ? startHour : 0;
    const safeEnd = Number.isFinite(endHour) ? endHour : 23;
    const minHour = isToday ? minAllowed.getHours() : safeStart;

    const start = Math.max(safeStart, minHour);
    if (safeEnd < start) {
      return [];
    }
    const hours: number[] = [];
    for (let h = start; h <= safeEnd; h += 1) {
      hours.push(h);
    }
    return hours;
  }, [scheduledAt, settings]);

  const allowedMinutes = useCallback(
    (hour: number) => {
      if (!settings) {
        return Array.from({ length: 60 }, (_, i) => i).filter((value) => value % 5 === 0);
      }

      const now = new Date();
      const minimumMinutes = Math.max(0, Number(settings.minimum_minutes ?? 0));
      const minAllowed = new Date(now.getTime() + minimumMinutes * 60 * 1000);
      const isToday =
        scheduledAt.getFullYear() === now.getFullYear() &&
        scheduledAt.getMonth() === now.getMonth() &&
        scheduledAt.getDate() === now.getDate();

      const [, startMinute] = settings.start_time.split(":").map(Number);
      const [, endMinute] = settings.end_time.split(":").map(Number);
      const safeStartMinute = Number.isFinite(startMinute) ? startMinute : 0;
      const safeEndMinute = Number.isFinite(endMinute) ? endMinute : 59;

      let minMinute = 0;
      if (hour === allowedHours[0]) {
        minMinute = safeStartMinute;
      }
      if (isToday && hour === minAllowed.getHours()) {
        minMinute = Math.max(minMinute, minAllowed.getMinutes());
      }

      let maxMinute = 59;
      if (hour === allowedHours[allowedHours.length - 1]) {
        maxMinute = safeEndMinute;
      }

      if (maxMinute < minMinute) {
        return [];
      }

      return Array.from({ length: maxMinute - minMinute + 1 }, (_, i) => i + minMinute).filter(
        (value) => value % 5 === 0
      );
    },
    [allowedHours, scheduledAt, settings]
  );

  useEffect(() => {
    if (!settings) return;
    const now = new Date();
    const minimumMinutes = Math.max(0, Number(settings.minimum_minutes ?? 0));
    const minAllowed = new Date(now.getTime() + minimumMinutes * 60 * 1000);
    const [startHour, startMinute] = settings.start_time.split(":").map(Number);
    const [endHour, endMinute] = settings.end_time.split(":").map(Number);
    const endLimit = new Date(now);
    endLimit.setHours(endHour || 0, endMinute || 0, 0, 0);
    endLimit.setMinutes(endLimit.getMinutes() - 5);

    const isToday =
      scheduledAt.getFullYear() === now.getFullYear() &&
      scheduledAt.getMonth() === now.getMonth() &&
      scheduledAt.getDate() === now.getDate();

    if (isToday && minAllowed > endLimit) {
      const nextDay = new Date(now);
      nextDay.setDate(now.getDate() + 1);
      nextDay.setHours(startHour || 0, startMinute || 0, 0, 0);
      if (nextDay.getTime() !== scheduledAt.getTime()) {
        setScheduledAt(nextDay);
      }
    }
  }, [scheduledAt, setScheduledAt, settings]);

  useEffect(() => {
    if (allowedHours.length === 0) return;
    const currentHour = scheduledAt.getHours();
    const currentMinutes = scheduledAt.getMinutes();
    const next = new Date(scheduledAt);

    if (!allowedHours.includes(currentHour)) {
      next.setHours(allowedHours[0], 0, 0, 0);
      if (next.getTime() !== scheduledAt.getTime()) {
        setScheduledAt(next);
      }
      return;
    }

    const minutes = allowedMinutes(currentHour);
    if (minutes.length > 0 && !minutes.includes(currentMinutes)) {
      next.setMinutes(minutes[0] ?? 0, 0, 0);
      if (next.getTime() !== scheduledAt.getTime()) {
        setScheduledAt(next);
      }
    }
  }, [allowedHours, allowedMinutes, scheduledAt, setScheduledAt]);

  return {
    minimumDate,
    allowedHours,
    allowedMinutes,
  };
}
