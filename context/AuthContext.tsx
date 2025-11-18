// context/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Appearance } from "react-native";
import api, { setUnauthorizedHandler } from "@/api/api";
import { User, AppConfig } from "@/types";
import { useThemeMode, ThemeMode } from "@/context/ThemeContext";

type AuthContextType = {
  user: User | null;
  config: AppConfig | null;
  signIn: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>; 
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const { setMode } = useThemeMode();

  // 🔹 Carrega user/token salvos
  useEffect(() => {
    const loadUser = async () => {
      const savedUser = await AsyncStorage.getItem("user");
      const savedToken = await AsyncStorage.getItem("token");
      const savedConfig = await AsyncStorage.getItem("config");

      if (savedUser && savedToken) {
        api.defaults.headers.Authorization = `Bearer ${savedToken}`;
        const parsedUser: User = JSON.parse(savedUser);
        setUser(parsedUser);
        if (parsedUser.theme) {
          setMode(parsedUser.theme as ThemeMode);
        }
      }
      if (savedConfig) {
        try {
          setConfig(JSON.parse(savedConfig));
        } catch (error) {
          console.warn("Falha ao carregar config salva", error);
        }
      }
      setLoading(false);
    };
    loadUser();
  }, [setMode]);

  const persistConfig = useCallback(async (value: AppConfig | null) => {
    if (value) {
      setConfig(value);
      await AsyncStorage.setItem("config", JSON.stringify(value));
    } else {
      setConfig(null);
      await AsyncStorage.removeItem("config");
    }
  }, []);

  const resetSession = useCallback(async () => {
    await AsyncStorage.removeItem("user");
    await AsyncStorage.removeItem("token");
    await persistConfig(null);
    setUser(null);
    delete api.defaults.headers.Authorization;
    const systemScheme = Appearance.getColorScheme();
    setMode(systemScheme === "dark" ? "dark" : "light");
  }, [persistConfig, setMode]);

  async function signIn(email: string, password: string) {
    const { data } = await api.post("/login", { email, password });
    const token = data.token || data.access_token;
    const user = data.user;
    const configData: AppConfig | null = data.config?.assets_base_url
      ? { assets_base_url: data.config.assets_base_url }
      : null;
    if (!token || !user) throw new Error("Resposta inválida do backend.");

    await AsyncStorage.setItem("user", JSON.stringify(user));
    await AsyncStorage.setItem("token", token);
    await persistConfig(configData);

    api.defaults.headers.Authorization = `Bearer ${token}`;
    setUser(user);
    if (user.theme) {
      setMode(user.theme as ThemeMode);
    }
  }

  async function register(data: any) {
    const response = await api.post("/register", data);
    const token = response.data.token;
    const user = response.data.user;
    const configData: AppConfig | null = response.data.config?.assets_base_url
      ? { assets_base_url: response.data.config.assets_base_url }
      : null;

    await AsyncStorage.setItem("user", JSON.stringify(user));
    await AsyncStorage.setItem("token", token);
    await persistConfig(configData);

    api.defaults.headers.Authorization = `Bearer ${token}`;
    setUser(user);
    if (user.theme) {
      setMode(user.theme as ThemeMode);
    }
  }

  async function signOut() {
    try {
      await api.post("/logout");
    } catch {}
    await resetSession();
  }

  // 🧠 Novo método para atualizar parcialmente o usuário localmente
  async function updateUser(data: Partial<User>) {
    if (!user) return;
    const updated = { ...user, ...data };
    setUser(updated);
    await AsyncStorage.setItem("user", JSON.stringify(updated));
    if (data.theme) {
      setMode(data.theme as ThemeMode);
    }
  }

  useEffect(() => {
    setUnauthorizedHandler(async () => {
      await resetSession();
    });
    return () => {
      setUnauthorizedHandler(null);
    };
  }, [resetSession]);

  return (
    <AuthContext.Provider
      value={{ user, config, signIn, register, signOut, updateUser, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
}
