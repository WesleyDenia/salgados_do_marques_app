import { Platform } from "react-native";
import { AppTheme } from "./theme";

export type CouponCardTheme = {
  borderRadius: number;
  borderWidth: number;
  contentPadding: number;
  placeholderBackground: string;
  placeholderText: string;
  codeBorderColor: string;
  codeBorderWidth: number;
  codeBorderRadius: number;
  codePaddingVertical: number;
  buttonRadius: number;
  cardBackground: string;
  imageMaxHeight: number;
};

export type CouponsScreenTheme = {
  subtitleColor: string;
  listPaddingHorizontal: number;
  listPaddingBottom: number;
  loadingIndicatorMarginTop: number;
  cardMarginBottom: number;
  cardTheme: CouponCardTheme;
};

export type CouponsCarouselTheme = {
  sectionMarginTop: number;
  spacing: number;
  titlePaddingHorizontal: number;
  widthMultiplier: number;
  maxWidth: number;
  imageRatio: number;
  cardTheme: CouponCardTheme;
};

export const getCouponCardTheme = (theme: AppTheme): CouponCardTheme => ({
  borderRadius: theme.radius.md,
  borderWidth: Platform.OS === "ios" ? 0 : 0.3,
  contentPadding: theme.spacing.md,
  placeholderBackground: theme.general.placeholderBackground,
  placeholderText: theme.general.placeholderText,
  codeBorderColor: theme.general.successBorder,
  codeBorderWidth: 1,
  codeBorderRadius: theme.radius.md,
  codePaddingVertical: theme.spacing.sm,
  buttonRadius: theme.radius.md,
  cardBackground: theme.colors.cardBackground,
  imageMaxHeight: 160,
});

export const getCouponsScreenTheme = (theme: AppTheme): CouponsScreenTheme => ({
  subtitleColor: theme.colors.textSecondary,
  listPaddingHorizontal: theme.spacing.lg + theme.spacing.xs,
  listPaddingBottom: theme.spacing.ultra,
  loadingIndicatorMarginTop: theme.spacing.huge,
  cardMarginBottom: theme.spacing.lg,
  cardTheme: getCouponCardTheme(theme),
});

export const getCouponsCarouselTheme = (theme: AppTheme): CouponsCarouselTheme => ({
  sectionMarginTop: theme.spacing.lg,
  spacing: theme.spacing.md,
  titlePaddingHorizontal: theme.spacing.lg,
  widthMultiplier: 0.88,
  maxWidth: 360,
  imageRatio: 0.4,
  cardTheme: getCouponCardTheme(theme),
});
