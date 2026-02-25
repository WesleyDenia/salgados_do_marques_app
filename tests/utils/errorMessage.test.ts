import axios, { AxiosError } from "axios";
import { describe, expect, it } from "vitest";

import { getApiErrorMessage } from "@/utils/errorMessage";

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

describe("utils/errorMessage", () => {
  it("returns first Laravel validation error message when available", () => {
    const error = makeAxiosError({
      message: "Dados invalidos.",
      errors: {
        phone: ["Telefone invalido."],
        name: ["Nome obrigatorio."],
      },
    });

    expect(getApiErrorMessage(error)).toBe("Telefone invalido.");
  });

  it("returns API message when axios error has no validation errors", () => {
    const error = makeAxiosError({
      message: "Nao foi possivel salvar o pedido.",
    });

    expect(getApiErrorMessage(error)).toBe("Nao foi possivel salvar o pedido.");
  });

  it("falls back to generic Error.message for non-axios errors", () => {
    expect(getApiErrorMessage(new Error("Erro local de rede"))).toBe("Erro local de rede");
  });

  it("returns custom fallback when no message can be extracted", () => {
    expect(getApiErrorMessage({ foo: "bar" }, "Fallback customizado")).toBe(
      "Fallback customizado"
    );
    expect(getApiErrorMessage(makeAxiosError("invalid-payload"), "Fallback customizado")).toBe(
      "Request failed"
    );
  });

  it("ignores malformed Laravel errors arrays and still uses message", () => {
    const error = makeAxiosError({
      message: "Mensagem da API.",
      errors: {
        phone: [123],
      },
    });

    expect(getApiErrorMessage(error)).toBe("Mensagem da API.");
  });
});
