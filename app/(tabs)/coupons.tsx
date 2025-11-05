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
import { useCouponsData } from "@/hooks/useCouponsData";
import CouponCard from "@/components/CouponCard";
import { useThemeMode } from "@/context/ThemeContext";
import { useRouter } from "expo-router";

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
    isActiveForMe,
  } = useCouponsData();

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
              const active = isActiveForMe(item.id);
              const userCoupon = myCouponsMap[item.id];

              return (
                <CouponCard
                  coupon={item}
                  theme={theme}
                  tokens={screenTheme.cardTheme}
                  active={active}
                  code={userCoupon?.external_code}
                  processing={processingId === item.id}
                  disabled={!!processingId}
                  onActivate={active ? undefined : () => activateCoupon(item.id)}
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
      marginBottom: theme.spacing.md,
      marginTop: theme.spacing.md,
      color: screenTheme.subtitleColor,
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
