import { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  StatusBar,
  RefreshControl,
} from "react-native";
import { Typography, AppTheme } from "@/constants/theme";
import { getCouponsScreenTheme, CouponsScreenTheme } from "@/constants/themeCoupons";
import { useCoupons } from "@/context/CouponsContext";
import CouponCard from "@/components/CouponCard";
import { useThemeMode } from "@/context/ThemeContext";
import { useRouter } from "expo-router";
import { getCouponStateCopy, hasUsableCouponCode } from "@/utils/coupons";

export default function CouponsScreen() {
  const { theme, mode } = useThemeMode();
  const barStyle = mode === "dark" ? "light-content" : "dark-content";
  const screenTheme = useMemo(() => getCouponsScreenTheme(theme), [theme]);
  const styles = useMemo(() => createStyles(theme, screenTheme), [theme, screenTheme]);
  const router = useRouter();

  const {
    availableCoupons,
    myCouponsMap,
    loading,
    refreshing,
    processingId,
    refresh,
    activateCoupon,
  } = useCoupons();

  const emptyList = useMemo(
    () => <Text style={styles.empty}>Nenhum cupom disponível no momento.</Text>,
    [styles.empty]
  );

  return (
    <View style={styles.safeArea}>
      <StatusBar backgroundColor={theme.colors.primary} barStyle={barStyle} />

      <View style={styles.container}>
        <Text style={[Typography.subtitle, styles.subtitle]}>
          Ative o seu cupom e aproveite os descontos!
        </Text>
        <Text style={styles.helperText}>
          Seus cupons privados e públicos ficam aqui. Ative os públicos e apresente o código na loja quando for usar.
        </Text>

        {loading ? (
          <ActivityIndicator color={theme.colors.primary} size="large" style={styles.loadingIndicator} />
        ) : (
          <FlatList
            data={availableCoupons}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => {
                  void refresh();
                }}
                colors={[theme.colors.primary]}
                tintColor={theme.colors.primary}
              />
            }
            renderItem={({ item }) => {
              const userCoupon = item.user_coupon ?? myCouponsMap[item.id];
              const stateCopy = getCouponStateCopy(userCoupon);
              const active = hasUsableCouponCode(userCoupon);

              return (
                <CouponCard
                  coupon={item}
                  theme={theme}
                  tokens={screenTheme.cardTheme}
                  active={active}
                  code={active ? userCoupon?.external_code ?? item.code : null}
                  statusTitle={!active ? stateCopy?.title ?? null : null}
                  statusHint={!active ? stateCopy?.hint ?? null : null}
                  processing={processingId === item.id}
                  disabled={!!processingId}
                  onActivate={active || item.origin?.type === "partner" ? undefined : () => activateCoupon(item.id)}
                  style={styles.card}
                  onPress={() => router.push(`/details/coupon/${item.id}`)}
                />
              );
            }}
            ListEmptyComponent={emptyList}
          />
        )}
      </View>
    </View>
  );
}

const createStyles = (theme: AppTheme, screenTheme: CouponsScreenTheme) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.general.screenBackground,
    },
    container: {
      flex: 1,
      backgroundColor: theme.general.screenBackground,
    },
    subtitle: {
      textAlign: "center",
      marginBottom: theme.spacing.xs,
      marginTop: theme.spacing.md,
      color: screenTheme.subtitleColor,
    },
    helperText: {
      textAlign: "center",
      marginBottom: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      color: theme.colors.textSecondary,
      fontSize: 13,
      lineHeight: 18,
    },
    listContent: {
      paddingHorizontal: screenTheme.listPaddingHorizontal,
      paddingBottom: screenTheme.listPaddingBottom,
    },
    loadingIndicator: {
      marginTop: screenTheme.loadingIndicatorMarginTop,
    },
    card: {
      marginBottom: screenTheme.cardMarginBottom,
    },
    empty: {
      textAlign: "center",
      marginTop: 0,
      color: theme.colors.textSecondary,
    },
  });
