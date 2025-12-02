import DateTimePicker, {
  DateTimePickerAndroid,
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
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
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors, Typography } from "@/constants/theme";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import api from "@/api/api";
import { Calendar } from "lucide-react-native";
import { getApiErrorMessage } from "@/utils/errorMessage";

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
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());

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

  function formatDate(date: Date) {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function parseBirthDate(value: string) {
    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  }

  function handleBirthDateChange(rawValue: string) {
    const digitsOnly = rawValue.replace(/\D/g, "").slice(0, 8);

    if (digitsOnly.length <= 4) {
      setBirthDate(digitsOnly);
      return;
    }

    if (digitsOnly.length <= 6) {
      setBirthDate(`${digitsOnly.slice(0, 4)}-${digitsOnly.slice(4)}`);
      return;
    }

    setBirthDate(
      `${digitsOnly.slice(0, 4)}-${digitsOnly.slice(4, 6)}-${digitsOnly.slice(6)}`
    );
  }

  function openDatePicker() {
    const current = birthDate ? parseBirthDate(birthDate) : new Date();

    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: current,
        mode: "date",
        maximumDate: new Date(),
        onChange: (_event, selectedDate) => {
          if (selectedDate) {
            setBirthDate(formatDate(selectedDate));
          }
        },
      });
      return;
    }

    setTempDate(current);
    setShowDatePicker(true);
  }

  function handleIosDateChange(_event: DateTimePickerEvent, selectedDate?: Date) {
    if (selectedDate) {
      setTempDate(selectedDate);
    }
  }

  function confirmIosDate() {
    setBirthDate(formatDate(tempDate));
    setShowDatePicker(false);
  }

  function cancelIosDate() {
    setShowDatePicker(false);
  }

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
      Alert.alert("Erro", getApiErrorMessage(error, "Falha ao registrar."));
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

              <View style={styles.dateInputContainer}>
                <TextInput
                  style={[styles.input, styles.dateInput]}
                  placeholder="Data de nascimento (YYYY-MM-DD)"
                  placeholderTextColor={Colors.light.textSecondary}
                  keyboardType="numbers-and-punctuation"
                  value={birthDate}
                  onChangeText={handleBirthDateChange}
                />
                <TouchableOpacity
                  style={styles.calendarButton}
                  onPress={openDatePicker}
                  accessibilityRole="button"
                  accessibilityLabel="Selecionar data de nascimento no calendário"
                >
                  <Calendar color={Colors.light.textSecondary} size={20} />
                </TouchableOpacity>
              </View>

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
      {Platform.OS === "ios" && (
        <Modal transparent visible={showDatePicker} animationType="fade">
          <View style={styles.modalWrapper}>
            <TouchableWithoutFeedback onPress={cancelIosDate}>
              <View style={styles.modalOverlay} />
            </TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Selecione a data</Text>
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="spinner"
                maximumDate={new Date()}
                locale="pt-PT"
                onChange={handleIosDateChange}
              />
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.modalAction} onPress={cancelIosDate}>
                  <Text style={styles.modalActionText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalAction, styles.modalActionPrimary]}
                  onPress={confirmIosDate}
                >
                  <Text style={[styles.modalActionText, styles.modalActionPrimaryText]}>
                    Confirmar
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
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
  dateInputContainer: {
    position: "relative",
    marginBottom: 16,
  },
  dateInput: { marginBottom: 0, paddingRight: 44 },
  calendarButton: {
    position: "absolute",
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    paddingHorizontal: 4,
  },
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
  modalWrapper: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalContent: {
    margin: 24,
    backgroundColor: Colors.light.background,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  modalTitle: {
    ...Typography.subtitle,
    textAlign: "center",
    marginBottom: 8,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    columnGap: 12,
  },
  modalAction: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.tabIconDefault,
    alignItems: "center",
  },
  modalActionPrimary: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  modalActionText: { color: Colors.light.text },
  modalActionPrimaryText: { color: Colors.light.textLight },
});
