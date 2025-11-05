import { useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  useWindowDimensions,
} from "react-native";
import { Typography, AppTheme } from "@/constants/theme";
import { getCouponsCarouselTheme, CouponsCarouselTheme } from "@/constants/themeCoupons";
import { useCouponsData } from "@/hooks/useCouponsData";
import CouponCard from "@/components/CouponCard";
import { useThemeMode } from "@/context/ThemeContext";

interface CouponsCarouselProps {
  refreshKey?: number;
}

export default function CouponsCarousel({ refreshKey }: CouponsCarouselProps) {
  const { theme } = useThemeMode();
  const carouselTheme = useMemo(() => getCouponsCarouselTheme(theme), [theme]);
  const styles = useMemo(() => createStyles(theme, carouselTheme), [theme, carouselTheme]);
  const { width } = useWindowDimensions();
  const carouselSpacing = carouselTheme.spacing;
  const cardWidth = useMemo(
    () => Math.min(width * carouselTheme.widthMultiplier, carouselTheme.maxWidth),
    [width, carouselTheme.widthMultiplier, carouselTheme.maxWidth]
  );
  const horizontalPadding = useMemo(
    () => Math.max((width - cardWidth) / 2, 0),
    [width, cardWidth]
  );

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

  useEffect(() => {
    if (!refreshKey) return;
    void refresh();
  }, [refreshKey, refresh]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  if (availableCoupons.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Nenhum cupom disponível no momento.</Text>
      </View>
    );
  }

  return (
    <View style={styles.carouselContainer}>
      <Text style={[Typography.subtitle, styles.sectionTitle]}>
        Cupons especiais para você
      </Text>

      <FlatList
        data={availableCoupons}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        decelerationRate="fast"
        snapToInterval={cardWidth + carouselSpacing}
        snapToAlignment="center"
        contentContainerStyle={{
          paddingHorizontal: horizontalPadding,
          paddingBottom: theme.spacing.md,
        }}
        ItemSeparatorComponent={() => <View style={{ width: carouselSpacing }} />}
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
            <View style={[styles.cardWrapper, { width: cardWidth }]}> 
              <CouponCard
                coupon={item}
                theme={theme}
                tokens={carouselTheme.cardTheme}
                active={active}
                code={userCoupon?.external_code}
                processing={processingId === item.id}
                disabled={!!processingId}
                onActivate={active ? undefined : () => activateCoupon(item.id)}
                style={styles.card}
                imageRatio={carouselTheme.imageRatio}
              />
            </View>
          );
        }}
      />
    </View>
  );
}

const createStyles = (theme: AppTheme, carouselTheme: CouponsCarouselTheme) =>
  StyleSheet.create({
    carouselContainer: {
      marginTop: carouselTheme.sectionMarginTop,
      width: "100%",
    },
    sectionTitle: {
      marginBottom: theme.spacing.md,
      textAlign: "left",
      paddingHorizontal: carouselTheme.titlePaddingHorizontal,
      color: theme.colors.textSecondary,
      fontSize: 18,
    },
    loadingContainer: {
      marginVertical: theme.spacing.huge,
      alignItems: "center",
      justifyContent: "center",
    },
    emptyContainer: {
      marginVertical: theme.spacing.huge,
      alignItems: "center",
    },
    emptyText: {
      fontSize: 14,
      textAlign: "center",
      color: theme.colors.textSecondary,
    },
    cardWrapper: {
      width: "100%",
    },
    card: {
      width: "100%",
    },
  });
