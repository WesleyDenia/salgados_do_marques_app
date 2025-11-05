import { AppTheme } from "./theme";

export type LoyaltyBannerTheme = {
  paddingVertical: number;
  paddingHorizontal: number;
  coinIcon: number;
  progressHeight: number;
  progressColor: string;
  progressTrack: string;
  milestoneColor: string;
  backgroundColor: string;
  rewardButtonBackground: string;
  rewardButtonText: string;
};

export type LoyaltyGridTheme = {
  listPaddingHorizontal: number;
  rowGap: number;
  columnGap: number;
  cardPadding: number;
  cardRadius: number;
  borderColor: string;
  imageRadius: number;
  lockOverlayColor: string;
  disabledButtonBackground: string;
  lockOverlaySize: number;
};

export const getLoyaltyBannerTheme = (theme: AppTheme): LoyaltyBannerTheme => ({
  paddingVertical: theme.spacing.md,
  paddingHorizontal: theme.spacing.lg,
  coinIcon: 45,
  progressHeight: 6,
  progressColor: "#ffd700",
  progressTrack: "rgba(255,255,255,0.3)",
  milestoneColor: theme.colors.textLight,
  backgroundColor: "#4e0101ff",
  rewardButtonBackground: "#ffffff",
  rewardButtonText: "#8B4513",
});

export const getLoyaltyGridTheme = (theme: AppTheme): LoyaltyGridTheme => ({
  listPaddingHorizontal: theme.spacing.lg,
  rowGap: theme.spacing.md,
  columnGap: theme.spacing.sm,
  cardPadding: theme.spacing.md,
  cardRadius: theme.radius.lg,
  borderColor: theme.colors.border,
  imageRadius: theme.radius.md,
  lockOverlayColor: theme.colors.background === "#1f2937"
    ? "rgba(0,0,0,0.6)"
    : "rgba(213, 213, 213, 0.85)",
  disabledButtonBackground: theme.colors.disabledBackground,
  lockOverlaySize: 36,
});
