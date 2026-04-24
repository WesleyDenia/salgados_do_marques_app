import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import CheckoutItemsCard from "@/components/cart/CheckoutItemsCard";
import PickupScheduleCard from "@/components/cart/PickupScheduleCard";
import { useThemeMode } from "@/context/ThemeContext";
import { useCart } from "@/context/CartContext";
import { useCartCheckout } from "@/hooks/useCartCheckout";

export default function CartScreen() {
  const router = useRouter();
  const { theme } = useThemeMode();
  const styles = createStyles(theme);
  const { items, total, updateQuantity, removeItem } = useCart();
  const checkout = useCartCheckout();

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Carrinho vazio</Text>
          <Text style={styles.emptyText}>
            Adicione produtos no menu para começar uma nova encomenda.
          </Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => router.replace("/(tabs)/menu")}>
            <Text style={styles.primaryButtonText}>Ir ao menu</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Checkout atual</Text>
          <Text style={styles.subtitle}>
            Defina a retirada e confirme esta encomenda antes de consultar o histórico.
          </Text>
        </View>

        <PickupScheduleCard
          theme={theme}
          stores={checkout.stores}
          loadingStores={checkout.loadingStores}
          storesError={checkout.storesError}
          onRetryStores={() => {
            void checkout.fetchStores({ accepts_orders: true });
          }}
          settings={checkout.settings}
          settingsError={checkout.settingsError}
          onRetrySettings={() => {
            void checkout.loadSettings();
          }}
          selectedStore={checkout.selectedStore}
          onSelectStore={checkout.setSelectedStore}
          selectedDate={checkout.selectedDate}
          onSelectDate={checkout.setSelectedDate}
          selectedHour={checkout.selectedHour}
          onSelectHour={checkout.setSelectedHour}
          selectedMinute={checkout.selectedMinute}
          onSelectMinute={checkout.setSelectedMinute}
          hasSelectedDate={checkout.hasSelectedDate}
          hasSelectedTime={checkout.hasSelectedTime}
          availableDates={checkout.availableDates}
          availableHours={checkout.availableHours}
          minuteOptions={checkout.minuteOptions}
          loadingDates={checkout.loadingDates}
          loadingHours={checkout.loadingHours}
          loadingMinutes={checkout.loadingMinutes}
          datesError={checkout.datesError}
          hoursError={checkout.hoursError}
          minutesError={checkout.minutesError}
          onRetryDates={() => {
            void checkout.retryDates();
          }}
          onRetryHours={() => {
            void checkout.retryHours();
          }}
          onRetryMinutes={() => {
            void checkout.retryMinutes();
          }}
          scheduleUnavailable={checkout.scheduleUnavailable}
          scheduleSummary={checkout.scheduleFlowContext.summary}
          scheduleStep={checkout.scheduleFlowContext.nextStep}
          readinessMessage={checkout.checkoutReadiness.message}
          readinessTone={checkout.checkoutReadiness.tone}
          submitError={checkout.submitError}
        />

        <CheckoutItemsCard
          items={items}
          total={total}
          onUpdateQuantity={updateQuantity}
          onRemove={removeItem}
          theme={theme}
        />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            (!checkout.checkoutReadiness.ready || checkout.submitting) && styles.submitButtonDisabled,
          ]}
          disabled={!checkout.checkoutReadiness.ready || checkout.submitting}
          onPress={async () => {
            const result = await checkout.submitOrder();
            if (result.ok) {
              router.replace({
                pathname: "/success" as never,
                params: result.successParams,
              });
            }
          }}
        >
          {checkout.submitting ? (
            <ActivityIndicator color={theme.colors.textLight} />
          ) : (
            <Text style={styles.submitText}>{checkout.checkoutReadiness.ctaLabel}</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (theme: ReturnType<typeof useThemeMode>["theme"]) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.general.screenBackground,
    },
    content: {
      padding: 20,
      gap: 18,
      paddingBottom: 120,
    },
    header: {
      gap: 6,
    },
    title: {
      fontSize: 24,
      fontWeight: "700",
      color: theme.colors.text,
    },
    subtitle: {
      fontSize: 14,
      lineHeight: 20,
      color: theme.colors.textSecondary,
    },
    emptyState: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 28,
      gap: 12,
    },
    emptyTitle: {
      fontSize: 24,
      fontWeight: "700",
      color: theme.colors.text,
    },
    emptyText: {
      fontSize: 14,
      lineHeight: 20,
      color: theme.colors.textSecondary,
      textAlign: "center",
    },
    primaryButton: {
      marginTop: 8,
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 12,
    },
    primaryButtonText: {
      color: theme.colors.textLight,
      fontWeight: "700",
    },
    footer: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 20,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.border,
      backgroundColor: theme.general.screenBackground,
    },
    submitButton: {
      paddingVertical: 16,
      borderRadius: 14,
      backgroundColor: theme.colors.primary,
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
  });
