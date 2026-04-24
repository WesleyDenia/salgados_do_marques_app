import { Store } from "@/types";

const formatDateLabel = (value: Date) => value.toLocaleDateString("pt-PT");
const formatTimeLabel = (value: Date) =>
  value.toLocaleTimeString("pt-PT", {
    hour: "2-digit",
    minute: "2-digit",
  });

export const formatLocalDateTime = (date: Date) => {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
};

export function buildCheckoutReadiness(args: {
  itemCount: number;
  selectedStore: Store | null;
  hasSelectedDate: boolean;
  hasSelectedTime: boolean;
  scheduleError: string | null;
  scheduleUnavailable: boolean;
  scheduleUnavailableMessage?: string | null;
}) {
  if (args.itemCount === 0) {
    return {
      ready: false,
      message: "Adicione itens à encomenda para continuar.",
      tone: "neutral" as const,
      ctaLabel: "Adicione itens para continuar",
    };
  }

  if (!args.selectedStore) {
    return {
      ready: false,
      message: "Selecione a loja de retirada.",
      tone: "warning" as const,
      ctaLabel: "Selecione loja para continuar",
    };
  }

  if (args.scheduleUnavailable) {
    return {
      ready: false,
      message: args.scheduleUnavailableMessage ?? "A agenda desta loja está indisponível nos próximos dias.",
      tone: "error" as const,
      ctaLabel: "Escolha outra loja",
    };
  }

  if (!args.hasSelectedDate) {
    return {
      ready: false,
      message: "Selecione a data de retirada.",
      tone: "warning" as const,
      ctaLabel: "Selecione data para continuar",
    };
  }

  if (!args.hasSelectedTime) {
    return {
      ready: false,
      message: "Selecione a hora de retirada.",
      tone: "warning" as const,
      ctaLabel: "Selecione hora para continuar",
    };
  }

  if (args.scheduleError) {
    return {
      ready: false,
      message: args.scheduleError,
      tone: "error" as const,
      ctaLabel: "Ajuste o horário para confirmar",
    };
  }

  return {
    ready: true,
    message: "Tudo pronto para confirmar sua encomenda.",
    tone: "success" as const,
    ctaLabel: "Confirmar encomenda",
  };
}

export function buildScheduleFlowContext(args: {
  hasSelectedDate: boolean;
  hasSelectedTime: boolean;
  scheduledAt: Date;
  scheduleUnavailable: boolean;
}) {
  if (args.scheduleUnavailable) {
    return {
      nextStep: "Selecione outra loja ou ajuste a agenda no painel.",
      summary: "Sem horários de retirada disponíveis nos próximos 14 dias.",
    };
  }

  const dateLabel = args.hasSelectedDate ? formatDateLabel(args.scheduledAt) : "data";
  const timeLabel = args.hasSelectedTime ? formatTimeLabel(args.scheduledAt) : "hora";

  if (!args.hasSelectedDate) {
    return {
      nextStep: "Passo 1 de 3: selecione a data de retirada.",
      summary: "Retirada ainda não agendada.",
    };
  }

  if (!args.hasSelectedTime) {
    return {
      nextStep: "Passo 2 e 3 de 3: selecione hora e minutos da retirada.",
      summary: `Data selecionada: ${dateLabel}. Falta definir o horário.`,
    };
  }

  return {
    nextStep: "Horário de retirada definido.",
    summary: `Retirada prevista para ${dateLabel} às ${timeLabel}.`,
  };
}

export function buildOrderPayload(args: {
  storeId: number;
  scheduledAt: Date;
  items: Array<{
    productId: number;
    variantId?: number | null;
    quantity: number;
    flavors?: Array<{ id: number; quantity: number }>;
  }>;
}) {
  return {
    store_id: args.storeId,
    scheduled_at: formatLocalDateTime(args.scheduledAt),
    items: args.items.map((item) => ({
      product_id: item.productId,
      variant_id: item.variantId ?? null,
      quantity: item.quantity,
      flavors:
        item.flavors && item.flavors.length > 0
          ? item.flavors.flatMap((flavor) =>
              Array.from({ length: flavor.quantity }, () => flavor.id)
            )
          : undefined,
    })),
  };
}

export function buildSuccessParams(args: {
  orderId: number | string;
  storeName?: string | null;
  scheduledAt: Date;
  hasSelectedDate: boolean;
  hasSelectedTime: boolean;
}) {
  return {
    orderId: String(args.orderId),
    storeName: args.storeName ?? "",
    scheduledLabel:
      args.hasSelectedDate && args.hasSelectedTime
        ? `Retirada em ${formatDateLabel(args.scheduledAt)} às ${formatTimeLabel(args.scheduledAt)}`
        : "",
  };
}
