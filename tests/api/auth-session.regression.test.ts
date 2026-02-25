import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  return {
    asyncStorage: {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      multiRemove: vi.fn(),
    },
    sessionStorage: {
      getToken: vi.fn(),
      setToken: vi.fn(),
      clearToken: vi.fn(),
    },
  };
});

vi.mock("@react-native-async-storage/async-storage", () => ({
  default: mocks.asyncStorage,
}));

vi.mock("@/utils/env", () => ({
  getApiBaseUrl: () => "https://api.test.local/api/v1",
}));

vi.mock("@/utils/sessionStorage", () => ({
  getToken: mocks.sessionStorage.getToken,
  setToken: mocks.sessionStorage.setToken,
  clearToken: mocks.sessionStorage.clearToken,
}));

import api, { __apiTestUtils, handleApiResponseError, setUnauthorizedHandler } from "@/api/api";

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe("regression: auth/session 401 refresh/reset flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    __apiTestUtils.resetInternalState();
    setUnauthorizedHandler(null);
    mocks.sessionStorage.getToken.mockResolvedValue(null);
    mocks.sessionStorage.setToken.mockResolvedValue(undefined);
    mocks.sessionStorage.clearToken.mockResolvedValue(undefined);
    mocks.asyncStorage.setItem.mockResolvedValue(undefined);
    mocks.asyncStorage.removeItem.mockResolvedValue(undefined);
    mocks.asyncStorage.multiRemove.mockResolvedValue(undefined);
    api.defaults.adapter = undefined;
  });

  it("deduplicates concurrent unauthorized notifications and calls handler once", async () => {
    const gate = deferred<void>();
    const handler = vi.fn(async () => {
      await gate.promise;
    });
    setUnauthorizedHandler(handler);

    const p1 = __apiTestUtils.notifyUnauthorized();
    const p2 = __apiTestUtils.notifyUnauthorized();
    await Promise.resolve();

    expect(handler).toHaveBeenCalledTimes(1);

    gate.resolve();
    await Promise.all([p1, p2]);
  });

  it("falls back to clearing local session when no unauthorized handler is attached", async () => {
    await __apiTestUtils.notifyUnauthorized();

    expect(mocks.sessionStorage.clearToken).toHaveBeenCalledTimes(1);
    expect(mocks.asyncStorage.multiRemove).toHaveBeenCalledWith(["user", "config"]);
  });

  it("deduplicates concurrent refresh calls and persists refreshed session data", async () => {
    mocks.sessionStorage.getToken.mockResolvedValue("old-token");
    const refreshGate = deferred<{ data: any }>();
    const post = vi.fn(() => refreshGate.promise);
    const createSpy = vi.spyOn(axios, "create").mockReturnValue({ post } as any);

    const p1 = __apiTestUtils.refreshToken();
    const p2 = __apiTestUtils.refreshToken();
    await Promise.resolve();

    expect(post).toHaveBeenCalledTimes(1);

    refreshGate.resolve({
      data: {
        token: "new-token",
        user: { id: 7, name: "Cliente" },
        config: { currency: "EUR" },
      },
    });

    await expect(Promise.all([p1, p2])).resolves.toEqual(["new-token", "new-token"]);
    expect(mocks.sessionStorage.setToken).toHaveBeenCalledWith("new-token");
    expect(mocks.asyncStorage.setItem).toHaveBeenCalledWith(
      "config",
      JSON.stringify({ currency: "EUR" })
    );
    expect(mocks.asyncStorage.setItem).toHaveBeenCalledWith(
      "user",
      JSON.stringify({ id: 7, name: "Cliente" })
    );
    expect(api.defaults.headers.Authorization).toBe("Bearer new-token");

    createSpy.mockRestore();
  });

  it("retries a 401 request once after successful refresh and injects the new token", async () => {
    mocks.sessionStorage.getToken.mockResolvedValue("old-token");
    vi.spyOn(axios, "create").mockReturnValue({
      post: vi.fn().mockResolvedValue({
        data: { token: "fresh-token" },
      }),
    } as any);

    api.defaults.adapter = vi.fn(async (config) => ({
      data: { ok: true },
      status: 200,
      statusText: "OK",
      headers: {},
      config,
    }));

    const error = {
      response: { status: 401 },
      config: { url: "/protected", method: "get", headers: {} as Record<string, string> },
    };

    const response = await handleApiResponseError(error);

    expect(response.data).toEqual({ ok: true });
    expect(error.config._retry).toBe(true);
    expect(error.config.headers.Authorization).toBe("Bearer fresh-token");
  });

  it("rejects and triggers centralized reset flow when refresh fails on 401", async () => {
    const unauthorizedHandler = vi.fn().mockResolvedValue(undefined);
    setUnauthorizedHandler(unauthorizedHandler);
    mocks.sessionStorage.getToken.mockResolvedValue(null);

    const error = { response: { status: 401 }, config: { headers: {} } };

    await expect(handleApiResponseError(error)).rejects.toBe(error);
    expect(unauthorizedHandler).toHaveBeenCalledTimes(1);
  });
});
