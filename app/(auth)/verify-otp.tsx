import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import styledNative from "styled-components/native";

import { useVerifyOtp } from "@/hooks/useVerifyOtp";
import { useThemeMode } from "@/context/ThemeContext";
import { getApiErrorMessage } from "@/utils/errorMessage";
import AuthScreenLayout from "@/components/auth/AuthScreenLayout";

const Input = styledNative.TextInput`
  border-width: 1px;
  border-color: ${({ theme }) => theme.general.borderColor};
  border-radius: ${({ theme }) => theme.radius.md}px;
  padding: ${({ theme }) => theme.spacing.lg}px;
  margin-bottom: ${({ theme }) => theme.spacing.lg}px;
  color: ${({ theme }) => theme.colors.text};
  background-color: ${({ theme }) => theme.colors.cardBackground};
`;

const OtpInput = styledNative(Input)`
  text-align: center;
  font-size: 22px;
  letter-spacing: 6px;
`;

const SubmitButton = styledNative.TouchableOpacity<{ disabled?: boolean }>`
  margin-top: ${({ theme }) => theme.spacing.lg}px;
  padding: ${({ theme }) => theme.spacing.lg}px;
  border-radius: ${({ theme }) => theme.radius.md}px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme, disabled }) =>
    disabled ? theme.colors.disabledBackground : theme.colors.primary};
`;

const SubmitText = styledNative.Text`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textLight};
`;

const ErrorText = styledNative.Text`
  margin-top: ${({ theme }) => theme.spacing.lg}px;
  text-align: center;
  color: ${({ theme }) => theme.colors.errorText};
  font-size: 14px;
`;

const HelperText = styledNative.Text`
  margin-top: ${({ theme }) => theme.spacing.xs}px;
  margin-bottom: ${({ theme }) => theme.spacing.lg}px;
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 13px;
  line-height: 18px;
`;

const StepCallout = styledNative.View`
  margin-bottom: ${({ theme }) => theme.spacing.lg}px;
  padding: ${({ theme }) => theme.spacing.md}px;
  border-radius: ${({ theme }) => theme.radius.md}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.general.borderColor};
  background-color: ${({ theme }) => theme.general.surfaceElevated};
`;

const StepCalloutTitle = styledNative.Text`
  font-size: 14px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.xs}px;
`;

const StepCalloutText = styledNative.Text`
  font-size: 13px;
  line-height: 18px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const SecondaryLink = styledNative.Text`
  margin-top: ${({ theme }) => theme.spacing.xl}px;
  text-align: center;
  color: ${({ theme }) => theme.colors.link};
  font-size: 15px;
  font-weight: 600;
`;

export default function VerifyOtpScreen() {
  const router = useRouter();
  const { theme } = useThemeMode();
  const params = useLocalSearchParams<{ phone?: string }>();
  const initialPhone = typeof params.phone === "string" ? params.phone : "";

  const [phone, setPhone] = useState(initialPhone);
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const { verify, loading, error } = useVerifyOtp();

  useEffect(() => {
    if (initialPhone) {
      setPhone(initialPhone);
    }
  }, [initialPhone]);

  async function handleVerify() {
    const trimmedPhone = phone.trim();
    const trimmedToken = token.trim();
    const trimmedPassword = password.trim();

    if (!trimmedPhone) {
      setFormError("Informe o número do WhatsApp para validar o código.");
      return;
    }

    if (!trimmedToken) {
      setFormError("Informe o código de 6 dígitos recebido.");
      return;
    }

    if (trimmedToken.length !== 6) {
      setFormError("O código deve ter 6 dígitos.");
      return;
    }

    if (!trimmedPassword) {
      setFormError("Informe a nova senha para concluir.");
      return;
    }

    try {
      setFormError(null);
      const response = await verify({
        phone: trimmedPhone,
        token: trimmedToken,
        newPassword: trimmedPassword,
      });

      const message = response?.message ?? "Senha redefinida com sucesso!";
      router.replace({
        pathname: "/(auth)/login",
        params: { resetSuccess: "1", message },
      });
    } catch (err: any) {
      const message = getApiErrorMessage(err, error ?? "Código inválido ou expirado.");
      setFormError(message);
    }
  }

  return (
    <AuthScreenLayout
      title="Validar código"
      subtitle="Insira o código recebido no WhatsApp e defina uma nova senha."
    >
          <StepCallout>
            <StepCalloutTitle>Próximo passo</StepCalloutTitle>
            <StepCalloutText>
              Informe o WhatsApp, digite o código de 6 dígitos recebido e defina a nova senha para concluir.
            </StepCalloutText>
          </StepCallout>

          <Input
            placeholder="Número do WhatsApp (+351900123456)"
            placeholderTextColor={theme.colors.placeholderText}
            keyboardType="phone-pad"
            value={phone}
            onChangeText={(value) => {
              setPhone(value);
              if (formError) setFormError(null);
            }}
            textContentType="telephoneNumber"
            autoCapitalize="none"
          />

          <OtpInput
            placeholder="000000"
            placeholderTextColor={theme.colors.placeholderText}
            keyboardType="number-pad"
            maxLength={6}
            value={token}
            onChangeText={(value) => {
              setToken(value.replace(/\D/g, ""));
              if (formError) setFormError(null);
            }}
            textContentType="oneTimeCode"
            autoCapitalize="none"
          />
          <HelperText>Digite exatamente 6 dígitos do código enviado.</HelperText>

          <Input
            placeholder="Nova senha"
            placeholderTextColor={theme.colors.placeholderText}
            secureTextEntry
            value={password}
            onChangeText={(value) => {
              setPassword(value);
              if (formError) setFormError(null);
            }}
            textContentType="newPassword"
          />

          {formError ? <ErrorText>{formError}</ErrorText> : null}

          <SubmitButton onPress={handleVerify} disabled={loading}>
            {loading ? (
              <ActivityIndicator color={theme.colors.textLight} />
            ) : (
              <SubmitText>Redefinir senha</SubmitText>
            )}
          </SubmitButton>

          {error && !formError ? <ErrorText>{error}</ErrorText> : null}

          <TouchableOpacity onPress={() => router.push("/(auth)/forgot-password")}>
            <SecondaryLink>Não recebeu? Reenviar código</SecondaryLink>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
            <SecondaryLink>Voltar para login</SecondaryLink>
          </TouchableOpacity>
    </AuthScreenLayout>
  );
}
