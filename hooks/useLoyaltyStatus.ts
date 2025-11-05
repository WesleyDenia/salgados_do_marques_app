import { useEffect, useState, useCallback, useRef } from "react";
import api from "@/api/api";
import { LoyaltyStatus } from "@/types";

export function useLoyaltyStatus() {
  const [data, setData] = useState<LoyaltyStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchStatus = useCallback(async () => {
    if (!isMounted.current) return;
    try {
      setLoading(true);
      const res = await api.get<{ data: LoyaltyStatus }>("/loyalty/summary");
      const payload = res.data.data;
      const milestones = Array.isArray(payload.milestones)
        ? [...new Set(payload.milestones)].sort((a, b) => a - b)
        : [];

      if (!isMounted.current) return;

      setData({
        ...payload,
        milestones,
        rewards: payload.rewards ?? [],
      });
      setError(null);
    } catch (e: any) {
      if (!isMounted.current) return;
      setError(e?.response?.data?.message || "Erro ao carregar fidelidade");
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return { data, loading, error, refetch: fetchStatus };
}
