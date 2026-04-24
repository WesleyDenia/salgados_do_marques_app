import { useEffect, useRef, type ReactNode } from "react";
import { Animated, Easing, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useThemeMode } from "@/context/ThemeContext";

type FeedbackActionScreenProps = {
  eyebrow: string;
  title: string;
  body: string;
  summary?: ReactNode;
  primaryLabel: string;
  secondaryLabel: string;
  onPrimaryPress: () => void;
  onSecondaryPress: () => void;
};

export default function FeedbackActionScreen({
  eyebrow,
  title,
  body,
  summary,
  primaryLabel,
  secondaryLabel,
  onPrimaryPress,
  onSecondaryPress,
}: FeedbackActionScreenProps) {
  const { theme } = useThemeMode();
  const styles = createStyles(theme);
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslateY = useRef(new Animated.Value(18)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(cardTranslateY, {
        toValue: 0,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [cardOpacity, cardTranslateY]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.View
        style={[
          styles.card,
          {
            opacity: cardOpacity,
            transform: [{ translateY: cardTranslateY }],
          },
        ]}
      >
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.body}>{body}</Text>

        {summary ? <View style={styles.summary}>{summary}</View> : null}

        <TouchableOpacity style={styles.primaryButton} onPress={onPrimaryPress}>
          <Text style={styles.primaryButtonText}>{primaryLabel}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={onSecondaryPress}>
          <Text style={styles.secondaryButtonText}>{secondaryLabel}</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

export function FeedbackSummaryText({ children }: { children: ReactNode }) {
  const { theme } = useThemeMode();

  return <Text style={[summaryStyles.text, { color: theme.colors.text }]}>{children}</Text>;
}

const createStyles = (theme: ReturnType<typeof useThemeMode>["theme"]) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.general.screenBackground,
      justifyContent: "center",
      paddingHorizontal: 20,
    },
    card: {
      borderRadius: 20,
      padding: 24,
      backgroundColor: theme.colors.cardBackground,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
      gap: 14,
    },
    eyebrow: {
      fontSize: 12,
      textTransform: "uppercase",
      letterSpacing: 1,
      color: theme.colors.successText,
      fontWeight: "700",
    },
    title: {
      fontSize: 28,
      fontWeight: "800",
      color: theme.colors.text,
    },
    body: {
      fontSize: 15,
      lineHeight: 22,
      color: theme.colors.textSecondary,
    },
    summary: {
      padding: 14,
      borderRadius: 14,
      backgroundColor: theme.general.surface,
      gap: 4,
    },
    primaryButton: {
      marginTop: 4,
      backgroundColor: theme.colors.primary,
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: "center",
    },
    primaryButtonText: {
      color: theme.colors.textLight,
      fontWeight: "700",
      fontSize: 15,
    },
    secondaryButton: {
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: "center",
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
    },
    secondaryButtonText: {
      color: theme.colors.text,
      fontWeight: "600",
      fontSize: 15,
    },
  });

const summaryStyles = StyleSheet.create({
  text: {
    fontSize: 14,
    lineHeight: 19,
  },
});
