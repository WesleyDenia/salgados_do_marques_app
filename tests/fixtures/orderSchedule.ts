import type { OrderSettings, Store } from "@/types";
import type { PickupDayKey, StorePickupScheduleDay } from "@/types/store";

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
    scheduling_window_days: 14,
    ...overrides,
  };
}

export function makeWeeklySchedule(
  overrides: Partial<Record<PickupDayKey, Partial<StorePickupScheduleDay>>> = {}
): Record<PickupDayKey, StorePickupScheduleDay> {
  const base: Record<PickupDayKey, StorePickupScheduleDay> = {
    monday: { is_open: false, start_time: null, end_time: null },
    tuesday: { is_open: true, start_time: "12:00", end_time: "20:00" },
    wednesday: { is_open: true, start_time: "12:00", end_time: "20:00" },
    thursday: { is_open: true, start_time: "12:00", end_time: "20:00" },
    friday: { is_open: true, start_time: "12:00", end_time: "20:00" },
    saturday: { is_open: true, start_time: "12:00", end_time: "20:00" },
    sunday: { is_open: true, start_time: "14:00", end_time: "20:00" },
  };

  return Object.entries(overrides).reduce((schedule, [day, value]) => {
    const key = day as PickupDayKey;
    schedule[key] = {
      ...schedule[key],
      ...value,
    };

    return schedule;
  }, base);
}

export function makeStore(overrides: Partial<Store> = {}): Store {
  return {
    id: 1,
    name: "Loja Centro",
    address: "Rua 1",
    city: "Lisboa",
    latitude: 0,
    longitude: 0,
    phone: null,
    type: "principal",
    accepts_orders: true,
    default_store: true,
    pickup_weekly_schedule: makeWeeklySchedule(),
    pickup_date_exceptions: [],
    ...overrides,
  };
}
