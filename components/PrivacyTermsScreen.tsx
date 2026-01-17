import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Markdown from "react-native-markdown-display";

import { useThemeMode } from "@/context/ThemeContext";
import api from "@/api/api";
import { AppTheme } from "@/constants/theme";

type TermsResponse = {
  content: string;
  hash: string;
  version: string;
  updated_at?: string | null;
};

export default function PrivacyTermsScreen() {
  const router = useRouter();
  const { theme } = useThemeMode();
  const [terms, setTerms] = useState<TermsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadTerms = async () => {
      try {
        const { data } = await api.get("/lgpd/terms");
        if (!active) return;

        const rawContent = data.content ?? "";
        setTerms({
          content: rawContent,
          hash: data.hash,
          version: data.version ?? data.updated_at ?? new Date().toISOString(),
          updated_at: data.updated_at,
        });
        setError(null);
      } catch (err: any) {
        if (!active) return;
        console.error("Falha ao carregar termo LGPD", err);
        setError("Não foi possível carregar o termo. Tente novamente mais tarde.");
      } finally {
        if (active) setLoading(false);
      }
    };

    loadTerms();

    return () => {
      active = false;
    };
  }, []);

  const markdownStyles = useMemo(() => createMarkdownStyles(theme), [theme]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.general.screenBackground }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={[styles.backText, { color: theme.colors.primary }]}>Voltar</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Termos de Privacidade</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} bounces={false}>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={[styles.feedbackText, { color: theme.colors.textSecondary }]}>
              Carregando termo...
            </Text>
          </View>
        ) : null}

        {!loading && error ? (
          <Text style={[styles.errorText, { color: theme.colors.secondary }]}>{error}</Text>
        ) : null}

        {!loading && !error && terms ? (
          <View>
            <Markdown style={markdownStyles}>
              {(terms.content || "").replace(/\r\n/g, "\n")}
            </Markdown>
            <Text style={[styles.versionInfo, { color: theme.colors.textSecondary }]}>
              Versão: {terms.version}
              {terms.updated_at
                ? ` • Atualizado em ${new Date(terms.updated_at).toLocaleDateString()}`
                : ""}
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  backText: {
    fontWeight: "600",
  },
  headerTitle: { textAlign: "center", flex: 1, fontSize: 20, fontWeight: "700" },
  headerSpacer: { width: 52 },
  content: {
    padding: 20,
    paddingBottom: 20,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 40,
  },
  feedbackText: {
    fontSize: 14,
  },
  errorText: {
    fontSize: 14,
  },
  versionInfo: {
    marginTop: 16,
    fontSize: 12,
  },
});

const createMarkdownStyles = (theme: AppTheme) =>
  StyleSheet.create({
    body: {
      color: theme.colors.textSecondary,
    },
    paragraph: {
      marginBottom: 12,
    },
    text: {
      color: theme.colors.textSecondary,
      fontSize: 16,
      lineHeight: 22,
    },
    heading1: { color: theme.colors.text },
    heading2: { color: theme.colors.text },
    heading3: { color: theme.colors.text },
    link: { color: theme.colors.primary },
    strong: { color: theme.colors.text },
    bullet_list: { marginVertical: 8 },
    ordered_list: { marginVertical: 8 },
  });
