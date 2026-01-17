import { Slot, useRouter, useSegments } from "expo-router";
import { View, ActivityIndicator, Platform } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ThemeProvider, useThemeMode } from "@/context/ThemeContext";
import { CouponsProvider } from "@/context/CouponsContext";
import { LoyaltyProvider } from "@/context/LoyaltyContext";
import * as NavigationBar from "expo-navigation-bar";

function AuthGuard() {
  const { user, loading } = useAuth();
  const { theme } = useThemeMode();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const currentGroup = segments[0];
    const inAuthGroup = currentGroup === "(auth)" || currentGroup === "auth";
    const inTabsGroup = currentGroup === "(tabs)";
    const allowedStandaloneGroups = ["details"]; // rotas acessíveis fora das tabs
    const inAllowedStandalone = currentGroup
      ? allowedStandaloneGroups.includes(currentGroup)
      : false;

    // 🚫 Usuário não logado → garantir que está no grupo (auth)
    if (!user && !inAuthGroup && !inAllowedStandalone) {
      router.replace("/(auth)/login");
      return;
    }

    // ✅ Usuário logado → garantir que está nas tabs
    if (user && !inTabsGroup && !inAllowedStandalone) {
      router.replace("/(tabs)");
      return;
    }
  }, [user, loading, segments, router]);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.general.screenBackground,
        }}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return <Slot />;
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <AuthProvider>
          <LoyaltyProvider>
            <CouponsProvider>
              <ThemedApp />
            </CouponsProvider>
          </LoyaltyProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}

function ThemedApp() {
  const { mode, theme } = useThemeMode();

  useEffect(() => {
    if (Platform.OS !== "android") return;

    const buttonStyle = mode === "dark" ? "light" : "dark";
    // Edge-to-edge habilitado no Android ignora background; evitamos warning com try/catch.
    NavigationBar.setButtonStyleAsync(buttonStyle).catch(() => {});
    NavigationBar.setBackgroundColorAsync(theme.general.screenBackground).catch(() => {});
  }, [mode, theme.general.screenBackground]);

  return (
    <>
      <AuthGuard />
      <StatusBar
        style={mode === "dark" ? "light" : "dark"}
        backgroundColor={theme.general.screenBackground}
      />
    </>
  );
}
