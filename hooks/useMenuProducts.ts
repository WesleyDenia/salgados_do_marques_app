import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";

import api from "@/api/api";
import { unwrapApiList } from "@/utils/apiResponse";
import { resolveAssetUrl } from "@/utils/url";

type RawMenuProduct = {
  id?: number | string;
  name?: string;
  description?: string | null;
  price?: number | string | null;
  image_url?: string | null;
  image?: string | null;
  category?: {
    name?: string | null;
    order?: number | null;
  } | null;
};

export type MenuProduct = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  categoryName: string;
  categoryOrder: number | null;
};

export type MenuProductSection = {
  title: string;
  order: number | null;
  data: MenuProduct[];
};

type UseMenuProductsOptions = {
  assetsBaseUrl?: string | null;
};

export function useMenuProducts({ assetsBaseUrl }: UseMenuProductsOptions) {
  const [rawProducts, setRawProducts] = useState<RawMenuProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const loadProducts = useCallback(async (options?: { fromRefresh?: boolean }) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      setLoadError(null);
      if (!options?.fromRefresh) {
        setLoading(true);
      }
      const { data } = await api.get("/products", { signal: controller.signal });
      setRawProducts(unwrapApiList<RawMenuProduct>(data));
    } catch (error: any) {
      if (error?.name === "AbortError" || error?.name === "CanceledError") return;
      console.error("Erro ao carregar produtos", error);
      setLoadError("Não foi possível carregar o cardápio. Verifique sua conexão e tente novamente.");
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
    return rawProducts.map((item) => {
      const imagePath = item.image_url ?? item.image ?? null;
      const resolvedImage =
        resolveAssetUrl(imagePath, assetsBaseUrl) ??
        (typeof imagePath === "string" ? imagePath : null);

      return {
        id: Number(item.id),
        name: item.name ?? "Produto",
        description: item.description ?? null,
        price: Number(item.price ?? 0),
        imageUrl: resolvedImage,
        categoryName: item?.category?.name ?? "Outros",
        categoryOrder: item?.category?.order ?? null,
      };
    });
  }, [rawProducts, assetsBaseUrl]);

  const sections = useMemo<MenuProductSection[]>(() => {
    const map = new Map<string, MenuProduct[]>();

    products.forEach((product) => {
      const key = product.categoryName || "Outros";
      if (!map.has(key)) map.set(key, []);
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
        if (orderA !== orderB) return orderA - orderB;
        return a.title.localeCompare(b.title);
      });
  }, [products]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await loadProducts({ fromRefresh: true });
  }, [loadProducts]);

  const retry = useCallback(async () => {
    setRefreshing(false);
    await loadProducts();
  }, [loadProducts]);

  return {
    sections,
    loading,
    refreshing,
    loadError,
    refresh,
    retry,
  };
}
