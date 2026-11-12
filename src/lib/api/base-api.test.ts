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
    const store = makeStore();
    const result = await store.dispatch(toursApi.endpoints.getTours.initiate());

    expect(result.data).toBeDefined();
    expect(result.data?.total).toBeGreaterThan(0);
    expect(Array.isArray(result.data?.data)).toBe(true);
    expect(result.data?.data.length).toBeGreaterThan(0);
  });
});
