import { Coupon } from "./coupon";

export interface LoyaltyStatus {
  points: number;
  nextRewardAt: number | null;
  milestones: number[];
  rewards: LoyaltyReward[];
}

export interface LoyaltyReward {
  id: number;
  name: string;
  description: string | null;
  threshold: number;
  image: string | null;
  active: boolean;
  value: number | null;
  user_coupon?: LoyaltyRewardCoupon | null;
}

export interface LoyaltyRewardCoupon {
  id: number;
  external_code: string | null;
  status: string | null;
  type: string | null;
  coupon?: Coupon | null;
}
