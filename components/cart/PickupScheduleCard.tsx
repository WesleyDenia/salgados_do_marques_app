import { useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Calendar, DateData, LocaleConfig } from "react-native-calendars";

import ListModal from "@/components/orders/ListModal";
import { getInteractiveFieldStyles } from "@/components/ui/InteractiveField";
import { AppTheme } from "@/constants/theme";
import { OrderSettings, Store } from "@/types";
import { buildCalendarMarkedDates } from "@/utils/orderAvailability";

LocaleConfig.locales["pt-PT"] = {
  monthNames: [
    "Janeiro",
    "Fevereiro",
    "Marco",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ],
  monthNamesShort: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"],
  dayNames: ["Domingo", "Segunda-feira", "Terca-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sabado"],
  dayNamesShort: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"],
  today: "Hoje",
};
LocaleConfig.defaultLocale = "pt-PT";

type PickupScheduleCardProps = {
  theme: AppTheme;
  stores: Store[];
  loadingStores: boolean;
  storesError: string | null;
  onRetryStores: () => void;
  settings: OrderSettings | null;
  settingsError: string | null;
  onRetrySettings: () => void;
  selectedStore: Store | null;
  onSelectStore: (store: Store) => void;
  selectedDate: string | null;
  onSelectDate: (value: string) => void;
  selectedHour: string | null;
  onSelectHour: (value: string) => void;
  selectedMinute: string | null;
  onSelectMinute: (value: string) => void;
  hasSelectedDate: boolean;
  hasSelectedTime: boolean;
  availableDates: string[];
  availableHours: string[];
  minuteOptions: string[];
  loadingDates: boolean;
  loadingHours: boolean;
  loadingMinutes: boolean;
  datesError: string | null;
  hoursError: string | null;
  minutesError: string | null;
  onRetryDates: () => void;
  onRetryHours: () => void;
  onRetryMinutes: () => void;
  scheduleUnavailable: boolean;
  scheduleSummary: string;
  scheduleStep: string;
  readinessMessage: string;
  readinessTone: "neutral" | "warning" | "error" | "success";
  submitError: string | null;
};

