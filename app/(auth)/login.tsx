import { Colors, Typography } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert("Campos obrigatórios", "Informe o email e a senha.");
      return;
    }

    try {
      setLoading(true);
      await signIn(email, password);
      router.replace("/");
    } catch (error: any) {
      Alert.alert("Erro", error.message || "Falha ao fazer login.");
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
              <Text style={[Typography.title, styles.title]}>Bem-vindo 👋</Text>
              <Text style={[Typography.subtitle, styles.subtitle]}>
                Faça login para continuar
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={Colors.light.textSecondary}
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />

              <TextInput
                style={styles.input}
                placeholder="Senha"
                placeholderTextColor={Colors.light.textSecondary}
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
                  <ActivityIndicator color={Colors.light.background} />
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

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.light.background },
  scrollContainer: { flexGrow: 1, justifyContent: "center" },
  container: { padding: 24 },
  title: { marginBottom: 8, textAlign: "center", color: Colors.light.text },
  subtitle: {
    marginBottom: 32,
    textAlign: "center",
    color: Colors.light.textSecondary,
  },
  input: {
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.tabIconDefault,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    color: Colors.light.text,
  },
  button: {
    backgroundColor: Colors.light.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  buttonText: { color: Colors.light.textLight },
  link: { color: Colors.light.secondary, textAlign: "center", marginTop: 8 },
});
