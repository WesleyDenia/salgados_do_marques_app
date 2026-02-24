export interface Product {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  image?: string | null;
  image_url?: string | null;
  category_id?: number | null;
  category_name?: string | null;
  category?: {
    id: number | null;
    name: string | null;
    order?: number | null;
  } | null;
  variants?: ProductVariant[];
  active?: boolean;
}

export interface ProductVariant {
  id: number;
  name: string;
  unit_count: number;
  max_flavors: number;
  price: number;
  active: boolean;
  display_order: number;
}
