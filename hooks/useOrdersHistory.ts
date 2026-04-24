import { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";

import api from "@/api/api";
import { Order } from "@/types";

type OrdersHistorySnapshot = {
  orders: Order[];
  loading: boolean;
  error: string | null;
};

const cache: OrdersHistorySnapshot = {
  orders: [],
  loading: false,
  error: null,
};

const listeners = new Set<(snapshot: OrdersHistorySnapshot) => void>();
let inFlight: Promise<Order[]> | null = null;
let initialized = false;

function publish() {
  const snapshot = { ...cache, orders: [...cache.orders] };
  listeners.forEach((listener) => listener(snapshot));
}

async function fetchOrdersHistory(): Promise<Order[]> {
  if (inFlight) {
    return inFlight;
  }

  cache.loading = true;
  cache.error = null;
  publish();

  inFlight = (async () => {
    try {
      const { data } = await api.get("/orders");
      const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
      cache.orders = list;
      cache.error = null;
      initialized = true;
      return list;
    } catch (error) {
      console.error("Erro ao carregar encomendas", error);
      cache.error = "Não foi possível carregar suas encomendas.";
      throw error;
    } finally {
      cache.loading = false;
      inFlight = null;
      publish();
    }
  })();

  return inFlight;
}

export async function refreshOrdersHistory() {
  return fetchOrdersHistory();
}

export function useOrdersHistory() {
  const [state, setState] = useState<OrdersHistorySnapshot>({
    orders: cache.orders,
    loading: cache.loading,
    error: cache.error,
  });

  useEffect(() => {
    listeners.add(setState);
    return () => {
      listeners.delete(setState);
    };
  }, []);

  const refresh = useCallback(async () => {
    await fetchOrdersHistory();
  }, []);

  useEffect(() => {
    if (!initialized) {
      void fetchOrdersHistory();
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void fetchOrdersHistory();
    }, [])
  );

  return {
    orders: state.orders,
    loading: state.loading,
    error: state.error,
    refresh,
  };
}
