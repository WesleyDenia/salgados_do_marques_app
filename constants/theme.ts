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
    cardBackground: "#ffffffff",
    surface: "#ffffff",
    surfaceElevated: "#f8f8fb",
    text: "#2a2a2a",
    textSecondary: "#7a7a7a",
    textMuted: "#8f8f8f",
    textLight: "#ffffff",
    successText: "#1f8f4b",
    errorText: "#c62828",
    warningText: "#b26a00",
    infoText: "#1565c0",
    link: "#910202",
    accentSuccess: "#25d366",
    errorFill: "#b71c1c",
    placeholderBackground: "#eeeeee",
    placeholderText: "#7a7a7a",
    border: "rgba(0,0,0,0.05)",
    disabledBackground: "#f0f0f0",
    activatedButton: "#279e5dff",
  },
  dark: {
    primary: "#910202",
    secondary: "#4e0101ff",
    background: "#121212",
    backgroundButton: "#2a1b1b",
    cardBackground: "#202020",
    surface: "#1a1a1a",
    surfaceElevated: "#242424",
    text: "#f2f2f2",
    textSecondary: "#c2c2c2",
    textMuted: "#9a9a9a",
    textLight: "#ffffff",
    successText: "#5ee38a",
    errorText: "#ff8a8a",
    warningText: "#ffd166",
    infoText: "#7ccbff",
    link: "#ff9f9f",
    accentSuccess: "#1f8f4b",
    errorFill: "#a61e1e",
    placeholderBackground: "#1f1f1f",
    placeholderText: "#b8bdc6",
    border: "rgba(255,255,255,0.10)",
    disabledBackground: "#303846",
    activatedButton: "#335d47",
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
  textMuted: string;
  textLight: string;
  successText: string;
  errorText: string;
  warningText: string;
  infoText: string;
  link: string;
  background: string;
  surface: string;
  surfaceElevated: string;
  primary: string;
  secondary: string;
  accentSuccess: string;
  errorFill: string;
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
    errorBorder: string;
    warningBorder: string;
    disabledBackground: string;
    surfaceElevated: string;
  };
};

const lightTheme: ThemeDefinition = {
  colors: {
    text: palette.light.text,
    textSecondary: palette.light.textSecondary,
    textMuted: palette.light.textMuted,
    textLight: palette.light.textLight,
    successText: palette.light.successText,
    errorText: palette.light.errorText,
    warningText: palette.light.warningText,
    infoText: palette.light.infoText,
    link: palette.light.link,
    background: palette.light.background,
    surface: palette.light.surface,
    surfaceElevated: palette.light.surfaceElevated,
    primary: palette.light.primary,
    secondary: palette.light.secondary,
    accentSuccess: palette.light.accentSuccess,
    errorFill: palette.light.errorFill,
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
    errorBorder: palette.light.errorFill,
    warningBorder: palette.light.warningText,
    disabledBackground: palette.light.disabledBackground,
    surfaceElevated: palette.light.surfaceElevated,
  },
};

const darkTheme: ThemeDefinition = {
  colors: {
    text: palette.dark.text,
    textSecondary: palette.dark.textSecondary,
    textMuted: palette.dark.textMuted,
    textLight: palette.dark.textLight,
    successText: palette.dark.successText,
    errorText: palette.dark.errorText,
    warningText: palette.dark.warningText,
    infoText: palette.dark.infoText,
    link: palette.dark.link,
    background: palette.dark.background,
    surface: palette.dark.surface,
    surfaceElevated: palette.dark.surfaceElevated,
    primary: palette.dark.primary,
    secondary: palette.dark.secondary,
    accentSuccess: palette.dark.accentSuccess,
    errorFill: palette.dark.errorFill,
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
    errorBorder: palette.dark.errorFill,
    warningBorder: palette.dark.warningText,
    disabledBackground: palette.dark.disabledBackground,
    surfaceElevated: palette.dark.surfaceElevated,
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
