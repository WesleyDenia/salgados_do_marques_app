import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import QuantitySelector from "@/components/QuantitySelector";
import { AppTheme } from "@/constants/theme";
import { CartItem } from "@/context/CartContext";
import { formatCurrency } from "@/utils/format";

type CheckoutItemsCardProps = {
  items: CartItem[];
  total: number;
  onUpdateQuantity: (key: string, quantity: number) => void;
  onRemove: (key: string) => void;
  theme: AppTheme;
};

export default function CheckoutItemsCard({
  items,
  total,
  onUpdateQuantity,
  onRemove,
  theme,
}: CheckoutItemsCardProps) {
  const styles = createStyles(theme);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Resumo dos itens</Text>
        <Text style={styles.subtitle}>Revise quantidades, variantes e sabores antes de enviar.</Text>
      </View>

      {items.map((item) => (
        <View key={item.key} style={styles.itemBlock}>
          <View style={styles.itemTopRow}>
            <Text style={styles.itemName}>{item.product.name}</Text>
            <Text style={styles.itemPrice}>{formatCurrency(item.unitPrice)}</Text>
          </View>

          {item.variant ? (
            <Text style={styles.itemMeta}>
              {item.variant.name} • {item.variant.unit_count} unidades
            </Text>
          ) : null}

          {item.flavors && item.flavors.length > 0 ? (
            <Text style={styles.itemMeta}>
              Sabores:{" "}
              {item.flavors.map((flavor) => `${flavor.name} (${flavor.quantity})`).join(", ")}
            </Text>
          ) : null}

          <View style={styles.itemActions}>
            <QuantitySelector
              value={item.quantity}
              min={1}
              max={99}
              theme={theme}
              onChange={(value) => onUpdateQuantity(item.key, value)}
            />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => onRemove(item.key)}
              accessibilityRole="button"
              accessibilityLabel={`Remover ${item.product.name} da encomenda`}
            >
              <Text style={styles.removeText}>Remover</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total estimado</Text>
        <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
      </View>
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    card: {
      padding: 16,
      borderRadius: 16,
      backgroundColor: theme.colors.cardBackground,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
      gap: 16,
    },
    header: {
      gap: 4,
    },
    title: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.colors.text,
    },
    subtitle: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      lineHeight: 18,
    },
    itemBlock: {
      gap: 8,
      paddingBottom: 16,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.border,
    },
    itemTopRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 12,
    },
    itemName: {
      flex: 1,
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.text,
    },
    itemPrice: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    itemMeta: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      lineHeight: 17,
    },
    itemActions: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 12,
    },
    removeButton: {
      alignSelf: "flex-start",
    },
    removeText: {
      color: theme.colors.textSecondary,
      fontWeight: "600",
    },
    totalRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    totalLabel: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.text,
    },
    totalValue: {
      fontSize: 17,
      fontWeight: "800",
      color: theme.colors.text,
    },
  });
