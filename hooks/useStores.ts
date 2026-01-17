import { useCallback, useRef, useState } from "react";

import api from "@/api/api";
import { Store } from "@/types";

type StoreQuery = {
  city?: string;
  type?: "principal" | "revenda";
  lat?: number;
  lng?: number;
};

type UseStoresResult = {
  stores: Store[];
  loading: boolean;
  error: string | null;
  fetchStores: (params?: StoreQuery) => Promise<void>;
};

export function useStores(): UseStoresResult {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  const fetchStores = useCallback(async (params: StoreQuery = {}) => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get("/stores", { params, signal: controller.signal });
      const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
      setStores(list);
    } catch (err: any) {
      if (err?.name === "AbortError" || err?.name === "CanceledError") return;
      console.error("Erro ao carregar lojas:", err);
      setError("Não foi possível carregar as lojas.");
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    stores,
    loading,
    error,
    fetchStores,
  };
}
