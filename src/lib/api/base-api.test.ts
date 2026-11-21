import { describe, it, expect, vi } from "vitest";
import { baseApi, parseRetryAfter } from "./base-api";
import { toursApi } from "@/features/tours/api/tours-api";
import { makeStore } from "@/store";

describe("baseApi configuration & Retry-After parser", () => {
  it("initializes baseApi with correct reducerPath", () => {
    expect(baseApi.reducerPath).toBe("api");
  });

  it("registers baseApi reducer and middleware into the Redux store", () => {
    const store = makeStore();
    const state = store.getState();

    expect(state).toHaveProperty("api");
    expect(typeof state.api.queries).toBe("object");
  });

  it("supports endpoints using Tour, Experience, Booking, Category, Auth, and User tag types", () => {
    const testApi = baseApi.injectEndpoints({
      endpoints: (builder) => ({
        testAuthEndpoint: builder.query<{ status: string }, void>({
          queryFn: () => ({ data: { status: "ok" } }),
          providesTags: ["Auth", "User", "Tour", "Experience", "Booking", "Category"],
        }),
      }),
      overrideExisting: true,
    });

    expect(testApi.endpoints.testAuthEndpoint).toBeDefined();
  });

  it("correctly parses integer seconds Retry-After header with bounded max cap", () => {
    const headers = new Headers();
    headers.set("retry-after", "15");
    expect(parseRetryAfter(headers)).toBe(15000);

    // Capped at 30 seconds
    headers.set("retry-after", "120");
    expect(parseRetryAfter(headers)).toBe(30000);
  });

  it("returns null when Retry-After header is missing or invalid", () => {
    expect(parseRetryAfter(undefined)).toBeNull();
    const headers = new Headers();
    expect(parseRetryAfter(headers)).toBeNull();
    headers.set("retry-after", "invalid-str");
    expect(parseRetryAfter(headers)).toBeNull();
  });

  it("keeps existing toursApi query functional through the store", async () => {
    const originalFetch = globalThis.fetch;
    const mockResponseBody = {
      success: true,
      data: {
        items: [
          {
            id: "tour-1",
            name: "Similan Islands Day Trip",
            description: "Full day tour",
            type: "TOUR",
            status: "PUBLISHED",
            pricingSummary: { basePrice: 200, currency: "THB" },
          },
        ],
        pagination: { total: 1, page: 1, limit: 12, totalPages: 1 },
      },
    };

    try {
      globalThis.fetch = vi.fn().mockImplementation(async () => {
        return {
          ok: true,
          status: 200,
          headers: new Headers({ "content-type": "application/json" }),
          json: async () => mockResponseBody,
          text: async () => JSON.stringify(mockResponseBody),
          clone() {
            return this;
          },
        } as unknown as Response;
      });

      const store = makeStore();
      const result = await store.dispatch(
        toursApi.endpoints.getTours.initiate(undefined, { forceRefetch: true })
      );

      expect(result.data).toBeDefined();
      expect(result.data?.total).toBeGreaterThan(0);
      expect(Array.isArray(result.data?.data)).toBe(true);
      expect(result.data?.data.length).toBeGreaterThan(0);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("coordinates concurrent 401 requests with single-flight refresh without deadlocks", async () => {
    const originalFetch = globalThis.fetch;
    let refreshCalls = 0;
    let servicesCalls = 0;

    const mockAuthRefreshResponse = {
      success: true,
      data: {
        accessToken: "new-access-token-999",
        user: {
          id: "u-1",
          email: "admin@phukettours.com",
          role: "admin",
          status: "active",
        },
      },
    };

    try {
      globalThis.fetch = vi.fn().mockImplementation(async (reqInfo: RequestInfo | URL, init?: RequestInit) => {
        let url = "";
        let authHeader: string | null = null;

        if (reqInfo instanceof Request) {
          url = reqInfo.url;
          authHeader = reqInfo.headers.get("authorization");
        } else {
          url = String(reqInfo);
          const headers = new Headers(init?.headers);
          authHeader = headers.get("authorization");
        }

        if (url.includes("/auth/refresh")) {
          refreshCalls++;
          // simulate slight network delay
          await new Promise((r) => setTimeout(r, 20));
          return {
            ok: true,
            status: 200,
            headers: new Headers({ "content-type": "application/json" }),
            json: async () => mockAuthRefreshResponse,
            text: async () => JSON.stringify(mockAuthRefreshResponse),
            clone() {
              return this;
            },
          } as unknown as Response;
        }

        // Normal query
        servicesCalls++;
        // If request does not have the new token, return 401
        if (authHeader !== "Bearer new-access-token-999") {
          return {
            ok: false,
            status: 401,
            headers: new Headers({ "content-type": "application/json" }),
            json: async () => ({ success: false, message: "Unauthorized, token expired" }),
            text: async () => JSON.stringify({ success: false, message: "Unauthorized, token expired" }),
            clone() {
              return this;
            },
          } as unknown as Response;
        }

        // After refresh, returns 200
        return {
          ok: true,
          status: 200,
          headers: new Headers({ "content-type": "application/json" }),
          json: async () => ({ success: true, data: { status: "ok" } }),
          text: async () => JSON.stringify({ success: true, data: { status: "ok" } }),
          clone() {
            return this;
          },
        } as unknown as Response;
      });

      const store = makeStore();
      const testApi = baseApi.injectEndpoints({
        endpoints: (builder) => ({
          testResourceA: builder.query<{ status: string }, void>({
            query: () => "/test-resource-a",
          }),
          testResourceB: builder.query<{ status: string }, void>({
            query: () => "/test-resource-b",
          }),
          testResourceC: builder.query<{ status: string }, void>({
            query: () => "/test-resource-c",
          }),
        }),
        overrideExisting: true,
      });

      // Fire 3 simultaneous requests that all hit 401 at the same time
      const [resA, resB, resC] = await Promise.all([
        store.dispatch(testApi.endpoints.testResourceA.initiate(undefined, { forceRefetch: true })),
        store.dispatch(testApi.endpoints.testResourceB.initiate(undefined, { forceRefetch: true })),
        store.dispatch(testApi.endpoints.testResourceC.initiate(undefined, { forceRefetch: true })),
      ]);
      // All 3 queries should succeed after token refresh
      expect(resA.data).toEqual({ success: true, data: { status: "ok" } });
      expect(resB.data).toEqual({ success: true, data: { status: "ok" } });
      expect(resC.data).toEqual({ success: true, data: { status: "ok" } });

      // Only exactly ONE refresh call should have been dispatched (single-flight)
      expect(refreshCalls).toBe(1);

      // Verify the new token is persisted in Redux state
      expect(store.getState().auth.accessToken).toBe("new-access-token-999");
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
