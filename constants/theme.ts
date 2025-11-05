import { ColorSchemeName, Platform, ViewStyle } from "react-native";

/**
 * 🎨 Paleta de cores base – identidade visual da Salgados do Marquês
 */
const palette = {
  light: {
    primary: "#910202",
    secondary: "#4e0101ff",
    background: "#edebf4ff",
    backgroundButton: "#fff0e6",
    cardBackground: "#ffffff",
    surface: "#ffffff",    
    text: "#2a2a2a",
    textSecondary: "#7a7a7a",
    textLight: "#ffffff",
    accentSuccess: "#25d366",
    placeholderBackground: "#eeeeee",
    placeholderText: "#7a7a7a",
    border: "rgba(0,0,0,0.05)",
    disabledBackground: "#f0f0f0",
    activatedButton: "#279e5dff",
  },
  dark: {
    primary: "#910202",
    secondary: "#4e0101ff",
    background: "#141414ff",
    backgroundButton: "#fff0e6",
    cardBackground: "#262626ff",
    surface: "#141414ff",
    text: "#d3d3d3ff",
    textSecondary: "#a1a1a1ff",
    textLight: "#e6e6e6ff",
    accentSuccess: "#434242ff",
    placeholderBackground: "#161e2bff",
    placeholderText: "#d1d5db",
    border: "rgba(255,255,255,0.08)",
    disabledBackground: "#2d3d58ff",
    activatedButton: "#726e8dff",
  },
} as const;

/**
 * 📏 Escalas globais (espaçamentos, raios, sombras)
 */
const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
  ultra: 60,
} as const;

const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
} as const;

type ShadowPreset = {
  ios: ViewStyle;
  android: ViewStyle;
};

const shadowPresets: Record<"card" | "subtle", ShadowPreset> = {
  card: {
    ios: {
      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 4 },
    },
    android: { elevation: 4 },
  },
  subtle: {
    ios: {
      shadowColor: "#000",
      shadowOpacity: 0.08,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
    },
    android: { elevation: 2 },
  },
};

type ThemeColors = {
  text: string;
  textSecondary: string;
  textLight: string;
  background: string;
  surface: string;
  primary: string;
  secondary: string;
  accentSuccess: string;
  placeholderBackground: string;
  placeholderText: string;
  border: string;
  disabledBackground: string;
  icon: string;
  tabIconDefault: string;
  tabIconSelected: string;
  tint: string;
  activatedButton: string;
  backgroundButton: string;
  cardBackground: string;
};

type ThemeDefinition = {
  colors: ThemeColors;
  spacing: typeof spacing;
  radius: typeof radius;
  shadow: typeof shadowPresets;
  general: {
    screenBackground: string;
    surface: string;
    borderColor: string;
    placeholderBackground: string;
    placeholderText: string;
    successBorder: string;
    disabledBackground: string;
  };
};

const lightTheme: ThemeDefinition = {
  colors: {
    text: palette.light.text,
    textSecondary: palette.light.textSecondary,
    textLight: palette.light.textLight,
    background: palette.light.background,
    surface: palette.light.surface,
    primary: palette.light.primary,
    secondary: palette.light.secondary,
    accentSuccess: palette.light.accentSuccess,
    placeholderBackground: palette.light.placeholderBackground,
    placeholderText: palette.light.placeholderText,
    border: palette.light.border,
    disabledBackground: palette.light.disabledBackground,
    icon: palette.light.textSecondary,
    tabIconDefault: palette.light.textSecondary,
    tabIconSelected: palette.light.primary,
    tint: palette.light.primary,
    activatedButton: palette.light.activatedButton,
    backgroundButton: palette.light.backgroundButton,
    cardBackground: palette.light.cardBackground,
  },
  spacing,
  radius,
  shadow: shadowPresets,
  general: {
    screenBackground: palette.light.background,
    surface: palette.light.surface,
    borderColor: palette.light.border,
    placeholderBackground: palette.light.placeholderBackground,
    placeholderText: palette.light.placeholderText,
    successBorder: palette.light.accentSuccess,
    disabledBackground: palette.light.disabledBackground,
  },
};

const darkTheme: ThemeDefinition = {
  colors: {
    text: palette.dark.text,
    textSecondary: palette.dark.textSecondary,
    textLight: palette.dark.textLight,
    background: palette.dark.background,
    surface: palette.dark.surface,
    primary: palette.dark.primary,
    secondary: palette.dark.secondary,
    accentSuccess: palette.dark.accentSuccess,
    placeholderBackground: palette.dark.placeholderBackground,
    placeholderText: palette.dark.placeholderText,
    border: palette.dark.border,
    disabledBackground: palette.dark.disabledBackground,
    icon: palette.dark.textSecondary,
    tabIconDefault: palette.dark.textSecondary,
    tabIconSelected: palette.dark.text,
    tint: palette.dark.primary,
    activatedButton: palette.dark.accentSuccess,
    backgroundButton: palette.dark.backgroundButton,
    cardBackground: palette.dark.cardBackground,
  },
  spacing,
  radius,
  shadow: shadowPresets,
  general: {
    screenBackground: palette.dark.background,
    surface: palette.dark.surface,
    borderColor: palette.dark.border,
    placeholderBackground: palette.dark.placeholderBackground,
    placeholderText: palette.dark.placeholderText,
    successBorder: palette.dark.accentSuccess,
    disabledBackground: palette.dark.disabledBackground,
  },
};

export const Theme = {
  light: lightTheme,
  dark: darkTheme,
} as const;

export type AppTheme = typeof Theme.light;
export type ThemeShadowPreset = ShadowPreset;

export const getTheme = (colorScheme?: ColorSchemeName): AppTheme =>
  Theme[colorScheme ?? "light"];

export const Colors = {
  light: Theme.light.colors,
  dark: Theme.dark.colors,
};

export const resolveShadow = (preset: ShadowPreset): ViewStyle =>
  Platform.OS === "ios" || Platform.OS === "macos" ? preset.ios : preset.android;

/**
 * 🅰️ Tipografia – fontes do sistema
 */
export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  android: {
    sans: "sans-serif",
    serif: "serif",
    rounded: "sans-serif-rounded",
    mono: "monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

/**
 * ✍️ Estilos tipográficos reutilizáveis
 */
export const Typography = {
  title: {
    fontSize: 24,
    fontWeight: "bold" as const,
    fontFamily: Fonts?.sans,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "400" as const,
    fontFamily: Fonts?.sans,
  },
  button: {
    fontSize: 16,
    fontWeight: "600" as const,
    fontFamily: Fonts?.sans,
  },
};
