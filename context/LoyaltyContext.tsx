import React, { createContext, useContext, useMemo, useCallback } from "react";
import { useLoyaltyStatus } from "@/hooks/useLoyaltyStatus";
import api from "@/api/api";
import { useAuth } from "@/context/AuthContext";

type LoyaltyContextValue = ReturnType<typeof useLoyaltyStatus> & {
  claimWelcomeBonus: () => Promise<void>;
};

const LoyaltyContext = createContext<LoyaltyContextValue | null>(null);

export function LoyaltyProvider({ children }: { children: React.ReactNode }) {
  const loyalty = useLoyaltyStatus();
  const { updateUser } = useAuth();

  const claimWelcomeBonus = useCallback(async () => {
    await api.post("/loyalty/welcome-bonus");
    await loyalty.refetch();
    await updateUser({ loyalty_synced: true });
  }, [loyalty, updateUser]);

  const value = useMemo(
    () => ({
      ...loyalty,
      claimWelcomeBonus,
    }),
    [claimWelcomeBonus, loyalty],
  );

  return <LoyaltyContext.Provider value={value}>{children}</LoyaltyContext.Provider>;
}

export function useLoyalty() {
  const ctx = useContext(LoyaltyContext);
  if (!ctx) throw new Error("useLoyalty deve ser usado dentro de LoyaltyProvider");
  return ctx;
}
