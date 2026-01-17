import { useEffect, useMemo, useState, useCallback, useRef } from "react";
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
import { useFocusEffect } from "@react-navigation/native";

import api from "@/api/api";
import { useThemeMode } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { resolveAssetUrl } from "@/utils/url";

type MenuProduct = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  categoryName: string;
  categoryOrder: number | null;
};

export default function MenuScreen() {
  const router = useRouter();
  const { theme } = useThemeMode();
  const { config } = useAuth();

  const [rawProducts, setRawProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const loadProducts = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      setLoading(true);
      const { data } = await api.get("/products", { signal: controller.signal });
      const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
      setRawProducts(list);
    } catch (error: any) {
      if (error?.name === "AbortError") return;
      console.error("Erro ao carregar produtos", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadProducts();
    return () => {
      abortRef.current?.abort();
    };
  }, [loadProducts]);

  useFocusEffect(
    useCallback(() => {
      void loadProducts();
      return () => abortRef.current?.abort();
    }, [loadProducts])
  );

  const products = useMemo<MenuProduct[]>(() => {
    return rawProducts.map((item: any) => {
      const imagePath = item.image_url ?? item.image ?? null;
      const resolvedImage =
        resolveAssetUrl(imagePath, config?.assets_base_url) ??
        (typeof imagePath === "string" ? imagePath : null);

      return {
        id: Number(item.id),
        name: item.name,
        description: item.description ?? null,
        price: Number(item.price ?? 0),
        imageUrl: resolvedImage,
        categoryName: item?.category?.name ?? "Outros",
        categoryOrder: item?.category?.order ?? null,
      };
    });
  }, [rawProducts, config?.assets_base_url]);

  const sections = useMemo(() => {
    const map = new Map<string, MenuProduct[]>();

    products.forEach((product) => {
      const key = product.categoryName || "Outros";
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(product);
    });

    return Array.from(map.entries())
      .map(([title, items]) => ({
        title,
        order: items[0]?.categoryOrder ?? null,
        data: items.sort((a, b) => a.name.localeCompare(b.name)),
      }))
      .sort((a, b) => {
        const orderA = a.order ?? Number.MAX_SAFE_INTEGER;
        const orderB = b.order ?? Number.MAX_SAFE_INTEGER;
        if (orderA !== orderB) {
          return orderA - orderB;
        }
        return a.title.localeCompare(b.title);
      });
  }, [products]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.general.screenBackground }]}>
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
                setRefreshing(true);
                void loadProducts();
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
                    name: item.name,
                    description: item.description ?? "",
                    imageUrl: item.imageUrl ?? "",
                  },
                })
              }
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
              </View>

              <Text style={[styles.price, { color: theme.colors.textSecondary }]}>
                {item.price.toLocaleString("pt-PT", {
                  style: "currency",
                  currency: "EUR",
                  minimumFractionDigits: 2,
                })}
              </Text>
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
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
  },
  subtitle: {
    marginVertical: 10,
    fontSize: 14,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
