import { describe, expect, it } from "vitest";

import {
  computeAllowedHours,
  computeAllowedMinutes,
  computeRolledScheduleDate,
  normalizeScheduledAtToAllowedWindow,
} from "@/hooks/useOrderSchedule";
import type { OrderSettings } from "@/types/order";

function localDate(year: number, monthIndex: number, day: number, hour = 0, minute = 0) {
  return new Date(year, monthIndex, day, hour, minute, 0, 0);
}

function makeSettings(overrides: Partial<OrderSettings> = {}): OrderSettings {
  return {
    start_time: "09:00",
    end_time: "18:00",
    minimum_minutes: 0,
    cancel_minutes: 0,
    timezone: "America/Sao_Paulo",
    ...overrides,
  };
}

describe("hooks/useOrderSchedule pure functions", () => {
  describe("computeAllowedHours", () => {
    it("returns 24 hours when settings is null", () => {
      expect(computeAllowedHours(null, localDate(2026, 1, 25, 10, 0))).toEqual(
        Array.from({ length: 24 }, (_, i) => i)
      );
    });

    it("uses configured start/end on non-today dates", () => {
      const settings = makeSettings({ start_time: "09:00", end_time: "11:00" });
      const now = localDate(2026, 1, 25, 10, 0);
      const scheduledAt = localDate(2026, 1, 26, 10, 0);

      expect(computeAllowedHours(settings, scheduledAt, now)).toEqual([9, 10, 11]);
    });

    it("applies minimum_minutes when scheduling for today", () => {
      const settings = makeSettings({
        start_time: "09:00",
        end_time: "18:00",
        minimum_minutes: 125,
      });
      const now = localDate(2026, 1, 25, 10, 10);
      const scheduledAt = localDate(2026, 1, 25, 10, 10);

      expect(computeAllowedHours(settings, scheduledAt, now)).toEqual([
        12, 13, 14, 15, 16, 17, 18,
      ]);
    });

    it("returns empty array when effective window is invalid", () => {
      const settings = makeSettings({ start_time: "10:00", end_time: "09:00" });
      expect(computeAllowedHours(settings, localDate(2026, 1, 26, 10, 0))).toEqual([]);
    });
  });

  describe("computeAllowedMinutes", () => {
    it("returns 5-minute increments when settings is null", () => {
      expect(
        computeAllowedMinutes(null, localDate(2026, 1, 25, 10, 0), 10, [10], localDate(2026, 1, 25, 10, 0))
      ).toEqual([0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]);
    });

    it("returns empty when there are no allowed hours", () => {
      const settings = makeSettings();
      expect(
        computeAllowedMinutes(settings, localDate(2026, 1, 25, 10, 0), 10, [], localDate(2026, 1, 25, 10, 0))
      ).toEqual([]);
    });

    it("respects start minute on first hour and end minute on last hour", () => {
      const settings = makeSettings({ start_time: "09:10", end_time: "10:20" });
      const scheduledAt = localDate(2026, 1, 26, 9, 0);
      const now = localDate(2026, 1, 25, 10, 0);
      const allowedHours = [9, 10];

      expect(computeAllowedMinutes(settings, scheduledAt, 9, allowedHours, now)).toEqual([
        10, 15, 20, 25, 30, 35, 40, 45, 50, 55,
      ]);
      expect(computeAllowedMinutes(settings, scheduledAt, 10, allowedHours, now)).toEqual([
        0, 5, 10, 15, 20,
      ]);
    });

    it("applies current-day minimum minute floor on minAllowed hour", () => {
      const settings = makeSettings({
        start_time: "09:00",
        end_time: "12:30",
        minimum_minutes: 68, // 10:07 -> 11:15
      });
      const now = localDate(2026, 1, 25, 10, 7);
      const scheduledAt = localDate(2026, 1, 25, 10, 30);
      const allowedHours = computeAllowedHours(settings, scheduledAt, now);

      expect(allowedHours[0]).toBe(11);
      expect(computeAllowedMinutes(settings, scheduledAt, 11, allowedHours, now)).toEqual([
        15, 20, 25, 30, 35, 40, 45, 50, 55,
      ]);
    });

    it("returns empty when min minute exceeds max minute in same allowed hour", () => {
      const settings = makeSettings({
        start_time: "09:00",
        end_time: "10:10",
        minimum_minutes: 65, // 09:10 -> 10:15
      });
      const now = localDate(2026, 1, 25, 9, 10);
      const scheduledAt = localDate(2026, 1, 25, 9, 30);
      const allowedHours = [10];

      expect(computeAllowedMinutes(settings, scheduledAt, 10, allowedHours, now)).toEqual([]);
    });
  });

  describe("computeRolledScheduleDate", () => {
    it("returns next day at start_time when today's window is no longer reachable", () => {
      const settings = makeSettings({
        start_time: "09:00",
        end_time: "18:00",
        minimum_minutes: 20,
      });
      const now = localDate(2026, 1, 25, 17, 50); // minAllowed 18:10 > endLimit 17:55
      const scheduledAt = localDate(2026, 1, 25, 17, 50);

      const rolled = computeRolledScheduleDate(settings, scheduledAt, now);
      expect(rolled).not.toBeNull();
      expect(rolled?.getDate()).toBe(26);
      expect(rolled?.getHours()).toBe(9);
      expect(rolled?.getMinutes()).toBe(0);
    });

    it("returns null when same-day schedule is still possible", () => {
      const settings = makeSettings({
        start_time: "09:00",
        end_time: "18:00",
        minimum_minutes: 10,
      });
      const now = localDate(2026, 1, 25, 17, 40); // minAllowed 17:50 <= endLimit 17:55
      const scheduledAt = localDate(2026, 1, 25, 17, 40);

      expect(computeRolledScheduleDate(settings, scheduledAt, now)).toBeNull();
    });
  });

  describe("normalizeScheduledAtToAllowedWindow", () => {
    it("returns null when there are no allowed hours", () => {
      const scheduledAt = localDate(2026, 1, 25, 10, 0);
      expect(normalizeScheduledAtToAllowedWindow(scheduledAt, [], () => [])).toBeNull();
    });

    it("snaps to first allowed hour when current hour is outside window", () => {
      const scheduledAt = localDate(2026, 1, 25, 8, 37);
      const next = normalizeScheduledAtToAllowedWindow(scheduledAt, [9, 10], () => [0, 5, 10]);

      expect(next?.getHours()).toBe(9);
      expect(next?.getMinutes()).toBe(0);
      expect(next?.getSeconds()).toBe(0);
    });

    it("snaps to first allowed minute when hour is valid but minute is not", () => {
      const scheduledAt = localDate(2026, 1, 25, 10, 7);
      const next = normalizeScheduledAtToAllowedWindow(scheduledAt, [9, 10], (hour) =>
        hour === 10 ? [15, 20, 25] : [0, 5]
      );

      expect(next?.getHours()).toBe(10);
      expect(next?.getMinutes()).toBe(15);
    });

    it("returns null when scheduled time is already inside allowed window", () => {
      const scheduledAt = localDate(2026, 1, 25, 10, 20);
      const next = normalizeScheduledAtToAllowedWindow(scheduledAt, [9, 10], (hour) =>
        hour === 10 ? [15, 20, 25] : [0, 5]
      );

      expect(next).toBeNull();
    });
  });
});
