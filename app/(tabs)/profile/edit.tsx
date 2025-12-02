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

export default function ProfileEditScreen() {
  const router = useRouter();
  const { updateUser, user: authUser } = useAuth();
  const { theme, mode } = useThemeMode();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const barStyle = mode === "dark" ? "light-content" : "dark-content";
  const [form, setForm] = useState<Partial<User>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
          style={styles.input}
          placeholder="Nome"
          placeholderTextColor={theme.colors.textSecondary}
          value={form.name || ""}
          onChangeText={(v) => handleChange("name", v)}
        />
        <TextInput
          style={styles.input}
          placeholder="Telefone"
          placeholderTextColor={theme.colors.textSecondary}
          keyboardType="phone-pad"
          value={form.phone || ""}
          onChangeText={(v) => handleChange("phone", v)}
        />
        <TextInput
          style={styles.input}
          placeholder="Data de nascimento (YYYY-MM-DD)"
          placeholderTextColor={theme.colors.textSecondary}
          value={form.birth_date || ""}
          onChangeText={(v) => handleChange("birth_date", v)}
        />
        <TextInput
          style={styles.input}
          placeholder="NIF"
          placeholderTextColor={theme.colors.textSecondary}
          value={form.nif || ""}
          onChangeText={(v) => handleChange("nif", v)}
        />
        <TextInput
          style={styles.input}
          placeholder="Rua"
          placeholderTextColor={theme.colors.textSecondary}
          value={form.street || ""}
          onChangeText={(v) => handleChange("street", v)}
        />
        <TextInput
          style={styles.input}
          placeholder="Cidade"
          placeholderTextColor={theme.colors.textSecondary}
          value={form.city || ""}
          onChangeText={(v) => handleChange("city", v)}
        />
        <TextInput
          style={styles.input}
          placeholder="Código Postal"
          placeholderTextColor={theme.colors.textSecondary}
          value={form.postal_code || ""}
          onChangeText={(v) => handleChange("postal_code", v)}
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
      backgroundColor: theme.general.surface,
      borderColor: theme.general.borderColor,
      borderWidth: 1,
      borderRadius: theme.radius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
      color: theme.colors.text,
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
