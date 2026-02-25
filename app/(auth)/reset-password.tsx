import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import styled from "styled-components/native";

import api from "@/api/api";
import { useThemeMode } from "@/context/ThemeContext";
import { getApiErrorMessage } from "@/utils/errorMessage";
import AuthScreenLayout from "@/components/auth/AuthScreenLayout";
import { ResetPasswordResponse } from "@/types";
import { unwrapApiObject } from "@/utils/apiResponse";

const Input = styled.TextInput`
  border-width: 1px;
  border-color: ${({ theme }) => theme.general.borderColor};
  border-radius: ${({ theme }) => theme.radius.md}px;
  padding: ${({ theme }) => theme.spacing.lg}px;
  color: ${({ theme }) => theme.colors.text};
  background-color: ${({ theme }) => theme.colors.cardBackground};
`;

const SubmitButton = styled.TouchableOpacity<{ disabled?: boolean }>`
  margin-top: ${({ theme }) => theme.spacing.xl}px;
  padding: ${({ theme }) => theme.spacing.lg}px;
  border-radius: ${({ theme }) => theme.radius.md}px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme, disabled }) =>
    disabled ? theme.colors.disabledBackground : theme.colors.primary};
`;

const SubmitText = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textLight};
`;

const TokenAlert = styled.Text`
  text-align: center;
  color: ${({ theme }) => theme.colors.secondary};
  margin-top: ${({ theme }) => theme.spacing.xl}px;
  font-size: 14px;
`;

const InlineError = styled.Text`
  margin-top: ${({ theme }) => theme.spacing.md}px;
  text-align: center;
  color: ${({ theme }) => theme.colors.secondary};
  font-size: 14px;
`;

const HelperText = styled.Text`
  margin-top: ${({ theme }) => theme.spacing.xs}px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 13px;
  line-height: 18px;
`;

const StepCallout = styled.View`
  margin-bottom: ${({ theme }) => theme.spacing.lg}px;
  padding: ${({ theme }) => theme.spacing.md}px;
  border-radius: ${({ theme }) => theme.radius.md}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.general.borderColor};
  background-color: ${({ theme }) => theme.general.surface};
`;

const StepCalloutTitle = styled.Text`
  font-size: 14px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.xs}px;
`;

const StepCalloutText = styled.Text`
  font-size: 13px;
  line-height: 18px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { theme } = useThemeMode();
  const params = useLocalSearchParams<{ token?: string }>();
  const token = typeof params.token === "string" ? params.token : "";

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleReset() {
    const trimmedPassword = password.trim();

    if (!token) {
      setFormError("O link de redefinição é inválido ou expirou.");
      return;
    }

    if (!trimmedPassword) {
      setFormError("Informe a nova senha para continuar.");
      return;
    }

    if (trimmedPassword.length < 8) {
      setFormError("A nova senha deve ter pelo menos 8 caracteres.");
      return;
    }

    try {
      setFormError(null);
      setLoading(true);
      const response = await api.post<ResetPasswordResponse>("/auth/reset-password", {
        token,
        new_password: trimmedPassword,
      });
      const data = unwrapApiObject<ResetPasswordResponse>(response.data);

      const message = data?.message ?? "Senha redefinida com sucesso!";

      Alert.alert("Tudo certo!", message, [
        {
          text: "Ir para login",
          onPress: () => router.replace("/(auth)/login"),
        },
      ]);
    } catch (error: any) {
      const message = getApiErrorMessage(
        error,
        "Não foi possível redefinir a senha. Tente novamente."
      );
      setFormError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthScreenLayout
      title="Definir nova senha"
      subtitle="Digite a nova senha para finalizar a recuperação de acesso ao aplicativo."
    >
          <StepCallout>
            <StepCalloutTitle>Último passo</StepCalloutTitle>
            <StepCalloutText>
              Defina uma nova senha para concluir a recuperação e voltar para o login.
            </StepCalloutText>
          </StepCallout>

          <View>
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
              autoCapitalize="none"
            />
            <HelperText>Use pelo menos 8 caracteres para uma senha mais segura.</HelperText>
          </View>

          {formError ? <InlineError>{formError}</InlineError> : null}

          <SubmitButton onPress={handleReset} disabled={loading}>
            {loading ? (
              <ActivityIndicator color={theme.colors.textLight} />
            ) : (
              <SubmitText>Salvar nova senha</SubmitText>
            )}
          </SubmitButton>

          {!token && <TokenAlert>O token de redefinição não foi encontrado.</TokenAlert>}
    </AuthScreenLayout>
  );
}
