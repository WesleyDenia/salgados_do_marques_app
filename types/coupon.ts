import type { PartnerCampaignSummary, PartnerSummary } from "./partner";

export type UserCouponStatus =
  | "pending"
  | "done"
  | "pending_erp"
  | "syncing_erp"
  | "synced"
  | "failed_erp"
  | "manual_review"
  | "cancelled";

export interface CouponOrigin {
  type: "regular" | "loyalty" | "partner";
  label: string;
  partner: PartnerSummary | null;
  partner_campaign: PartnerCampaignSummary | null;
}

export interface UserCoupon {
  id: number;
  active: boolean;
  external_code?: string | null;
  external_id?: string | null;
  coupon?: Coupon;
  status: UserCouponStatus;
  erp_status?: string | null;
  erp_error?: string | null;
  type: "regular" | "loyalty" | "partner";
  partner_campaign_id?: number | null;
  loyalty_reward_id?: number | null;
  created_at?: string | null;
  origin?: CouponOrigin;
}

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
  is_loyalty_reward?: boolean;
  created_at?: string | null;
  origin?: CouponOrigin;
  user_coupon?: UserCoupon | null;
}
