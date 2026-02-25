import type { AppConfig } from "./config";
import type { User } from "./user";

export type AuthTokenFields = {
  token?: string | null;
  access_token?: string | null;
};

export type AuthConfigPayload = {
  assets_base_url?: string | null;
};

export type AuthResponse = AuthTokenFields & {
  user?: User | null;
  config?: AuthConfigPayload | null;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  nif?: string;
  phone: string;
  birth_date?: string | null;
  lgpd: {
    accepted: boolean;
    version: string;
    hash: string;
    channel: string;
  };
};

export function toAppConfig(config?: AuthConfigPayload | null): AppConfig | null {
  if (!config?.assets_base_url) {
    return null;
  }

  return { assets_base_url: config.assets_base_url };
}

