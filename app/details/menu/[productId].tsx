import { useMemo } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
} from "react-native";

import { useLocalSearchParams, useRouter } from "expo-router";
import Markdown from "react-native-markdown-display";

import { useThemeMode } from "@/context/ThemeContext";
import AppHeader from "@/components/AppHeader";
import { LoyaltyProvider } from "@/context/LoyaltyContext";

export default function ProductDetailScreen() {
  const router = useRouter();
  const { theme, mode } = useThemeMode();
  const params = useLocalSearchParams<{
    productId?: string;
    name?: string;
    description?: string;
    imageUrl?: string;
  }>();

  const description = useMemo(() => {
    const raw = params.description ?? "";
    if (!raw || raw === "null" || !raw.trim()) return null;
    return raw.replace(/\r\n/g, "\n\n").trim();
  }, [params.description]);
  const barStyle = mode === "dark" ? "light-content" : "dark-content";
  const markdownStyles = useMemo(
    () =>
      StyleSheet.create({
        body: {
          color: theme.colors.text,
          fontSize: 16,
          lineHeight: 22,
        },
        text: {
          color: theme.colors.text,
          fontSize: 16,
          lineHeight: 22,
        },
        strong: { color: theme.colors.text },
        heading1: { color: theme.colors.text },
        heading2: { color: theme.colors.text },
        heading3: { color: theme.colors.text },
        bullet_list: { marginVertical: 8 },
        ordered_list: { marginVertical: 8 },
      }),
    [theme.colors.text]
  );

  const handleGoBack = () => {
    router.replace("/(tabs)/menu");
  };

  return (
    <LoyaltyProvider>
      
      <View style={[styles.safeArea, { backgroundColor: theme.general.screenBackground }]}>
        <StatusBar backgroundColor={theme.colors.primary} barStyle={barStyle} />
        <AppHeader onBack={handleGoBack} />
        <ScrollView contentContainerStyle={styles.content}>
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <Text style={[styles.backText, { color: theme.colors.primary }]}>Voltar</Text>
          </TouchableOpacity>

          {params.imageUrl ? (
            <Image source={{ uri: params.imageUrl }} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={[styles.imageFallback, { backgroundColor: theme.colors.disabledBackground }]}>
              <Text style={[styles.imageFallbackText, { color: theme.colors.textSecondary }]}>
                Sem imagem
              </Text>
            </View>
          )}

          <Text style={[styles.title, { color: theme.colors.text }]}>{params.name}</Text>

          {description ? (
            <Markdown style={markdownStyles}>{description}</Markdown>
          ) : (
            <Text style={[styles.descriptionFallback, { color: theme.colors.textSecondary }]}>
              Sem descrição disponível.
            </Text>
          )}
        </ScrollView>
      </View>
    </LoyaltyProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  backButton: {
    marginBottom: 12,
  },
  backText: {
    fontSize: 16,
    fontWeight: "600",
  },
  image: {
    width: "100%",
    height: 220,
    borderRadius: 16,
    marginBottom: 16,
  },
  imageFallback: {
    width: "100%",
    height: 220,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  imageFallbackText: {
    fontSize: 15,
    fontWeight: "600",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
  },
  descriptionFallback: {
    fontSize: 16,
    lineHeight: 22,
  },
});
