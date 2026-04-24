import { Store } from "@/types/store";

export type OrderStatus =
  | "placed"
  | "accepted"
  | "rejected"
  | "ready"
  | "done"
  | "canceled";

export type OrderItem = {
  id: number;
  product_id: number | null;
  name: string;
  price: number;
  quantity: number;
  total: number;
  options?: {
    flavors?: number[];
  } | null;
};

export type Order = {
  id: number;
  status: OrderStatus;
  scheduled_at: string;
  total: number;
  notes?: string | null;
  cancelled_at?: string | null;
  store?: Store | null;
  items: OrderItem[];
  created_at?: string;
};

export type OrderSettings = {
  start_time: string;
  end_time: string;
  minimum_minutes: number;
  cancel_minutes: number;
  timezone: string;
  scheduling_window_days: number;
};

export type OrderAvailabilityDates = {
  store_id: number;
  timezone: string;
  dates: string[];
};

export type OrderAvailabilityHours = {
  store_id: number;
  date: string;
  timezone: string;
  hours: string[];
};

export type OrderAvailabilityMinutes = {
  store_id: number;
  date: string;
  hour: string;
  timezone: string;
  minute_options: string[];
};
