import React, { createContext, useContext } from "react";

import { useCouponsData } from "@/hooks/useCouponsData";
import { useAuth } from "@/context/AuthContext";

const CouponsContext = createContext<ReturnType<typeof useCouponsData> | null>(null);

export function CouponsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const coupons = useCouponsData({ enabled: Boolean(user) });

  return <CouponsContext.Provider value={coupons}>{children}</CouponsContext.Provider>;
}

export function useCoupons() {
  const ctx = useContext(CouponsContext);
  if (!ctx) {
    throw new Error("useCoupons deve ser usado dentro de CouponsProvider");
  }
  return ctx;
}
