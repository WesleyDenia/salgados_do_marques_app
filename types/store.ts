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
  distance_km?: number;
};
