import { useCallback, useState } from "react";

import api from "@/api/api";
import { getApiErrorMessage } from "@/utils/errorMessage";
import { ForgotPasswordPayload, ForgotPasswordResponse } from "@/types";
import { unwrapApiObject } from "@/utils/apiResponse";

const GENERIC_ERROR = "Não foi possível completar a solicitação. Tente novamente.";

export function useForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const send = useCallback(async ({ method, identifier }: ForgotPasswordPayload) => {
    setLoading(true);
    setFeedback(null);
    setError(null);

    try {
      const response = await api.post<ForgotPasswordResponse>("/auth/forgot-password", {
        method,
        identifier,
      });
      const data = unwrapApiObject<ForgotPasswordResponse>(response.data);

      const message = data?.message ?? (method === "whatsapp"
        ? "Código enviado via WhatsApp."
        : "Verifique seu e-mail.");

      setFeedback(message);

      return data;
    } catch (err) {
      console.error("Falha ao enviar recuperação de senha", err);
      const message = getApiErrorMessage(err, GENERIC_ERROR);
      setError(message);
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
