import { useCallback, useEffect, useMemo, useState } from "react";

import api from "@/api/api";
import { useCart } from "@/context/CartContext";
import { useOrderAvailability } from "@/hooks/useOrderAvailability";
import { useStores } from "@/hooks/useStores";
import { refreshOrdersHistory } from "@/hooks/useOrdersHistory";
import {
  buildCheckoutReadiness,
  buildOrderPayload,
  buildScheduleFlowContext,
  buildSuccessParams,
} from "@/utils/cartCheckout";
import { getApiErrorMessage } from "@/utils/errorMessage";
import { buildScheduledAtFromSelection } from "@/utils/orderAvailability";
import { OrderSettings, Store } from "@/types";
function buildScheduleUnavailableMessage(settings: OrderSettings | null) {
  const count = Math.max(1, Number(settings?.scheduling_window_days ?? 0));
  const label = count === 1 ? "a próxima data disponível" : `as próximas ${count} datas disponíveis`;

  return `A agenda desta loja está indisponível para ${label}.`;
}

export function useCartCheckout() {
  const { items, clear } = useCart();
  const { stores, loading: loadingStores, error: storesError, fetchStores } = useStores();

  const [settings, setSettings] = useState<OrderSettings | null>(null);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedHour, setSelectedHour] = useState<string | null>(null);
  const [selectedMinute, setSelectedMinute] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const availableStores = useMemo(() => stores.filter((store) => store.accepts_orders ?? false), [stores]);

  useEffect(() => {
    if (selectedStore && availableStores.some((store) => store.id === selectedStore.id)) return;
    if (availableStores.length === 0) {
      setSelectedStore(null);
      return;
    }

    const preferred = availableStores.find((store) => store.default_store) ?? availableStores[0];
    if (preferred) {
      setSelectedStore(preferred);
    }
  }, [availableStores, selectedStore]);

  const loadSettings = useCallback(async () => {
    try {
      setSettingsError(null);
      const { data } = await api.get<{ data: OrderSettings }>("/orders/settings");
      const nextSettings = data.data;
      setSettings(nextSettings);
    } catch (error) {
      console.error("Erro ao carregar settings de encomendas", error);
      setSettingsError("Não foi possível carregar as regras de agendamento.");
    }
  }, []);

  useEffect(() => {
    if (items.length === 0) {
      return;
    }

    void fetchStores({ accepts_orders: true });
    void loadSettings();
  }, [fetchStores, items.length, loadSettings]);

  useEffect(() => {
    setSelectedDate(null);
    setSelectedHour(null);
    setSelectedMinute(null);
  }, [selectedStore?.id]);

  const {
    availableDates,
    availableHours,
    minuteOptions,
    loadingDates,
    loadingHours,
    loadingMinutes,
    datesError,
    hoursError,
    minutesError,
    scheduleUnavailable,
    retryDates,
    retryHours,
    retryMinutes,
  } = useOrderAvailability({
    enabled: items.length > 0,
    storeId: selectedStore?.id ?? null,
    selectedDate,
    setSelectedDate,
    selectedHour,
    setSelectedHour,
    selectedMinute,
    setSelectedMinute,
  });

  const scheduledAt = useMemo(
    () => buildScheduledAtFromSelection(selectedDate, selectedMinute ?? selectedHour),
    [selectedDate, selectedHour, selectedMinute]
  );
  const hasSelectedDate = selectedDate !== null;
  const hasSelectedTime = selectedMinute !== null;
  const scheduleUnavailableMessage = buildScheduleUnavailableMessage(settings);

  const validateSchedule = useCallback(() => {
    if (selectedStore && scheduleUnavailable) {
      return scheduleUnavailableMessage;
    }

    if (!hasSelectedDate || !hasSelectedTime) {
      return "Selecione data e hora para retirada.";
    }

    if (!selectedDate || !availableDates.includes(selectedDate)) {
      return "Essa loja não estará aberta nessa data.";
    }

    if (!selectedHour || !availableHours.includes(selectedHour)) {
      return "O horário escolhido está fora do funcionamento dessa loja.";
    }

    if (!selectedMinute || !minuteOptions.includes(selectedMinute)) {
      return "O horário escolhido está fora do funcionamento dessa loja.";
    }

    return null;
  }, [
    availableDates,
    availableHours,
    hasSelectedDate,
    hasSelectedTime,
    minuteOptions,
    scheduleUnavailable,
    scheduleUnavailableMessage,
    selectedDate,
    selectedHour,
    selectedMinute,
    selectedStore,
  ]);

  const scheduleError = useMemo(() => validateSchedule(), [validateSchedule]);

  const checkoutReadiness = useMemo(
    () =>
      buildCheckoutReadiness({
        itemCount: items.length,
        selectedStore,
        hasSelectedDate,
        hasSelectedTime,
        scheduleError,
        scheduleUnavailable,
        scheduleUnavailableMessage,
      }),
    [
      hasSelectedDate,
      hasSelectedTime,
      items.length,
      scheduleError,
      scheduleUnavailable,
      scheduleUnavailableMessage,
      selectedStore,
    ]
  );

  const scheduleFlowContext = useMemo(
    () =>
      buildScheduleFlowContext({
        hasSelectedDate,
        hasSelectedTime,
        scheduledAt,
        scheduleUnavailable,
      }),
    [hasSelectedDate, hasSelectedTime, scheduleUnavailable, scheduledAt]
  );

  const submitOrder = useCallback(async () => {
    if (submitting || !selectedStore || !checkoutReadiness.ready) {
      return { ok: false as const, error: checkoutReadiness.message };
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const payload = buildOrderPayload({
        storeId: selectedStore.id,
        scheduledAt,
        items: items.map((item) => ({
          productId: item.product.id,
          variantId: item.variant?.id ?? null,
          quantity: item.quantity,
          flavors: item.flavors,
        })),
      });

      const response = await api.post("/orders", payload);
      const orderId =
        response?.data?.data?.id ??
        response?.data?.id ??
        response?.data?.order?.id ??
        response?.data?.data?.order?.id ??
        "nova";

      try {
        await refreshOrdersHistory();
      } catch (refreshError) {
        console.error("Erro ao atualizar histórico após checkout", refreshError);
      }

      clear();

      return {
        ok: true as const,
        successParams: buildSuccessParams({
          orderId,
          storeName: selectedStore.name,
          scheduledAt,
          hasSelectedDate,
          hasSelectedTime,
        }),
      };
    } catch (error) {
      const message = getApiErrorMessage(error, "Não foi possível enviar a encomenda agora.");
      setSubmitError(message);
      return { ok: false as const, error: message };
    } finally {
      setSubmitting(false);
    }
  }, [
    checkoutReadiness.message,
    checkoutReadiness.ready,
    clear,
    hasSelectedDate,
    hasSelectedTime,
    items,
    scheduledAt,
    selectedStore,
    submitting,
  ]);

  return {
    stores: availableStores,
    loadingStores,
    storesError,
    fetchStores,
    settings,
    settingsError,
    loadSettings,
    selectedStore,
    setSelectedStore,
    scheduledAt,
    selectedDate,
    setSelectedDate,
    selectedHour,
    setSelectedHour,
    selectedMinute,
    setSelectedMinute,
    hasSelectedDate,
    hasSelectedTime,
    availableDates,
    availableHours,
    minuteOptions,
    loadingDates,
    loadingHours,
    loadingMinutes,
    datesError,
    hoursError,
    minutesError,
    retryDates,
    retryHours,
    retryMinutes,
    scheduleUnavailable,
    checkoutReadiness,
    scheduleFlowContext,
    submitting,
    submitError,
    submitOrder,
    itemsCount: items.length,
    validateSchedule,
  };
}
