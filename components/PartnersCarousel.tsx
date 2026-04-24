import { useEffect, useMemo, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  RefreshControl,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";

import PartnerCard from "@/components/PartnerCard";
import { AppTheme } from "@/constants/theme";
import { getPartnersCarouselTheme, PartnersCarouselTheme } from "@/constants/themePartners";
import { useAuth } from "@/context/AuthContext";
import { useThemeMode } from "@/context/ThemeContext";
import { usePartnersData } from "@/hooks/usePartnersData";

type PartnersCarouselProps = {
  refreshKey?: number;
};

export default function PartnersCarousel({
  refreshKey,
}: PartnersCarouselProps) {
  const router = useRouter();
  const { theme } = useThemeMode();
  const { config } = useAuth();
  const carouselTheme = useMemo(() => getPartnersCarouselTheme(theme), [theme]);
  const homeContentInset = theme.spacing.sm + theme.spacing.lg;
  const { width } = useWindowDimensions();
  const previewWidth = useMemo(() => Math.max(width * 0.1, theme.spacing.xl), [theme.spacing.xl, width]);
  const scrollX = useRef(new Animated.Value(0)).current;
  const styles = useMemo(
    () => createStyles(theme, carouselTheme, homeContentInset, width),
    [theme, carouselTheme, homeContentInset, width]
  );
  const { partners, loading, refreshing, error, refresh } = usePartnersData();
  const cardWidth = useMemo(
    () =>
      Math.min(
        width - homeContentInset - previewWidth - carouselTheme.spacing,
        Math.min(width * carouselTheme.widthMultiplier, carouselTheme.maxWidth)
      ),
    [
      carouselTheme.maxWidth,
      carouselTheme.spacing,
      carouselTheme.widthMultiplier,
      homeContentInset,
      previewWidth,
      width,
    ]
  );
  const itemWidth = cardWidth + carouselTheme.spacing;
  const snapOffsets = useMemo(
    () => partners.map((_, index) => index * itemWidth),
    [itemWidth, partners]
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

  if (!partners.length) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{error ?? "Nenhum parceiro disponível no momento."}</Text>
      </View>
    );
  }

  return (
    <View style={styles.carouselContainer}>
      <Animated.FlatList
        data={partners}
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
        ItemSeparatorComponent={() => <View style={{ width: carouselTheme.spacing }} />}
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
              <PartnerCard
                partner={item}
                assetBaseUrl={config?.assets_base_url}
                theme={theme}
                tokens={carouselTheme.cardTheme}
                style={styles.card}
                onPress={() => router.push(`/details/partner/${item.id}`)}
                showDescription={false}
                showCta={false}
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
  carouselTheme: PartnersCarouselTheme,
  homeContentInset: number,
  viewportWidth: number
) =>
  StyleSheet.create({
    carouselContainer: {
      marginTop: theme.spacing.sm,
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
