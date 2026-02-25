import { useMemo, useRef, useState } from "react";
import { Typography, AppTheme } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getApiErrorMessage } from "@/utils/errorMessage";
import { useThemeMode } from "@/context/ThemeContext";

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const { theme } = useThemeMode();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const passwordInputRef = useRef<TextInput>(null);

  const isValidEmail = (value: string) => /\S+@\S+\.\S+/.test(value.trim());

  async function handleLogin() {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    let hasError = false;

    setEmailError(null);
    setPasswordError(null);
    setFormError(null);

    if (!trimmedEmail) {
      setEmailError("Informe o email.");
      hasError = true;
    } else if (!isValidEmail(trimmedEmail)) {
      setEmailError("Informe um email válido para continuar.");
      hasError = true;
    }

    if (!trimmedPassword) {
      setPasswordError("Informe a senha.");
      hasError = true;
    }

    if (hasError) {
      return;
    }

    try {
      setLoading(true);
      await signIn(trimmedEmail, trimmedPassword);
      router.replace("/");
    } catch (error: any) {
      setFormError(getApiErrorMessage(error, "Falha ao fazer login."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.container}>
              <Image
                source={require("@/assets/images/logo_icon.png")}
                style={styles.logo}
              />

              <Text style={[Typography.title, styles.title]}>Entrar</Text>
              <Text style={[Typography.subtitle, styles.subtitle]}>
                Acesse sua conta para acompanhar encomendas, cupons e Coinxinhas.
              </Text>

              <TextInput
                style={[styles.input, emailError && styles.inputError]}
                placeholder="Email"
                placeholderTextColor={theme.colors.textSecondary}
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={(value) => {
                  setEmail(value);
                  if (emailError) setEmailError(null);
                  if (formError) setFormError(null);
                }}
                autoCorrect={false}
                textContentType="emailAddress"
                returnKeyType="next"
                onSubmitEditing={() => passwordInputRef.current?.focus()}
                accessibilityLabel="Email"
                accessibilityHint="Digite o email da sua conta"
              />
              {emailError ? <Text style={styles.inlineError}>{emailError}</Text> : null}

              <TextInput
                ref={passwordInputRef}
                style={[styles.input, passwordError && styles.inputError]}
                placeholder="Senha"
                placeholderTextColor={theme.colors.textSecondary}
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry
                value={password}
                onChangeText={(value) => {
                  setPassword(value);
                  if (passwordError) setPasswordError(null);
                  if (formError) setFormError(null);
                }}
                textContentType="password"
                returnKeyType="go"
                onSubmitEditing={() => {
                  void handleLogin();
                }}
                accessibilityLabel="Senha"
                accessibilityHint="Digite a senha para entrar na sua conta"
              />
              {passwordError ? <Text style={styles.inlineError}>{passwordError}</Text> : null}

              {formError ? <Text style={styles.formError}>{formError}</Text> : null}

              <TouchableOpacity
                style={[styles.button, loading && { opacity: 0.6 }]}
                onPress={handleLogin}
                disabled={loading}
                accessibilityRole="button"
                accessibilityLabel="Entrar"
                accessibilityHint="Faz login na sua conta"
                accessibilityState={{ disabled: loading, busy: loading }}
              >
                {loading ? (
                  <ActivityIndicator color={theme.colors.textLight} />
                ) : (
                  <Text style={[Typography.button, styles.buttonText]}>Entrar</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push("/(auth)/forgot-password")}
                accessibilityRole="button"
                accessibilityLabel="Esqueci minha senha"
                accessibilityHint="Abre o fluxo de recuperação de senha"
              >
                <Text style={styles.link}>Esqueci minha senha</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push("/register")}
                accessibilityRole="button"
                accessibilityLabel="Registrar nova conta"
                accessibilityHint="Abre a tela de cadastro"
              >
                <Text style={styles.link}>Não tem conta? Registre-se</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.colors.primary },
    scrollContainer: { flexGrow: 1, justifyContent: "center" },
    container: { padding: 24 },
    logo: {
      width: 180,
      height: 180,
      alignSelf: "center",
      marginBottom: 8,
      resizeMode: "contain",
    },
    title: {
      textAlign: "center",
      color: theme.colors.textLight,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 14,
      marginBottom: 32,
      textAlign: "center",
      color: theme.colors.textLight,
    },
    input: {
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.tabIconDefault,
      borderRadius: 8,
      padding: 12,
      marginBottom: 16,
      color: theme.colors.text,
    },
    inputError: {
      borderColor: theme.colors.secondary,
    },
    inlineError: {
      color: theme.colors.textLight,
      marginTop: -10,
      marginBottom: 12,
      fontSize: 12,
    },
    formError: {
      color: theme.colors.textLight,
      backgroundColor: "#00000022",
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      marginBottom: 16,
      textAlign: "center",
      fontSize: 13,
    },
    button: {
      backgroundColor: theme.colors.secondary,
      borderRadius: 8,
      padding: 16,
      alignItems: "center",
      marginBottom: 16,
    },
    buttonText: { color: theme.colors.textLight },
    link: { color: theme.colors.textLight, textAlign: "center", marginTop: 8 },
  });
