import Constants from "expo-constants";

const DEFAULT_API_BASE_URL = "https://api.salgadosdomarques.pt/api/v1";

const normalizeUrl = (value: string) => value.trim().replace(/\/+$/, "");

/**
 * Resolve a base URL da API respeitando env vars públicas do Expo e extras do app.json.
 * Mantém um fallback para não quebrar builds existentes.
 */
export function getApiBaseUrl(): string {
  const envUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (envUrl && envUrl.trim()) {
    return normalizeUrl(envUrl);
  }

  const extraUrl = Constants?.expoConfig?.extra?.API_BASE_URL;
  if (typeof extraUrl === "string" && extraUrl.trim()) {
    return normalizeUrl(extraUrl);
  }

  return DEFAULT_API_BASE_URL;
}
