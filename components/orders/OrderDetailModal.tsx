import { memo } from "react";
import {
  FlatList,
  Modal,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";
import { MapPin } from "lucide-react-native";
import { Order } from "@/types";
import { AppTheme } from "@/constants/theme";
import { formatCurrency, formatDateTime } from "@/utils/format";
import { getOrderStatusColors, getOrderStatusLabel } from "@/components/orders/orderStatus";

type OrderDetailModalProps = {
  order: Order | null;
  visible: boolean;
  theme: AppTheme;
  formatFlavorLabels: (flavorIds: number[]) => string[];
  onClose: () => void;
  onCancel: (orderId: number) => void;
  canCancel: (order: Order) => boolean;
  onStorePress: () => void;
};

function OrderDetailModal({
  order,
  visible,
  theme,
  formatFlavorLabels,
  onClose,
  onCancel,
  canCancel,
  onStorePress,
}: OrderDetailModalProps) {
  const styles = createStyles(theme);
  const statusColors = order ? getOrderStatusColors(order.status, theme) : null;
  const statusLabel = order ? getOrderStatusLabel(order.status) : null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {order ? (
            <>
              <Text style={styles.title}>Encomenda #{order.id}</Text>
              <View style={styles.header}>
                <Text style={styles.meta}>Retirada: {formatDateTime(order.scheduled_at)}</Text>
                <View
                  style={[
                    styles.badge,
                    statusColors
                      ? { backgroundColor: statusColors.background }
                      : null,
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      statusColors ? { color: statusColors.text } : null,
                    ]}
                  >
                    {statusLabel}
                  </Text>
                </View>
              </View>
              <View style={styles.metaGroup}>
                {order.store ? (
                  <View style={styles.storeRow}>
                    <MapPin size={16} color={theme.colors.textSecondary} />
                    <TouchableOpacity onPress={onStorePress}>
                      <Text style={styles.storeLink}>{order.store.name}</Text>
                    </TouchableOpacity>
                  </View>
                ) : null}
                <Text style={styles.meta}>Total: {formatCurrency(order.total)}</Text>
              </View>

              <Text style={styles.sectionTitle}>Itens</Text>
              <FlatList
                data={order.items ?? []}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item }) => (
                  <View style={styles.detailItem}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailName}>
                        {item.name} x {item.quantity}
                      </Text>
                      <Text style={styles.detailPrice}>{formatCurrency(item.total)}</Text>
                    </View>
                    {item.options?.flavors?.length ? (
                      <View style={styles.flavorList}>
                        {formatFlavorLabels(item.options.flavors).map((label) => (
                          <Text key={label} style={styles.detailMeta}>
                            • {label}
                          </Text>
                        ))}
                      </View>
                    ) : null}
                  </View>
                )}
                ListEmptyComponent={<Text style={styles.empty}>Nenhum item encontrado.</Text>}
              />

              {canCancel(order) ? (
                <TouchableOpacity style={styles.cancelButton} onPress={() => onCancel(order.id)}>
                  <Text style={styles.cancelText}>Cancelar encomenda</Text>
                </TouchableOpacity>
              ) : null}
            </>
          ) : null}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.4)",
      justifyContent: "flex-end",
    },
    card: {
      backgroundColor: theme.general.screenBackground,
      padding: 20,
      maxHeight: "70%",
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
    },
    title: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.colors.text,
      marginBottom: 12,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 12,
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
    meta: {
      fontSize: 13,
      color: theme.colors.textSecondary,
    },
    metaGroup: {
      marginTop: 6,
      gap: 6,
    },
    storeRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    storeLink: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      textDecorationLine: "underline",
    },
    sectionTitle: {
      marginTop: 24,
      fontSize: 18,
      fontWeight: "700",
      color: theme.colors.text,
    },
    detailItem: {
      paddingVertical: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.border,
    },
    detailRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 12,
    },
    detailName: {
      flex: 1,
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.text,
    },
    detailPrice: {
      fontSize: 16,
      color: theme.colors.textSecondary,
    },
    detailMeta: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginTop: 4,
    },
    flavorList: {
      marginTop: 4,
      gap: 4,
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
    closeButton: {
      marginTop: 12,
      alignItems: "center",
      backgroundColor: theme.colors.primary,
      borderRadius: 5,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    closeText: {
      color: theme.colors.textLight,
      fontWeight: "600",
    },
    empty: {
      textAlign: "center",
      marginTop: 16,
      color: theme.colors.textSecondary,
    },
  });

export default memo(OrderDetailModal);
