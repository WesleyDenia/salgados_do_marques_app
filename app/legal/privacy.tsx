import { useEffect, useState } from "react";
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
import { Colors, Typography } from "@/constants/theme";
import api from "@/api/api";

type TermsResponse = {
  content: string;
  hash: string;
  version: string;
  updated_at?: string | null;
};

export default function PrivacyTermsScreen() {
  const router = useRouter();
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>Voltar</Text>
        </TouchableOpacity>
        <Text style={[Typography.title, styles.headerTitle]}>Termos de Privacidade</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} bounces={false}>
        {loading && (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={Colors.light.primary} />
            <Text style={styles.feedbackText}>Carregando termo...</Text>
          </View>
        )}

        {!loading && error && (
          <Text style={styles.errorText}>{error}</Text>
        )}

        {!loading && !error && terms && (
          <View>
            <Markdown style={markdownStyles}>
              {(terms.content || "").replace(/\r\n/g, "\n")}
            </Markdown>
            <Text style={styles.versionInfo}>
              Versão: {terms.version}
              {terms.updated_at ? ` • Atualizado em ${new Date(terms.updated_at).toLocaleDateString()}` : ""}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.light.background },
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
    color: Colors.light.primary,
    fontWeight: "600",
  },
  headerTitle: { textAlign: "center", flex: 1, color: Colors.light.text },
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
    color: Colors.light.textSecondary,
  },
  errorText: {
    color: "#B00020",
  },
  versionInfo: {
    marginTop: 16,
    color: Colors.light.textSecondary,
    fontSize: 12,
  },
});

const markdownStyles = StyleSheet.create({
  body: {
    color: Colors.light.textSecondary,
  },
  paragraph: {
    marginBottom: 12,
  },
  text: {
    color: Colors.light.textSecondary,
    fontSize: 16,
    lineHeight: 22,
  },
  heading1: { color: Colors.light.text },
  heading2: { color: Colors.light.text },
  heading3: { color: Colors.light.text },
  link: { color: Colors.light.primary },
  strong: { color: Colors.light.text },
  bullet_list: { marginVertical: 8 },
  ordered_list: { marginVertical: 8 },
});
