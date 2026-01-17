import DateTimePicker, {
  DateTimePickerAndroid,
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useEffect, useMemo, useState } from "react";
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
import { Typography, AppTheme } from "@/constants/theme";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import api from "@/api/api";
import { Calendar } from "lucide-react-native";
import { getApiErrorMessage } from "@/utils/errorMessage";
import { useThemeMode } from "@/context/ThemeContext";

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const { theme } = useThemeMode();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [nif, setNif] = useState("");
  const [phoneDigits, setPhoneDigits] = useState("");
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

  const isValidEmail = (value: string) => /\S+@\S+\.\S+/.test(value.trim());
  const normalizeDigits = (value: string) => value.replace(/\D/g, "");

  function formatPhoneDisplay(digits: string) {
    const chunks = digits.match(/.{1,3}/g) ?? [];
    const formatted = chunks.join(" ").trim();
    return formatted ? `+351 ${formatted}` : "+351 ";
  }

  function validatePasswordStrength(value: string): string | null {
    if (value.length < 8) return "A senha deve ter pelo menos 8 caracteres.";
    if (!/[A-Za-z]/.test(value) || !/[0-9]/.test(value)) {
      return "Use letras e números para deixar a senha mais forte.";
    }
    return null;
  }

  async function handleRegister() {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedConfirm = confirm.trim();
    const phoneDigitsOnly = normalizeDigits(phoneDigits);
    const birthDateValue = birthDate.trim();

    if (!trimmedName || !trimmedEmail || !trimmedPassword || !trimmedConfirm || !phoneDigitsOnly) {
      Alert.alert("Campos obrigatórios", "Preencha todos os campos obrigatórios.");
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      Alert.alert("Email inválido", "Informe um email válido para continuar.");
      return;
    }

    if (phoneDigitsOnly.length < 9) {
      Alert.alert("Telefone inválido", "Informe o telefone completo com indicativo.");
      return;
    }

    const passwordError = validatePasswordStrength(trimmedPassword);
    if (passwordError) {
      Alert.alert("Senha fraca", passwordError);
      return;
    }

    if (trimmedPassword !== trimmedConfirm) {
      Alert.alert("Erro", "As senhas não coincidem.");
      return;
    }

    if (birthDateValue && birthDateValue.length < 10) {
      Alert.alert("Data inválida", "Use o formato YYYY-MM-DD para a data de nascimento.");
      return;
    }

    const nifDigits = normalizeDigits(nif);
    if (nifDigits && nifDigits.length !== 9) {
      Alert.alert("NIF inválido", "O NIF deve ter 9 dígitos.");
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
        name: trimmedName,
        email: trimmedEmail,
        password: trimmedPassword,
        password_confirmation: trimmedConfirm,
        nif: nifDigits || undefined,
        phone: `+351${phoneDigitsOnly}`,
        birth_date: birthDateValue || null,
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
      console.error("Erro ao registrar", error?.response?.status, error?.response?.data ?? error);
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
                placeholderTextColor={theme.colors.textSecondary}
                value={name}
                onChangeText={setName}
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
                placeholder="Telefone"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="phone-pad"
                value={formatPhoneDisplay(phoneDigits)}
                onChangeText={(text) => {
                  const digitsOnly = normalizeDigits(text).replace(/^351/, "");
                  setPhoneDigits(digitsOnly.slice(0, 9));
                }}
                textContentType="telephoneNumber"
              />

              <TextInput
                style={styles.input}
                placeholder="NIF (opcional)"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="numeric"
                value={nif}
                onChangeText={setNif}
              />

              <View style={styles.dateInputContainer}>
                <TextInput
                  style={[styles.input, styles.dateInput]}
                  placeholder="Data de nascimento (YYYY-MM-DD)"
                  placeholderTextColor={theme.colors.textSecondary}
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
                  <Calendar color={theme.colors.textSecondary} size={20} />
                </TouchableOpacity>
              </View>

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

              <TextInput
                style={styles.input}
                placeholder="Confirmar Senha"
                placeholderTextColor={theme.colors.textSecondary}
                autoCapitalize="none"
                autoCorrect={false}
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
                    <ActivityIndicator size="small" color={theme.colors.primary} />
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
                  <ActivityIndicator color={theme.colors.textLight} />
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

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.general.screenBackground },
    scrollContainer: { flexGrow: 1, justifyContent: "center" },
    container: { padding: 24 },
    title: { marginBottom: 8, textAlign: "center", color: theme.colors.text },
    subtitle: { marginBottom: 32, textAlign: "center", color: theme.colors.textSecondary },
    input: {
      backgroundColor: theme.colors.cardBackground,
      borderWidth: 1,
      borderColor: theme.colors.tabIconDefault,
      borderRadius: 8,
      padding: 12,
      marginBottom: 16,
      color: theme.colors.text,
    },
    button: {
      backgroundColor: theme.colors.primary,
      borderRadius: 8,
      padding: 16,
      alignItems: "center",
      marginBottom: 16,
    },
    buttonText: { color: theme.colors.textLight },
    link: { color: theme.colors.secondary, textAlign: "center" },
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
    termsError: { color: theme.colors.secondary },
    checkboxContainer: { flexDirection: "row", alignItems: "center" },
    checkbox: {
      width: 22,
      height: 22,
      borderRadius: 4,
      borderWidth: 1,
      borderColor: theme.colors.tabIconDefault,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
      backgroundColor: theme.colors.cardBackground,
    },
    checkboxChecked: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    checkboxMark: {
      color: theme.colors.textLight,
      fontWeight: "bold",
    },
    checkboxLabel: { flex: 1, color: theme.colors.textSecondary },
    linkText: { color: theme.colors.primary, textDecorationLine: "underline" },
    termsFeedback: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 8,
    },
    feedbackText: {
      color: theme.colors.textSecondary,
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
      backgroundColor: theme.colors.cardBackground,
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
      color: theme.colors.text,
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
      borderColor: theme.colors.tabIconDefault,
      alignItems: "center",
    },
    modalActionPrimary: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    modalActionText: { color: theme.colors.text },
    modalActionPrimaryText: { color: theme.colors.textLight },
  });
