import { Slot, useRouter, useSegments } from "expo-router";
import { View, ActivityIndicator, Platform } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ThemeProvider, useThemeMode } from "@/context/ThemeContext";
import { CouponsProvider } from "@/context/CouponsContext";
import { LoyaltyProvider } from "@/context/LoyaltyContext";
import { CartProvider } from "@/context/CartContext";
import * as NavigationBar from "expo-navigation-bar";

const AUTH_ROUTE_GROUPS = new Set(["(auth)", "auth"]);
const PROTECTED_ROUTE_GROUPS = new Set(["(tabs)"]);
const PUBLIC_STANDALONE_ROUTE_GROUPS = new Set(["details"]);

function getCurrentRouteGroup(segments: string[]): string | null {
  return segments[0] ?? null;
}

function isAuthRoute(group: string | null): boolean {
  return !!group && AUTH_ROUTE_GROUPS.has(group);
}

function isProtectedRoute(group: string | null): boolean {
  return !!group && PROTECTED_ROUTE_GROUPS.has(group);
}

function isPublicStandaloneRoute(group: string | null): boolean {
  return !!group && PUBLIC_STANDALONE_ROUTE_GROUPS.has(group);
}

function canGuestAccessRoute(group: string | null): boolean {
  return isAuthRoute(group) || isPublicStandaloneRoute(group);
}

function canAuthenticatedUserAccessRoute(group: string | null): boolean {
  return isProtectedRoute(group) || isPublicStandaloneRoute(group);
}

function AuthGuard() {
  const { user, loading } = useAuth();
  const { theme } = useThemeMode();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const currentGroup = getCurrentRouteGroup(segments);

    // 🚫 Usuário não logado → garantir que está no grupo (auth)
    if (!user && !canGuestAccessRoute(currentGroup)) {
      router.replace("/(auth)/login");
      return;
    }

    // ✅ Usuário logado → garantir que está nas tabs
    if (user && !canAuthenticatedUserAccessRoute(currentGroup)) {
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
              <CartProvider>
                <ThemedApp />
              </CartProvider>
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
    // Em edge-to-edge o Android ignora a cor de fundo da navigation bar.
    NavigationBar.setButtonStyleAsync(buttonStyle).catch(() => {});
  }, [mode]);

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
