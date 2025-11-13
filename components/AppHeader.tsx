import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useRouter, useSegments } from "expo-router";
import { ArrowLeft, User } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeMode } from "@/context/ThemeContext";
import { useLoyalty } from "@/context/LoyaltyContext";

type AppHeaderProps = {
  onBack?: () => void;
};

export default function AppHeader({ onBack }: AppHeaderProps = {}) {
  const router = useRouter();
  const segments = useSegments() as string[];
  const insets = useSafeAreaInsets();
  const { theme } = useThemeMode();

  const { data, loading } = useLoyalty();

  const root = segments?.[0];
  const second = segments?.[1];
  const isHome = root === "(tabs)" && (!second || second === "index");

  const points = data?.points ?? 0;

  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: theme.colors.primary,
          paddingTop: insets.top + 10,
        },
      ]}
    >
      {/* Esquerda */}
      {isHome ? (
        <TouchableOpacity onPress={() => router.push("/(tabs)/profile")}>
          <User size={26} color={theme.colors.textLight} />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={() => (onBack ? onBack() : router.back())}>
          <ArrowLeft size={26} color={theme.colors.textLight} />
        </TouchableOpacity>
      )}

      {/* Logo central */}
      <View style={styles.logoContainer}>
        <Image
          source={require("@/assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Coinxinhas à direita */}
      <TouchableOpacity onPress={() => router.push("/(tabs)/loyalty")}>
        <View style={styles.coinxinhasContainer}>
          <Image
            source={require("@/assets/icons/coinxinha.png")}
            style={styles.coinxinhaIcon}
          />
          {loading ? (
            <ActivityIndicator color={theme.colors.textLight} size="small" />
          ) : (
            <Text style={[styles.coinxinhasText, { color: theme.colors.textLight }]}>
              {points}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    height: 100,
  },
  logoContainer: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [
      { translateX: -43 },
      { translateY: 20 },
    ],
  },
  logo: {
    width: 120,
    height: 45,
  },
  coinxinhasContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff33",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  coinxinhaIcon: {
    width: 30,
    height: 30,
    marginRight: 4,
  },
  coinxinhasText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
