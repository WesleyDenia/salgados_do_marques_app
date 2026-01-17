import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar } from "react-native";
import { useThemeMode } from "@/context/ThemeContext";
import { AppTheme } from "@/constants/theme";
import { useCoupons } from "@/context/CouponsContext";
import AppHeader from "@/components/AppHeader";

export default function CouponDetailsScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const { theme, mode } = useThemeMode();
  const { availableCoupons } = useCoupons();

  const coupon = useMemo(() => {
    const parsedId = Number(id);
    if (!parsedId) return undefined;
    return availableCoupons.find((item) => item.id === parsedId);
  }, [id, availableCoupons]);

  const styles = useMemo(() => createStyles(theme), [theme]);
  const barStyle = mode === "dark" ? "light-content" : "dark-content";

  if (!coupon) {
    return (
      <View style={styles.notFoundContainer}>
        <Text style={styles.notFoundTitle}>Cupom não encontrado</Text>
        <Text style={styles.notFoundDescription}>
          O cupom pode ter sido removido ou você não tem acesso a ele no momento.
        </Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.safeArea}>
      <StatusBar backgroundColor={theme.colors.primary} barStyle={barStyle} />
      <AppHeader />
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity style={styles.backButtonInline} onPress={() => router.back()}>
          <Text style={styles.backButtonTextInline}>Voltar</Text>
        </TouchableOpacity>

        <Text style={styles.title}>{coupon.title}</Text>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Validade</Text>
        <Text style={styles.sectionText}>
          {coupon.ends_at
            ? `Válido até ${new Date(coupon.ends_at).toLocaleDateString()}`
            : "Sem data de expiração"}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Código</Text>
        <Text style={styles.code}>{coupon.code}</Text>
      </View>

      {coupon.body ? (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Como usar</Text>
          <Text style={styles.sectionText}>{coupon.body}</Text>
        </View>
      ) : null}
      </ScrollView>
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.general.screenBackground,
    },
    container: {
      padding: theme.spacing.lg,
      paddingBottom: theme.spacing.huge,
      gap: theme.spacing.lg,
      paddingTop: theme.spacing.lg + theme.spacing.md,
    },
    backButtonInline: {
      alignSelf: "flex-start",
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.sm,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: theme.general.borderColor,
    },
    backButtonTextInline: {
      color: theme.colors.textSecondary,
      fontWeight: "500",
    },
    title: {
      fontSize: 24,
      fontWeight: "700",
      color: theme.colors.text,
    },
    section: {
      gap: theme.spacing.xs,
    },
    sectionLabel: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.colors.textSecondary,
      textTransform: "uppercase",
      letterSpacing: 0.6,
    },
    sectionText: {
      fontSize: 16,
      color: theme.colors.text,
      lineHeight: 24,
    },
    code: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.colors.primary,
      letterSpacing: 1,
    },
    notFoundContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: theme.spacing.lg,
      gap: theme.spacing.md,
      backgroundColor: theme.general.screenBackground,
    },
    notFoundTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: theme.colors.text,
    },
    notFoundDescription: {
      fontSize: 15,
      lineHeight: 22,
      color: theme.colors.textSecondary,
      textAlign: "center",
    },
    backButton: {
      marginTop: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: theme.colors.primary,
    },
    backButtonText: {
      color: theme.colors.primary,
      fontWeight: "600",
    },
  });
