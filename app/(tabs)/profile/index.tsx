import { useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
  ScrollView,
  Switch,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Edit3 } from "lucide-react-native";
import { useAuth } from "@/context/AuthContext";
import { useThemeMode } from "@/context/ThemeContext";
import { AppTheme } from "@/constants/theme";
import api from "@/api/api";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut, loading, updateUser } = useAuth();
  const { theme, mode, setMode } = useThemeMode();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const barStyle = mode === "dark" ? "light-content" : "dark-content";
  const [updatingTheme, setUpdatingTheme] = useState(false);

  const handleToggleTheme = useCallback(
    async (value: boolean) => {
      if (!user) return;
      const previousMode = mode;
      const newMode = value ? "dark" : "light";
      setMode(newMode);
      setUpdatingTheme(true);
      try {
        const { data } = await api.put("/user", { theme: newMode });
        await updateUser(data.data ?? data);
      } catch (error) {
        console.error("Erro ao atualizar tema:", error);
        setMode(previousMode);
        Alert.alert("Erro", "Não foi possível atualizar o tema agora.");
      } finally {
        setUpdatingTheme(false);
      }
    },
    [mode, setMode, updateUser, user]
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Não foi possível carregar o perfil.</Text>
      </View>
    );
  }

  return (
    <View style={styles.safeArea}>
      <StatusBar backgroundColor={theme.colors.primary} barStyle={barStyle} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.infoBox}>
          <Text style={styles.label}>Nome</Text>
          <Text style={styles.value}>{user.name}</Text>

          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{user.email}</Text>

          <Text style={styles.label}>Telefone</Text>
          <Text style={styles.value}>{user.phone || "—"}</Text>

          <Text style={styles.label}>Data de nascimento</Text>
          <Text style={styles.value}>{user.birth_date || "—"}</Text>

          <Text style={styles.label}>NIF</Text>
          <Text style={styles.value}>{user.nif || "—"}</Text>

          <Text style={styles.label}>Morada</Text>
          <Text style={styles.value}>
            {user.street
              ? `${user.street}, ${user.city ?? ""} ${user.postal_code ?? ""}`
              : "—"}
          </Text>
        </View>

        <View style={styles.preferencesBox}>

          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>
              {mode === "dark" ? "Modo escuro" : "Modo claro"}
            </Text>
            <Switch
              value={mode === "dark"}
              onValueChange={handleToggleTheme}
              disabled={updatingTheme}
              trackColor={{
                false: theme.colors.icon,
                true: theme.colors.icon,
              }}
              thumbColor={theme.colors.textLight}
              ios_backgroundColor={theme.colors.border}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={() =>
            router.push({
              pathname: "/(tabs)/profile/edit",
              params: { user: JSON.stringify(user) },
            })
          }
        >
          <Edit3 size={18} color={theme.colors.textLight} />
          <Text style={styles.buttonText}>Editar Perfil</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={signOut}
        >
          <Text style={styles.secondaryButtonText}>Sair</Text>
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
    infoBox: {
      backgroundColor: theme.general.surface,
      padding: theme.spacing.lg,
      borderRadius: theme.radius.md,
      marginBottom: theme.spacing.lg,
      borderWidth: 1,
      borderColor: theme.general.borderColor,
    },
    preferencesBox: {
      backgroundColor: theme.general.surface,
      padding: theme.spacing.lg,
      borderRadius: theme.radius.md,
      marginBottom: theme.spacing.lg,
      borderWidth: 1,
      borderColor: theme.general.borderColor,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.text,
    },
    toggleRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: theme.spacing.md,
    },
    toggleLabel: {
      fontSize: 16,
      fontWeight: "500",
      color: theme.colors.text,
    },
    toggleDescription: {
      marginTop: theme.spacing.sm,
      color: theme.colors.textSecondary,
      fontSize: 13,
      lineHeight: 18,
    },
    label: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.sm,
    },
    value: {
      fontSize: 16,
      fontWeight: "500",
      color: theme.colors.text,
      marginTop: theme.spacing.xs,
    },
    button: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: theme.spacing.md,
      borderRadius: theme.radius.md,
      marginBottom: theme.spacing.md,
      gap: theme.spacing.sm,
    },
    primaryButton: {
      backgroundColor: theme.colors.primary,
    },
    secondaryButton: {
      backgroundColor: theme.colors.disabledBackground,
    },
    buttonText: {
      color: theme.colors.textLight,
      fontWeight: "600",
    },
    secondaryButtonText: {
      color: theme.colors.text,
      fontWeight: "600",
    },
    centered: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.general.screenBackground,
    },
    errorText: {
      color: theme.colors.text,
      fontSize: 16,
    },
  });
