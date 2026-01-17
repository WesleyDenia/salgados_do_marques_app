import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApiBaseUrl } from "@/utils/env";
import { getToken, clearToken, setToken } from "@/utils/sessionStorage";

type UnauthorizedHandler = (() => Promise<void> | void) | null;
let unauthorizedHandler: UnauthorizedHandler = null;

export function setUnauthorizedHandler(handler: UnauthorizedHandler) {
  unauthorizedHandler = handler;
}

const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 10000,
});

api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshRequest: Promise<string | null> | null = null;

async function refreshToken(): Promise<string | null> {
  if (refreshRequest) return refreshRequest;

  refreshRequest = (async () => {
    const token = await getToken();
    if (!token) return null;

    try {
      const client = axios.create({ baseURL: api.defaults.baseURL, timeout: 10000 });
      const { data } = await client.post("/auth/refresh", null, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const nextToken = data.token || data.access_token || null;
      if (nextToken) {
        await setToken(nextToken);
        api.defaults.headers.Authorization = `Bearer ${nextToken}`;
      }
      if (data.config) {
        await AsyncStorage.setItem("config", JSON.stringify(data.config));
      }
      if (data.user) {
        await AsyncStorage.setItem("user", JSON.stringify(data.user));
      }
      return nextToken;
    } catch {
      return null;
    } finally {
      refreshRequest = null;
    }
  })();

  return refreshRequest;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const originalRequest = error.config as any;

    if (status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;
      const newToken = await refreshToken();
      if (newToken) {
        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      }
    }

    if (status === 401) {
      await clearToken();
      await AsyncStorage.multiRemove(["user", "config"]);
      if (unauthorizedHandler) {
        await unauthorizedHandler();
      }
    }
    return Promise.reject(error);
  }
);

export default api;
