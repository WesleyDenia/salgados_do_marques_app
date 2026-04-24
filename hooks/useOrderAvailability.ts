import { useCallback, useEffect, useRef, useState } from "react";

import api from "@/api/api";
import {
  OrderAvailabilityDates,
  OrderAvailabilityHours,
  OrderAvailabilityMinutes,
} from "@/types";
import {
  buildScheduledAtFromSelection,
  normalizeAvailabilitySelection,
} from "@/utils/orderAvailability";

type UseOrderAvailabilityArgs = {
  enabled: boolean;
  storeId: number | null;
  selectedDate: string | null;
  setSelectedDate: (value: string | null) => void;
  selectedHour: string | null;
  setSelectedHour: (value: string | null) => void;
  selectedMinute: string | null;
  setSelectedMinute: (value: string | null) => void;
};

const isAbortLikeError = (error: unknown) =>
  typeof error === "object" &&
  error !== null &&
  ("name" in error ? error.name === "AbortError" || error.name === "CanceledError" : false);

export function useOrderAvailability({
  enabled,
  storeId,
  selectedDate,
  setSelectedDate,
  selectedHour,
  setSelectedHour,
  selectedMinute,
  setSelectedMinute,
}: UseOrderAvailabilityArgs) {
  const datesControllerRef = useRef<AbortController | null>(null);
  const hoursControllerRef = useRef<AbortController | null>(null);
  const minutesControllerRef = useRef<AbortController | null>(null);

  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [availableHours, setAvailableHours] = useState<string[]>([]);
  const [minuteOptions, setMinuteOptions] = useState<string[]>([]);
  const [loadingDates, setLoadingDates] = useState(false);
  const [loadingHours, setLoadingHours] = useState(false);
  const [loadingMinutes, setLoadingMinutes] = useState(false);
  const [datesError, setDatesError] = useState<string | null>(null);
  const [hoursError, setHoursError] = useState<string | null>(null);
  const [minutesError, setMinutesError] = useState<string | null>(null);

  const fetchDates = useCallback(async () => {
    if (!enabled || !storeId) {
      setAvailableDates([]);
      return;
    }

    datesControllerRef.current?.abort();
    const controller = new AbortController();
    datesControllerRef.current = controller;

    setLoadingDates(true);
    setDatesError(null);

    try {
      const { data } = await api.get<{ data: OrderAvailabilityDates }>("/orders/availability/dates", {
        params: { store_id: storeId },
        signal: controller.signal,
      });
      setAvailableDates(Array.isArray(data?.data?.dates) ? data.data.dates : []);
    } catch (error) {
      if (isAbortLikeError(error)) return;
      console.error("Erro ao carregar datas de agendamento", error);
      setAvailableDates([]);
      setDatesError("Não foi possível carregar as datas disponíveis.");
    } finally {
      setLoadingDates(false);
    }
  }, [enabled, storeId]);

  const fetchHours = useCallback(async () => {
    if (!enabled || !storeId || !selectedDate) {
      setAvailableHours([]);
      return;
    }

    hoursControllerRef.current?.abort();
    const controller = new AbortController();
    hoursControllerRef.current = controller;

    setLoadingHours(true);
    setHoursError(null);

    try {
      const { data } = await api.get<{ data: OrderAvailabilityHours }>("/orders/availability/hours", {
        params: { store_id: storeId, date: selectedDate },
        signal: controller.signal,
      });
      setAvailableHours(Array.isArray(data?.data?.hours) ? data.data.hours : []);
    } catch (error) {
      if (isAbortLikeError(error)) return;
      console.error("Erro ao carregar horas de agendamento", error);
      setAvailableHours([]);
      setHoursError("Não foi possível carregar as horas disponíveis.");
    } finally {
      setLoadingHours(false);
    }
  }, [enabled, selectedDate, storeId]);

  const fetchMinutes = useCallback(async () => {
    if (!enabled || !storeId || !selectedDate || !selectedHour) {
      setMinuteOptions([]);
      return;
    }

    minutesControllerRef.current?.abort();
    const controller = new AbortController();
    minutesControllerRef.current = controller;

    setLoadingMinutes(true);
    setMinutesError(null);

    try {
      const { data } = await api.get<{ data: OrderAvailabilityMinutes }>("/orders/availability/minutes", {
        params: { store_id: storeId, date: selectedDate, hour: selectedHour },
        signal: controller.signal,
      });
      setMinuteOptions(Array.isArray(data?.data?.minute_options) ? data.data.minute_options : []);
    } catch (error) {
      if (isAbortLikeError(error)) return;
      console.error("Erro ao carregar minutos de agendamento", error);
      setMinuteOptions([]);
      setMinutesError("Não foi possível carregar os minutos disponíveis.");
    } finally {
      setLoadingMinutes(false);
    }
  }, [enabled, selectedDate, selectedHour, storeId]);

  useEffect(() => {
    if (!enabled || !storeId) {
      datesControllerRef.current?.abort();
      hoursControllerRef.current?.abort();
      minutesControllerRef.current?.abort();
      setAvailableDates([]);
      setAvailableHours([]);
      setMinuteOptions([]);
      setDatesError(null);
      setHoursError(null);
      setMinutesError(null);
      return;
    }

    void fetchDates();
  }, [enabled, fetchDates, storeId]);

  useEffect(() => {
    if (!selectedDate) {
      hoursControllerRef.current?.abort();
      minutesControllerRef.current?.abort();
      setAvailableHours([]);
      setMinuteOptions([]);
      setHoursError(null);
      setMinutesError(null);
      return;
    }

    void fetchHours();
  }, [fetchHours, selectedDate]);

  useEffect(() => {
    if (!selectedHour) {
      minutesControllerRef.current?.abort();
      setMinuteOptions([]);
      setMinutesError(null);
      return;
    }

    void fetchMinutes();
  }, [fetchMinutes, selectedHour]);

  useEffect(() => {
    if (loadingDates) return;

    const normalizedDate = normalizeAvailabilitySelection(selectedDate, availableDates);
    if (selectedDate !== normalizedDate) {
      setSelectedDate(normalizedDate);
      setSelectedHour(null);
      setSelectedMinute(null);
    }
  }, [
    availableDates,
    loadingDates,
    selectedDate,
    setSelectedDate,
    setSelectedHour,
    setSelectedMinute,
  ]);

  useEffect(() => {
    if (loadingHours) return;

    const normalizedHour = normalizeAvailabilitySelection(selectedHour, availableHours);
    if (selectedHour !== normalizedHour) {
      setSelectedHour(normalizedHour);
      setSelectedMinute(null);
    }
  }, [availableHours, loadingHours, selectedHour, setSelectedHour, setSelectedMinute]);

  useEffect(() => {
    if (loadingMinutes) return;

    const normalizedMinute = normalizeAvailabilitySelection(selectedMinute, minuteOptions);
    if (selectedMinute !== normalizedMinute) {
      setSelectedMinute(normalizedMinute);
    }
  }, [loadingMinutes, minuteOptions, selectedMinute, setSelectedMinute]);

  return {
    availableDates,
    availableHours,
    minuteOptions,
    loadingDates,
    loadingHours,
    loadingMinutes,
    datesError,
    hoursError,
    minutesError,
    scheduleUnavailable: Boolean(storeId && !loadingDates && availableDates.length === 0 && !datesError),
    retryDates: fetchDates,
    retryHours: fetchHours,
    retryMinutes: fetchMinutes,
  };
}
