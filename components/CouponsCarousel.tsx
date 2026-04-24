import { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  useWindowDimensions,
} from "react-native";
import { AppTheme } from "@/constants/theme";
import { getCouponsCarouselTheme, CouponsCarouselTheme } from "@/constants/themeCoupons";
import { useCoupons } from "@/context/CouponsContext";
import CouponCard from "@/components/CouponCard";
import { useThemeMode } from "@/context/ThemeContext";

interface CouponsCarouselProps {
  refreshKey?: number;
}

export default function CouponsCarousel({ refreshKey }: CouponsCarouselProps) {
  const { theme } = useThemeMode();
  const carouselTheme = useMemo(() => getCouponsCarouselTheme(theme), [theme]);
  const { width } = useWindowDimensions();
  const homeContentInset = theme.spacing.sm + theme.spacing.lg;
  const previewWidth = useMemo(() => Math.max(width * 0.1, theme.spacing.xl), [theme.spacing.xl, width]);
  const carouselSpacing = carouselTheme.spacing;
  const scrollX = useRef(new Animated.Value(0)).current;
  const cardWidth = useMemo(
    () =>
      Math.min(
        width - homeContentInset - previewWidth - carouselSpacing,
        Math.min(width * carouselTheme.widthMultiplier, carouselTheme.maxWidth)
      ),
    [
      width,
      homeContentInset,
      previewWidth,
      carouselSpacing,
      carouselTheme.widthMultiplier,
      carouselTheme.maxWidth,
    ]
  );
  const styles = useMemo(
    () => createStyles(theme, carouselTheme, homeContentInset, width),
    [theme, carouselTheme, homeContentInset, width]
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
  } = useCoupons();
  const itemWidth = cardWidth + carouselSpacing;
  const snapOffsets = useMemo(
    () => availableCoupons.map((_, index) => index * itemWidth),
    [availableCoupons, itemWidth]
  );

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
      <Animated.FlatList
        data={availableCoupons}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToOffsets={snapOffsets}
        snapToAlignment="start"
        disableIntervalMomentum
        bounces={false}
        contentContainerStyle={{
          paddingLeft: homeContentInset,
          paddingRight: homeContentInset + previewWidth,
          paddingBottom: theme.spacing.md,
        }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        ItemSeparatorComponent={() => <View style={{ width: carouselSpacing }} />}
        getItemLayout={(_, index) => ({
          length: itemWidth,
          offset: itemWidth * index,
          index,
        })}
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
        renderItem={({ item, index }) => {
          const active = isActiveForMe(item.id);
          const userCoupon = myCouponsMap[item.id];
          const inputRange = [
            (index - 1) * itemWidth,
            index * itemWidth,
            (index + 1) * itemWidth,
          ];
          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.94, 1, 0.94],
            extrapolate: "clamp",
          });
          const translateY = scrollX.interpolate({
            inputRange,
            outputRange: [8, 0, 8],
            extrapolate: "clamp",
          });
          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.9, 1, 0.9],
            extrapolate: "clamp",
          });

          return (
            <Animated.View
              style={[
                styles.cardWrapper,
                {
                  width: cardWidth,
                  opacity,
                  transform: [{ scale }, { translateY }],
                },
              ]}
            >
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
            </Animated.View>
          );
        }}
      />
    </View>
  );
}

const createStyles = (
  theme: AppTheme,
  carouselTheme: CouponsCarouselTheme,
  homeContentInset: number,
  viewportWidth: number
) =>
  StyleSheet.create({
    carouselContainer: {
      marginTop: carouselTheme.sectionMarginTop,
      width: viewportWidth,
      marginHorizontal: -homeContentInset,
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
      paddingVertical: theme.spacing.xs,
    },
    card: {
      width: "100%",
    },
  });