export default function PickupScheduleCard(props: PickupScheduleCardProps) {
  const styles = createStyles(props.theme);
  const [showStoreModal, setShowStoreModal] = useState(false);
  const [showHourPicker, setShowHourPicker] = useState(false);
  const [showMinutePicker, setShowMinutePicker] = useState(false);

  const formattedDate = useMemo(
    () =>
      props.selectedDate
        ? new Date(`${props.selectedDate}T00:00:00`).toLocaleDateString("pt-PT", {
            weekday: "long",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })
        : "Selecionar data",
    [props.selectedDate]
  );
  const formattedTime = useMemo(
    () => props.selectedMinute ?? props.selectedHour ?? "--:--",
    [props.selectedHour, props.selectedMinute]
  );
  const markedDates = useMemo(
    () => buildCalendarMarkedDates(props.availableDates, props.selectedDate),
    [props.availableDates, props.selectedDate]
  );

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Retirada</Text>
        <Text style={styles.subtitle}>
          Escolha a loja, a data e o horário disponíveis para concluir o checkout.
        </Text>
      </View>

      <TouchableOpacity
        style={[
          styles.selector,
          (props.selectedStore || showStoreModal) && styles.selectorActive,
        ]}
        onPress={() => setShowStoreModal(true)}
      >
        <Text style={styles.selectorLabel}>Loja de retirada</Text>
        <Text style={styles.selectorValue}>
          {props.selectedStore ? props.selectedStore.name : "Selecionar loja"}
        </Text>
      </TouchableOpacity>

      {props.storesError ? (
        <View style={styles.inlineErrorBlock}>
          <Text style={styles.inlineErrorText}>{props.storesError}</Text>
          <TouchableOpacity style={styles.inlineRetryButton} onPress={props.onRetryStores}>
            <Text style={styles.inlineRetryText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <View style={styles.scheduleRow}>
        <View
          style={[
            styles.selector,
            props.hasSelectedDate && styles.selectorActive,
            props.scheduleUnavailable && styles.selectorDisabled,
          ]}
        >
          <Text style={styles.selectorLabel}>Data (Passo 1)</Text>
          <Text style={styles.selectorValue}>{props.hasSelectedDate ? formattedDate : "Selecionar data"}</Text>
          <View style={styles.calendarWrapper}>
            <Calendar
              current={props.selectedDate ?? props.availableDates[0]}
              markedDates={markedDates}
              disabledByDefault
              enableSwipeMonths
              disableAllTouchEventsForDisabledDays
              onDayPress={(day: DateData) => {
                if (!props.availableDates.includes(day.dateString)) {
                  return;
                }

                props.onSelectDate(day.dateString);
              }}
              theme={{
                backgroundColor: props.theme.colors.cardBackground,
                calendarBackground: props.theme.colors.cardBackground,
                textSectionTitleColor: props.theme.colors.textSecondary,
                monthTextColor: props.theme.colors.text,
                dayTextColor: props.theme.colors.text,
                todayTextColor: props.theme.colors.primary,
                textDisabledColor: props.theme.colors.textMuted ?? props.theme.colors.textSecondary,
                arrowColor: props.theme.colors.primary,
              }}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.selector,
            (props.hasSelectedTime || showHourPicker || showMinutePicker) && styles.selectorActive,
            (!props.hasSelectedDate || props.loadingHours) && styles.selectorDisabled,
          ]}
          onPress={() => setShowHourPicker(true)}
          disabled={!props.hasSelectedDate || props.loadingHours}
        >
          <Text style={styles.selectorLabel}>Hora (Passos 2-3)</Text>
          <Text style={styles.selectorValue}>{props.hasSelectedTime ? formattedTime : "--:--"}</Text>
        </TouchableOpacity>
      </View>

      {props.settings ? (
        <Text style={styles.helperText}>
          Tempo mínimo de preparação: {props.settings.minimum_minutes} min. Datas exibidas já respeitam a agenda da loja.
        </Text>
      ) : null}

      {props.settingsError ? (
        <View style={styles.inlineErrorBlock}>
          <Text style={styles.inlineErrorText}>{props.settingsError}</Text>
          <TouchableOpacity style={styles.inlineRetryButton} onPress={props.onRetrySettings}>
            <Text style={styles.inlineRetryText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {props.datesError ? (
        <View style={styles.inlineErrorBlock}>
          <Text style={styles.inlineErrorText}>{props.datesError}</Text>
          <TouchableOpacity style={styles.inlineRetryButton} onPress={props.onRetryDates}>
            <Text style={styles.inlineRetryText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {props.hoursError ? (
        <View style={styles.inlineErrorBlock}>
          <Text style={styles.inlineErrorText}>{props.hoursError}</Text>
          <TouchableOpacity style={styles.inlineRetryButton} onPress={props.onRetryHours}>
            <Text style={styles.inlineRetryText}>Recarregar horas</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {props.minutesError ? (
        <View style={styles.inlineErrorBlock}>
          <Text style={styles.inlineErrorText}>{props.minutesError}</Text>
          <TouchableOpacity style={styles.inlineRetryButton} onPress={props.onRetryMinutes}>
            <Text style={styles.inlineRetryText}>Recarregar minutos</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {props.submitError ? (
        <View style={styles.inlineErrorBlock}>
          <Text style={styles.inlineErrorText}>{props.submitError}</Text>
        </View>
      ) : null}

      <Text style={styles.scheduleSummaryText}>{props.scheduleSummary}</Text>
      <Text style={styles.scheduleStepText}>{props.scheduleStep}</Text>
      <Text
        style={[
          styles.checkoutStatus,
          props.readinessTone === "success" && styles.checkoutStatusSuccess,
          props.readinessTone === "error" && styles.checkoutStatusError,
        ]}
      >
        {props.readinessMessage}
      </Text>

      <ListModal
        visible={showStoreModal}
        title="Selecione a loja"
        data={props.loadingStores ? [] : props.stores}
        keyExtractor={(item) => String(item.id)}
        renderItem={(item) => (
          <TouchableOpacity
            style={styles.listItem}
            onPress={() => {
              props.onSelectStore(item);
              setShowStoreModal(false);
            }}
          >
            <Text style={styles.listItemTitle}>{item.name}</Text>
            <Text style={styles.listItemSubtitle}>{item.address}</Text>
          </TouchableOpacity>
        )}
        emptyMessage={
          props.loadingStores ? "Carregando lojas..." : "Nenhuma loja disponível para encomendas."
        }
        onClose={() => setShowStoreModal(false)}
        theme={props.theme}
      />

      <ListModal
        visible={showHourPicker}
        title="Passo 2 de 3: selecione a hora"
        data={props.availableHours}
        keyExtractor={(item) => item}
        renderItem={(item) => (
          <TouchableOpacity
            style={styles.listItem}
            onPress={() => {
              props.onSelectHour(item);
              setShowHourPicker(false);
              setShowMinutePicker(true);
            }}
          >
            <Text style={styles.listItemTitle}>{item}</Text>
          </TouchableOpacity>
        )}
        emptyMessage={props.loadingHours ? "Carregando horas..." : "Nenhuma hora disponível."}
        onClose={() => setShowHourPicker(false)}
        theme={props.theme}
      />

      <ListModal
        visible={showMinutePicker}
        title="Passo 3 de 3: selecione os minutos"
        data={props.minuteOptions}
        keyExtractor={(item) => item}
        renderItem={(item) => (
          <TouchableOpacity
            style={styles.listItem}
            onPress={() => {
              props.onSelectMinute(item);
              setShowMinutePicker(false);
            }}
          >
            <Text style={styles.listItemTitle}>{item}</Text>
          </TouchableOpacity>
        )}
        emptyMessage={props.loadingMinutes ? "Carregando minutos..." : "Nenhum minuto disponível."}
        onClose={() => setShowMinutePicker(false)}
        theme={props.theme}
      />
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
    selector: {
      padding: 12,
      borderRadius: 12,
      ...getInteractiveFieldStyles(theme, { variant: "inputLike", state: "default" }),
      flex: 1,
    },
    selectorActive: {
      ...getInteractiveFieldStyles(theme, { variant: "inputLike", state: "active" }),
    },
    selectorDisabled: {
      ...getInteractiveFieldStyles(theme, { variant: "inputLike", state: "disabled" }),
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
      gap: 12,
    },
    calendarWrapper: {
      marginTop: 12,
      borderRadius: 12,
      overflow: "hidden",
    },
    helperText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      lineHeight: 17,
    },
    inlineErrorBlock: {
      borderRadius: 10,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.general.errorBorder,
      backgroundColor: theme.general.surfaceElevated,
      padding: 10,
      gap: 8,
    },
    inlineErrorText: {
      fontSize: 12,
      color: theme.colors.errorText,
      lineHeight: 16,
    },
    inlineRetryButton: {
      alignSelf: "flex-start",
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
      backgroundColor: theme.colors.primary,
    },
    inlineRetryText: {
      color: theme.colors.textLight,
      fontSize: 12,
      fontWeight: "700",
    },
    scheduleSummaryText: {
      fontSize: 13,
      color: theme.colors.text,
      lineHeight: 18,
    },
    scheduleStepText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      lineHeight: 16,
    },
    checkoutStatus: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      lineHeight: 18,
    },
    checkoutStatusSuccess: {
      color: theme.colors.successText,
      fontWeight: "600",
    },
    checkoutStatusError: {
      color: theme.colors.errorText,
      fontWeight: "600",
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
    listItemSubtitle: {
      marginTop: 2,
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
  });
