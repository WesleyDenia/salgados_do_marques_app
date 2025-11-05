import { ReactNode, createContext, useContext, useMemo, useState } from "react";
import { Appearance } from "react-native";
import { AppTheme, getTheme } from "@/constants/theme";
import { ThemeProvider as StyledThemeProvider } from "styled-components/native";

export type ThemeMode = "light" | "dark";

type ThemeContextValue = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  theme: AppTheme;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(() =>
    Appearance.getColorScheme() === "dark" ? "dark" : "light",
  );

  const theme = useMemo(() => getTheme(mode), [mode]);

  const value = useMemo(
    () => ({
      mode,
      setMode,
      theme,
    }),
    [mode, theme],
  );

  return (
    <StyledThemeProvider theme={theme}>
      <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
    </StyledThemeProvider>
  );
}

export function useThemeMode() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeMode must be used within a ThemeProvider");
  }
  return context;
}
