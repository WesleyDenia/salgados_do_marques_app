type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

export function unwrapApiList<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) {
    return payload as T[];
  }

  if (isRecord(payload) && Array.isArray(payload.data)) {
    return payload.data as T[];
  }

  return [];
}

export function unwrapApiObject<T>(payload: unknown): T | null {
  if (isRecord(payload) && isRecord(payload.data)) {
    return payload.data as T;
  }

  if (isRecord(payload)) {
    return payload as T;
  }

  return null;
}
