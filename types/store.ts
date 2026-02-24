export type StoreType = "principal" | "revenda";

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
  distance_km?: number;
};
