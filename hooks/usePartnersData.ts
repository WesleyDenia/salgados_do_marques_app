import { useCallback, useEffect, useRef, useState } from "react";

import api from "@/api/api";
import type { Partner, UserCoupon } from "@/types";
import { getApiErrorMessage } from "@/utils/errorMessage";
import { unwrapApiList, unwrapApiObject } from "@/utils/apiResponse";

export function usePartnersData() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchPartners = useCallback(async (signal?: AbortSignal) => {
    const response = await api.get("/partners", { signal });
    const nextPartners = unwrapApiList<Partner>(response.data).sort((left, right) =>
      left.name.localeCompare(right.name, "pt")
    );

    if (!mountedRef.current) return;

    setPartners(nextPartners);
    setError(null);
  }, []);

  const refresh = useCallback(async () => {
    const controller = new AbortController();
    setRefreshing(true);
    try {
      await fetchPartners(controller.signal);
    } catch (error) {
      if ((error as Error)?.name !== "AbortError" && mountedRef.current) {
        setError(getApiErrorMessage(error, "Não foi possível carregar os parceiros."));
      }
    } finally {
      if (mountedRef.current) {
        setRefreshing(false);
      }
    }
  }, [fetchPartners]);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      setLoading(true);
      try {
        await fetchPartners(controller.signal);
      } catch (error) {
        if ((error as Error)?.name !== "AbortError" && mountedRef.current) {
          setError(getApiErrorMessage(error, "Não foi possível carregar os parceiros."));
        }
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    })();

    return () => controller.abort();
  }, [fetchPartners]);

  const getPartnerById = useCallback(async (id: number, signal?: AbortSignal) => {
    const response = await api.get(`/partners/${id}`, { signal });
    return unwrapApiObject<Partner>(response.data);
  }, []);

  const validatePartnerCode = useCallback(async (code: string) => {
    setSubmitting(true);
    try {
      const response = await api.post("/partner-campaigns/validate", { code });
      const userCoupon = unwrapApiObject<UserCoupon>(response.data);

      if (!userCoupon) {
        throw new Error("Resposta inválida ao validar o código.");
      }

      setError(null);
      return userCoupon;
    } catch (error) {
      const message = getApiErrorMessage(error, "Não foi possível validar o código.");
      setError(message);
      throw new Error(message);
    } finally {
      if (mountedRef.current) {
        setSubmitting(false);
      }
    }
  }, []);

  return {
    partners,
    loading,
    refreshing,
    submitting,
    error,
    refresh,
    getPartnerById,
    validatePartnerCode,
  };
}
