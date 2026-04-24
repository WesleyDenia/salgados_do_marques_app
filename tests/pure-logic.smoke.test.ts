import { describe, expect, it } from "vitest";

import { unwrapApiList, unwrapApiObject } from "@/utils/apiResponse";
import { getApiErrorMessage } from "@/utils/errorMessage";
import {
  buildCalendarMarkedDates,
  buildScheduledAtFromSelection,
  normalizeAvailabilitySelection,
} from "@/utils/orderAvailability";

describe("test base for pure logic", () => {
  it("executes a simple smoke test across target pure utilities", () => {
    expect(unwrapApiList<number>({ data: [1, 2] })).toEqual([1, 2]);
    expect(unwrapApiObject<{ ok: boolean }>({ data: { ok: true } })).toEqual({ ok: true });
    expect(getApiErrorMessage(new Error("erro local"))).toBe("erro local");
    expect(normalizeAvailabilitySelection("2026-03-20", ["2026-03-20"])).toBe("2026-03-20");
    expect(buildCalendarMarkedDates(["2026-03-20"], "2026-03-20")["2026-03-20"]?.selected).toBe(true);
    expect(buildScheduledAtFromSelection("2026-03-20", "16:10").getHours()).toBe(16);
  });
});
