import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ChevronRight, ShoppingBag } from "lucide-react-native";

import { AppTheme } from "@/constants/theme";
import { formatCurrency } from "@/utils/format";

type CartEntryCardProps = {
  itemCount: number;
  total: number;
  disabled: boolean;
  onPress: () => void;
  theme: AppTheme;
};

export default function CartEntryCard({
  itemCount,
  total,
  disabled,
  onPress,
  theme,
}: CartEntryCardProps) {
  const styles = createStyles(theme);

  return (
    <TouchableOpacity
      style={[styles.card, disabled && styles.cardDisabled]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={
        disabled
          ? "Carrinho vazio"
          : `Abrir carrinho com ${itemCount} item${itemCount > 1 ? "s" : ""}`
      }
      accessibilityHint={
        disabled
          ? "Adicione itens ao cardápio para habilitar o carrinho"
          : "Abre o checkout atual para rever os itens e definir a retirada"
      }
      accessibilityState={{ disabled }}
    >
      <View style={styles.leading}>
        <View style={styles.iconBadge}>
          <ShoppingBag size={18} color={theme.colors.textLight} />
        </View>
        <View style={styles.copy}>
          <Text style={styles.title}>Carrinho</Text>
          <Text style={styles.subtitle}>
            {disabled
              ? "Adicione produtos para começar a sua encomenda"
              : `${itemCount} item${itemCount > 1 ? "s" : ""} pronto${itemCount > 1 ? "s" : ""} para checkout`}
          </Text>
        </View>
      </View>

      <View style={styles.trailing}>
        <Text style={styles.total}>{formatCurrency(total)}</Text>
        <ChevronRight size={18} color={theme.colors.textLight} />
      </View>
    </TouchableOpacity>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    card: {
      width: "100%",
      paddingVertical: 16,
      paddingHorizontal: 20,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 15,
      marginTop: -35,
      backgroundColor: theme.colors.primary,
      borderRadius: 18,
      gap: 16,
    },
    cardDisabled: {
      opacity: 0.6,
    },
    leading: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      flex: 1,
    },
    iconBadge: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.secondary,
    },
    copy: {
      flex: 1,
    },
    title: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.colors.textLight,
    },
    subtitle: {
      marginTop: 2,
      fontSize: 13,
      color: theme.colors.textLight,
      opacity: 0.92,
      lineHeight: 18,
    },
    trailing: {
      alignItems: "flex-end",
      gap: 4,
    },
    total: {
      fontSize: 16,
      fontWeight: "800",
      color: theme.colors.textLight,
    },
  });
