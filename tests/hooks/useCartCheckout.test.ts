import { describe, expect, it } from "vitest";

import {
  buildCheckoutReadiness,
  buildOrderPayload,
  buildScheduleFlowContext,
  buildSuccessParams,
  formatLocalDateTime,
} from "@/utils/cartCheckout";

function localDate(year: number, monthIndex: number, day: number, hour = 0, minute = 0) {
  return new Date(year, monthIndex, day, hour, minute, 0, 0);
}

describe("hooks/useCartCheckout pure helpers", () => {
  it("marks checkout as not ready until the pickup selections are complete", () => {
    expect(
      buildCheckoutReadiness({
        itemCount: 1,
        selectedStore: null,
        hasSelectedDate: false,
        hasSelectedTime: false,
        scheduleError: null,
        scheduleUnavailable: false,
      })
    ).toMatchObject({
      ready: false,
      ctaLabel: "Selecione loja para continuar",
    });
  });

  it("reports success readiness when store, date and time are all valid", () => {
    expect(
      buildCheckoutReadiness({
        itemCount: 2,
        selectedStore: {
          id: 10,
          name: "Loja Centro",
        } as never,
        hasSelectedDate: true,
        hasSelectedTime: true,
        scheduleError: null,
        scheduleUnavailable: false,
      })
    ).toMatchObject({
      ready: true,
      ctaLabel: "Confirmar encomenda",
    });
  });

  it("builds the backend payload with flattened flavors and local datetime formatting", () => {
    expect(
      buildOrderPayload({
        storeId: 3,
        scheduledAt: localDate(2026, 2, 14, 16, 5),
        items: [
          {
            productId: 11,
            variantId: 21,
            quantity: 2,
            flavors: [
              { id: 5, quantity: 2 },
              { id: 8, quantity: 1 },
            ],
          },
        ],
      })
    ).toEqual({
      store_id: 3,
      scheduled_at: "2026-03-14 16:05",
      items: [
        {
          product_id: 11,
          variant_id: 21,
          quantity: 2,
          flavors: [5, 5, 8],
        },
      ],
    });
  });

  it("formats success params with a precomputed scheduled label", () => {
    expect(
      buildSuccessParams({
        orderId: 77,
        storeName: "Loja Centro",
        scheduledAt: localDate(2026, 2, 15, 9, 30),
        hasSelectedDate: true,
        hasSelectedTime: true,
      })
    ).toEqual({
      orderId: "77",
      storeName: "Loja Centro",
      scheduledLabel: "Retirada em 15/03/2026 às 09:30",
    });
  });

  it("keeps success params safe when schedule labels are incomplete", () => {
    expect(
      buildSuccessParams({
        orderId: "nova",
        storeName: null,
        scheduledAt: localDate(2026, 2, 15, 9, 30),
        hasSelectedDate: false,
        hasSelectedTime: false,
      })
    ).toEqual({
      orderId: "nova",
      storeName: "",
      scheduledLabel: "",
    });
  });

  it("builds schedule guidance copy by progress step", () => {
    expect(
      buildScheduleFlowContext({
        hasSelectedDate: true,
        hasSelectedTime: false,
        scheduledAt: localDate(2026, 2, 15, 9, 30),
        scheduleUnavailable: false,
      })
    ).toEqual({
      nextStep: "Passo 2 e 3 de 3: selecione hora e minutos da retirada.",
      summary: "Data selecionada: 15/03/2026. Falta definir o horário.",
    });
  });

  it("formats local datetime without seconds", () => {
    expect(formatLocalDateTime(localDate(2026, 2, 14, 7, 5))).toBe("2026-03-14 07:05");
  });
});
