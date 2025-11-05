import { useLocalSearchParams, useRouter } from "expo-router";
import { memo, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Image,
} from "react-native";
import { useThemeMode } from "@/context/ThemeContext";
import { AppTheme } from "@/constants/theme";
import { useHomeContent } from "@/hooks/useHomeContent";
import { useAuth } from "@/context/AuthContext";
import { resolveAssetUrl } from "@/utils/url";
import AppHeader from "@/components/AppHeader";
import { LoyaltyProvider } from "@/context/LoyaltyContext";

const AutoSizedImage = memo(({ uri, style }: { uri: string; style: any }) => {
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    Image.getSize(
      uri,
      (width, height) => {
        if (!mounted || !width || !height) return;
        setAspectRatio(width / height);
      },
      () => {
        if (mounted) setAspectRatio(null);
      }
    );

    return () => {
      mounted = false;
    };
  }, [uri]);

  const computedStyle = useMemo(() => {
    if (aspectRatio) {
      return [style, { aspectRatio }];
    }
    return [style, { height: 220 }];
  }, [style, aspectRatio]);

  return <Image source={{ uri }} style={computedStyle} resizeMode="cover" />;
});

export default function ContentDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const { theme, mode } = useThemeMode();
  const { blocks } = useHomeContent();
  const { config } = useAuth();

  const block = useMemo(() => {
    const parsed = Number(id);
    if (!parsed) return undefined;
    return blocks.find((item) => item.id === parsed);
  }, [id, blocks]);

  const styles = useMemo(() => createStyles(theme), [theme]);
  const barStyle = mode === "dark" ? "light-content" : "dark-content";

  const imageUri = block ? resolveAssetUrl(block.image_url, config?.assets_base_url) : null;

  const content = block ? (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.backButtonInline} onPress={() => router.back()}>
        <Text style={styles.backButtonTextInline}>Voltar</Text>
      </TouchableOpacity>

      {imageUri ? <AutoSizedImage uri={imageUri} style={styles.heroImage} /> : null}

      {block.title ? <Text style={styles.title}>{block.title}</Text> : null}
      {block.text_body ? (
        <Text style={styles.description}>{block.text_body}</Text>
      ) : null}
    </ScrollView>
  ) : (
    <View style={styles.notFoundContainer}>
      <Text style={styles.notFoundTitle}>Conteúdo não encontrado</Text>
      <Text style={styles.notFoundDescription}>
        O conteúdo pode ter sido removido ou ainda não está disponível para você.
      </Text>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <LoyaltyProvider>
      <View style={styles.safeArea}>
        <StatusBar backgroundColor={theme.colors.primary} barStyle={barStyle} />
        <AppHeader />
        {content}
      </View>
    </LoyaltyProvider>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.general.screenBackground,
    },
    container: {
      padding: theme.spacing.lg,
      paddingBottom: theme.spacing.huge,
      gap: theme.spacing.lg,
    },
    heroImage: {
      width: "100%",
      overflow: "hidden",
      borderRadius: theme.radius.md,
    },
    title: {
      fontSize: 24,
      fontWeight: "700",
      color: theme.colors.text,
    },
    description: {
      fontSize: 16,
      lineHeight: 24,
      color: theme.colors.text,
    },
    backButtonInline: {
      alignSelf: "flex-start",
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.sm,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: theme.general.borderColor,
    },
    backButtonTextInline: {
      color: theme.colors.textSecondary,
      fontWeight: "500",
    },
    notFoundContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: theme.spacing.lg,
      gap: theme.spacing.md,
      backgroundColor: theme.general.screenBackground,
    },
    notFoundTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: theme.colors.text,
    },
    notFoundDescription: {
      fontSize: 15,
      lineHeight: 22,
      color: theme.colors.textSecondary,
      textAlign: "center",
    },
    backButton: {
      marginTop: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: theme.colors.primary,
    },
    backButtonText: {
      color: theme.colors.primary,
      fontWeight: "600",
    },
  });
