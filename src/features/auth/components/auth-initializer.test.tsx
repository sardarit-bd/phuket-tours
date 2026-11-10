import * as React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { AuthInitializer } from "./auth-initializer";
import { makeStore, type AppStore } from "@/store";
import {
  selectCurrentUser,
  selectIsAuthenticated,
  selectIsAuthInitialized,
  selectAuthStatus,
} from "../slices/auth-slice";

describe("AuthInitializer Component", () => {
  const originalFetch = globalThis.fetch;
  let store: AppStore;

  const setupMockFetch = (status: number, responseBody: unknown) => {
    globalThis.fetch = vi.fn().mockImplementation(async () => {
      return {
        ok: status >= 200 && status < 300,
        status,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => responseBody,
        text: async () => JSON.stringify(responseBody),
        clone() {
          return this;
        },
      } as unknown as Response;
    });
  };

  const renderInitializer = () => {
    store = makeStore();
    return {
      ...render(
        <Provider store={store}>
          <AuthInitializer />
        </Provider>
      ),
      store,
    };
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("restores user session on startup when /auth/me returns 200", async () => {
    setupMockFetch(200, {
      success: true,
      message: "Profile retrieved successfully",
      data: {
        id: "user-123",
        name: "Somsak Jaidee",
        email: "somsak@example.com",
        phone: "+66 89 123 4567",
        role: "customer",
        status: "active",
        createdAt: "2026-01-15T08:00:00.000Z",
      },
    });

    const { store: activeStore } = renderInitializer();

    // Initially uninitialized before query resolves
    expect(selectIsAuthInitialized(activeStore.getState())).toBe(false);

    await waitFor(() => {
      expect(selectIsAuthInitialized(activeStore.getState())).toBe(true);
      expect(selectIsAuthenticated(activeStore.getState())).toBe(true);
      expect(selectCurrentUser(activeStore.getState())).toEqual(
        expect.objectContaining({
          id: "user-123",
          name: "Somsak Jaidee",
          email: "somsak@example.com",
          role: "customer",
        })
      );
      expect(selectAuthStatus(activeStore.getState())).toBe("succeeded");
    });
  });

  it("handles 401 response by marking initialized with unauthenticated state and idle status", async () => {
    setupMockFetch(401, {
      success: false,
      message: "Authentication required",
    });

    const { store: activeStore } = renderInitializer();

    await waitFor(() => {
      expect(selectIsAuthInitialized(activeStore.getState())).toBe(true);
      expect(selectIsAuthenticated(activeStore.getState())).toBe(false);
      expect(selectCurrentUser(activeStore.getState())).toBeNull();
      expect(selectAuthStatus(activeStore.getState())).toBe("idle");
    });
  });

  it("handles network/server failure by setting status to failed for error fallback presentation", async () => {
    setupMockFetch(500, {
      success: false,
      message: "Internal server error",
    });

    const { store: activeStore } = renderInitializer();

    await waitFor(() => {
      expect(selectIsAuthInitialized(activeStore.getState())).toBe(true);
      expect(selectIsAuthenticated(activeStore.getState())).toBe(false);
      expect(selectCurrentUser(activeStore.getState())).toBeNull();
      expect(selectAuthStatus(activeStore.getState())).toBe("failed");
    });
  });
});
