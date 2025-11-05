import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  ViewStyle,
  StyleProp,
} from "react-native";
import { Coupon } from "@/types";
import { AppTheme, resolveShadow } from "@/constants/theme";
import { CouponCardTheme } from "@/constants/themeCoupons";
import { useAuth } from "@/context/AuthContext";
import { resolveAssetUrl } from "@/utils/url";

type CouponCardProps = {
  coupon: Coupon;
  theme: AppTheme;
  tokens: CouponCardTheme;
  active: boolean;
  code?: string | null;
  processing?: boolean;
  disabled?: boolean;
  onActivate?: () => void;
  style?: StyleProp<ViewStyle>;
  imageRatio?: number;
  onPress?: () => void;
};

export default function CouponCard({
  coupon,
  theme,
  tokens,
  active,
  code,
  processing = false,
  disabled = false,
  onActivate,
  style,
  imageRatio = 0.4,
  onPress,
}: CouponCardProps) {
  const imageFlex = Math.max(0.1, Math.min(imageRatio, 0.9));
  const infoFlex = 1 - imageFlex;
  const styles = useStyles(theme, tokens, imageFlex, infoFlex);
  const { config } = useAuth();
  const assetUri = resolveAssetUrl(coupon.image_url, config?.assets_base_url);
  const imageSource = assetUri ? { uri: assetUri } : undefined;
  const amountValue = typeof coupon.amount === "number" ? coupon.amount : Number(coupon.amount ?? 0);
  const discountLabel =
    coupon.type === "percent"
      ? `${amountValue}% de desconto`
      : `${amountValue.toFixed(2)}€ de desconto`;

  const showActivateButton = !active && typeof onActivate === "function";

  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.82 : 1}
      onPress={onPress}
      style={[styles.shadowWrapper, style]}
      disabled={!onPress}
    >
      <View style={styles.container}>
        <View style={styles.imageWrapper}>
          {imageSource ? (
            <Image source={imageSource} style={styles.image} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.placeholderText}>Sem imagem</Text>
            </View>
          )}
        </View>

        <View style={styles.infoWrapper}>
          <View>
            <Text style={styles.expiration}>
              {coupon.ends_at
                ? `Válido até ${new Date(coupon.ends_at).toLocaleDateString()}`
                : "Sem data de expiração"}
            </Text>
          <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
            {coupon.title}
          </Text>
          <Text style={styles.discount}>{discountLabel}</Text>
          </View>

          {active ? (
            <View style={styles.codeContainer}>
              <Text style={styles.codeLabel}>Código do desconto</Text>
              <Text style={styles.codeValue}>{code ?? "—"}</Text>
            </View>
          ) : showActivateButton ? (
            <TouchableOpacity
              style={[styles.button, (disabled || processing) && styles.buttonDisabled]}
              onPress={onActivate}
              disabled={disabled || processing}
            >
              {processing ? (
                <ActivityIndicator color={theme.colors.textLight} />
              ) : (
                <Text style={styles.buttonText}>Ativar cupom</Text>
              )}
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const useStyles = (
  theme: AppTheme,
  tokens: CouponCardTheme,
  imageFlex: number,
  infoFlex: number
) =>
  StyleSheet.create({
    shadowWrapper: {
      width: "100%",
      borderRadius: tokens.borderRadius,
      backgroundColor: "transparent",
      ...resolveShadow(theme.shadow.card),
    },
    container: {
      width: "100%",
      flexDirection: "row",
      borderRadius: tokens.borderRadius,
      borderWidth: tokens.borderWidth,
      borderColor: theme.general.borderColor,
      backgroundColor: tokens.cardBackground,
      overflow: "hidden",
    },
    imageWrapper: {
      flex: imageFlex,
      maxHeight: tokens.imageMaxHeight,
      alignSelf: "stretch",
    },
    image: {
      width: "100%",
      height: "100%",
    },
    imagePlaceholder: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: tokens.placeholderBackground,
    },
    placeholderText: {
      fontSize: 12,
      color: tokens.placeholderText,
    },
    infoWrapper: {
      flex: infoFlex,
      padding: tokens.contentPadding,
      justifyContent: "space-between",
      backgroundColor: tokens.cardBackground,
    },
    expiration: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.xs,
    },
    title: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    discount: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.xs,
    },
    body: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    button: {
      paddingVertical: tokens.codePaddingVertical,
      borderRadius: theme.radius.sm,
      alignItems: "center",
      backgroundColor: theme.colors.primary,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    buttonText: {
      fontWeight: "bold",
      textTransform: "uppercase",
      fontSize: 14,
      color: theme.colors.textLight,
    },
    codeContainer: {
      paddingVertical: tokens.codePaddingVertical,
      borderRadius: tokens.codeBorderRadius,
      alignItems: "center",
      borderWidth: tokens.codeBorderWidth,
      borderColor: tokens.codeBorderColor,
      backgroundColor: tokens.cardBackground,
    },
    codeLabel: {
      fontSize: 13,
      marginBottom: 4,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      color: theme.colors.textSecondary,
    },
    codeValue: {
      fontSize: 18,
      fontWeight: "bold",
      letterSpacing: 1,
      color: theme.colors.text,
    },
  });
