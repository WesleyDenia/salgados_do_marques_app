import { describe, expect, it } from "vitest";

import { unwrapApiList, unwrapApiObject } from "@/utils/apiResponse";

describe("utils/apiResponse", () => {
  describe("unwrapApiList", () => {
    it("returns payload when payload is already an array", () => {
      expect(unwrapApiList<number>([1, 2, 3])).toEqual([1, 2, 3]);
    });

    it("returns payload.data when payload follows { data: [] } shape", () => {
      expect(unwrapApiList<string>({ data: ["a", "b"] })).toEqual(["a", "b"]);
    });

    it("returns empty array for invalid payloads", () => {
      expect(unwrapApiList(null)).toEqual([]);
      expect(unwrapApiList(undefined)).toEqual([]);
      expect(unwrapApiList({})).toEqual([]);
      expect(unwrapApiList({ data: {} })).toEqual([]);
      expect(unwrapApiList("texto")).toEqual([]);
    });
  });

  describe("unwrapApiObject", () => {
    it("returns payload.data when payload follows { data: {} } shape", () => {
      expect(unwrapApiObject<{ id: number }>({ data: { id: 10 } })).toEqual({ id: 10 });
    });

    it("returns plain object payload when no data wrapper exists", () => {
      expect(unwrapApiObject<{ ok: boolean }>({ ok: true })).toEqual({ ok: true });
    });

    it("returns null for non-object payloads", () => {
      expect(unwrapApiObject(null)).toBeNull();
      expect(unwrapApiObject(undefined)).toBeNull();
      expect(unwrapApiObject(123)).toBeNull();
      expect(unwrapApiObject("abc")).toBeNull();
    });

    it("returns arrays as-is because arrays are objects in current implementation", () => {
      expect(unwrapApiObject<string[]>([])).toEqual([]);
    });
  });
});
