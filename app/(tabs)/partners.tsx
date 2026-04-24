import { useMemo } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";

import PartnerCard from "@/components/PartnerCard";
import { getPartnerCardTheme } from "@/constants/themePartners";
import { usePartnersData } from "@/hooks/usePartnersData";
import { useThemeMode } from "@/context/ThemeContext";
import { AppTheme, Typography } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";

export default function PartnersScreen() {
  const router = useRouter();
  const { theme, mode } = useThemeMode();
  const { config } = useAuth();
  const { partners, loading, refreshing, error, refresh } = usePartnersData();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const cardTheme = useMemo(() => getPartnerCardTheme(theme), [theme]);
  const barStyle = mode === "dark" ? "light-content" : "dark-content";

  return (
    <View style={styles.safeArea}>
      <StatusBar backgroundColor={theme.colors.primary} barStyle={barStyle} />

      <View style={styles.container}>
        <Text style={[Typography.subtitle, styles.title]}>Parceiros</Text>
        <Text style={styles.subtitle}>
          Valide códigos promocionais e gere benefícios privados diretamente na sua área de cupons.
        </Text>

        {loading ? (
          <ActivityIndicator color={theme.colors.primary} size="large" style={styles.loading} />
        ) : (
          <FlatList
            data={partners}
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
            ListEmptyComponent={
              <Text style={styles.empty}>
                {error ?? "Nenhum parceiro disponível no momento."}
              </Text>
            }
            renderItem={({ item }) => (
              <PartnerCard
                partner={item}
                assetBaseUrl={config?.assets_base_url}
                theme={theme}
                tokens={cardTheme}
                onPress={() => router.push(`/details/partner/${item.id}`)}
              />
            )}
          />
        )}
      </View>
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
      flex: 1,
      backgroundColor: theme.general.screenBackground,
      paddingHorizontal: theme.spacing.lg,
    },
    title: {
      textAlign: "center",
      marginTop: theme.spacing.md,
      color: theme.colors.text,
    },
    subtitle: {
      textAlign: "center",
      color: theme.colors.textSecondary,
      fontSize: 14,
      lineHeight: 20,
      marginTop: theme.spacing.xs,
      marginBottom: theme.spacing.lg,
    },
    loading: {
      marginTop: theme.spacing.huge,
    },
    listContent: {
      paddingBottom: theme.spacing.ultra,
      gap: theme.spacing.lg,
    },
    empty: {
      color: theme.colors.textSecondary,
      textAlign: "center",
      marginTop: theme.spacing.huge,
    },
  });
