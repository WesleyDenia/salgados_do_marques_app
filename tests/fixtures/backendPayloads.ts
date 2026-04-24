export const backendPayloadFixtures = {
  listWrappedWithMeta: {
    data: [
      { id: 1, title: "Banner principal", is_active: true },
      { id: 2, title: "Promoção", is_active: false },
    ],
    links: {
      first: "https://api.example.test/content-home?page=1",
      last: "https://api.example.test/content-home?page=1",
    },
    meta: {
      current_page: 1,
      total: 2,
    },
  },
  authWrappedObject: {
    data: {
      user: {
        id: 10,
        name: "Cliente Teste",
      },
      token: "jwt-token",
    },
    message: "Login realizado com sucesso.",
  },
  forgotPasswordPlainObject: {
    message: "Código enviado via WhatsApp.",
    expires_in_minutes: 10,
  },
  validationError: {
    message: "The given data was invalid.",
    errors: {
      phone: ["O telefone informado é inválido."],
      token: ["O código está expirado."],
    },
  },
  genericApiError: {
    message: "Não foi possível concluir a operação.",
  },
  myCouponsProcessingPayload: {
    data: [
      {
        id: 44,
        external_code: null,
        external_id: null,
        type: "loyalty",
        loyalty_reward_id: 7,
        partner_campaign_id: null,
        active: true,
        status: "pending_erp",
        erp_status: "queued",
        erp_error: null,
        created_at: "2026-04-24T10:30:00Z",
        coupon: {
          id: 88,
          title: "Recompensa Especial",
          body: "Cupom em processamento.",
          code: "INT-PLACEHOLDER",
          image_url: null,
          recurrence: "none",
          starts_at: null,
          ends_at: null,
          active: true,
          type: "money",
          amount: 10,
        },
      },
    ],
  },
} as const;
