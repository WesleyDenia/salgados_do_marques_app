import { describe, expect, it } from "vitest";

import {
  buildDisplayCoupons,
  buildMyCouponsMap,
  getCouponStateCopy,
  hasUsableCouponCode,
} from "@/utils/coupons";
import type { Coupon, UserCoupon } from "@/types";

describe("useCouponsData partner merge helpers", () => {
  it("includes private partner coupons before public coupons and keeps external code only when synced", () => {
    const publicCoupons: Coupon[] = [
      {
        id: 20,
        title: "Cupom Público",
        body: "Público",
        code: "PUBLICO",
        image_url: null,
        recurrence: "none",
        starts_at: null,
        ends_at: null,
        active: true,
        type: "money",
        amount: 5,
      },
    ];

    const partnerCoupon: UserCoupon = {
      id: 7,
      active: true,
      external_code: "PAR-777",
      status: "synced",
      type: "partner",
      created_at: "2026-03-25T12:00:00Z",
      origin: {
        type: "partner",
        label: "Cupom Parceiro",
        partner: { id: 1, name: "Parceiro", slug: "parceiro" },
        partner_campaign: { id: 9, public_name: "Campanha" },
      },
      coupon: {
        id: 10,
        title: "Cupom Privado",
        body: "Privado",
        code: "BASE",
        image_url: null,
        recurrence: "none",
        starts_at: null,
        ends_at: null,
        active: true,
        type: "money",
        amount: 10,
      },
    };

    const displayCoupons = buildDisplayCoupons(publicCoupons, [partnerCoupon]);

    expect(displayCoupons.map((coupon) => coupon.id)).toEqual([10, 20]);
    expect(displayCoupons[0]?.code).toBe("PAR-777");
    expect(displayCoupons[0]?.origin?.type).toBe("partner");
  });

  it("keeps pending coupons visible without exposing placeholder code", () => {
    const processingCoupon: UserCoupon = {
      id: 11,
      active: true,
      external_code: null,
      status: "pending_erp",
      type: "loyalty",
      created_at: "2026-04-24T10:30:00Z",
      coupon: {
        id: 90,
        title: "Recompensa",
        body: "Processando",
        code: "INT-123",
        image_url: null,
        recurrence: "none",
        starts_at: null,
        ends_at: null,
        active: true,
        type: "money",
        amount: 8,
      },
    };

    const displayCoupons = buildDisplayCoupons([], [processingCoupon]);

    expect(displayCoupons[0]?.code).toBe("");
    expect(hasUsableCouponCode(processingCoupon)).toBe(false);
    expect(getCouponStateCopy(processingCoupon)?.title).toBe("Cupom em processamento");
  });

  it("marks failed and cancelled coupons as non-copyable", () => {
    const failedCoupon: UserCoupon = {
      id: 21,
      active: true,
      external_code: null,
      status: "failed_erp",
      type: "partner",
      coupon: {
        id: 42,
        title: "Falhou",
        body: "Falhou",
        code: "BASE-FAIL",
        image_url: null,
        recurrence: "none",
        starts_at: null,
        ends_at: null,
        active: true,
        type: "money",
        amount: 5,
      },
    };

    const cancelledCoupon: UserCoupon = {
      ...failedCoupon,
      id: 22,
      status: "cancelled",
      active: false,
    };

    expect(getCouponStateCopy(failedCoupon)?.title).toBe("Cupom indisponível");
    expect(getCouponStateCopy(cancelledCoupon)?.title).toBe("Cupom cancelado");
    expect(hasUsableCouponCode(cancelledCoupon)).toBe(false);
  });

  it("keeps regular coupons copyable when ERP already returned an external code", () => {
    const regularCoupon: UserCoupon = {
      id: 31,
      active: true,
      external_code: "REG-321",
      status: "pending",
      type: "regular",
      coupon: {
        id: 77,
        title: "Cupom regular",
        body: "Descricao",
        code: "BASE-REG",
        image_url: null,
        recurrence: "none",
        starts_at: null,
        ends_at: null,
        active: true,
        type: "money",
        amount: 12,
      },
    };

    const displayCoupons = buildDisplayCoupons([], [regularCoupon]);

    expect(hasUsableCouponCode(regularCoupon)).toBe(true);
    expect(displayCoupons[0]?.code).toBe("REG-321");
  });

  it("builds the user coupon map keyed by coupon id", () => {
    const userCoupons: UserCoupon[] = [
      {
        id: 1,
        active: true,
        status: "pending",
        type: "regular",
        coupon: {
          id: 33,
          title: "Cupom",
          body: "Descrição",
          code: "ABC",
          image_url: null,
          recurrence: "none",
          starts_at: null,
          ends_at: null,
          active: true,
          type: "money",
          amount: 5,
        },
      },
    ];

    expect(buildMyCouponsMap(userCoupons)[33]?.id).toBe(1);
  });
});
