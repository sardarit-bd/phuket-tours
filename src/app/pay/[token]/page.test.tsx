import React from "react";
import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { baseApi } from "@/lib/api/base-api";
import PublicPaymentPage from "./page";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(),
}));

const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});

describe("Public Customer Payment Page (/pay/[token])", () => {
  it("renders loader initially when fetching payment link details", async () => {
    const paramsPromise = Promise.resolve({ token: "test-token-12345678901234567890123456789012" });

    await act(async () => {
      render(
        <Provider store={store}>
          <PublicPaymentPage params={paramsPromise} />
        </Provider>
      );
    });

    expect(screen.getByText(/Loading secure checkout/i)).toBeInTheDocument();
  });
});
