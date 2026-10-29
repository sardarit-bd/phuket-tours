import { describe, it, expect } from "vitest";
import { baseApi } from "./base-api";
import { toursApi } from "@/features/tours/api/tours-api";
import { makeStore } from "@/store";

describe("baseApi configuration", () => {
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
    // Testing that tag types can be provided/invalidated without runtime error
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

  it("keeps existing toursApi query functional through the store", async () => {
    const store = makeStore();
    const result = await store.dispatch(toursApi.endpoints.getTours.initiate());

    expect(result.data).toBeDefined();
    expect(result.data?.total).toBeGreaterThan(0);
    expect(Array.isArray(result.data?.data)).toBe(true);
    expect(result.data?.data.length).toBeGreaterThan(0);
  });
});
