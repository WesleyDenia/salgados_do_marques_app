import { describe, expect, it } from "vitest";

import {
  computeAllowedHours,
  computeAllowedMinutes,
  computeRolledScheduleDate,
  normalizeScheduledAtToAllowedWindow,
} from "@/hooks/useOrderSchedule";
import { localDate, makeOrderSettings } from "@/tests/fixtures/orderSchedule";

describe("regression: order schedule business scenarios", () => {
  it("allows last same-day slot exactly on endLimit boundary (5 min before end_time)", () => {
    const settings = makeOrderSettings({
      start_time: "09:00",
      end_time: "18:00",
      minimum_minutes: 5,
    });
    const now = localDate(2026, 1, 25, 17, 50); // minAllowed = 17:55, endLimit = 17:55
    const scheduledAt = localDate(2026, 1, 25, 17, 50);

    expect(computeRolledScheduleDate(settings, scheduledAt, now)).toBeNull();

    const allowedHours = computeAllowedHours(settings, scheduledAt, now);
    expect(allowedHours).toEqual([17, 18]);
    expect(computeAllowedMinutes(settings, scheduledAt, 17, allowedHours, now)).toEqual([55]);
  });

  it("rolls to next day when minimum_minutes pushes past closing threshold", () => {
    const settings = makeOrderSettings({
      start_time: "09:00",
      end_time: "18:00",
      minimum_minutes: 5,
    });
    const now = localDate(2026, 1, 25, 17, 51); // minAllowed = 17:56 > endLimit = 17:55
    const scheduledAt = localDate(2026, 1, 25, 17, 51);

    const rolled = computeRolledScheduleDate(settings, scheduledAt, now);
    expect(rolled).not.toBeNull();
    expect(rolled?.getDate()).toBe(26);
    expect(rolled?.getHours()).toBe(9);
    expect(rolled?.getMinutes()).toBe(0);
  });

  it("normalizes an invalid minute after reopening to the first 5-minute slot", () => {
    const settings = makeOrderSettings({
      start_time: "09:05",
      end_time: "18:00",
      minimum_minutes: 0,
    });
    const now = localDate(2026, 1, 25, 8, 0);
    const scheduledAt = localDate(2026, 1, 25, 9, 3);
    const allowedHours = computeAllowedHours(settings, scheduledAt, now);

    const normalized = normalizeScheduledAtToAllowedWindow(scheduledAt, allowedHours, (hour) =>
      computeAllowedMinutes(settings, scheduledAt, hour, allowedHours, now)
    );

    expect(normalized).not.toBeNull();
    expect(normalized?.getHours()).toBe(9);
    expect(normalized?.getMinutes()).toBe(5);
  });
});
