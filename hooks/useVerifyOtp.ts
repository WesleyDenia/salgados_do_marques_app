import { useCallback, useState } from "react";

import api from "@/api/api";

type VerifyOtpPayload = {
  phone: string;
  token: string;
  newPassword: string;
};

type VerifyOtpResponse = {
  success?: boolean;
  message?: string;
};

const GENERIC_ERROR = "Não foi possível confirmar o código. Tente novamente.";

export function useVerifyOtp() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verify = useCallback(async ({ phone, token, newPassword }: VerifyOtpPayload) => {
    setLoading(true);
    setError(null);

    try {
      const { data } = await api.post<VerifyOtpResponse>("/auth/verify-otp", {
        phone,
        token,
        new_password: newPassword,
      });

      return data;
    } catch (err: any) {
      console.error("Falha ao validar OTP", err);
      setError(err?.response?.data?.message ?? GENERIC_ERROR);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    verify,
    loading,
    error,
  };
}
