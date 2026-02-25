import { describe, expect, it } from "vitest";

import { unwrapApiList, unwrapApiObject } from "@/utils/apiResponse";
import { getApiErrorMessage } from "@/utils/errorMessage";
import { computeAllowedHours } from "@/hooks/useOrderSchedule";

describe("test base for pure logic", () => {
  it("executes a simple smoke test across target pure utilities", () => {
    expect(unwrapApiList<number>({ data: [1, 2] })).toEqual([1, 2]);
    expect(unwrapApiObject<{ ok: boolean }>({ data: { ok: true } })).toEqual({ ok: true });
    expect(getApiErrorMessage(new Error("erro local"))).toBe("erro local");

    const hours = computeAllowedHours(
      {
        enabled: true,
        start_time: "09:00",
        end_time: "11:00",
        minimum_minutes: 0,
      } as any,
      new Date("2026-02-25T10:00:00.000Z"),
      new Date("2026-02-24T10:00:00.000Z")
    );

    expect(hours).toEqual([9, 10, 11]);
  });
});
