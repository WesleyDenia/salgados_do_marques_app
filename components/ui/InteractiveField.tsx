import { ViewStyle } from "react-native";

import { AppTheme } from "@/constants/theme";

type InteractiveFieldVariant = "input" | "inputLike";
type InteractiveFieldState = "default" | "focus" | "active" | "disabled" | "error";

type GetInteractiveFieldStylesOptions = {
  variant: InteractiveFieldVariant;
  state?: InteractiveFieldState;
};

type InteractiveFieldColors = {
  inputSurface: string;
  inputBorder: string;
  inputBorderFocus: string;
  inputText: string;
  inputPlaceholder: string;
  inputLikeSurface: string;
  inputLikeBorder: string;
  inputLikeBorderActive: string;
  disabledSurface: string;
  errorBorder: string;
};

type InteractiveFieldStyle = Pick<
  ViewStyle,
  "borderWidth" | "borderColor" | "backgroundColor" | "opacity"
>;

const DEFAULT_BORDER_WIDTH = 1;

export const getInteractiveFieldColors = (theme: AppTheme): InteractiveFieldColors => ({
  inputSurface: theme.colors.inputSurface,
  inputBorder: theme.colors.inputBorder,
  inputBorderFocus: theme.colors.inputBorderFocus,
  inputText: theme.colors.inputText,
  inputPlaceholder: theme.colors.inputPlaceholder,
  inputLikeSurface: theme.colors.inputLikeSurface,
  inputLikeBorder: theme.colors.inputLikeBorder,
  inputLikeBorderActive: theme.colors.inputLikeBorderActive,
  disabledSurface: theme.colors.disabledBackground,
  errorBorder: theme.colors.errorText,
});

export const getInteractiveFieldStyles = (
  theme: AppTheme,
  { variant, state = "default" }: GetInteractiveFieldStylesOptions
): InteractiveFieldStyle => {
  const colors = getInteractiveFieldColors(theme);

  const baseInputStyle: InteractiveFieldStyle = {
    borderWidth: DEFAULT_BORDER_WIDTH,
    borderColor: colors.inputBorder,
    backgroundColor: colors.inputSurface,
  };

  const baseInputLikeStyle: InteractiveFieldStyle = {
    borderWidth: DEFAULT_BORDER_WIDTH,
    borderColor: colors.inputLikeBorder,
    backgroundColor: colors.inputLikeSurface,
  };

  const baseStyle = variant === "input" ? baseInputStyle : baseInputLikeStyle;

  if (state === "focus") {
    return {
      ...baseStyle,
      borderColor: colors.inputBorderFocus,
    };
  }

  if (state === "active") {
    return {
      ...baseStyle,
      borderColor: colors.inputLikeBorderActive,
    };
  }

  if (state === "disabled") {
    return {
      ...baseStyle,
      backgroundColor: colors.disabledSurface,
      opacity: 0.65,
    };
  }

  if (state === "error") {
    return {
      ...baseStyle,
      borderColor: colors.errorBorder,
    };
  }

  return baseStyle;
};

export type { GetInteractiveFieldStylesOptions, InteractiveFieldState, InteractiveFieldVariant };
