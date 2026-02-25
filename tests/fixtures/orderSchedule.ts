import type { OrderSettings } from "@/types/order";

export function localDate(year: number, monthIndex: number, day: number, hour = 0, minute = 0) {
  return new Date(year, monthIndex, day, hour, minute, 0, 0);
}

export function makeOrderSettings(
  overrides: Partial<OrderSettings> = {}
): OrderSettings {
  return {
    start_time: "09:00",
    end_time: "18:00",
    minimum_minutes: 0,
    cancel_minutes: 0,
    timezone: "America/Sao_Paulo",
    ...overrides,
  };
}
