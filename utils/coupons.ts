import type { Coupon, UserCoupon, UserCouponStatus } from "@/types";

const READY_STATUSES: UserCouponStatus[] = ["synced"];
const PROCESSING_STATUSES: UserCouponStatus[] = ["pending_erp", "syncing_erp"];
const FAILURE_STATUSES: UserCouponStatus[] = ["failed_erp", "manual_review", "cancelled"];

export function hasUsableCouponCode(userCoupon?: UserCoupon | null): boolean {
  if (!userCoupon) return false;

  if (!userCoupon.external_code?.trim()) {
    return false;
  }

  if (userCoupon.type === "regular") {
    return userCoupon.status !== "done" && userCoupon.active;
  }

  return READY_STATUSES.includes(userCoupon.status);
}

export function isProcessingCoupon(userCoupon?: UserCoupon | null): boolean {
  return !!userCoupon && PROCESSING_STATUSES.includes(userCoupon.status);
}

export function isUnavailableCoupon(userCoupon?: UserCoupon | null): boolean {
  return !!userCoupon && FAILURE_STATUSES.includes(userCoupon.status);
}

export function getCouponStateCopy(userCoupon?: UserCoupon | null): { title: string; hint: string } | null {
  if (!userCoupon) return null;

  if (hasUsableCouponCode(userCoupon)) {
    return {
      title: "Cupom pronto para uso",
      hint: "Copie o código e apresente na loja no momento do pagamento.",
    };
  }

  if (isProcessingCoupon(userCoupon)) {
    return {
      title: "Cupom em processamento",
      hint: "O código será liberado assim que a sincronização com o ERP terminar.",
    };
  }

  if (userCoupon.status === "manual_review") {
    return {
      title: "Cupom em revisão",
      hint: "A equipe precisa revisar este benefício antes de liberar um código.",
    };
  }

  if (userCoupon.status === "cancelled") {
    return {
      title: "Cupom cancelado",
      hint: "Este benefício foi encerrado e não possui código utilizável.",
    };
  }

  if (userCoupon.status === "failed_erp") {
    return {
      title: "Cupom indisponível",
      hint: "Houve uma falha operacional ao gerar o código. Tente atualizar em instantes.",
    };
  }

  return null;
}

export function buildMyCouponsMap(userCoupons: UserCoupon[]): Record<number, UserCoupon> {
  return userCoupons.reduce<Record<number, UserCoupon>>((accumulator, userCoupon) => {
    const couponId = userCoupon.coupon?.id;

    if (couponId != null) {
      accumulator[couponId] = userCoupon;
    }

    return accumulator;
  }, {});
}

export function buildDisplayCoupons(coupons: Coupon[], userCoupons: UserCoupon[]): Coupon[] {
  const publicCoupons = coupons.filter((coupon) => {
    const userCoupon = userCoupons.find((candidate) => candidate.coupon?.id === coupon.id);
    return !userCoupon || userCoupon.status !== "done";
  });

  const privateCoupons = userCoupons
    .filter((userCoupon) => userCoupon.status !== "done" && userCoupon.coupon)
    .sort((left, right) => {
      const leftTime = left.created_at ? new Date(left.created_at).getTime() : 0;
      const rightTime = right.created_at ? new Date(right.created_at).getTime() : 0;
      return rightTime - leftTime;
    })
    .map((userCoupon) => ({
      ...userCoupon.coupon,
      code: hasUsableCouponCode(userCoupon) ? userCoupon.external_code?.trim() || "" : "",
      created_at: userCoupon.created_at ?? userCoupon.coupon?.created_at ?? null,
      origin: userCoupon.origin ?? userCoupon.coupon?.origin,
      user_coupon: userCoupon,
    })) as Coupon[];

  const merged = [...privateCoupons];
  const existingIds = new Set(privateCoupons.map((coupon) => coupon.id));

  publicCoupons.forEach((coupon) => {
    if (!existingIds.has(coupon.id)) {
      merged.push({
        ...coupon,
        user_coupon: null,
      });
    }
  });

  return merged;
}
