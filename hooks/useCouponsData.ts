import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert } from "react-native";
import api from "@/api/api";
import { Coupon } from "@/types";

export type UserCoupon = {
  id: number;
  active: boolean;
  external_code?: string;
  coupon?: { id: number };
  status: "pending" | "done";
};

type UseCouponsOptions = {
  enabled?: boolean;
};

export function useCouponsData({ enabled = true }: UseCouponsOptions = {}) {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [myCouponsMap, setMyCouponsMap] = useState<Record<number, UserCoupon>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchCoupons = useCallback(async () => {
    if (!enabled || !mountedRef.current) return;
    const { data } = await api.get("/coupons");
    if (!mountedRef.current) return;
    setCoupons(data.data ?? data);
  }, [enabled]);

  const fetchMyCoupons = useCallback(async () => {
    if (!enabled || !mountedRef.current) return;
    const { data } = await api.get("/my-coupons");
    if (!mountedRef.current) return;

    const list: UserCoupon[] = data.data ?? data;
    const map: Record<number, UserCoupon> = {};

    list.forEach((uc) => {
      const id = uc.coupon?.id;
      if (id != null) {
        map[id] = uc;
      }
    });

    setMyCouponsMap(map);
  }, [enabled]);

  const loadInitialData = useCallback(async () => {
    if (!mountedRef.current || !enabled) return;
    setLoading(true);
    try {
      await Promise.all([fetchCoupons(), fetchMyCoupons()]);
    } catch (error) {
      console.error("Erro ao carregar cupons", error);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [enabled, fetchCoupons, fetchMyCoupons]);

  const refresh = useCallback(async () => {
    if (!mountedRef.current || !enabled) return;
    setRefreshing(true);
    try {
      await Promise.all([fetchCoupons(), fetchMyCoupons()]);
    } catch (error) {
      console.error("Erro ao atualizar cupons", error);
    } finally {
      if (mountedRef.current) {
        setRefreshing(false);
      }
    }
  }, [enabled, fetchCoupons, fetchMyCoupons]);

  useEffect(() => {
    if (enabled) {
      loadInitialData();
    } else {
      setCoupons([]);
      setMyCouponsMap({});
      setLoading(false);
    }
  }, [enabled, loadInitialData]);

  const activateCoupon = useCallback(
    async (couponId: number) => {
      if (!mountedRef.current || !enabled) return;
      try {
        setProcessingId(couponId);
        const { data } = await api.post("/my-coupons", { coupon_id: couponId });
        if (!mountedRef.current) return;

        const userCoupon: UserCoupon = data.data ?? data;
        setMyCouponsMap((prev) => ({ ...prev, [couponId]: userCoupon }));
      } catch (error: any) {
        const message = error?.response?.data?.message ?? "Não foi possível ativar o cupom.";
        Alert.alert("Erro", message);
        console.error(error?.response?.data ?? error);
      } finally {
        if (mountedRef.current) {
          setProcessingId(null);
        }
      }
    },
    [enabled]
  );

  const availableCoupons = useMemo(() => {
    return coupons.filter((coupon) => {
      const uc = myCouponsMap[coupon.id];
      return !uc || uc.status?.toLowerCase() !== "done";
    });
  }, [coupons, myCouponsMap]);

  const isActiveForMe = useCallback(
    (couponId: number) => !!myCouponsMap[couponId]?.active,
    [myCouponsMap]
  );

  return {
    coupons,
    availableCoupons,
    myCouponsMap,
    loading,
    refreshing,
    processingId,
    refresh,
    activateCoupon,
    isActiveForMe,
  };
}
