import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors, Typography } from "@/constants/theme";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import api from "@/api/api";

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [nif, setNif] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [termsLoading, setTermsLoading] = useState(true);
  const [termsError, setTermsError] = useState<string | null>(null);
  const [lgpdAccepted, setLgpdAccepted] = useState(false);
  const [lgpdTerms, setLgpdTerms] = useState<{
    content: string;
    hash: string;
    version: string;
  } | null>(null);

  useEffect(() => {
    let active = true;

    async function loadTerms() {
      try {
        const { data } = await api.get("/lgpd/terms");
        if (!active) return;
        setLgpdTerms({
          content: data.content ?? "",
          hash: data.hash,
          version: data.version ?? data.updated_at ?? new Date().toISOString(),
        });
        setTermsError(null);
      } catch (error: any) {
        console.error("Falha ao carregar termo LGPD", error);
        if (active) {
          setTermsError("Não foi possível carregar o termo LGPD. Tente novamente mais tarde.");
        }
      } finally {
        if (active) setTermsLoading(false);
      }
    }

    loadTerms();
    return () => {
      active = false;
    };
  }, []);

  async function handleRegister() {
    if (!name || !email || !password || !confirm || !phone) {
      Alert.alert("Campos obrigatórios", "Preencha todos os campos obrigatórios.");
      return;
    }

    if (password !== confirm) {
      Alert.alert("Erro", "As senhas não coincidem.");
      return;
    }

    if (termsLoading) {
      Alert.alert("Aguarde", "Carregando termo LGPD. Tente novamente em instantes.");
      return;
    }

    if (!lgpdTerms || termsError) {
      Alert.alert(
        "Termo indisponível",
        "Não foi possível carregar o termo LGPD. Verifique sua conexão e tente novamente."
      );
      return;
    }

    if (!lgpdAccepted) {
      Alert.alert("Consentimento necessário", "É preciso aceitar o termo LGPD para continuar.");
      return;
    }

    try {
      setLoading(true);
      await register({
        name,
        email,
        password,
        password_confirmation: confirm,
        nif,
        phone,
        birth_date: birthDate || null,
        lgpd: {
          accepted: true,
          version: lgpdTerms.version,
          hash: lgpdTerms.hash,
          channel: Platform.OS === "ios" ? "mobile-ios" : "mobile-android",
        },
      });

      Alert.alert("🎉 Conta criada!", "Bem-vindo à Salgados do Marquês!");
      router.replace("/");
    } catch (error: any) {
      Alert.alert("Erro", error.message || "Falha ao registrar.");
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
              <Text style={[Typography.title, styles.title]}>Criar Conta</Text>
              <Text style={[Typography.subtitle, styles.subtitle]}>
                Preencha os dados para registrar
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Nome"
                placeholderTextColor={Colors.light.textSecondary}
                value={name}
                onChangeText={setName}
              />

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
                placeholder="Telefone"
                placeholderTextColor={Colors.light.textSecondary}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />

              <TextInput
                style={styles.input}
                placeholder="NIF (opcional)"
                placeholderTextColor={Colors.light.textSecondary}
                keyboardType="numeric"
                value={nif}
                onChangeText={setNif}
              />

              <TextInput
                style={styles.input}
                placeholder="Data de nascimento (YYYY-MM-DD)"
                placeholderTextColor={Colors.light.textSecondary}
                keyboardType="numbers-and-punctuation"
                value={birthDate}
                onChangeText={setBirthDate}
              />

              <TextInput
                style={styles.input}
                placeholder="Senha"
                placeholderTextColor={Colors.light.textSecondary}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />

              <TextInput
                style={styles.input}
                placeholder="Confirmar Senha"
                placeholderTextColor={Colors.light.textSecondary}
                secureTextEntry
                value={confirm}
                onChangeText={setConfirm}
              />

              <View style={styles.termsContainer}>
                <TouchableOpacity
                  style={styles.checkboxContainer}
                  activeOpacity={0.7}
                  onPress={() => setLgpdAccepted((prev) => !prev)}
                >
                  <View style={[styles.checkbox, lgpdAccepted && styles.checkboxChecked]}>
                    {lgpdAccepted && <Text style={styles.checkboxMark}>✓</Text>}
                  </View>
                  <Text style={styles.checkboxLabel}>
                    Li e aceito os{" "}
                    <Text
                      style={styles.linkText}
                      onPress={(event) => {
                        event.stopPropagation();
                        router.push("/details/legal/privacy");
                      }}
                    >
                      termos de privacidade
                    </Text>
                  </Text>
                </TouchableOpacity>
                {termsLoading && (
                  <View style={styles.termsFeedback}>
                    <ActivityIndicator size="small" color={Colors.light.primary} />
                    <Text style={styles.feedbackText}>Carregando termo...</Text>
                  </View>
                )}
                {termsError && !termsLoading && (
                  <Text style={styles.termsError}>{termsError}</Text>
                )}
              </View>

              <TouchableOpacity
                style={[
                  styles.button,
                  (loading || !lgpdAccepted || termsLoading || !!termsError) && { opacity: 0.6 },
                ]}
                onPress={handleRegister}
                disabled={loading || !lgpdAccepted || termsLoading || !!termsError}
              >
                {loading ? (
                  <ActivityIndicator color={Colors.light.background} />
                ) : (
                  <Text style={[Typography.button, styles.buttonText]}>Registrar</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={() => router.push("/login")}>
                <Text style={styles.link}>Já tem conta? Faça login</Text>
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
  subtitle: { marginBottom: 32, textAlign: "center", color: Colors.light.textSecondary },
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
  link: { color: Colors.light.secondary, textAlign: "center" },
  termsContainer: { marginTop: 8, marginBottom: 24 },
  termsError: { color: "#B00020" },
  checkboxContainer: { flexDirection: "row", alignItems: "center" },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.light.tabIconDefault,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    backgroundColor: Colors.light.background,
  },
  checkboxChecked: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  checkboxMark: {
    color: Colors.light.textLight,
    fontWeight: "bold",
  },
  checkboxLabel: { flex: 1, color: Colors.light.textSecondary },
  linkText: { color: Colors.light.primary, textDecorationLine: "underline" },
  termsFeedback: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  feedbackText: {
    color: Colors.light.textSecondary,
    fontSize: 12,
    marginLeft: 8,
  },
});
