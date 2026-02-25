import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import styled from "styled-components/native";

import { useForgotPassword } from "@/hooks/useForgotPassword";
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

const ToggleGroup = styled.View`
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing.sm}px;
  margin-bottom: ${({ theme }) => theme.spacing.xl}px;
`;

const MethodButton = styled.TouchableOpacity<{ active: boolean }>`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.lg}px;
  border-radius: ${({ theme }) => theme.radius.md}px;
  border-width: 1px;
  border-color: ${({ theme, active }) =>
    active ? theme.colors.primary : theme.general.borderColor};
  background-color: ${({ theme, active }) =>
    active ? theme.colors.primary : theme.colors.backgroundButton};
`;

const MethodButtonText = styled.Text<{ active: boolean }>`
  text-align: center;
  font-size: 15px;
  font-weight: 600;
  color: ${({ theme, active }) => (active ? theme.colors.textLight : theme.colors.textSecondary)};
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

const InputRow = styled.View`
  flex-direction: row;
  align-items: center;
  border-width: 1px;
  border-color: ${({ theme }) => theme.general.borderColor};
  border-radius: ${({ theme }) => theme.radius.md}px;
  margin-bottom: ${({ theme }) => theme.spacing.lg}px;
  background-color: ${({ theme }) => theme.colors.cardBackground};
`;

const Prefix = styled.Text`
  padding-left: ${({ theme }) => theme.spacing.lg}px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 15px;
  font-weight: 600;
`;

const PhoneInput = styled.TextInput`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.lg}px;
  color: ${({ theme }) => theme.colors.text};
`;

const HelperText = styled.Text`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing.lg}px;
`;

const FeedbackText = styled.Text<{ success?: boolean }>`
  font-size: 14px;
  color: ${({ theme, success }) => (success ? theme.colors.accentSuccess : theme.colors.secondary)};
  margin-top: ${({ theme }) => theme.spacing.sm}px;
  text-align: center;
`;

const SecondaryLink = styled.Text`
  margin-top: ${({ theme }) => theme.spacing.xl}px;
  text-align: center;
  color: ${({ theme }) => theme.colors.secondary};
  font-size: 15px;
  font-weight: 600;
`;

const SubmitButton = styled.TouchableOpacity<{ disabled?: boolean }>`
  margin-top: ${({ theme }) => theme.spacing.md}px;
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

type ResetMethod = "whatsapp" | "email";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { theme } = useThemeMode();
  const [method, setMethod] = useState<ResetMethod>("whatsapp");
  const [identifier, setIdentifier] = useState("");
  const [phoneDigits, setPhoneDigits] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);

  const { send, loading, feedback, error, resetState } = useForgotPassword();

  function formatPhoneDisplay(digits: string) {
    const parts = digits.match(/.{1,3}/g) ?? [];
    return parts.join(" ").trim();
  }

  function normalizePhoneForApi(digits: string) {
    return digits ? `+351${digits}` : "";
  }

  function handlePhoneChange(text: string) {
    const digitsOnly = text.replace(/\D/g, "");
    const withoutPrefix = digitsOnly.startsWith("351") ? digitsOnly.slice(3) : digitsOnly;
    setPhoneDigits(withoutPrefix.slice(0, 9));
    setFieldError(null);
    resetState();
  }

  async function handleSubmit() {
    const trimmed =
      method === "whatsapp"
        ? normalizePhoneForApi(phoneDigits)
        : identifier.trim();

    if (!trimmed) {
      setFieldError(
        method === "whatsapp"
          ? "Digite apenas os 9 dígitos do WhatsApp para continuar."
          : "Informe o e-mail cadastrado para continuar."
      );
      return;
    }

    if (method === "whatsapp" && phoneDigits.length !== 9) {
      setFieldError("Digite os 9 dígitos do WhatsApp (sem +351).");
      return;
    }

    try {
      setFieldError(null);
      const response = await send({ method, identifier: trimmed });

      const message =
        response?.message ??
        (method === "whatsapp"
          ? "Código enviado via WhatsApp."
          : "Verifique seu e-mail para continuar.");

      if (method === "whatsapp") {
        router.push({
          pathname: "/(auth)/verify-otp",
          params: { phone: trimmed },
        });
      }
    } catch (err: any) {
      Alert.alert("Erro", getApiErrorMessage(err, "Não foi possível enviar sua solicitação. Tente novamente."));
    }
  }

  function handleSelect(nextMethod: ResetMethod) {
    if (method !== nextMethod) {
      setMethod(nextMethod);
      setIdentifier("");
      setPhoneDigits("");
      setFieldError(null);
      resetState();
    }
  }

  return (
    <Container>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Content keyboardShouldPersistTaps="handled">
          <Title>Recuperar acesso</Title>
          <Subtitle>Escolha como prefere receber o código ou link de redefinição.</Subtitle>

          <ToggleGroup>
            <MethodButton active={method === "whatsapp"} onPress={() => handleSelect("whatsapp")}>
              <MethodButtonText active={method === "whatsapp"}>WhatsApp</MethodButtonText>
            </MethodButton>

            <MethodButton active={method === "email"} onPress={() => handleSelect("email")}>
              <MethodButtonText active={method === "email"}>E-mail</MethodButtonText>
            </MethodButton>
          </ToggleGroup>

          <HelperText>
            {method === "whatsapp"
              ? "Digite apenas os 9 dígitos do seu WhatsApp. O prefixo +351 será adicionado automaticamente."
              : "Enviaremos um link seguro para o e-mail informado."}
          </HelperText>

          {method === "whatsapp" ? (
            <InputRow>
              <Prefix>+351</Prefix>
              <PhoneInput
                placeholder="999 999 999"
                placeholderTextColor={theme.colors.placeholderText}
                keyboardType="phone-pad"
                autoCapitalize="none"
                value={formatPhoneDisplay(phoneDigits)}
                onChangeText={handlePhoneChange}
                autoCorrect={false}
                textContentType="telephoneNumber"
              />
            </InputRow>
          ) : (
            <Input
              placeholder="E-mail cadastrado"
              placeholderTextColor={theme.colors.placeholderText}
              keyboardType="email-address"
              autoCapitalize="none"
              value={identifier}
              onChangeText={(text) => {
                setIdentifier(text);
                setFieldError(null);
                resetState();
              }}
              autoCorrect={false}
              textContentType="emailAddress"
            />
          )}

          {fieldError ? <FeedbackText>{fieldError}</FeedbackText> : null}

          <SubmitButton onPress={handleSubmit} disabled={loading}>
            {loading ? (
              <ActivityIndicator color={theme.colors.textLight} />
            ) : (
              <SubmitText>Enviar código / link</SubmitText>
            )}
          </SubmitButton>

          {feedback && <FeedbackText success>{feedback}</FeedbackText>}
          {error && <FeedbackText>{error}</FeedbackText>}

          <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
            <SecondaryLink>Voltar para login</SecondaryLink>
          </TouchableOpacity>
        </Content>
      </KeyboardAvoidingView>
    </Container>
  );
}
