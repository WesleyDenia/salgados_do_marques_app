import { useCallback, useState } from "react";

import api from "@/api/api";

type ResetMethod = "whatsapp" | "email";

type ForgotPayload = {
  method: ResetMethod;
  identifier: string;
};

type ForgotResponse = {
  success?: boolean;
  message?: string;
};

const GENERIC_ERROR = "Não foi possível completar a solicitação. Tente novamente.";

export function useForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const send = useCallback(async ({ method, identifier }: ForgotPayload) => {
    setLoading(true);
    setFeedback(null);
    setError(null);

    try {
      const { data } = await api.post<ForgotResponse>("/auth/forgot-password", {
        method,
        identifier,
      });

      const message = data?.message ?? (method === "whatsapp"
        ? "Código enviado via WhatsApp."
        : "Verifique seu e-mail.");

      setFeedback(message);

      return data;
    } catch (err) {
      console.error("Falha ao enviar recuperação de senha", err);
      setError(GENERIC_ERROR);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const resetState = useCallback(() => {
    setFeedback(null);
    setError(null);
  }, []);

  return {
    send,
    loading,
    feedback,
    error,
    resetState,
  };
}
