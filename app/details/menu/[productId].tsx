import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
} from "react-native";

import { useLocalSearchParams, useRouter } from "expo-router";
import Markdown from "react-native-markdown-display";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useThemeMode } from "@/context/ThemeContext";
import AppHeader from "@/components/AppHeader";
import QuantitySelector from "@/components/QuantitySelector";
import { useCart } from "@/context/CartContext";
import api from "@/api/api";
import { Product, ProductVariant } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { resolveAssetUrl } from "@/utils/url";

export default function ProductDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme, mode } = useThemeMode();
  const { addItem } = useCart();
  const { config } = useAuth();
  const params = useLocalSearchParams<{ productId?: string }>();
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [flavorCounts, setFlavorCounts] = useState<Record<number, number>>({});

  const description = useMemo(() => {
    const raw = product?.description ?? "";
    if (!raw || raw === "null" || !raw.trim()) return null;
    return raw.replace(/\r\n/g, "\n\n").trim();
  }, [product?.description]);
  const barStyle = mode === "dark" ? "light-content" : "dark-content";
  const markdownStyles = useMemo(
    () =>
      StyleSheet.create({
        body: {
          color: theme.colors.text,
          fontSize: 16,
          lineHeight: 22,
        },
        text: {
          color: theme.colors.text,
          fontSize: 16,
          lineHeight: 22,
        },
        strong: { color: theme.colors.text },
        heading1: { color: theme.colors.text },
        heading2: { color: theme.colors.text },
        heading3: { color: theme.colors.text },
        bullet_list: { marginVertical: 8 },
        ordered_list: { marginVertical: 8 },
      }),
    [theme.colors.text]
  );

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace("/(tabs)/menu");
  };

  const resolvedImageUrl = useMemo(() => {
    if (!product?.image_url) return null;
    return resolveAssetUrl(product.image_url, config?.assets_base_url) ?? product.image_url;
  }, [product?.image_url, config?.assets_base_url]);

  const loadProduct = useCallback(async () => {
    if (!params.productId) return;
    try {
      setLoadError(null);
      setNotFound(false);
      setLoading(true);
      const productResponse = await api.get<{ data: Product }>(`/products/${params.productId}`);
      const loadedProduct = productResponse.data.data ?? productResponse.data;
      setProduct(loadedProduct);

      const variants = Array.isArray(loadedProduct?.variants)
        ? [...loadedProduct.variants].filter((variant) => variant.active)
        : [];
      variants.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
      setSelectedVariant(variants[0] ?? null);
    } catch (error: any) {
      console.error("Erro ao carregar produto", error);
      setProduct(null);
      if (error?.response?.status === 404) {
        setNotFound(true);
        setLoadError(null);
      } else {
        setNotFound(false);
        setLoadError("Não foi possível carregar este produto. Verifique sua conexão e tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  }, [params.productId]);

  useEffect(() => {
    void loadProduct();
  }, [loadProduct]);

  const maxFlavors = selectedVariant?.max_flavors ?? 0;
  const unitPrice = useMemo(
    () => Number(selectedVariant?.price ?? product?.price ?? 0),
    [product?.price, selectedVariant?.price]
  );
  const subtotal = useMemo(() => unitPrice * quantity, [quantity, unitPrice]);
  const formattedUnitPrice = useMemo(
    () =>
      unitPrice.toLocaleString("pt-PT", {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: 2,
      }),
    [unitPrice]
  );
  const formattedSubtotal = useMemo(
    () =>
      subtotal.toLocaleString("pt-PT", {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: 2,
      }),
    [subtotal]
  );
  const totalFlavorCount = useMemo(
    () => Object.values(flavorCounts).reduce((sum, value) => sum + value, 0),
    [flavorCounts]
  );
  const allowedFlavors = useMemo(
    () => (Array.isArray(product?.allowed_flavors) ? product.allowed_flavors : []),
    [product?.allowed_flavors]
  );
  const flavorSelectionStatus = useMemo(() => {
    if (!selectedVariant || maxFlavors <= 0) {
      return null;
    }

    if (totalFlavorCount === 0) {
      return {
        tone: "warning" as const,
        message: `Selecione pelo menos 1 sabor para este pack (até ${maxFlavors}).`,
      };
    }

    if (totalFlavorCount < maxFlavors) {
      return {
        tone: "neutral" as const,
        message: `Faltam ${maxFlavors - totalFlavorCount} sabor(es) para completar o pack.`,
      };
    }

    return {
      tone: "success" as const,
      message: "Pack completo. Pode adicionar à encomenda.",
    };
  }, [maxFlavors, selectedVariant, totalFlavorCount]);
  const canAddToCart = useMemo(() => {
    if (!product) return false;
    if (product.variants && product.variants.length > 0) {
      if (!selectedVariant) return false;
      if (maxFlavors > 0 && totalFlavorCount < maxFlavors) return false;
    }
    return true;
  }, [maxFlavors, product, selectedVariant, totalFlavorCount]);

  const handleFlavorChange = useCallback(
    (flavorId: number, nextValue: number) => {
      if (!selectedVariant) return;
      const safeValue = Math.max(0, Math.min(maxFlavors, nextValue));
      const current = flavorCounts[flavorId] ?? 0;
      const nextTotal = totalFlavorCount - current + safeValue;
      if (nextTotal > maxFlavors) return;
      setFlavorCounts((prev) => ({ ...prev, [flavorId]: safeValue }));
    },
    [flavorCounts, maxFlavors, selectedVariant, totalFlavorCount]
  );

  const handleAddToCart = () => {
    if (!product) return;

    if (product.variants && product.variants.length > 0) {
      if (!selectedVariant) return;
      if (maxFlavors > 0 && totalFlavorCount < maxFlavors) {
        return;
      }
    }

    const selectedFlavors = allowedFlavors
      .map((flavor) => ({
        id: flavor.id,
        name: flavor.name,
        quantity: flavorCounts[flavor.id] ?? 0,
      }))
      .filter((flavor) => flavor.quantity > 0);

    addItem(product, {
      quantity,
      unitPrice: selectedVariant?.price ?? product.price,
      variant: selectedVariant,
      flavors: selectedFlavors,
    });
    router.replace({
      pathname: "/(tabs)/item-added",
      params: {
        itemName: product.name,
        quantity: String(quantity),
      },
    });
  };

  return (
    <View style={[styles.safeArea, { backgroundColor: theme.general.screenBackground }]}>
      <StatusBar backgroundColor={theme.colors.primary} barStyle={barStyle} />
      <AppHeader onBack={handleGoBack} />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: 160 + Math.max(insets.bottom, 0) },
        ]}
      >

        {loading ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : loadError ? (
          <View style={styles.stateContainer}>
            <Text style={[styles.descriptionFallback, styles.stateText, { color: theme.colors.textSecondary }]}>
              {loadError}
            </Text>
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => void loadProduct()}
            >
              <Text style={[styles.retryButtonText, { color: theme.colors.textLight }]}>
                Tentar novamente
              </Text>
            </TouchableOpacity>
          </View>
        ) : product ? (
          <>
            {resolvedImageUrl ? (
              <Image source={{ uri: resolvedImageUrl }} style={styles.image} resizeMode="cover" />
            ) : (
              <View style={[styles.imageFallback, { backgroundColor: theme.colors.disabledBackground }]}>
                <Text style={[styles.imageFallbackText, { color: theme.colors.textSecondary }]}>
                  Sem imagem
                </Text>
              </View>
            )}

            <Text style={[styles.title, { color: theme.colors.text }]}>{product.name}</Text>

            {description ? (
              <Markdown style={markdownStyles}>{description}</Markdown>
            ) : (
              <Text style={[styles.descriptionFallback, { color: theme.colors.textSecondary }]}>
                Sem descrição disponível.
              </Text>
            )}

            {product.variants && product.variants.length > 0 ? (
              <View style={styles.variantSection}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                  Escolha o pack
                </Text>
                <View style={styles.variantList}>
                  {product.variants
                    .filter((variant) => variant.active)
                    .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
                    .map((variant) => {
                      const active = selectedVariant?.id === variant.id;
                      return (
                        <TouchableOpacity
                          key={variant.id}
                          style={[
                            styles.variantButton,
                            {
                              borderColor: active ? theme.colors.primary : theme.colors.border,
                              backgroundColor: active ? theme.colors.primary : theme.general.surface,
                            },
                          ]}
                          onPress={() => {
                            setSelectedVariant(variant);
                            setFlavorCounts({});
                          }}
                          accessibilityRole="button"
                          accessibilityLabel={`Selecionar pack ${variant.name}, ${variant.unit_count} unidades`}
                          accessibilityHint={
                            active ? "Pack atualmente selecionado" : "Toque para selecionar este pack"
                          }
                          accessibilityState={{ selected: active }}
                        >
                          <Text
                            style={[
                              styles.variantText,
                              { color: active ? theme.colors.textLight : theme.colors.text },
                            ]}
                          >
                            {variant.name} • {variant.unit_count} un
                          </Text>
                          <Text
                            style={[
                              styles.variantPrice,
                              { color: active ? theme.colors.textLight : theme.colors.textSecondary },
                            ]}
                          >
                            {variant.price.toLocaleString("pt-PT", {
                              style: "currency",
                              currency: "EUR",
                              minimumFractionDigits: 2,
                            })}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                </View>
              </View>
            ) : null}

            {selectedVariant && maxFlavors > 0 ? (
              <View style={styles.flavorSection}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                  Escolha os sabores (até {maxFlavors})
                </Text>
                <Text style={[styles.helperText, { color: theme.colors.textSecondary }]}>
                  Selecionados: {totalFlavorCount} de {maxFlavors}
                </Text>
                {flavorSelectionStatus ? (
                  <Text
                    style={[
                      styles.flavorStatusText,
                      flavorSelectionStatus.tone === "warning" && {
                        color: theme.colors.warningText,
                      },
                      flavorSelectionStatus.tone === "success" && {
                        color: theme.colors.successText,
                        fontWeight: "600",
                      },
                      flavorSelectionStatus.tone === "neutral" && {
                        color: theme.colors.textSecondary,
                      },
                    ]}
                  >
                    {flavorSelectionStatus.message}
                  </Text>
                ) : null}
                <View style={styles.flavorList}>
                  {allowedFlavors.map((flavor) => (
                    <View key={flavor.id} style={styles.flavorRow}>
                      <Text style={[styles.flavorName, { color: theme.colors.text }]}>
                        {flavor.name}
                      </Text>
                      <QuantitySelector
                        value={flavorCounts[flavor.id] ?? 0}
                        min={0}
                        max={maxFlavors}
                        onChange={(value) => handleFlavorChange(flavor.id, value)}
                        theme={theme}
                      />
                    </View>
                  ))}
                </View>
                {allowedFlavors.length === 0 ? (
                  <Text style={[styles.helperText, { color: theme.colors.warningText }]}>
                    Este artigo ainda não tem sabores disponíveis.
                  </Text>
                ) : null}
              </View>
            ) : null}

          </>
        ) : notFound ? (
          <View style={styles.stateContainer}>
            <Text style={[styles.descriptionFallback, styles.stateText, { color: theme.colors.textSecondary }]}>
              Produto não encontrado.
            </Text>
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleGoBack}
            >
              <Text style={[styles.retryButtonText, { color: theme.colors.textLight }]}>
                Voltar ao cardápio
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.stateContainer}>
            <Text style={[styles.descriptionFallback, styles.stateText, { color: theme.colors.textSecondary }]}>
              Não foi possível carregar este produto.
            </Text>
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => void loadProduct()}
            >
              <Text style={[styles.retryButtonText, { color: theme.colors.textLight }]}>
                Tentar novamente
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {!loading && !loadError && !notFound && product ? (
        <View
          style={[
            styles.stickyFooter,
            {
              backgroundColor: theme.colors.cardBackground,
              borderTopColor: theme.colors.border,
              paddingBottom: Math.max(insets.bottom, 10),
            },
          ]}
        >
          <View style={styles.stickyTopRow}>
            <View style={styles.priceBlock}>
              <Text style={[styles.priceLabel, { color: theme.colors.textSecondary }]}>
                {selectedVariant ? "Pack selecionado" : "Preço unitário"}
              </Text>
              <Text style={[styles.priceValue, { color: theme.colors.text }]}>
                {formattedUnitPrice}
              </Text>
            </View>
            <View style={styles.subtotalBlock}>
              <Text style={[styles.priceLabel, { color: theme.colors.textSecondary }]}>
                Subtotal
              </Text>
              <Text style={[styles.subtotalValue, { color: theme.colors.text }]}>
                {formattedSubtotal}
              </Text>
            </View>
          </View>

          <View style={styles.stickyBottomRow}>
            <QuantitySelector
              value={quantity}
              min={1}
              max={99}
              onChange={setQuantity}
              theme={theme}
              style={styles.footerQuantity}
            />
            <TouchableOpacity
              style={[
                styles.addButton,
                { backgroundColor: theme.colors.secondary },
                !canAddToCart && {
                  backgroundColor: theme.colors.disabledBackground,
                },
              ]}
              onPress={handleAddToCart}
              disabled={!canAddToCart}
              accessibilityRole="button"
              accessibilityLabel="Adicionar produto à encomenda"
              accessibilityHint={
                canAddToCart
                  ? "Adiciona este produto configurado ao carrinho"
                  : "Selecione os sabores obrigatórios para habilitar"
              }
              accessibilityState={{ disabled: !canAddToCart }}
            >
              <Text
                style={[
                  styles.addButtonText,
                  { color: canAddToCart ? theme.colors.textOnBrand : theme.colors.textSecondary },
                ]}
              >
                Adicionar à encomenda
              </Text>
            </TouchableOpacity>
          </View>
          {flavorSelectionStatus && !canAddToCart ? (
            <Text style={[styles.footerHint, { color: theme.colors.warningText }]}>
              {flavorSelectionStatus.message}
            </Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  loader: {
    paddingVertical: 40,
    alignItems: "center",
  },
  stateContainer: {
    paddingVertical: 32,
    alignItems: "center",
    gap: 12,
  },
  stateText: {
    textAlign: "center",
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: "700",
  },
  backButton: {
    marginBottom: 12,
  },
  backText: {
    fontSize: 16,
    fontWeight: "600",
  },
  image: {
    width: "100%",
    height: 220,
    borderRadius: 16,
    marginBottom: 16,
  },
  imageFallback: {
    width: "100%",
    height: 220,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  imageFallbackText: {
    fontSize: 15,
    fontWeight: "600",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  descriptionFallback: {
    fontSize: 16,
    lineHeight: 22,
  },
  variantSection: {
    marginTop: 16,
    gap: 12,
  },
  variantList: {
    gap: 10,
  },
  variantButton: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  variantText: {
    fontSize: 15,
    fontWeight: "600",
  },
  variantPrice: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: "600",
  },
  flavorSection: {
    marginTop: 20,
    gap: 10,
  },
  helperText: {
    fontSize: 12,
  },
  flavorStatusText: {
    fontSize: 12,
    lineHeight: 16,
  },
  flavorList: {
    gap: 12,
  },
  flavorRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  flavorName: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
  },
  addButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  addButtonText: {
    fontWeight: "700",
    fontSize: 16,
  },
  stickyFooter: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 12,
  },
  stickyTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: 12,
  },
  stickyBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  footerQuantity: {
    alignSelf: "stretch",
  },
  priceBlock: {
    flex: 1,
  },
  subtotalBlock: {
    alignItems: "flex-end",
  },
  priceLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  priceValue: {
    fontSize: 15,
    fontWeight: "600",
  },
  subtotalValue: {
    fontSize: 18,
    fontWeight: "700",
  },
  footerHint: {
    fontSize: 12,
    lineHeight: 16,
  },
});
