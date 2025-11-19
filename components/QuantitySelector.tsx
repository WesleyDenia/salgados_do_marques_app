import { memo } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Text,
  ViewStyle,
} from "react-native";
import { AppTheme } from "@/constants/theme";

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

  const handleBump = (delta: number) => {
    if (disabled) return;
    const next = Math.max(min, Math.min(max, safeValue + delta));
    onChange(next);
  };

  return (
    <View style={[styles(theme).container, style]}>
      <TouchableOpacity
        style={[styles(theme).button, disabled && styles(theme).buttonDisabled]}
        disabled={disabled || safeValue <= min}
        onPress={() => handleBump(-step)}
      >
        <Text style={styles(theme).buttonLabel}>-</Text>
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
        style={styles(theme).input}
      />
      <TouchableOpacity
        style={[styles(theme).button, disabled && styles(theme).buttonDisabled]}
        disabled={disabled || safeValue >= max}
        onPress={() => handleBump(step)}
      >
        <Text style={styles(theme).buttonLabel}>+</Text>
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
      borderWidth: 1,
      borderColor: theme.general.borderColor,
      backgroundColor: theme.general.surface,
    },
    buttonDisabled: {
      opacity: 0.5,
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
      borderWidth: 1,
      borderRadius: theme.radius.sm,
      borderColor: theme.general.borderColor,
      backgroundColor: theme.colors.cardBackground,
      color: theme.colors.text,
      fontWeight: "600",
    },
  });

export default memo(QuantitySelectorComponent);
