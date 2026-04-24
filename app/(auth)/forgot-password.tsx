import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import styledNative from "styled-components/native";

import { useForgotPassword } from "@/hooks/useForgotPassword";
import { useThemeMode } from "@/context/ThemeContext";
import { getApiErrorMessage } from "@/utils/errorMessage";
import AuthScreenLayout from "@/components/auth/AuthScreenLayout";
import { getInteractiveFieldColors } from "@/components/ui/InteractiveField";

const ToggleGroup = styledNative.View`
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing.sm}px;
  margin-bottom: ${({ theme }) => theme.spacing.xl}px;
`;

const MethodButton = styledNative.TouchableOpacity<{ active: boolean }>`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.lg}px;
  border-radius: ${({ theme }) => theme.radius.md}px;
  border-width: 1px;
  border-color: ${({ theme, active }) =>
    active ? theme.colors.inputLikeBorderActive : theme.colors.inputLikeBorder};
  background-color: ${({ theme, active }) =>
    active ? theme.colors.inputLikeSurface : theme.colors.surfaceElevated};
`;

const MethodButtonText = styledNative.Text<{ active: boolean }>`
  text-align: center;
  font-size: 15px;
  font-weight: 600;
  color: ${({ theme, active }) => (active ? theme.colors.inputText : theme.colors.textSecondary)};
`;

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
  margin-bottom: ${({ theme }) => theme.spacing.lg}px;
  color: ${({ theme }) => theme.colors.inputText};
  background-color: ${({ theme }) => theme.colors.inputSurface};
`;

const InputRow = styledNative.View<{ $focused?: boolean; $error?: boolean }>`
  flex-direction: row;
  align-items: center;
  border-width: 1px;
  border-color: ${({ theme, $focused, $error }) => {
    const colors = getInteractiveFieldColors(theme);
    if ($error) return theme.colors.errorText;
    if ($focused) return colors.inputBorderFocus;
    return colors.inputBorder;
  }};
  border-radius: ${({ theme }) => theme.radius.md}px;
  margin-bottom: ${({ theme }) => theme.spacing.lg}px;
  background-color: ${({ theme }) => theme.colors.inputSurface};
`;

const Prefix = styledNative.Text`
  padding-left: ${({ theme }) => theme.spacing.lg}px;
  color: ${({ theme }) => theme.colors.inputPlaceholder};
  font-size: 15px;
  font-weight: 600;
`;

const PhoneInput = styledNative.TextInput`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.lg}px;
  color: ${({ theme }) => theme.colors.inputText};
`;

const HelperText = styledNative.Text`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing.lg}px;
`;

const FeedbackText = styledNative.Text<{ success?: boolean }>`
  font-size: 14px;
  color: ${({ theme, success }) => (success ? theme.colors.successText : theme.colors.errorText)};
  margin-top: ${({ theme }) => theme.spacing.sm}px;
  text-align: center;
`;

const SecondaryLink = styledNative.Text`
  margin-top: ${({ theme }) => theme.spacing.xl}px;
  text-align: center;
  color: ${({ theme }) => theme.colors.link};
  font-size: 15px;
  font-weight: 600;
`;

const SubmitButton = styledNative.TouchableOpacity<{ disabled?: boolean }>`
  margin-top: ${({ theme }) => theme.spacing.md}px;
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

type ResetMethod = "whatsapp" | "email";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { theme } = useThemeMode();
  const [method, setMethod] = useState<ResetMethod>("whatsapp");
  const [identifier, setIdentifier] = useState("");
  const [phoneDigits, setPhoneDigits] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [isPhoneFocused, setIsPhoneFocused] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);

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
      await send({ method, identifier: trimmed });

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
    <AuthScreenLayout
      title="Recuperar acesso"
      subtitle="Escolha como prefere receber o código ou link de redefinição."
    >

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
            <InputRow $focused={isPhoneFocused} $error={!!fieldError}>
              <Prefix>+351</Prefix>
              <PhoneInput
                placeholder="999 999 999"
                placeholderTextColor={theme.colors.inputPlaceholder}
                keyboardType="phone-pad"
                autoCapitalize="none"
                value={formatPhoneDisplay(phoneDigits)}
                onChangeText={handlePhoneChange}
                autoCorrect={false}
                textContentType="telephoneNumber"
                onFocus={() => setIsPhoneFocused(true)}
                onBlur={() => setIsPhoneFocused(false)}
              />
            </InputRow>
          ) : (
            <Input
              $focused={isEmailFocused}
              $error={!!fieldError}
              placeholder="E-mail cadastrado"
              placeholderTextColor={theme.colors.inputPlaceholder}
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
              onFocus={() => setIsEmailFocused(true)}
              onBlur={() => setIsEmailFocused(false)}
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
    </AuthScreenLayout>
  );
}
