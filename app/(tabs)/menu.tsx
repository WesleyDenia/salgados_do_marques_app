import { useMemo } from "react";
import {
  ActivityIndicator,
  Image,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronRight } from "lucide-react-native";

import { useThemeMode } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { getLoyaltyBannerTheme } from "@/constants/themeLoyalty";
import { useMenuProducts } from "@/hooks/useMenuProducts";

export default function MenuScreen() {
  const router = useRouter();
  const { theme } = useThemeMode();
  const { config } = useAuth();
  const { items, total } = useCart();
  const bannerTheme = useMemo(() => getLoyaltyBannerTheme(theme), [theme]);
  const { sections, loading, refreshing, loadError, refresh, retry } = useMenuProducts({
    assetsBaseUrl: config?.assets_base_url,
  });

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.general.screenBackground }]}>
      <TouchableOpacity
        style={[
          styles.cartSummary,
          { backgroundColor: bannerTheme.backgroundColor },
          itemCount === 0 && styles.cartSummaryDisabled,
        ]}
        onPress={() => router.push("/(tabs)/orders")}
        disabled={itemCount === 0}
        accessibilityRole="button"
        accessibilityLabel={
          itemCount > 0
            ? `Abrir encomenda. ${itemCount} item${itemCount > 1 ? "s" : ""} no carrinho`
            : "Sua encomenda vazia"
        }
        accessibilityHint={
          itemCount > 0
            ? "Abre a tela de encomenda para revisar os itens"
            : "Adicione itens ao cardápio para habilitar a encomenda"
        }
        accessibilityState={{ disabled: itemCount === 0 }}
      >
        <View>
          <Text style={[styles.cartTitle, { color: theme.colors.textLight }]}>Sua encomenda</Text>
          <Text style={[styles.cartSubtitle, { color: theme.colors.textLight }]}>
            {itemCount > 0
              ? `${itemCount} item${itemCount > 1 ? "s" : ""} no carrinho`
              : "Nenhum item adicionado"}
          </Text>
        </View>
        <Text style={[styles.cartTotal, { color: theme.colors.textLight }]}>
          {Number(total ?? 0).toLocaleString("pt-PT", {
            style: "currency",
            currency: "EUR",
            minimumFractionDigits: 2,
          })}
        </Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Cardápio</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Escolha seu salgado favorito e descubra novos sabores!
        </Text>        
      </View>
      

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : loadError ? (
        <View style={styles.stateContainer}>
          <Text style={[styles.stateMessage, { color: theme.colors.textSecondary }]}>
            {loadError}
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => {
              void retry();
            }}
            accessibilityRole="button"
            accessibilityLabel="Tentar carregar cardápio novamente"
          >
            <Text style={[styles.retryButtonText, { color: theme.colors.textLight }]}>
              Tentar novamente
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => String(item.id)}
          stickySectionHeadersEnabled={false}
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
          SectionSeparatorComponent={() => <View style={styles.sectionSeparator} />}
          renderSectionHeader={({ section }) => (
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{section.title}</Text>
          )}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.85}
              style={[
                styles.card,
                {
                  backgroundColor: theme.colors.cardBackground,
                  borderColor: theme.colors.border,
                },
              ]}
              onPress={() =>
                router.push({
                  pathname: "/details/menu/[productId]",
                  params: {
                    productId: String(item.id),
                  },
                })
              }
              accessibilityRole="button"
              accessibilityLabel={`${item.name}, ${item.price.toLocaleString("pt-PT", {
                style: "currency",
                currency: "EUR",
                minimumFractionDigits: 2,
              })}`}
              accessibilityHint="Abre os detalhes do produto"
            >
              {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="cover" />
              ) : (
                <View style={[styles.imageFallback, { backgroundColor: theme.colors.disabledBackground }]}>
                  <Text style={[styles.fallbackText, { color: theme.colors.textSecondary }]}>SM</Text>
                </View>
              )}

              <View style={styles.info}>
                <Text style={[styles.name, { color: theme.colors.text }]} numberOfLines={2}>
                  {item.name}
                </Text>
                {item.description ? (
                  <Text
                    style={[styles.description, { color: theme.colors.textSecondary }]}
                    numberOfLines={2}
                  >
                    {item.description}
                  </Text>
                ) : null}
                <View style={styles.affordanceRow}>
                  <Text style={[styles.affordanceText, { color: theme.colors.primary }]}>
                    Ver detalhes
                  </Text>
                  <ChevronRight size={14} color={theme.colors.primary} />
                </View>
              </View>

              <View style={styles.priceColumn}>
                <Text style={[styles.priceLabel, { color: theme.colors.textSecondary }]}>
                  Desde
                </Text>
                <Text style={[styles.price, { color: theme.colors.text }]}>
                  {item.price.toLocaleString("pt-PT", {
                    style: "currency",
                    currency: "EUR",
                    minimumFractionDigits: 2,
                  })}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={[styles.empty, { color: theme.colors.textSecondary }]}>
              Nenhum produto disponível.
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
  },
  subtitle: {
    marginVertical: 10,
    fontSize: 14,
  },
  cartSummary: {
    width: "100%",
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    marginTop: -35,
  },
  cartSummaryDisabled: {
    opacity: 0.6,
  },
  cartTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  cartSubtitle: {
    marginTop: 2,
    fontSize: 14,
  },
  cartTotal: {
    fontSize: 16,
    fontWeight: "800",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  stateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    gap: 12,
  },
  stateMessage: {
    textAlign: "center",
    fontSize: 14,
    lineHeight: 20,
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: "700",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionSeparator: {
    height: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 12,
    gap: 12,
  },
  image: {
    width: 64,
    height: 64,
    borderRadius: 10,
  },
  imageFallback: {
    width: 64,
    height: 64,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  fallbackText: {
    fontWeight: "700",
    fontSize: 16,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
  },
  description: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
  },
  affordanceRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  affordanceText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  priceColumn: {
    alignItems: "flex-end",
    minWidth: 82,
  },
  priceLabel: {
    fontSize: 11,
    marginBottom: 2,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  price: {
    fontSize: 15,
    fontWeight: "900",
  },
  empty: {
    textAlign: "center",
    marginTop: 24,
    fontSize: 16,
  },
});
