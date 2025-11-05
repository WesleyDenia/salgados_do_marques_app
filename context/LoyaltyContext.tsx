import React, { createContext, useContext } from "react";
import { useLoyaltyStatus } from "@/hooks/useLoyaltyStatus";

const LoyaltyContext = createContext<ReturnType<typeof useLoyaltyStatus> | null>(null);

export function LoyaltyProvider({ children }: { children: React.ReactNode }) {
  const loyalty = useLoyaltyStatus();
  return <LoyaltyContext.Provider value={loyalty}>{children}</LoyaltyContext.Provider>;
}

export function useLoyalty() {
  const ctx = useContext(LoyaltyContext);
  if (!ctx) throw new Error("useLoyalty deve ser usado dentro de LoyaltyProvider");
  return ctx;
}
