import {
  View,
  StyleSheet,
  Alert,
  StatusBar,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Text,
  TouchableOpacity,
} from "react-native";
import { useCallback, useState, useRef, useMemo } from "react";
import { AppTheme } from "@/constants/theme";
import { getHomeTheme, HomeTheme } from "@/constants/themeHome";
import LoyaltyBanner from "@/components/LoyaltyBanner";
import { useLoyalty } from "@/context/LoyaltyContext";
import { useAuth } from "@/context/AuthContext";
import LottieView from "lottie-react-native";
import api from "@/api/api";
import { useThemeMode } from "@/context/ThemeContext";
import { useHomeContent } from "@/hooks/useHomeContent";
import HomeContentList from "@/components/HomeContentList";
import CouponsCarousel from "@/components/CouponsCarousel";
import WelcomeBonusButton from "@/components/WelcomeBonusButton";
import { ContentHomeBlock } from "@/types/contentHome";

export default function HomeScreen() {
  const { theme, mode } = useThemeMode();
  const homeTheme = useMemo(() => getHomeTheme(theme), [theme]);
  const styles = useMemo(() => createStyles(theme, homeTheme), [theme, homeTheme]);
  const barStyle = mode === "dark" ? "light-content" : "dark-content";
  const { data, loading, refetch } = useLoyalty();
  const { user, updateUser } = useAuth();
  const {
    blocks: homeContent,
    loading: homeContentLoading,
    error: homeContentError,
    refresh: refreshHomeContent,
  } = useHomeContent();
  const [refreshing, setRefreshing] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const confettiRef = useRef<LottieView>(null);
  const [couponRefreshKey, setCouponRefreshKey] = useState(0);
  const milestones = data?.milestones ?? [];
  const bannerGoal =
    milestones.length > 0
      ? milestones[milestones.length - 1]
      : data?.nextRewardAt ?? 1000;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetch(), refreshHomeContent()]);
      setCouponRefreshKey((prev) => prev + 1);
    } finally {
      setRefreshing(false);
    }
  }, [refetch, refreshHomeContent]);

  const triggerConfetti = useCallback(() => {
    try {
      setShowConfetti(true);
      confettiRef.current?.play();
    } catch (e) {
      console.error("Erro ao iniciar confete:", e);
    }
  }, []);

  const finalizeBonusActivation = useCallback(async () => {
    try {
      await api.post("/loyalty/welcome-bonus");
      await updateUser({ loyalty_synced: true });
      await refetch();
    } catch (error) {
      Alert.alert("Erro", "Não foi possível ativar o bônus agora.");
      console.error(error);
    } finally {
      setShowConfetti(false);
    }
  }, [refetch, updateUser]);

  const hasWelcomeComponent = useMemo(
    () =>
      homeContent.some(
        (block) => block.type === "component" && block.component_name === "WelcomeBonusButton",
      ),
    [homeContent],
  );

  const renderDynamicComponent = useCallback(
    (block: ContentHomeBlock) => {
      if (!block.component_name) return null;

      const rawProps =
        block.component_props && typeof block.component_props === "object" && !Array.isArray(block.component_props)
          ? (block.component_props as Record<string, unknown>)
          : {};
      const componentProps = rawProps as Record<string, any>;

      switch (block.component_name) {
        case "WelcomeBonusButton":
          return (
            <WelcomeBonusButton
              {...componentProps}
              onBonusActivated={triggerConfetti}
            />
          );

        case "CouponsCarousel":
          return (
            <CouponsCarousel
              {...componentProps}
              refreshKey={couponRefreshKey}
            />
          );

        default:
          return null;
      }
    },
    [couponRefreshKey, triggerConfetti],
  );

  const handleRetryHomeContent = useCallback(() => {
    void refreshHomeContent();
  }, [refreshHomeContent]);

  return (
    <View style={styles.safeArea}>
      <StatusBar backgroundColor={theme.colors.primary} barStyle={barStyle} />

      {/* 🔹 Animação global */}
      {showConfetti && (
        <LottieView
          ref={confettiRef}
          source={require("@/assets/animations/success-green.json")}
          autoPlay
          loop={false}
          onAnimationFinish={finalizeBonusActivation} 
          style={styles.fullscreenConfetti}
        />
      )}

      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        <LoyaltyBanner
          points={data?.points ?? 0}
          goal={bannerGoal}
          loading={loading}
          milestones={milestones}
        />

        {!hasWelcomeComponent ? (
          <View style={styles.componentWrapper}>
            <WelcomeBonusButton onBonusActivated={triggerConfetti} />
          </View>
        ) : null}

        {homeContentError ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{homeContentError}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleRetryHomeContent}>
              <Text style={styles.retryButtonText}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        ) : homeContentLoading ? (
          <ActivityIndicator
            color={theme.colors.primary}
            style={styles.contentLoader}
          />
        ) : (
          <HomeContentList
            blocks={homeContent}
            renderComponent={renderDynamicComponent}
          />
        )}

        {/* Componente CouponsCarousel agora é controlado exclusivamente pelos blocos do CMS */}
      </ScrollView>
    </View>
  );
}

const createStyles = (theme: AppTheme, homeTheme: HomeTheme) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.general.screenBackground,
    },
    container: {
      paddingBottom: homeTheme.layout.paddingBottom,
      backgroundColor: theme.general.screenBackground,
    },
    contentLoader: {
      marginTop: homeTheme.layout.paddingBottom / 2,
      marginBottom: homeTheme.banner.marginBottom,
    },
    errorContainer: {
      marginHorizontal: theme.spacing.lg,
      padding: theme.spacing.lg,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: theme.general.borderColor,
      backgroundColor: theme.general.surface,
      alignItems: "center",
    },
    errorText: {
      color: theme.colors.textSecondary,
      textAlign: "center",
    },
    retryButton: {
      marginTop: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.primary,
    },
    retryButtonText: {
      color: theme.colors.textLight,
      fontWeight: "600",
    },
    fullscreenConfetti: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 9999,
      elevation: 9999,
      pointerEvents: "none",
    },
    componentWrapper: {
      width: "100%",
      marginTop: theme.spacing.lg,
    },
  });
