import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import AppHeader from "@/components/AppHeader";
import FeedbackActionScreen, { FeedbackSummaryText } from "@/components/feedback/FeedbackActionScreen";
import { getInteractiveFieldStyles } from "@/components/ui/InteractiveField";
import { useAuth } from "@/context/AuthContext";
import { useCoupons } from "@/context/CouponsContext";
import { useThemeMode } from "@/context/ThemeContext";
import { AppTheme } from "@/constants/theme";
import { usePartnersData } from "@/hooks/usePartnersData";
import { resolveAssetUrl } from "@/utils/url";
import type { Partner } from "@/types";

export default function PartnerDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const { theme, mode } = useThemeMode();
  const { config } = useAuth();
  const { refresh: refreshCoupons } = useCoupons();
  const { getPartnerById, validatePartnerCode, submitting } = usePartnersData();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [successPayload, setSuccessPayload] = useState<{
    partnerName: string;
    campaignName: string;
  } | null>(null);
  const styles = useMemo(() => createStyles(theme), [theme]);
  const barStyle = mode === "dark" ? "light-content" : "dark-content";

  const loadPartner = useCallback(async () => {
    const parsedId = Number(id);
    if (!parsedId) {
      setLoading(false);
      setError("Parceiro não encontrado.");
      return;
    }

    const controller = new AbortController();

    try {
      setLoading(true);
      const response = await getPartnerById(parsedId, controller.signal);
      setPartner(response);
      setError(response ? null : "Parceiro não encontrado.");
    } catch (error) {
      setError((error as Error).message || "Não foi possível carregar o parceiro.");
    } finally {
      setLoading(false);
    }

    return () => controller.abort();
  }, [getPartnerById, id]);

  useEffect(() => {
    let cleanup: void | (() => void);

    void loadPartner().then((nextCleanup) => {
      cleanup = nextCleanup;
    });

    return () => {
      if (typeof cleanup === "function") cleanup();
    };
  }, [loadPartner]);

  async function handleValidateCode() {
    try {
      const userCoupon = await validatePartnerCode(code);
      await refreshCoupons();
      setValidationError(null);
      setCode("");
      setSuccessPayload({
        partnerName: partner?.name ?? userCoupon.origin?.partner?.name ?? "Parceiro",
        campaignName:
          userCoupon.origin?.partner_campaign?.public_name ?? userCoupon.coupon?.title ?? "",
      });
    } catch (error) {
      setValidationError((error as Error).message);
    }
  }

  if (loading) {
    return (
      <View style={styles.safeArea}>
        <StatusBar backgroundColor={theme.colors.primary} barStyle={barStyle} />
        <AppHeader />
        <ActivityIndicator color={theme.colors.primary} size="large" style={styles.loading} />
      </View>
    );
  }

  if (!partner) {
    return (
      <View style={styles.safeArea}>
        <StatusBar backgroundColor={theme.colors.primary} barStyle={barStyle} />
        <AppHeader />
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Parceiro não encontrado</Text>
          <Text style={styles.emptyText}>{error ?? "Tente novamente mais tarde."}</Text>
        </View>
      </View>
    );
  }

  const imageUri = resolveAssetUrl(partner.image_url, config?.assets_base_url);

  if (successPayload) {
    return (
      <FeedbackActionScreen
        eyebrow="Cupom gerado"
        title="Tudo certo com o seu benefício."
        body="O seu cupom foi gerado com sucesso. Pode consultá-lo agora na aba Cupons."
        summary={
          <View style={styles.summary}>
            <FeedbackSummaryText>{successPayload.partnerName}</FeedbackSummaryText>
            {successPayload.campaignName ? (
              <FeedbackSummaryText>{successPayload.campaignName}</FeedbackSummaryText>
            ) : null}
          </View>
        }
        primaryLabel="Ver cupons"
        secondaryLabel="Voltar aos parceiros"
        onPrimaryPress={() => router.replace("/(tabs)/coupons")}
        onSecondaryPress={() => router.replace("/(tabs)/partners")}
      />
    );
  }

  return (
    <View style={styles.safeArea}>
      <StatusBar backgroundColor={theme.colors.primary} barStyle={barStyle} />
      <AppHeader />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
          >
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.hero} />
            ) : (
              <View style={styles.heroPlaceholder}>
                <Text style={styles.heroPlaceholderText}>{partner.name}</Text>
              </View>
            )}

            <Text style={styles.title}>{partner.name}</Text>
            <Text style={styles.description}>{partner.description}</Text>
            <View style={styles.contentCard}>
              <Text style={styles.sectionTitle}>Como funciona</Text>
              <Text style={styles.sectionText}>
                Insira o código recebido nesta parceria para desbloquear o benefício e consultar o
                cupom depois na aba Cupons.
              </Text>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>

        <View style={styles.stickyComposer}>
          <View style={styles.validationCard}>
            <Text style={styles.inputLabel}>Código do parceiro</Text>
            <TextInput
              value={code}
              onChangeText={(value) => {
                setCode(value);
                if (validationError) setValidationError(null);
              }}
              placeholder="Ex.: PARCEIRO-10"
              autoCapitalize="characters"
              autoCorrect={false}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              style={[
                styles.input,
                getInteractiveFieldStyles(theme, {
                  variant: "input",
                  state: validationError ? "error" : isInputFocused ? "focus" : "default",
                }),
              ]}
              placeholderTextColor={theme.colors.textSecondary}
            />
            <Text style={validationError ? styles.validationError : styles.inputHint}>
              {validationError
                ? validationError
                : isInputFocused
                  ? "Digite o código exatamente como recebeu. Letras minúsculas e maiúsculas são aceitas."
                  : "O benefício será gerado e ficará disponível em Cupons, assim que o código for validado."}
            </Text>
            <TouchableOpacity
              style={[styles.button, (!code.trim() || submitting) && styles.buttonDisabled]}
              onPress={() => {
                void handleValidateCode();
              }}
              disabled={!code.trim() || submitting}
              >
              {submitting ? (
                <ActivityIndicator color={theme.colors.textLight} />
              ) : (
                <Text style={styles.buttonText}>Validar código</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.general.screenBackground,
    },
    flex: {
      flex: 1,
    },
    content: {
      padding: theme.spacing.lg,
      gap: theme.spacing.lg,
      paddingBottom: 300,
    },
    loading: {
      marginTop: theme.spacing.huge,
    },
    emptyState: {
      padding: theme.spacing.lg,
      alignItems: "center",
      gap: theme.spacing.sm,
    },
    emptyTitle: {
      color: theme.colors.text,
      fontWeight: "700",
      fontSize: 20,
    },
    emptyText: {
      color: theme.colors.textSecondary,
      textAlign: "center",
    },
    hero: {
      width: "100%",
      height: 220,
      borderRadius: theme.radius.lg,
    },
    heroPlaceholder: {
      width: "100%",
      height: 220,
      borderRadius: theme.radius.lg,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.general.placeholderBackground,
    },
    heroPlaceholderText: {
      color: theme.general.placeholderText,
      fontSize: 22,
      fontWeight: "700",
      paddingHorizontal: theme.spacing.lg,
      textAlign: "center",
    },
    title: {
      color: theme.colors.text,
      fontSize: 28,
      fontWeight: "700",
    },
    description: {
      color: theme.colors.textSecondary,
      lineHeight: 24,
      fontSize: 16,
    },
    contentCard: {
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.cardBackground,
      padding: theme.spacing.lg,
      gap: theme.spacing.sm,
      borderWidth: 1,
      borderColor: theme.general.borderColor,
    },
    stickyComposer: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.sm,
      backgroundColor: theme.general.screenBackground,
    },
    validationCard: {
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.cardBackground,
      padding: theme.spacing.md,
      gap: theme.spacing.sm,
      borderWidth: 1,
      borderColor: theme.general.borderColor,
      shadowColor: "#000",
      shadowOpacity: 0.08,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: -4 },
      elevation: 6,
    },
    sectionTitle: {
      color: theme.colors.text,
      fontSize: 18,
      fontWeight: "700",
    },
    sectionText: {
      color: theme.colors.textSecondary,
      lineHeight: 21,
    },
    inputLabel: {
      color: theme.colors.text,
      fontSize: 14,
      fontWeight: "600",
    },
    input: {
      borderRadius: theme.radius.md,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      color: theme.colors.text,
      backgroundColor: theme.colors.inputSurface,
    },
    inputHint: {
      color: theme.colors.textSecondary,
      fontSize: 13,
      lineHeight: 18,
    },
    validationError: {
      color: theme.colors.errorText,
      fontSize: 13,
      lineHeight: 18,
    },
    button: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.radius.md,
      paddingVertical: theme.spacing.md,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: theme.spacing.lg +15,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    buttonText: {
      color: theme.colors.textLight,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 0.4,
    },
    summary: {
      gap: 4,
    },
  });
