import { memo } from "react";
import { Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { Order } from "@/types";
import { AppTheme } from "@/constants/theme";
import { formatCurrency, formatDateTime } from "@/utils/format";
import { getOrderStatusColors, getOrderStatusLabel } from "@/components/orders/orderStatus";

type OrderCardProps = {
  order: Order;
  theme: AppTheme;
  onPress: () => void;
  onCancel: () => void;
  canCancel: boolean;
};

function OrderCard({ order, theme, onPress, onCancel, canCancel }: OrderCardProps) {
  const styles = createStyles(theme);
  const statusColors = getOrderStatusColors(order.status, theme);
  const statusLabel = getOrderStatusLabel(order.status);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Text style={styles.title}>Encomenda #{order.id}</Text>
          <Text style={styles.subtitle}>Toque para ver os detalhes</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: statusColors.background }]}>
          <Text style={[styles.badgeText, { color: statusColors.text }]}>{statusLabel}</Text>
        </View>
      </View>

      <View style={styles.metaBlock}>
        <Text style={styles.metaLabel}>Retirada</Text>
        <Text style={styles.metaValue}>{formatDateTime(order.scheduled_at)}</Text>
      </View>

      {order.store ? (
        <View style={styles.metaBlock}>
          <Text style={styles.metaLabel}>Loja</Text>
          <Text style={styles.metaValue}>{order.store.name}</Text>
        </View>
      ) : null}

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>{formatCurrency(order.total)}</Text>
      </View>

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
      alignItems: "flex-start",
      gap: 12,
    },
    headerInfo: {
      flex: 1,
    },
    title: {
      fontSize: 16,
      fontWeight: "700",
      color: theme.colors.text,
    },
    subtitle: {
      marginTop: 2,
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    badge: {
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
    },
    badgeText: {
      fontSize: 12,
      fontWeight: "700",
    },
    metaBlock: {
      gap: 2,
    },
    metaLabel: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    metaValue: {
      fontSize: 14,
      color: theme.colors.text,
      fontWeight: "500",
    },
    totalRow: {
      marginTop: 4,
      paddingTop: 8,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.border,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    totalLabel: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      fontWeight: "600",
    },
    totalValue: {
      fontSize: 15,
      color: theme.colors.text,
      fontWeight: "700",
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
