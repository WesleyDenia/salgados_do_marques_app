import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert } from "react-native";
import api from "@/api/api";
import { Coupon, UserCoupon } from "@/types";
import { getApiErrorMessage } from "@/utils/errorMessage";
import { unwrapApiList, unwrapApiObject } from "@/utils/apiResponse";
import { buildDisplayCoupons, buildMyCouponsMap } from "@/utils/coupons";

type UseCouponsOptions = {
  enabled?: boolean;
};

export function useCouponsData({ enabled = true }: UseCouponsOptions = {}) {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [myCoupons, setMyCoupons] = useState<UserCoupon[]>([]);
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

  const fetchCoupons = useCallback(
    async (signal?: AbortSignal) => {
      if (!enabled || !mountedRef.current) return;
      const { data } = await api.get("/coupons", { signal });
      if (!mountedRef.current) return;
      setCoupons(unwrapApiList<Coupon>(data));
    },
    [enabled],
  );

  const fetchMyCoupons = useCallback(
    async (signal?: AbortSignal) => {
      if (!enabled || !mountedRef.current) return;
      const { data } = await api.get("/my-coupons", { signal });
      if (!mountedRef.current) return;

      const list = unwrapApiList<UserCoupon>(data);
      setMyCoupons(list);
      setMyCouponsMap(buildMyCouponsMap(list));
    },
    [enabled],
  );

  const loadInitialData = useCallback(async () => {
    if (!mountedRef.current || !enabled) return;
    const controller = new AbortController();
    setLoading(true);
    try {
      await Promise.all([fetchCoupons(controller.signal), fetchMyCoupons(controller.signal)]);
    } catch (error) {
      if ((error as any)?.name !== "AbortError") {
        console.error("Erro ao carregar cupons", error);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
    return () => controller.abort();
  }, [enabled, fetchCoupons, fetchMyCoupons]);

  const refresh = useCallback(async () => {
    if (!mountedRef.current || !enabled) return;
    const controller = new AbortController();
    setRefreshing(true);
    try {
      await Promise.all([fetchCoupons(controller.signal), fetchMyCoupons(controller.signal)]);
    } catch (error) {
      if ((error as any)?.name !== "AbortError") {
        console.error("Erro ao atualizar cupons", error);
      }
    } finally {
      if (mountedRef.current) {
        setRefreshing(false);
      }
    }
  }, [enabled, fetchCoupons, fetchMyCoupons]);

  useEffect(() => {
    let cleanup: void | (() => void);
    if (enabled) {
      void loadInitialData().then((fn) => {
        cleanup = fn;
      });
      return () => {
        if (typeof cleanup === "function") cleanup();
      };
    } else {
      setCoupons([]);
      setMyCoupons([]);
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

        const userCoupon = unwrapApiObject<UserCoupon>(data);
        if (!userCoupon) {
          throw new Error("Resposta inválida ao ativar o cupom.");
        }

        setMyCoupons((prev) => {
          const next = prev.filter((candidate) => candidate.id !== userCoupon.id);
          return [userCoupon, ...next];
        });
        setMyCouponsMap((prev) => ({ ...prev, [couponId]: userCoupon }));
      } catch (error: any) {
        const message = getApiErrorMessage(error, "Não foi possível ativar o cupom.");
        Alert.alert("Erro", message);
        console.error(error?.response?.data ?? error);
      } finally {
        if (mountedRef.current) {
          setProcessingId(null);
        }
      }
    },
    [enabled],
  );

  const availableCoupons = useMemo(() => {
    return buildDisplayCoupons(coupons, myCoupons);
  }, [coupons, myCoupons]);

  const isActiveForMe = useCallback(
    (couponId: number) => !!myCouponsMap[couponId]?.active,
    [myCouponsMap],
  );

  return {
    coupons,
    availableCoupons,
    myCoupons,
    myCouponsMap,
    loading,
    refreshing,
    processingId,
    refresh,
    activateCoupon,
    isActiveForMe,
  };
}
