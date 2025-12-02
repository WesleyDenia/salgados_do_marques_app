import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import styled from "styled-components/native";

import api from "@/api/api";
import { useThemeMode } from "@/context/ThemeContext";
import { getApiErrorMessage } from "@/utils/errorMessage";

const Container = styled(SafeAreaView)`
  flex: 1;
  background-color: ${({ theme }) => theme.general.screenBackground};
`;

const Content = styled.ScrollView`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.xxl}px;
`;

const Title = styled.Text`
  font-size: 24px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.sm}px;
`;

const Subtitle = styled.Text`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl}px;
`;

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

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { theme } = useThemeMode();
  const params = useLocalSearchParams<{ token?: string }>();
  const token = typeof params.token === "string" ? params.token : "";

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleReset() {
    const trimmedPassword = password.trim();

    if (!token) {
      Alert.alert("Link inválido", "O link de redefinição é inválido ou expirou.");
      return;
    }

    if (!trimmedPassword) {
      Alert.alert("Nova senha", "Informe a nova senha para continuar.");
      return;
    }

    try {
      setLoading(true);
      const { data } = await api.post("/auth/reset-password", {
        token,
        new_password: trimmedPassword,
      });

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
      Alert.alert("Ops!", message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Content keyboardShouldPersistTaps="handled">
          <Title>Definir nova senha</Title>
          <Subtitle>
            Digite a nova senha para finalizar a recuperação de acesso ao aplicativo.
          </Subtitle>

          <View>
            <Input
              placeholder="Nova senha"
              placeholderTextColor={theme.colors.placeholderText}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              textContentType="newPassword"
              autoCapitalize="none"
            />
          </View>

          <SubmitButton onPress={handleReset} disabled={loading}>
            {loading ? (
              <ActivityIndicator color={theme.colors.textLight} />
            ) : (
              <SubmitText>Salvar nova senha</SubmitText>
            )}
          </SubmitButton>

          {!token && <TokenAlert>O token de redefinição não foi encontrado.</TokenAlert>}
        </Content>
      </KeyboardAvoidingView>
    </Container>
  );
}
