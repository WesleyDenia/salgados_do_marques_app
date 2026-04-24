import { AppTheme } from "./theme";

export type PartnerCardTheme = {
  borderRadius: number;
  contentPadding: number;
  imageHeight: number;
  cardBackground: string;
  placeholderBackground: string;
  placeholderText: string;
};

export type PartnersCarouselTheme = {
  sectionMarginTop: number;
  spacing: number;
  titlePaddingHorizontal: number;
  widthMultiplier: number;
  maxWidth: number;
  cardTheme: PartnerCardTheme;
};

export const getPartnerCardTheme = (theme: AppTheme): PartnerCardTheme => ({
  borderRadius: theme.radius.lg,
  contentPadding: theme.spacing.md,
  imageHeight: 180,
  cardBackground: theme.colors.cardBackground,
  placeholderBackground: theme.general.placeholderBackground,
  placeholderText: theme.general.placeholderText,
});

export const getPartnersCarouselTheme = (theme: AppTheme): PartnersCarouselTheme => ({
  sectionMarginTop: theme.spacing.lg,
  spacing: theme.spacing.md,
  titlePaddingHorizontal: theme.spacing.lg,
  widthMultiplier: 0.84,
  maxWidth: 332,
  cardTheme: getPartnerCardTheme(theme),
});
