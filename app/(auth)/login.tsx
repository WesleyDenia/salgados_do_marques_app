import { useMemo, useState } from "react";
import { Typography, AppTheme } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Alert,
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
   const { theme } = useThemeMode();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const isValidEmail = (value: string) => /\S+@\S+\.\S+/.test(value.trim());

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Campos obrigatórios", "Informe o email e a senha.");
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert("Email inválido", "Informe um email válido para continuar.");
      return;
    }

    try {
      setLoading(true);
      await signIn(email, password);
      router.replace("/");
    } catch (error: any) {
      Alert.alert("Erro", getApiErrorMessage(error, "Falha ao fazer login."));
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

              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={theme.colors.textSecondary}
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />

              <TextInput
                style={styles.input}
                placeholder="Senha"
                placeholderTextColor={theme.colors.textSecondary}
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />

              <TouchableOpacity
                style={[styles.button, loading && { opacity: 0.6 }]}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={theme.colors.textLight} />
                ) : (
                  <Text style={[Typography.button, styles.buttonText]}>Entrar</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={() => router.push("/(auth)/forgot-password")}>
                <Text style={styles.link}>Esqueci minha senha</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => router.push("/register")}>
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
      marginBottom: 16,
      resizeMode: "contain",
    },
    subtitle: {
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
