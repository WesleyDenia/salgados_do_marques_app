import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import styledNative from "styled-components/native";

import api from "@/api/api";
import { useThemeMode } from "@/context/ThemeContext";
import { getApiErrorMessage } from "@/utils/errorMessage";
import AuthScreenLayout from "@/components/auth/AuthScreenLayout";
import { ResetPasswordResponse } from "@/types";
import { unwrapApiObject } from "@/utils/apiResponse";
import { getInteractiveFieldColors } from "@/components/ui/InteractiveField";

const Input = styledNative.TextInput<{ $focused?: boolean; $error?: boolean }>`
  border-width: 1px;
  border-color: ${({ theme, $focused, $error }) => {
    const colors = getInteractiveFieldColors(theme);
    if ($error) return theme.colors.errorText;
    if ($focused) return colors.inputBorderFocus;
    return colors.inputBorder;
  }};
  border-radius: ${({ theme }) => theme.radius.md}px;
  padding: ${({ theme }) => theme.spacing.lg}px;
  color: ${({ theme }) => theme.colors.inputText};
  background-color: ${({ theme }) => theme.colors.inputSurface};
`;

const SubmitButton = styledNative.TouchableOpacity<{ disabled?: boolean }>`
  margin-top: ${({ theme }) => theme.spacing.xl}px;
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

const TokenAlert = styledNative.Text`
  text-align: center;
  color: ${({ theme }) => theme.colors.warningText};
  margin-top: ${({ theme }) => theme.spacing.xl}px;
  font-size: 14px;
`;

const InlineError = styledNative.Text`
  margin-top: ${({ theme }) => theme.spacing.md}px;
  text-align: center;
  color: ${({ theme }) => theme.colors.errorText};
  font-size: 14px;
`;

const HelperText = styledNative.Text`
  margin-top: ${({ theme }) => theme.spacing.xs}px;
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

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { theme } = useThemeMode();
  const params = useLocalSearchParams<{ token?: string }>();
  const token = typeof params.token === "string" ? params.token : "";

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

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
              $focused={isPasswordFocused}
              $error={!!formError}
              placeholder="Nova senha"
              placeholderTextColor={theme.colors.inputPlaceholder}
              secureTextEntry
              value={password}
              onChangeText={(value) => {
                setPassword(value);
                if (formError) setFormError(null);
              }}
              textContentType="newPassword"
              autoCapitalize="none"
              onFocus={() => setIsPasswordFocused(true)}
              onBlur={() => setIsPasswordFocused(false)}
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
