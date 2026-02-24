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
};
