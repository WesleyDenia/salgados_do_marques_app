export interface User {
  id: number;
  name: string;
  email: string;
  nif?: string | null;
  phone?: string | null;
  birth_date?: string | null;
  role?: string;
  active?: boolean;
  street?: string | null;
  city?: string | null;
  postal_code?: string | null;
  theme?: "light" | "dark";
  created_at?: string;
  loyalty_synced: boolean;
  loyalty_synced_at?: string | null;
}
