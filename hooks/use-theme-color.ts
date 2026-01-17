import { useThemeMode } from "@/context/ThemeContext";
import { AppTheme } from "@/constants/theme";

type ThemePaletteKey = keyof AppTheme["colors"];

/**
 * Hook de cor padronizado: prioriza overrides (light/dark) e, por padrão,
 * retorna o valor do ThemeContext para a chave informada.
 */
export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: ThemePaletteKey,
) {
  const { mode, theme } = useThemeMode();
  const colorFromProps = props[mode];

  return colorFromProps ?? theme.colors[colorName];
}
