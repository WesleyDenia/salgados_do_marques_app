import axios, { AxiosError } from "axios";
import { describe, expect, it } from "vitest";

import { unwrapApiList, unwrapApiObject } from "@/utils/apiResponse";
import { getApiErrorMessage } from "@/utils/errorMessage";
import { backendPayloadFixtures } from "@/tests/fixtures/backendPayloads";

function makeAxiosError(data?: unknown) {
  const error = new AxiosError("Request failed");
  error.response = {
    data,
    status: 422,
    statusText: "Unprocessable Entity",
    headers: {},
    config: { headers: axios.AxiosHeaders.from({}) },
  };
  return error;
}

describe("regression: backend payload contracts", () => {
  it("keeps support for Laravel collection payloads with data/meta/links", () => {
    const list = unwrapApiList<{ id: number; title: string }>(
      backendPayloadFixtures.listWrappedWithMeta
    );

    expect(list).toHaveLength(2);
    expect(list[0]).toMatchObject({ id: 1, title: "Banner principal" });
  });

  it("keeps support for wrapped auth payloads and plain object payloads", () => {
    const auth = unwrapApiObject<{ token: string; user: { id: number } }>(
      backendPayloadFixtures.authWrappedObject
    );
    const forgot = unwrapApiObject<{ message: string; expires_in_minutes: number }>(
      backendPayloadFixtures.forgotPasswordPlainObject
    );

    expect(auth?.token).toBe("jwt-token");
    expect(auth?.user.id).toBe(10);
    expect(forgot).toEqual({
      message: "Código enviado via WhatsApp.",
      expires_in_minutes: 10,
    });
  });

  it("prioritizes Laravel validation field message over generic API message", () => {
    const error = makeAxiosError(backendPayloadFixtures.validationError);
    expect(getApiErrorMessage(error)).toBe("O telefone informado é inválido.");
  });

  it("uses API message when validation bag is absent", () => {
    const error = makeAxiosError(backendPayloadFixtures.genericApiError);
    expect(getApiErrorMessage(error)).toBe("Não foi possível concluir a operação.");
  });
});
