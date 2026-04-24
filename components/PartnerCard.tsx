import { Image, StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from "react-native";

import { AppTheme, resolveShadow } from "@/constants/theme";
import { PartnerCardTheme } from "@/constants/themePartners";
import { resolveAssetUrl } from "@/utils/url";
import type { Partner } from "@/types";

type PartnerCardProps = {
  partner: Partner;
  assetBaseUrl?: string | null;
  theme: AppTheme;
  tokens: PartnerCardTheme;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  ctaLabel?: string;
  descriptionLines?: number;
  showDescription?: boolean;
  showCta?: boolean;
};

export default function PartnerCard({
  partner,
  assetBaseUrl,
  theme,
  tokens,
  style,
  onPress,
  ctaLabel = "Validar código",
  descriptionLines = 3,
  showDescription = true,
  showCta = true,
}: PartnerCardProps) {
  const styles = useStyles(theme, tokens);
  const imageUri = resolveAssetUrl(partner.image_url, assetBaseUrl ?? undefined);

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={[styles.card, style]}
      onPress={onPress}
      disabled={!onPress}
    >
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.cardImage} />
      ) : (
        <View style={styles.cardImagePlaceholder}>
          <Text style={styles.cardImagePlaceholderText}>Sem imagem</Text>
        </View>
      )}

      <View style={styles.cardBody}>
        <Text style={styles.cardTitle}>{partner.name}</Text>
        {showDescription ? (
          <Text style={styles.cardDescription} numberOfLines={descriptionLines}>
            {partner.description}
          </Text>
        ) : null}
        {showCta ? <Text style={styles.cardCta}>{ctaLabel}</Text> : null}
      </View>
    </TouchableOpacity>
  );
}

const useStyles = (theme: AppTheme, tokens: PartnerCardTheme) =>
  StyleSheet.create({
    card: {
      borderRadius: tokens.borderRadius,
      overflow: "hidden",
      backgroundColor: tokens.cardBackground,
      ...resolveShadow(theme.shadow.card),
    },
    cardImage: {
      width: "100%",
      height: tokens.imageHeight,
    },
    cardImagePlaceholder: {
      height: tokens.imageHeight,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: tokens.placeholderBackground,
    },
    cardImagePlaceholderText: {
      color: tokens.placeholderText,
    },
    cardBody: {
      padding: tokens.contentPadding,
      gap: theme.spacing.sm,
    },
    cardTitle: {
      color: theme.colors.text,
      fontSize: 20,
      fontWeight: "700",
    },
    cardDescription: {
      color: theme.colors.textSecondary,
      lineHeight: 22,
      fontSize: 14,
    },
    cardCta: {
      color: theme.colors.brandOnSurface,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 0.4,
      fontSize: 12,
    },
  });
