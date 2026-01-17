import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "token";

let cachedToken: string | null = null;
let secureStoreAvailable: boolean | null = null;

async function canUseSecureStore() {
  if (secureStoreAvailable !== null) return secureStoreAvailable;
  try {
    secureStoreAvailable = await SecureStore.isAvailableAsync();
  } catch {
    secureStoreAvailable = false;
  }
  return secureStoreAvailable;
}

export async function getToken(): Promise<string | null> {
  if (cachedToken) return cachedToken;

  const useSecure = await canUseSecureStore();
  try {
    if (useSecure) {
      cachedToken = (await SecureStore.getItemAsync(TOKEN_KEY)) || null;
    } else {
      cachedToken = (await AsyncStorage.getItem(TOKEN_KEY)) || null;
    }
  } catch {
    // fallback para AsyncStorage se SecureStore falhar
    try {
      cachedToken = (await AsyncStorage.getItem(TOKEN_KEY)) || null;
    } catch {
      cachedToken = null;
    }
  }

  return cachedToken;
}

export async function setToken(token: string) {
  cachedToken = token;
  const useSecure = await canUseSecureStore();
  if (useSecure) {
    try {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
      return;
    } catch {
      // fallback para AsyncStorage
    }
  }
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function clearToken() {
  cachedToken = null;
  const useSecure = await canUseSecureStore();
  if (useSecure) {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    } catch {
      // continua para limpar AsyncStorage
    }
  }
  await AsyncStorage.removeItem(TOKEN_KEY);
}
