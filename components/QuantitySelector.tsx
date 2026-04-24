import { memo, useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Text,
  ViewStyle,
} from "react-native";
import { AppTheme } from "@/constants/theme";
import { getInteractiveFieldStyles } from "@/components/ui/InteractiveField";

type QuantitySelectorProps = {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (next: number) => void;
  disabled?: boolean;
  theme: AppTheme;
  style?: ViewStyle;
};

function QuantitySelectorComponent({
  value,
  min,
  max,
  step = 1,
  onChange,
  disabled = false,
  theme,
  style,
}: QuantitySelectorProps) {
  const safeValue = Math.max(min, Math.min(max, Number.isFinite(value) ? value : min));
  const componentStyles = styles(theme);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [pressedControl, setPressedControl] = useState<"decrease" | "increase" | null>(null);

  const handleBump = (delta: number) => {
    if (disabled) return;
    const next = Math.max(min, Math.min(max, safeValue + delta));
    onChange(next);
  };

  return (
    <View style={[componentStyles.container, style]}>
      <TouchableOpacity
        style={[
          componentStyles.button,
          pressedControl === "decrease" && componentStyles.buttonActive,
          (disabled || safeValue <= min) && componentStyles.buttonDisabled,
        ]}
        disabled={disabled || safeValue <= min}
        onPressIn={() => setPressedControl("decrease")}
        onPressOut={() => setPressedControl(null)}
        onPress={() => handleBump(-step)}
      >
        <Text style={componentStyles.buttonLabel}>-</Text>
      </TouchableOpacity>
      <TextInput
        keyboardType="number-pad"
        value={String(safeValue)}
        onChangeText={(text) => {
          const parsed = Number(text.replace(/\D/g, ""));
          if (Number.isFinite(parsed)) {
            const next = Math.max(min, Math.min(max, parsed));
            onChange(next);
          }
        }}
        editable={!disabled}
        style={[
          componentStyles.input,
          isInputFocused && componentStyles.inputFocused,
          disabled && componentStyles.inputDisabled,
        ]}
        onFocus={() => setIsInputFocused(true)}
        onBlur={() => setIsInputFocused(false)}
        placeholderTextColor={theme.colors.inputPlaceholder}
      />
      <TouchableOpacity
        style={[
          componentStyles.button,
          pressedControl === "increase" && componentStyles.buttonActive,
          (disabled || safeValue >= max) && componentStyles.buttonDisabled,
        ]}
        disabled={disabled || safeValue >= max}
        onPressIn={() => setPressedControl("increase")}
        onPressOut={() => setPressedControl(null)}
        onPress={() => handleBump(step)}
      >
        <Text style={componentStyles.buttonLabel}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    button: {
      width: 36,
      height: 36,
      borderRadius: theme.radius.sm,
      alignItems: "center",
      justifyContent: "center",
      ...getInteractiveFieldStyles(theme, { variant: "inputLike", state: "default" }),
    },
    buttonActive: {
      ...getInteractiveFieldStyles(theme, { variant: "inputLike", state: "active" }),
    },
    buttonDisabled: {
      ...getInteractiveFieldStyles(theme, { variant: "inputLike", state: "disabled" }),
    },
    buttonLabel: {
      fontSize: 20,
      fontWeight: "600",
      color: theme.colors.text,
    },
    input: {
      minWidth: 50,
      textAlign: "center",
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderRadius: theme.radius.sm,
      ...getInteractiveFieldStyles(theme, { variant: "input", state: "default" }),
      color: theme.colors.inputText,
      fontWeight: "600",
    },
    inputFocused: {
      ...getInteractiveFieldStyles(theme, { variant: "input", state: "focus" }),
    },
    inputDisabled: {
      ...getInteractiveFieldStyles(theme, { variant: "input", state: "disabled" }),
    },
  });

export default memo(QuantitySelectorComponent);
