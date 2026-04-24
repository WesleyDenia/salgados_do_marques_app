import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ChevronDown } from "lucide-react-native";
import { useRouter } from "expo-router";

import api from "@/api/api";
import OrderCard from "@/components/orders/OrderCard";
import OrderDetailModal from "@/components/orders/OrderDetailModal";
import ListModal from "@/components/orders/ListModal";
import { AppTheme } from "@/constants/theme";
import { useThemeMode } from "@/context/ThemeContext";
import { useOrdersHistory } from "@/hooks/useOrdersHistory";
import { getApiErrorMessage } from "@/utils/errorMessage";
import { Flavor, Order, OrderSettings } from "@/types";

export default function OrdersScreen() {
  const router = useRouter();
  const { theme } = useThemeMode();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { orders, loading, error, refresh } = useOrdersHistory();

  const [refreshing, setRefreshing] = useState(false);
  const [settings, setSettings] = useState<OrderSettings | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [flavorMap, setFlavorMap] = useState<Record<number, string>>({});
  const [statusFilter, setStatusFilter] = useState<"all" | Order["status"]>("all");
  const [showStatusFilter, setShowStatusFilter] = useState(false);

  const statusOptions = useMemo(
    () => [
      { label: "Todos", value: "all" as const },
      { label: "Realizados", value: "placed" as const },
      { label: "Aceitos", value: "accepted" as const },
      { label: "Rejeitados", value: "rejected" as const },
      { label: "Prontos", value: "ready" as const },
      { label: "Concluídos", value: "done" as const },
      { label: "Cancelados", value: "canceled" as const },
    ],
    []
  );

  const filteredOrders = useMemo(() => {
    if (statusFilter === "all") {
      return orders;
    }
    return orders.filter((order) => order.status === statusFilter);
  }, [orders, statusFilter]);

  const loadSettings = useCallback(async () => {
    try {
      const { data } = await api.get<{ data: OrderSettings }>("/orders/settings");
      setSettings(data.data);
    } catch (loadError) {
      console.error("Erro ao carregar settings de encomendas", loadError);
    }
  }, []);

  const loadFlavors = useCallback(async () => {
    try {
      const { data } = await api.get<{ data: Flavor[] }>("/flavors");
      const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
      const mapped = list.reduce((acc: Record<number, string>, flavor: Flavor) => {
        if (flavor?.id && flavor?.name) {
          acc[Number(flavor.id)] = String(flavor.name);
        }
        return acc;
      }, {});
      setFlavorMap(mapped);
    } catch (loadError) {
      console.error("Erro ao carregar sabores", loadError);
    }
  }, []);

  useEffect(() => {
    void loadSettings();
    void loadFlavors();
  }, [loadFlavors, loadSettings]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([refresh(), loadSettings(), loadFlavors()]);
    } finally {
      setRefreshing(false);
    }
  }, [loadFlavors, loadSettings, refresh]);

  const formatFlavorLabels = useCallback(
    (flavorIds: number[]) => {
      const counts = flavorIds.reduce((acc: Record<number, number>, id) => {
        acc[id] = (acc[id] ?? 0) + 1;
        return acc;
      }, {});
      return Object.entries(counts).map(([id, count]) => {
        const label = flavorMap[Number(id)] ?? `#${id}`;
        return `${label} (${count})`;
      });
    },
    [flavorMap]
  );

  const canCancel = useCallback(
    (order: Order) => {
      if (!settings) return false;
      if (!["placed", "accepted"].includes(order.status)) return false;
      const scheduled = new Date(order.scheduled_at);
      const limit = new Date(scheduled.getTime() - settings.cancel_minutes * 60 * 1000);
      return Date.now() <= limit.getTime();
    },
    [settings]
  );

  const handleCancelOrder = useCallback(
    async (orderId: number) => {
      try {
        await api.post(`/orders/${orderId}/cancel`);
        await refresh();
      } catch (cancelError) {
        const message = getApiErrorMessage(cancelError, "Não foi possível cancelar a encomenda.");
        Alert.alert("Erro", message);
      }
    },
    [refresh]
  );

  return (
    <View style={styles.safeArea}>
      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => String(item.id)}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>Minhas encomendas</Text>
            <Text style={styles.subtitle}>
              Acompanhe o histórico, os detalhes e o estado das encomendas já submetidas.
            </Text>

            <View style={styles.sectionHeader}>
              <TouchableOpacity
                style={styles.menuButton}
                onPress={() => router.push("/(tabs)/menu")}
              >
                <Text style={styles.menuButtonText}>Novo pedido</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.filterButton}
                onPress={() => setShowStatusFilter(true)}
                accessibilityRole="button"
                accessibilityLabel="Filtrar histórico por status"
              >
                <View style={styles.filterButtonContent}>
                  <Text style={styles.filterButtonText}>
                    {statusOptions.find((option) => option.value === statusFilter)?.label ?? "Todos"}
                  </Text>
                  <ChevronDown size={14} color={theme.colors.textLight} />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <OrderCard
            order={item}
            theme={theme}
            onPress={() => setSelectedOrder(item)}
            onCancel={() => handleCancelOrder(item.id)}
            canCancel={canCancel(item)}
          />
        )}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator color={theme.colors.primary} style={styles.loading} />
          ) : error ? (
            <View style={styles.listStateContainer}>
              <Text style={styles.empty}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={() => void refresh()}>
                <Text style={styles.retryButtonText}>Tentar novamente</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.listStateContainer}>
              <Text style={styles.emptyTitle}>Ainda não tem encomendas passadas.</Text>
              <Text style={styles.empty}>
                Quando submeter o checkout, o histórico passa a aparecer aqui com o respetivo estado.
              </Text>
              <TouchableOpacity style={styles.menuButton} onPress={() => router.push("/(tabs)/menu")}>
                <Text style={styles.menuButtonText}>Ir ao menu</Text>
              </TouchableOpacity>
            </View>
          )
        }
        contentContainerStyle={filteredOrders.length === 0 ? styles.listContentEmpty : styles.listContent}
      />

      <OrderDetailModal
        order={selectedOrder}
        visible={!!selectedOrder}
        theme={theme}
        formatFlavorLabels={formatFlavorLabels}
        onClose={() => setSelectedOrder(null)}
        onCancel={handleCancelOrder}
        canCancel={canCancel}
        onStorePress={() => router.push("/(tabs)/stores")}
      />

      <ListModal
        visible={showStatusFilter}
        title="Filtrar status"
        data={statusOptions}
        keyExtractor={(item) => item.value}
        renderItem={(item) => (
          <TouchableOpacity
            style={styles.listItem}
            onPress={() => {
              setStatusFilter(item.value);
              setShowStatusFilter(false);
            }}
          >
            <Text style={styles.listItemTitle}>{item.label}</Text>
          </TouchableOpacity>
        )}
        onClose={() => setShowStatusFilter(false)}
        theme={theme}
      />
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.general.screenBackground,
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 12,
      gap: 8,
    },
    title: {
      fontSize: 24,
      fontWeight: "700",
      color: theme.colors.text,
    },
    subtitle: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      lineHeight: 20,
    },
    sectionHeader: {
      marginTop: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    },
    menuButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 10,
    },
    menuButtonText: {
      color: theme.colors.textLight,
      fontWeight: "700",
    },
    filterButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    filterButtonContent: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    filterButtonText: {
      color: theme.colors.textLight,
      fontWeight: "600",
      fontSize: 12,
    },
    listStateContainer: {
      paddingHorizontal: 24,
      alignItems: "center",
      gap: 12,
    },
    listContent: {
      paddingBottom: 32,
    },
    listContentEmpty: {
      flexGrow: 1,
      justifyContent: "center",
      paddingBottom: 32,
    },
    emptyTitle: {
      textAlign: "center",
      color: theme.colors.text,
      fontSize: 18,
      fontWeight: "700",
    },
    empty: {
      textAlign: "center",
      color: theme.colors.textSecondary,
      lineHeight: 20,
    },
    loading: {
      marginTop: 20,
    },
    retryButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 10,
    },
    retryButtonText: {
      color: theme.colors.textLight,
      fontWeight: "700",
    },
    listItem: {
      paddingVertical: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.border,
    },
    listItemTitle: {
      fontSize: 15,
      fontWeight: "600",
      color: theme.colors.text,
    },
  });
