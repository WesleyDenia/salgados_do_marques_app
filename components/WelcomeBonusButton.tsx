import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Image,
} from "react-native";
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useThemeMode } from "@/context/ThemeContext";
import { AppTheme } from "@/constants/theme";

export default function WelcomeBonusButton({
  onBonusActivated,
}: {
  onBonusActivated?: () => void;
}) {
  const { user } = useAuth();
  const [loadingBonus, setLoadingBonus] = useState(false);
  const [pulseAnim] = useState(new Animated.Value(1));
  const { theme } = useThemeMode();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const displayName = user?.name ?? "visitante";

  // ✨ animação pulsante do botão (caixa de presente)
  useEffect(() => {
    if (!user?.loyalty_synced) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 700,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 700,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [user?.loyalty_synced]);

  async function handleActivateBonus() {
    if (loadingBonus) return;
    setLoadingBonus(true);
    onBonusActivated?.(); // 🔥 chama o callback para tocar a animação
    setLoadingBonus(false);
  }

  if (user?.loyalty_synced) {
    return <Text style={styles.greetingText}>Olá, {displayName}!</Text>;
  }

  return (
    <View style={styles.container}>
      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        <TouchableOpacity
          onPress={handleActivateBonus}
          disabled={loadingBonus}
          activeOpacity={0.8}
        >
          <Image
            source={require("@/assets/images/presente.png")}
            style={[styles.giftImage, loadingBonus && { opacity: 0.6 }]}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </Animated.View>

      <Text style={styles.labelText}>
        {loadingBonus ? "Ativando..." : "Toque para abrir seu presente 🎁"}
      </Text>
    </View>
  );
}


const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      alignItems: "center",
      justifyContent: "center",
      marginVertical: theme.spacing.lg,
      backgroundColor: theme.general.surface,
    },
    giftImage: {
      width: 120,
      height: 120,
    },
    labelText: {
      marginTop: theme.spacing.sm,
      color: theme.colors.text,
      fontWeight: "600",
      fontSize: 15,
      textAlign: "center",
    },
    greetingText: {
      marginTop: theme.spacing.lg,
      color: theme.colors.text,
      fontWeight: "600",
      textAlign: "left",
      
      marginLeft: theme.spacing.md,
      fontSize: 22,
    },
  });
