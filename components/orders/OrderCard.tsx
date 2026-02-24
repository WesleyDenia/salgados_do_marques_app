import { memo } from "react";
import { Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { Order } from "@/types";
import { AppTheme } from "@/constants/theme";
import { formatCurrency, formatDateTime } from "@/utils/format";

type OrderCardProps = {
  order: Order;
  theme: AppTheme;
  onPress: () => void;
  onCancel: () => void;
  canCancel: boolean;
};

function OrderCard({ order, theme, onPress, onCancel, canCancel }: OrderCardProps) {
  const styles = createStyles(theme);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.title}>Encomenda #{order.id}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{order.status.toUpperCase()}</Text>
        </View>
      </View>
      <Text style={styles.meta}>Retirada: {formatDateTime(order.scheduled_at)}</Text>
      {order.store ? <Text style={styles.meta}>Loja: {order.store.name}</Text> : null}
      <Text style={styles.meta}>Total: {formatCurrency(order.total)}</Text>
      {canCancel ? (
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelText}>Cancelar encomenda</Text>
        </TouchableOpacity>
      ) : null}
    </TouchableOpacity>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    card: {
      marginHorizontal: 20,
      marginBottom: 16,
      padding: 16,
      borderRadius: 16,
      backgroundColor: theme.colors.cardBackground,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
      gap: 6,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    title: {
      fontSize: 16,
      fontWeight: "700",
      color: theme.colors.text,
    },
    badge: {
      backgroundColor: theme.colors.primary,
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    badgeText: {
      fontSize: 12,
      fontWeight: "700",
      color: theme.colors.textLight,
    },
    meta: {
      fontSize: 13,
      color: theme.colors.textSecondary,
    },
    cancelButton: {
      marginTop: 8,
      alignSelf: "flex-start",
      backgroundColor: theme.colors.primary,
      borderRadius: 5,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    cancelText: {
      color: theme.colors.textLight,
      fontWeight: "600",
    },
  });

export default memo(OrderCard);
