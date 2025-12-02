import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import styled from "styled-components/native";

import { useVerifyOtp } from "@/hooks/useVerifyOtp";
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
  margin-bottom: ${({ theme }) => theme.spacing.lg}px;
  color: ${({ theme }) => theme.colors.text};
  background-color: ${({ theme }) => theme.colors.cardBackground};
`;

const OtpInput = styled(Input)`
  text-align: center;
  font-size: 22px;
  letter-spacing: 6px;
`;

const SubmitButton = styled.TouchableOpacity<{ disabled?: boolean }>`
  margin-top: ${({ theme }) => theme.spacing.lg}px;
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

const ErrorText = styled.Text`
  margin-top: ${({ theme }) => theme.spacing.lg}px;
  text-align: center;
  color: ${({ theme }) => theme.colors.secondary};
  font-size: 14px;
`;

const SecondaryLink = styled.Text`
  margin-top: ${({ theme }) => theme.spacing.xl}px;
  text-align: center;
  color: ${({ theme }) => theme.colors.secondary};
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

    if (!trimmedPhone || !trimmedToken || trimmedToken.length !== 6 || !trimmedPassword) {
      Alert.alert("Campos obrigatórios", "Preencha número, código e nova senha.");
      return;
    }

    try {
      const response = await verify({
        phone: trimmedPhone,
        token: trimmedToken,
        newPassword: trimmedPassword,
      });

      const message = response?.message ?? "Senha redefinida com sucesso!";

      Alert.alert("Tudo certo!", message, [
        {
          text: "Ir para login",
          onPress: () => router.replace("/(auth)/login"),
        },
      ]);
    } catch (err: any) {
      const message = getApiErrorMessage(err, error ?? "Código inválido ou expirado.");
      Alert.alert("Atenção", message);
    }
  }

  return (
    <Container>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Content keyboardShouldPersistTaps="handled">
          <Title>Validar código</Title>
          <Subtitle>Insira o código recebido no WhatsApp e defina uma nova senha.</Subtitle>

          <Input
            placeholder="Número do WhatsApp (+351900123456)"
            placeholderTextColor={theme.colors.placeholderText}
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            textContentType="telephoneNumber"
            autoCapitalize="none"
          />

          <OtpInput
            placeholder="000000"
            placeholderTextColor={theme.colors.placeholderText}
            keyboardType="number-pad"
            maxLength={6}
            value={token}
            onChangeText={setToken}
            textContentType="oneTimeCode"
            autoCapitalize="none"
          />

          <Input
            placeholder="Nova senha"
            placeholderTextColor={theme.colors.placeholderText}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            textContentType="newPassword"
          />

          <SubmitButton onPress={handleVerify} disabled={loading}>
            {loading ? (
              <ActivityIndicator color={theme.colors.textLight} />
            ) : (
              <SubmitText>Redefinir senha</SubmitText>
            )}
          </SubmitButton>

          {error && <ErrorText>{error}</ErrorText>}

          <TouchableOpacity onPress={() => router.push("/(auth)/forgot-password")}>
            <SecondaryLink>Reenviar código</SecondaryLink>
          </TouchableOpacity>
        </Content>
      </KeyboardAvoidingView>
    </Container>
  );
}
