export interface Coupon {
  id: number;
  external_code?: string;
  title: string;
  body: string;
  code: string;
  image_url: string | null;
  recurrence: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly'; 
  starts_at: string | null;
  ends_at: string | null;
  active: boolean;
  type: 'money' | 'percent';
  amount: number;
}
