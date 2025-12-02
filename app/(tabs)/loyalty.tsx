import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
} from "react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AppTheme, Typography, resolveShadow } from "@/constants/theme";
import { getLoyaltyGridTheme, LoyaltyGridTheme } from "@/constants/themeLoyalty";
import { useLoyalty } from "@/context/LoyaltyContext";
import api from "@/api/api";
import { LoyaltyReward } from "@/types";
import { Lock } from "lucide-react-native";
import LoyaltyBanner from "@/components/LoyaltyBanner";
import { useThemeMode } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { resolveAssetUrl } from "@/utils/url";
import QuantitySelector from "@/components/QuantitySelector";
import { getApiErrorMessage } from "@/utils/errorMessage";

export default function LoyaltyScreen() {
  const { theme, mode } = useThemeMode();
  const gridTheme = useMemo(() => getLoyaltyGridTheme(theme), [theme]);
  const styles = useMemo(() => createStyles(theme, gridTheme), [theme, gridTheme]);
  const barStyle = mode === "dark" ? "light-content" : "dark-content";
  const { data, loading: loyaltyLoading, refetch: refetchSummary } = useLoyalty();
  const { config } = useAuth();
  const [rewards, setRewards] = useState<LoyaltyReward[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [redeemingId, setRedeemingId] = useState<number | null>(null);
  const [selectedReward, setSelectedReward] = useState<LoyaltyReward | null>(null);
  const [quantity, setQuantity] = useState(1);
  const milestones = data?.milestones ?? [];
  const bannerGoal =
    milestones.length > 0
      ? milestones[milestones.length - 1]
      : data?.nextRewardAt ?? 1000;

  const fetchRewards = useCallback(async () => {
    try {
      const response = await api.get<{ data: LoyaltyReward[] }>("/loyalty/rewards");
      setRewards(response.data.data);
      setError(null);
    } catch (err) {
      console.error("Erro ao buscar recompensas", err);
      setError("Não foi possível carregar as recompensas no momento.");
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchRewards();
      setLoading(false);
    })();
  }, [fetchRewards]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchRewards();
    setRefreshing(false);
  }, [fetchRewards]);

  const handleRedeem = useCallback(
    async (rewardId: number, redemptionQuantity: number) => {
      const safeQuantity = Math.max(1, Math.floor(redemptionQuantity));
      try {
        setRedeemingId(rewardId);
        await api.post(`/loyalty/rewards/${rewardId}/redeem`, { quantity: safeQuantity });
        await fetchRewards();
        await refetchSummary();
        setError(null);
    } catch (err: any) {
      console.error("Erro ao resgatar recompensa", err);
      const message = getApiErrorMessage(
        err,
        "Não foi possível resgatar a recompensa."
      );
      setError(message);
      Alert.alert("Erro", message);
    } finally {
      setRedeemingId(null);
    }
  },
    [fetchRewards, refetchSummary]
  );

  const renderReward = useCallback(
    ({ item }: { item: LoyaltyReward }) => {
      const points = data?.points ?? 0;
      const redeemedCoupon = item.user_coupon;
      const couponStatus = redeemedCoupon?.status?.toLowerCase() ?? null;
      const isConsumed = couponStatus === "done";
      const displayedCode = !isConsumed
        ? redeemedCoupon?.external_code ?? redeemedCoupon?.coupon?.code ?? null
        : null;
      const isRedeemed = Boolean(displayedCode);
      const threshold = item.threshold > 0 ? item.threshold : null;
      const availableUnits = threshold ? Math.floor(points / threshold) : 0;
      const canClaim = availableUnits >= 1 && !isRedeemed;
      const assetUri = resolveAssetUrl(item.image, config?.assets_base_url);
      const shouldBlur = !isRedeemed && !canClaim;
      const showLock = !isRedeemed && !canClaim;
      const isProcessing = redeemingId === item.id;
      const buttonLabel = canClaim ? "Resgatar Premio" : "Bloqueado";

      return (
        <View style={styles.cardWrapper}>
          <View style={styles.card}>
            {assetUri ? (
              <Image
                source={{ uri: assetUri }}
                style={styles.image}
                blurRadius={shouldBlur ? 18 : 0}
              />
            ) : (
              <View style={[styles.imageFallback, showLock && styles.imageFallbackLocked]}>
                <Text style={styles.fallbackText}>Sem imagem</Text>
              </View>
            )}

            {showLock && (
              <View style={styles.lockOverlay}>
                <Lock color={theme.colors.textSecondary} size={28} />
              </View>
            )}

            <Text style={styles.name} numberOfLines={2}>
              {item.name}
            </Text>
            <Text style={styles.desc} numberOfLines={2}>
              {threshold ? `${threshold} Coinxinhas` : "Configuração inválida"}
            </Text>

            {isRedeemed && displayedCode ? (
              <View style={styles.redeemedContainer}>
                <Text style={styles.redeemedLabel}>Cupom resgatado</Text>
                <Text style={styles.redeemedCode}>{displayedCode}</Text>
              </View>
            ) : (
              <TouchableOpacity
                disabled={!canClaim || isProcessing}
                style={[
                  styles.button,
                  (!canClaim || isProcessing) && styles.buttonDisabled,
                ]}
                onPress={() => {
                  if (canClaim && !isProcessing) {
                    if (availableUnits <= 1) {
                      void handleRedeem(item.id, 1);
                    } else {
                      setSelectedReward(item);
                      setQuantity(1);
                    }
                  }
                }}
              >
                {isProcessing ? (
                  <ActivityIndicator color={theme.colors.textLight} />
                ) : (
                  <Text style={styles.buttonText}>{buttonLabel}</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      );
    },
    [
      config?.assets_base_url,
      data?.points,
      handleRedeem,
      redeemingId,
      styles,
      theme.colors.textSecondary,
    ]
  );

  return (
    <View style={styles.safeArea}>
      <StatusBar backgroundColor={theme.colors.primary} barStyle={barStyle} />

      <LoyaltyBanner
        points={data?.points ?? 0}
        goal={bannerGoal}
        loading={loyaltyLoading}
        showRewardsButton={false}
        milestones={milestones}
      />

      <FlatList
        data={rewards}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderReward}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>            
            <Text style={[Typography.subtitle, styles.subtitle]}>
              Troque suas Coinxinhas por recompensas!
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            {loading ? (
              <ActivityIndicator color={theme.colors.primary} size="large" />
            ) : (
              <Text style={styles.emptyText}>{error ?? "Nenhuma recompensa disponível por enquanto."}</Text>
            )}
          </View>
        }
        contentContainerStyle={styles.listContent}
      />

      <Modal
        visible={Boolean(selectedReward)}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedReward(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedReward?.name}</Text>
            <Text style={styles.modalSubtitle}>
              {selectedReward
                ? `Cada unidade custa ${selectedReward.threshold} Coinxinhas`
                : ""}
            </Text>
            <QuantitySelector
              min={1}
              max={
                selectedReward
                  ? Math.max(
                      1,
                      selectedReward.threshold > 0
                        ? Math.floor((data?.points ?? 0) / selectedReward.threshold)
                        : 1,
                    )
                  : 1
              }
              value={quantity}
              onChange={setQuantity}
              theme={theme}
              disabled={!selectedReward}
              style={styles.quantitySelector}
            />
            {selectedReward?.value ? (
              <Text style={styles.modalValue}>
                Valor estimado: €{(selectedReward.value * quantity).toFixed(2)}
              </Text>
            ) : null}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalSecondary]}
                onPress={() => setSelectedReward(null)}
              >
                <Text style={styles.modalButtonTextSecondary}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalPrimary]}
                disabled={!selectedReward}
                onPress={() => {
                  if (selectedReward) {
                    const maxUnits = Math.max(
                      1,
                      selectedReward.threshold > 0
                        ? Math.floor((data?.points ?? 0) / selectedReward.threshold)
                        : 1,
                    );
                    const safeQuantity = Math.max(1, Math.min(quantity, maxUnits));
                    void handleRedeem(selectedReward.id, safeQuantity);
                    setSelectedReward(null);
                  }
                }}
              >
                <Text style={styles.modalButtonTextPrimary}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const createStyles = (theme: AppTheme, gridTheme: LoyaltyGridTheme) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.general.screenBackground,
    },
    listContent: {
      paddingBottom: theme.spacing.huge,
      paddingTop: theme.spacing.md,
      paddingHorizontal: gridTheme.listPaddingHorizontal,
      backgroundColor: theme.general.screenBackground,
    },
    header: {
      paddingBottom: theme.spacing.md,
    },
    subtitle: {
      textAlign: "center",
      marginVertical: theme.spacing.lg,
      paddingHorizontal: theme.spacing.md,
      color: theme.colors.textSecondary,
    },
    cardWrapper: {
      width: "100%",
      marginBottom: theme.spacing.xl,
    },
    card: {
      width: "100%",
      borderRadius: gridTheme.cardRadius,
      paddingBottom: gridTheme.cardPadding,
      backgroundColor: theme.colors.cardBackground,
      borderWidth: 1,
      borderColor: gridTheme.borderColor,
      alignItems: "center",
      overflow: "hidden",
      ...resolveShadow(theme.shadow.subtle),
    },
    image: {
      width: "100%",
      aspectRatio: 16 / 9,
      borderRadius: gridTheme.imageRadius,
      marginBottom: theme.spacing.md,
    },
    lockOverlay: {
      position: "absolute",
      top: theme.spacing.md,
      right: theme.spacing.md,
      width: gridTheme.lockOverlaySize,
      height: gridTheme.lockOverlaySize,
      borderRadius: gridTheme.lockOverlaySize / 2,
      backgroundColor: gridTheme.lockOverlayColor,
      alignItems: "center",
      justifyContent: "center",
    },
    name: {
      fontSize: 15,
      fontWeight: "600",
      textAlign: "center",
      color: theme.colors.text,
    },
    desc: {
      fontSize: 13,
      marginBottom: theme.spacing.md,
      color: theme.colors.textSecondary,
    },
    redeemedContainer: {
      width: "100%",
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: gridTheme.borderColor,
      backgroundColor: theme.colors.cardBackground,
      alignItems: "center",
      justifyContent: "center",
    },
    redeemedLabel: {
      fontSize: 12,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.xs,
    },
    redeemedCode: {
      fontSize: 18,
      fontWeight: "700",
      letterSpacing: 1,
      color: theme.colors.text,
    },
    button: {
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: theme.radius.sm,
      alignItems: "center",
      justifyContent: "center",
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
    emptyContainer: {
      paddingVertical: theme.spacing.huge,
      alignItems: "center",
    },
    emptyText: {
      textAlign: "center",
      color: theme.colors.textSecondary,
    },
    imageFallback: {
      width: "100%",
      aspectRatio: 16 / 9,
      borderRadius: gridTheme.imageRadius,
      marginBottom: theme.spacing.md,
      backgroundColor: theme.general.placeholderBackground,
      alignItems: "center",
      justifyContent: "center",
    },
    imageFallbackLocked: {
      opacity: 0.9,
    },
    fallbackText: {
      fontSize: 12,
      color: theme.general.placeholderText,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      alignItems: "center",
      justifyContent: "center",
      padding: theme.spacing.lg,
    },
    modalContent: {
      width: "100%",
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.cardBackground,
      padding: theme.spacing.lg,
      gap: theme.spacing.md,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.colors.text,
      textAlign: "center",
    },
    modalSubtitle: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: "center",
    },
    quantitySelector: {
      alignSelf: "center",
    },
    modalValue: {
      textAlign: "center",
      fontWeight: "600",
      color: theme.colors.text,
    },
    modalActions: {
      flexDirection: "row",
      gap: theme.spacing.md,
    },
    modalButton: {
      flex: 1,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.radius.md,
      alignItems: "center",
      justifyContent: "center",
    },
    modalPrimary: {
      backgroundColor: theme.colors.primary,
    },
    modalSecondary: {
      borderWidth: 1,
      borderColor: theme.general.borderColor,
      backgroundColor: theme.general.surface,
    },
    modalButtonTextPrimary: {
      color: theme.colors.textLight,
      fontWeight: "600",
    },
    modalButtonTextSecondary: {
      color: theme.colors.text,
      fontWeight: "600",
    },
  });
