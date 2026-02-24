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
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";

import api from "@/api/api";
import { useCart } from "@/context/CartContext";
import { useThemeMode } from "@/context/ThemeContext";
import { useStores } from "@/hooks/useStores";
import { useOrderSchedule } from "@/hooks/useOrderSchedule";
import { getApiErrorMessage } from "@/utils/errorMessage";
import { Order, OrderSettings, Store } from "@/types";
import QuantitySelector from "@/components/QuantitySelector";
import { AppTheme } from "@/constants/theme";
import { ChevronDown } from "lucide-react-native";
import OrderCard from "@/components/orders/OrderCard";
import OrderDetailModal from "@/components/orders/OrderDetailModal";
import ListModal from "@/components/orders/ListModal";
import { formatCurrency } from "@/utils/format";

const formatLocalDateTime = (date: Date) => {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
};

export default function OrdersScreen() {
  const router = useRouter();
  const { theme } = useThemeMode();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { items, updateQuantity, removeItem, clear, total } = useCart();
  const { stores, loading: loadingStores, fetchStores } = useStores();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [settings, setSettings] = useState<OrderSettings | null>(null);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [scheduledAt, setScheduledAt] = useState<Date>(new Date());
  const [hasSelectedDate, setHasSelectedDate] = useState(false);
  const [hasSelectedTime, setHasSelectedTime] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showHourPicker, setShowHourPicker] = useState(false);
  const [showMinutePicker, setShowMinutePicker] = useState(false);
  const [storeModalVisible, setStoreModalVisible] = useState(false);
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
      return orders.filter((order) => order.status !== "canceled");
    }
    return orders.filter((order) => order.status === statusFilter);
  }, [orders, statusFilter]);

  const availableStores = useMemo(
    () => stores.filter((store) => store.accepts_orders ?? false),
    [stores]
  );

  useEffect(() => {
    if (selectedStore || availableStores.length === 0) return;
    const preferred = availableStores.find((store) => store.default_store);
    if (preferred) {
      setSelectedStore(preferred);
    }
  }, [availableStores, selectedStore]);

  const loadSettings = useCallback(async () => {
    try {
      const { data } = await api.get<{ data: OrderSettings }>("/orders/settings");
      setSettings(data.data);
      const minimum = Math.max(0, Number(data.data.minimum_minutes ?? 0));
      const now = new Date();
      const minAllowed = new Date(now.getTime() + minimum * 60 * 1000);
      const [startHour, startMinute] = data.data.start_time.split(":").map(Number);
      const [endHour, endMinute] = data.data.end_time.split(":").map(Number);
      const endLimit = new Date(now);
      endLimit.setHours(endHour || 0, endMinute || 0, 0, 0);
      endLimit.setMinutes(endLimit.getMinutes() - 5);

      if (minAllowed > endLimit) {
        const nextDay = new Date(now);
        nextDay.setDate(now.getDate() + 1);
        nextDay.setHours(startHour || 0, startMinute || 0, 0, 0);
        setScheduledAt(nextDay);
      } else {
        setScheduledAt(minAllowed);
      }
    } catch (error) {
      console.error("Erro ao carregar settings de encomendas", error);
    }
  }, []);

  const loadOrders = useCallback(async () => {
    try {
      setLoadingOrders(true);
      const { data } = await api.get("/orders");
      const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
      setOrders(list);
    } catch (error) {
      console.error("Erro ao carregar encomendas", error);
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  const loadFlavors = useCallback(async () => {
    try {
      const { data } = await api.get("/flavors");
      const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
      const mapped = list.reduce((acc: Record<number, string>, flavor: any) => {
        if (flavor?.id && flavor?.name) {
          acc[Number(flavor.id)] = String(flavor.name);
        }
        return acc;
      }, {});
      setFlavorMap(mapped);
    } catch (error) {
      console.error("Erro ao carregar sabores", error);
    }
  }, []);

  useEffect(() => {
    void fetchStores({ accepts_orders: true });
    void loadOrders();
    void loadSettings();
    void loadFlavors();
  }, [fetchStores, loadOrders, loadSettings, loadFlavors]);

  const { minimumDate, allowedHours, allowedMinutes } = useOrderSchedule({
    settings,
    scheduledAt,
    setScheduledAt,
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      loadOrders(),
      fetchStores({ accepts_orders: true }),
      loadSettings(),
      loadFlavors(),
    ]);
    setRefreshing(false);
  }, [fetchStores, loadOrders, loadSettings, loadFlavors]);

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

  const validateSchedule = useCallback(() => {
    if (!hasSelectedDate || !hasSelectedTime) {
      return "Selecione data e hora para retirada.";
    }

    const now = new Date();
    if (scheduledAt < now) {
      return "O horário precisa estar no futuro.";
    }

    if (!settings) return null;

    const minimumMinutes = Math.max(0, Number(settings.minimum_minutes ?? 0));
    const minimumAllowed = new Date(Date.now() + minimumMinutes * 60 * 1000);
    if (scheduledAt < minimumAllowed) {
      return "O horário precisa respeitar o tempo mínimo de preparação.";
    }

    if (settings.start_time && settings.end_time) {
      const [startHour, startMinute] = settings.start_time.split(":").map(Number);
      const [endHour, endMinute] = settings.end_time.split(":").map(Number);
      const start = new Date(scheduledAt);
      start.setHours(startHour || 0, startMinute || 0, 0, 0);
      const end = new Date(scheduledAt);
      end.setHours(endHour || 0, endMinute || 0, 0, 0);

      if (scheduledAt < start || scheduledAt > end) {
        return "O horário precisa estar dentro do período de atendimento.";
      }
    }

    return null;
  }, [hasSelectedDate, hasSelectedTime, scheduledAt, settings]);

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

  const handleSubmit = useCallback(async () => {
    if (items.length === 0) {
      Alert.alert("Encomenda vazia", "Adicione itens à encomenda antes de confirmar.");
      return;
    }
    if (!selectedStore) {
      Alert.alert("Selecione a loja", "Escolha a loja para retirada.");
      return;
    }

    const scheduleError = validateSchedule();
    if (scheduleError) {
      Alert.alert("Horário inválido", scheduleError);
      return;
    }

    try {
      setSubmitting(true);
      await api.post("/orders", {
        store_id: selectedStore.id,
        scheduled_at: formatLocalDateTime(scheduledAt),
        items: items.map((item) => ({
          product_id: item.product.id,
          variant_id: item.variant?.id ?? null,
          quantity: item.quantity,
          flavors:
            item.flavors && item.flavors.length > 0
              ? item.flavors.flatMap((flavor) =>
                  Array.from({ length: flavor.quantity }, () => flavor.id)
                )
              : undefined,
        })),
      });
      clear();
      await loadOrders();
      Alert.alert("Encomenda confirmada", "Sua encomenda foi enviada com sucesso.");
    } catch (error) {
      const message = getApiErrorMessage(error, "Não foi possível enviar a encomenda agora.");
      Alert.alert("Erro", message);
    } finally {
      setSubmitting(false);
    }
  }, [items, selectedStore, validateSchedule, scheduledAt, clear, loadOrders]);

  const handleCancelOrder = useCallback(
    async (orderId: number) => {
      try {
        await api.post(`/orders/${orderId}/cancel`);
        await loadOrders();
      } catch (error) {
        const message = getApiErrorMessage(error, "Não foi possível cancelar a encomenda.");
        Alert.alert("Erro", message);
      }
    },
    [loadOrders]
  );

  return (
    <View style={styles.safeArea}>
      <FlatList
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
            <Text style={styles.title}>Sua encomenda</Text>
            {items.length === 0 ? (
              <TouchableOpacity
                style={styles.selectItemsButton}
                onPress={() => router.push("/(tabs)/menu")}
              >
                <Text style={styles.selectItemsText}>Faça sua encomenda</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.subtitle}>Revise a encomenda e confirme a retirada.</Text>
            )}

            {items.length > 0 && (
              <View style={styles.card}>
                {items.map((item) => (
                  <View key={item.key} style={styles.cartRow}>
                    <View style={styles.cartInfo}>
                      <Text style={styles.cartName}>{item.product.name}</Text>
                      <Text style={styles.cartPrice}>{formatCurrency(item.unitPrice)}</Text>
                    </View>
                    {item.variant ? (
                      <Text style={styles.cartMeta}>
                        {item.variant.name} • {item.variant.unit_count} unidades
                      </Text>
                    ) : null}
                    {item.flavors && item.flavors.length > 0 ? (
                      <Text style={styles.cartMeta}>
                        Sabores:{" "}
                        {item.flavors
                          .map((flavor) => `${flavor.name} (${flavor.quantity})`)
                          .join(", ")}
                      </Text>
                    ) : null}
                    <QuantitySelector
                      value={item.quantity}
                      min={1}
                      max={99}
                      theme={theme}
                      onChange={(value) => updateQuantity(item.key, value)}
                    />
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removeItem(item.key)}
                    >
                      <Text style={styles.removeText}>Remover</Text>
                    </TouchableOpacity>
                  </View>
                ))}

                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total estimado</Text>
                  <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
                </View>

                <TouchableOpacity
                  style={styles.selector}
                  onPress={() => setStoreModalVisible(true)}
                >
                  <Text style={styles.selectorLabel}>Loja de retirada</Text>
                  <Text style={styles.selectorValue}>
                    {selectedStore ? selectedStore.name : "Selecionar loja"}
                  </Text>
                </TouchableOpacity>

                <View style={styles.scheduleRow}>
                  <TouchableOpacity
                    style={styles.selector}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Text style={styles.selectorLabel}>Data</Text>
                    <Text style={styles.selectorValue}>
                      {hasSelectedDate
                        ? scheduledAt.toLocaleDateString("pt-PT")
                        : "Selecionar data"}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.selector}
                    onPress={() => setShowHourPicker(true)}
                    disabled={!hasSelectedDate}
                  >
                    <Text style={styles.selectorLabel}>Hora</Text>
                    <Text style={styles.selectorValue}>
                      {hasSelectedTime
                        ? scheduledAt.toLocaleTimeString("pt-PT", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "--:--"}
                    </Text>
                  </TouchableOpacity>
                </View>

                {settings ? (
                  <Text style={styles.helperText}>
                    Atendemos entre {settings.start_time} e {settings.end_time}. Tempo mínimo: {settings.minimum_minutes} min.
                  </Text>
                ) : null}

                <TouchableOpacity
                  style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                  disabled={submitting}
                  onPress={handleSubmit}
                >
                  {submitting ? (
                    <ActivityIndicator color={theme.colors.textLight} />
                  ) : (
                    <Text style={styles.submitText}>Confirmar encomenda</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Minhas encomendas</Text>
              <TouchableOpacity
                style={styles.filterButton}
                onPress={() => setShowStatusFilter(true)}
              >
                <View style={styles.filterButtonContent}>
                  <Text style={styles.filterButtonText}>
                    {statusOptions.find((option) => option.value === statusFilter)?.label ??
                      "Todos"}
                  </Text>
                  <ChevronDown size={14} color={theme.colors.textLight} />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        }
        data={filteredOrders}
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
          loadingOrders ? (
            <ActivityIndicator color={theme.colors.primary} style={styles.loading} />
          ) : (
            <Text style={styles.empty}>Nenhuma encomenda encontrada.</Text>
          )
        }
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

      {showDatePicker && (
        <DateTimePicker
          value={scheduledAt}
          mode="date"
          display="calendar"
          minimumDate={minimumDate}
          onChange={(_, date) => {
            setShowDatePicker(false);
            if (date) {
              const next = new Date(scheduledAt);
              next.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
              setScheduledAt(next);
              setHasSelectedDate(true);
            }
          }}
        />
      )}

      <ListModal
        visible={storeModalVisible}
        title="Selecione a loja"
        data={loadingStores ? [] : availableStores}
        keyExtractor={(item) => String(item.id)}
        renderItem={(item) => (
          <TouchableOpacity
            style={styles.listItem}
            onPress={() => {
              setSelectedStore(item);
              setStoreModalVisible(false);
            }}
          >
            <Text style={styles.listItemTitle}>{item.name}</Text>
            <Text style={styles.listItemSubtitle}>{item.address}</Text>
          </TouchableOpacity>
        )}
        emptyMessage={
          loadingStores ? "Carregando lojas..." : "Nenhuma loja disponível para encomendas."
        }
        onClose={() => setStoreModalVisible(false)}
        theme={theme}
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

      <ListModal
        visible={showHourPicker}
        title="Selecione a hora"
        data={allowedHours}
        keyExtractor={(item) => String(item)}
        renderItem={(item) => (
          <TouchableOpacity
            style={styles.listItem}
            onPress={() => {
              const next = new Date(scheduledAt);
              next.setHours(item, next.getMinutes(), 0, 0);
              setScheduledAt(next);
              setShowHourPicker(false);
              setShowMinutePicker(true);
            }}
          >
            <Text style={styles.listItemTitle}>{String(item).padStart(2, "0")}h</Text>
          </TouchableOpacity>
        )}
        emptyMessage="Nenhuma hora disponível."
        onClose={() => setShowHourPicker(false)}
        theme={theme}
      />

      <ListModal
        visible={showMinutePicker}
        title="Selecione os minutos"
        data={allowedMinutes(scheduledAt.getHours())}
        keyExtractor={(item) => String(item)}
        renderItem={(item) => (
          <TouchableOpacity
            style={styles.listItem}
            onPress={() => {
              const next = new Date(scheduledAt);
              next.setMinutes(item, 0, 0);
              setScheduledAt(next);
              setShowMinutePicker(false);
              setHasSelectedTime(true);
            }}
          >
            <Text style={styles.listItemTitle}>{String(item).padStart(2, "0")}</Text>
          </TouchableOpacity>
        )}
        emptyMessage="Nenhum minuto disponível."
        onClose={() => setShowMinutePicker(false)}
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
    },
    title: {
      fontSize: 24,
      fontWeight: "700",
      color: theme.colors.text,
    },
    subtitle: {
      marginTop: 6,
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    selectItemsButton: {
      marginTop: 12,
      alignSelf: "center",
      backgroundColor: theme.colors.primary,
      borderRadius: 5,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    selectItemsText: {
      color: theme.colors.textLight,
      fontWeight: "700",
      fontSize: 16,
    },
    card: {
      marginTop: 16,
      padding: 16,
      borderRadius: 16,
      backgroundColor: theme.colors.cardBackground,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
      gap: 16,
    },
    cartRow: {
      gap: 12,
    },
    cartInfo: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 12,
    },
    cartName: {
      flex: 1,
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.text,
    },
    cartPrice: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    cartMeta: {
      fontSize: 12,
      color: theme.colors.textSecondary,
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
      fontSize: 16,
      fontWeight: "700",
      color: theme.colors.text,
    },
    selector: {
      padding: 12,
      borderRadius: 12,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
      backgroundColor: theme.general.placeholderBackground,
      flex: 1,
    },
    selectorLabel: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    selectorValue: {
      marginTop: 4,
      fontSize: 15,
      fontWeight: "600",
      color: theme.colors.text,
    },
    scheduleRow: {
      flexDirection: "row",
      gap: 12,
    },
    helperText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    submitButton: {
      paddingVertical: 14,
      borderRadius: 12,
      backgroundColor: theme.colors.accentSuccess,
      alignItems: "center",
    },
    submitButtonDisabled: {
      opacity: 0.7,
    },
    submitText: {
      color: theme.colors.textLight,
      fontSize: 16,
      fontWeight: "700",
    },
    sectionTitle: {
      marginTop: 24,
      fontSize: 18,
      fontWeight: "700",
      color: theme.colors.text,
    },
    sectionHeader: {
      marginTop: 24,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    filterButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: 5,
      paddingHorizontal: 12,
      paddingVertical: 6,
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
    empty: {
      textAlign: "center",
      marginTop: 16,
      color: theme.colors.textSecondary,
    },
    loading: {
      marginTop: 20,
    },
    listItem: {
      paddingVertical: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.border,
    },
    listItemTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.text,
    },
    listItemSubtitle: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
  });
