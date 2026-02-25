import axios from "axios";

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

function getFirstValidationMessage(errors: unknown): string | null {
  if (!isRecord(errors)) return null;

  for (const value of Object.values(errors)) {
    if (Array.isArray(value) && typeof value[0] === "string") {
      return value[0];
    }
  }

  return null;
}

export function getApiErrorMessage(
  error: unknown,
  fallback = "Falha ao processar sua requisição."
): string {
  if (axios.isAxiosError(error)) {
    const data: unknown = error.response?.data;

    // Laravel validation: { message, errors: { field: [msg] } }
    if (isRecord(data)) {
      const validationMessage = getFirstValidationMessage(data.errors);
      if (validationMessage) return validationMessage;

      if (typeof data.message === "string") {
        return data.message;
      }
    }
  }

  if (isRecord(error) && typeof error.message === "string") return error.message;
  return fallback;
}
