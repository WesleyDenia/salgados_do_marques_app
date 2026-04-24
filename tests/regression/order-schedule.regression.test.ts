import { describe, expect, it } from "vitest";

import {
  buildCheckoutReadiness,
  buildOrderPayload,
  buildScheduleFlowContext,
} from "@/utils/cartCheckout";

function localDate(year: number, monthIndex: number, day: number, hour = 0, minute = 0) {
  return new Date(year, monthIndex, day, hour, minute, 0, 0);
}

describe("regression: server-driven order schedule", () => {
  it("blocks checkout when the backend reports no available dates", () => {
    expect(
      buildCheckoutReadiness({
        itemCount: 1,
        selectedStore: { id: 1, name: "Loja Centro" } as never,
        hasSelectedDate: false,
        hasSelectedTime: false,
        scheduleError: null,
        scheduleUnavailable: true,
        scheduleUnavailableMessage: "A agenda desta loja está indisponível para as próximas 5 datas disponíveis.",
      })
    ).toMatchObject({
      ready: false,
      message: "A agenda desta loja está indisponível para as próximas 5 datas disponíveis.",
    });
  });

  it("keeps the checkout guidance aligned with progressive date and time selection", () => {
    expect(
      buildScheduleFlowContext({
        hasSelectedDate: true,
        hasSelectedTime: false,
        scheduledAt: localDate(2026, 2, 19, 15, 0),
        scheduleUnavailable: false,
      })
    ).toEqual({
      nextStep: "Passo 2 e 3 de 3: selecione hora e minutos da retirada.",
      summary: "Data selecionada: 19/03/2026. Falta definir o horário.",
    });
  });

  it("serializes the final scheduled_at using the backend-selected minute slot", () => {
    expect(
      buildOrderPayload({
        storeId: 1,
        scheduledAt: localDate(2026, 2, 19, 15, 35),
        items: [{ productId: 11, quantity: 1 }],
      })
    ).toMatchObject({
      scheduled_at: "2026-03-19 15:35",
    });
  });
});
