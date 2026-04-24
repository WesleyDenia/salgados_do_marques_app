export type StoreType = "principal" | "revenda";

export type PickupDayKey =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export type StorePickupScheduleDay = {
  is_open: boolean;
  start_time: string | null;
  end_time: string | null;
};

export type StorePickupWeeklySchedule = Record<PickupDayKey, StorePickupScheduleDay>;

export type StorePickupDateException = {
  date: string;
  is_open: boolean;
  start_time: string | null;
  end_time: string | null;
};

export type Store = {
  id: number;
  name: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  phone: string | null;
  type: StoreType;
  accepts_orders?: boolean;
  default_store?: boolean;
  pickup_weekly_schedule?: Partial<StorePickupWeeklySchedule>;
  pickup_date_exceptions?: StorePickupDateException[];
  distance_km?: number;
};
