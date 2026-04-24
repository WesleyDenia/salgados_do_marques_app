import { AppTheme } from "@/constants/theme";
import { OrderStatus } from "@/types/order";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  placed: "Realizada",
  accepted: "Aceita",
  rejected: "Rejeitada",
  ready: "Pronta",
  done: "Concluída",
  canceled: "Cancelada",
};

export function getOrderStatusLabel(status: OrderStatus) {
  return ORDER_STATUS_LABELS[status] ?? status;
}

export function getOrderStatusColors(status: OrderStatus, theme: AppTheme) {
  switch (status) {
    case "accepted":
      return {
        background: theme.colors.accentSuccess,
        text: theme.colors.textLight,
      };
    case "ready":
      return {
        background: theme.colors.primary,
        text: theme.colors.textLight,
      };
    case "rejected":
    case "canceled":
      return {
        background: theme.colors.errorFill,
        text: theme.colors.textLight,
      };
    case "done":
      return {
        background: theme.colors.disabledBackground,
        text: theme.colors.text,
      };
    case "placed":
    default:
      return {
        background: theme.general.surface,
        text: theme.colors.text,
      };
  }
}
