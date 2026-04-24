import { useEffect, useMemo, useState } from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
  Alert,
  ScrollView,
} from "react-native";
import { Save } from "lucide-react-native";
import api from "@/api/api";
import { useAuth } from "@/context/AuthContext";
import { useThemeMode } from "@/context/ThemeContext";
import { AppTheme } from "@/constants/theme";
import { User } from "@/types";
import { getApiErrorMessage } from "@/utils/errorMessage";
import { getInteractiveFieldStyles } from "@/components/ui/InteractiveField";

export default function ProfileEditScreen() {
  const router = useRouter();
  const { updateUser, user: authUser } = useAuth();
  const { theme, mode } = useThemeMode();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const barStyle = mode === "dark" ? "light-content" : "dark-content";
  const [form, setForm] = useState<Partial<User>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const getInputStyle = (field: string) => [
    styles.input,
    focusedField === field && styles.inputFocused,
  ];

  useEffect(() => {
    if (authUser) {
      setForm(authUser);
    }
    setLoading(false);
  }, [authUser]);

  const handleChange = (field: keyof User, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!form.name || !form.phone) {
      Alert.alert("Atenção", "Nome e telefone são obrigatórios.");
      return;
    }

    setSaving(true);
    try {
      const { data } = await api.put("/user", form);
      await updateUser(data.data ?? data);
      Alert.alert("Sucesso", "Perfil atualizado!");
      router.back();
    } catch (error: any) {
      console.error("Erro ao atualizar:", error.response?.data || error);
      Alert.alert("Erro", getApiErrorMessage(error, "Não foi possível atualizar os dados."));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!authUser) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: theme.colors.text }}>Não foi possível carregar os dados.</Text>
      </View>
    );
  }

  return (
    <View style={styles.safeArea}>
      <StatusBar backgroundColor={theme.colors.primary} barStyle={barStyle} />

      <ScrollView contentContainerStyle={styles.content}>
        <TextInput
          style={getInputStyle("name")}
          placeholder="Nome"
          placeholderTextColor={theme.colors.inputPlaceholder}
          value={form.name || ""}
          onChangeText={(v) => handleChange("name", v)}
          onFocus={() => setFocusedField("name")}
          onBlur={() => setFocusedField(null)}
        />
        <TextInput
          style={getInputStyle("phone")}
          placeholder="Telefone"
          placeholderTextColor={theme.colors.inputPlaceholder}
          keyboardType="phone-pad"
          value={form.phone || ""}
          onChangeText={(v) => handleChange("phone", v)}
          onFocus={() => setFocusedField("phone")}
          onBlur={() => setFocusedField(null)}
        />
        <TextInput
          style={getInputStyle("birth_date")}
          placeholder="Data de nascimento (YYYY-MM-DD)"
          placeholderTextColor={theme.colors.inputPlaceholder}
          value={form.birth_date || ""}
          onChangeText={(v) => handleChange("birth_date", v)}
          onFocus={() => setFocusedField("birth_date")}
          onBlur={() => setFocusedField(null)}
        />
        <TextInput
          style={getInputStyle("nif")}
          placeholder="NIF"
          placeholderTextColor={theme.colors.inputPlaceholder}
          value={form.nif || ""}
          onChangeText={(v) => handleChange("nif", v)}
          onFocus={() => setFocusedField("nif")}
          onBlur={() => setFocusedField(null)}
        />
        <TextInput
          style={getInputStyle("street")}
          placeholder="Rua"
          placeholderTextColor={theme.colors.inputPlaceholder}
          value={form.street || ""}
          onChangeText={(v) => handleChange("street", v)}
          onFocus={() => setFocusedField("street")}
          onBlur={() => setFocusedField(null)}
        />
        <TextInput
          style={getInputStyle("city")}
          placeholder="Cidade"
          placeholderTextColor={theme.colors.inputPlaceholder}
          value={form.city || ""}
          onChangeText={(v) => handleChange("city", v)}
          onFocus={() => setFocusedField("city")}
          onBlur={() => setFocusedField(null)}
        />
        <TextInput
          style={getInputStyle("postal_code")}
          placeholder="Código Postal"
          placeholderTextColor={theme.colors.inputPlaceholder}
          value={form.postal_code || ""}
          onChangeText={(v) => handleChange("postal_code", v)}
          onFocus={() => setFocusedField("postal_code")}
          onBlur={() => setFocusedField(null)}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color={theme.colors.textLight} />
          ) : (
            <>
              <Save size={18} color={theme.colors.textLight} />
              <Text style={styles.buttonText}>Salvar Alterações</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.general.screenBackground,
    },
    content: {
      padding: theme.spacing.lg,
      backgroundColor: theme.general.screenBackground,
    },
    input: {
      ...getInteractiveFieldStyles(theme, { variant: "input", state: "default" }),
      borderRadius: theme.radius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
      color: theme.colors.inputText,
    },
    inputFocused: {
      ...getInteractiveFieldStyles(theme, { variant: "input", state: "focus" }),
    },
    button: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: theme.spacing.md,
      borderRadius: theme.radius.md,
      gap: theme.spacing.sm,
      backgroundColor: theme.colors.primary,
    },
    buttonText: {
      color: theme.colors.textLight,
      fontWeight: "600",
    },
    centered: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.general.screenBackground,
    },
  });
