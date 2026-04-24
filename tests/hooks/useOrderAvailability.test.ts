import { describe, expect, it } from "vitest";

import {
  buildCalendarMarkedDates,
  buildScheduledAtFromSelection,
  normalizeAvailabilitySelection,
} from "@/utils/orderAvailability";

describe("hooks/useOrderAvailability helpers", () => {
  it("keeps a selection only when it still exists in the latest availability list", () => {
    expect(normalizeAvailabilitySelection("2026-03-19", ["2026-03-18", "2026-03-19"])).toBe("2026-03-19");
    expect(normalizeAvailabilitySelection("16:00", ["17:00"])).toBeNull();
  });

  it("builds marked dates for the server-provided calendar days", () => {
    expect(
      buildCalendarMarkedDates(["2026-03-18", "2026-03-19"], "2026-03-19")
    ).toMatchObject({
      "2026-03-18": { disabled: false, selected: false },
      "2026-03-19": { disabled: false, selected: true },
    });
  });

  it("rebuilds the local scheduled date from backend date and minute slot", () => {
    const scheduledAt = buildScheduledAtFromSelection("2026-03-19", "15:35");

    expect(scheduledAt.getFullYear()).toBe(2026);
    expect(scheduledAt.getMonth()).toBe(2);
    expect(scheduledAt.getDate()).toBe(19);
    expect(scheduledAt.getHours()).toBe(15);
    expect(scheduledAt.getMinutes()).toBe(35);
  });
});
