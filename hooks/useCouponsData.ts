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

export function useCouponsData() {
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
    const { data } = await api.get("/coupons");
    if (!mountedRef.current) return;
    setCoupons(data.data ?? data);
  }, []);

  const fetchMyCoupons = useCallback(async () => {
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
  }, []);

  const loadInitialData = useCallback(async () => {
    if (!mountedRef.current) return;
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
  }, [fetchCoupons, fetchMyCoupons]);

  const refresh = useCallback(async () => {
    if (!mountedRef.current) return;
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
  }, [fetchCoupons, fetchMyCoupons]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const activateCoupon = useCallback(
    async (couponId: number) => {
      if (!mountedRef.current) return;
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
    []
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

