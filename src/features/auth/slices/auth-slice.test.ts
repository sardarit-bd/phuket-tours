import { describe, it, expect } from "vitest";
import {
  authReducer,
  setCredentials,
  clearCredentials,
  setAuthStatus,
  setInitialized,
  selectCurrentUser,
  selectIsAuthenticated,
  selectIsAuthInitialized,
  selectAuthStatus,
  type AuthState,
} from "./auth-slice";
import { authApi } from "../api/auth-api";
import { makeStore } from "@/store";
import type { AuthUser, UserProfile } from "../types/auth";

describe("authSlice", () => {
  const initialAuthState: AuthState = {
    user: null,
    isAuthenticated: false,
    isInitialized: false,
    status: "idle",
  };

  const sampleUser: AuthUser = {
    id: "user-1",
    name: "John Doe",
    email: "john@example.com",
    role: "customer",
  };

  const sampleAdmin: AuthUser = {
    id: "admin-1",
    name: "Admin User",
    email: "admin@example.com",
    role: "admin",
  };

  const sampleProfile: UserProfile = {
    id: "user-1",
    name: "John Doe",
    email: "john@example.com",
    phone: "+66 81 234 5678",
    role: "customer",
    status: "active",
    createdAt: "2026-01-01T00:00:00.000Z",
  };

  it("returns the initial state on unknown action", () => {
    expect(authReducer(undefined, { type: "@@INIT" })).toEqual(initialAuthState);
  });

  it("handles setCredentials action", () => {
    const nextState = authReducer(initialAuthState, setCredentials(sampleUser));
    expect(nextState.user).toEqual(sampleUser);
    expect(nextState.isAuthenticated).toBe(true);
    expect(nextState.isInitialized).toBe(true);
    expect(nextState.status).toBe("succeeded");
  });

  it("handles clearCredentials action", () => {
    const loggedInState: AuthState = {
      user: sampleUser,
      isAuthenticated: true,
      isInitialized: true,
      status: "succeeded",
    };

    const nextState = authReducer(loggedInState, clearCredentials());
    expect(nextState.user).toBeNull();
    expect(nextState.isAuthenticated).toBe(false);
    expect(nextState.isInitialized).toBe(true);
    expect(nextState.status).toBe("idle");
  });

  it("handles setAuthStatus action", () => {
    const nextState = authReducer(initialAuthState, setAuthStatus("loading"));
    expect(nextState.status).toBe("loading");
  });

  it("handles setInitialized action", () => {
    const nextState = authReducer(initialAuthState, setInitialized(true));
    expect(nextState.isInitialized).toBe(true);
  });

  it("integrates authReducer into the Redux store created by makeStore", () => {
    const store = makeStore();
    expect(store.getState().auth).toEqual(initialAuthState);
    expect(selectIsAuthInitialized(store.getState())).toBe(false);

    store.dispatch(setCredentials(sampleAdmin));
    expect(selectCurrentUser(store.getState())).toEqual(sampleAdmin);
    expect(selectIsAuthenticated(store.getState())).toBe(true);
    expect(selectIsAuthInitialized(store.getState())).toBe(true);
    expect(selectAuthStatus(store.getState())).toBe("succeeded");

    store.dispatch(clearCredentials());
    expect(selectCurrentUser(store.getState())).toBeNull();
    expect(selectIsAuthenticated(store.getState())).toBe(false);
    expect(selectIsAuthInitialized(store.getState())).toBe(true);
  });

  describe("extraReducers matchers", () => {
    it("updates auth state on login.matchFulfilled", () => {
      const action = {
        type: `${authApi.reducerPath}/executeMutation/fulfilled`,
        payload: {
          success: true,
          message: "Login successful",
          data: sampleUser,
        },
        meta: {
          arg: {
            endpointName: "login",
          },
        },
      };

      expect(authApi.endpoints.login.matchFulfilled(action)).toBe(true);
      const nextState = authReducer(initialAuthState, action);
      expect(nextState.user).toEqual(sampleUser);
      expect(nextState.isAuthenticated).toBe(true);
      expect(nextState.isInitialized).toBe(true);
      expect(nextState.status).toBe("succeeded");
    });

    it("updates auth state on register.matchFulfilled", () => {
      const action = {
        type: `${authApi.reducerPath}/executeMutation/fulfilled`,
        payload: {
          success: true,
          message: "Registered successfully",
          data: sampleUser,
        },
        meta: {
          arg: {
            endpointName: "register",
          },
        },
      };

      expect(authApi.endpoints.register.matchFulfilled(action)).toBe(true);
      const nextState = authReducer(initialAuthState, action);
      expect(nextState.user).toEqual(sampleUser);
      expect(nextState.isAuthenticated).toBe(true);
      expect(nextState.isInitialized).toBe(true);
      expect(nextState.status).toBe("succeeded");
    });

    it("sets status to loading on getMe.matchPending", () => {
      const action = {
        type: `${authApi.reducerPath}/executeQuery/pending`,
        meta: {
          arg: {
            endpointName: "getMe",
          },
        },
      };

      expect(authApi.endpoints.getMe.matchPending(action)).toBe(true);
      const nextState = authReducer(initialAuthState, action);
      expect(nextState.status).toBe("loading");
    });

    it("updates auth state on getMe.matchFulfilled", () => {
      const action = {
        type: `${authApi.reducerPath}/executeQuery/fulfilled`,
        payload: {
          success: true,
          message: "Profile retrieved successfully",
          data: sampleProfile,
        },
        meta: {
          arg: {
            endpointName: "getMe",
          },
        },
      };

      expect(authApi.endpoints.getMe.matchFulfilled(action)).toBe(true);
      const nextState = authReducer(initialAuthState, action);
      expect(nextState.user).toEqual(sampleProfile);
      expect(nextState.isAuthenticated).toBe(true);
      expect(nextState.isInitialized).toBe(true);
      expect(nextState.status).toBe("succeeded");
    });

    it("handles 401 unauthenticated session on getMe.matchRejected without failing status", () => {
      const action = {
        type: `${authApi.reducerPath}/executeQuery/rejected`,
        payload: {
          status: 401,
          data: {
            success: false,
            message: "Authentication required",
          },
        },
        meta: {
          arg: {
            endpointName: "getMe",
          },
        },
      };

      expect(authApi.endpoints.getMe.matchRejected(action)).toBe(true);
      const nextState = authReducer(
        { ...initialAuthState, status: "loading" },
        action
      );
      expect(nextState.user).toBeNull();
      expect(nextState.isAuthenticated).toBe(false);
      expect(nextState.isInitialized).toBe(true);
      expect(nextState.status).toBe("idle");
    });

    it("handles network/server errors on getMe.matchRejected by setting status to failed", () => {
      const action = {
        type: `${authApi.reducerPath}/executeQuery/rejected`,
        payload: {
          status: 500,
          data: {
            success: false,
            message: "Internal server error",
          },
        },
        meta: {
          arg: {
            endpointName: "getMe",
          },
        },
      };

      expect(authApi.endpoints.getMe.matchRejected(action)).toBe(true);
      const nextState = authReducer(
        { ...initialAuthState, status: "loading" },
        action
      );
      expect(nextState.user).toBeNull();
      expect(nextState.isAuthenticated).toBe(false);
      expect(nextState.isInitialized).toBe(true);
      expect(nextState.status).toBe("failed");
    });

    it("clears auth state on logout.matchFulfilled", () => {
      const loggedInState: AuthState = {
        user: sampleUser,
        isAuthenticated: true,
        isInitialized: true,
        status: "succeeded",
      };

      const action = {
        type: `${authApi.reducerPath}/executeMutation/fulfilled`,
        payload: {
          success: true,
          message: "Logged out successfully",
          data: null,
        },
        meta: {
          arg: {
            endpointName: "logout",
          },
        },
      };

      expect(authApi.endpoints.logout.matchFulfilled(action)).toBe(true);
      const nextState = authReducer(loggedInState, action);
      expect(nextState.user).toBeNull();
      expect(nextState.isAuthenticated).toBe(false);
      expect(nextState.isInitialized).toBe(true);
      expect(nextState.status).toBe("idle");
    });

    it("clears auth state on logout.matchRejected for resilient cleanup", () => {
      const loggedInState: AuthState = {
        user: sampleUser,
        isAuthenticated: true,
        isInitialized: true,
        status: "succeeded",
      };

      const action = {
        type: `${authApi.reducerPath}/executeMutation/rejected`,
        payload: {
          status: 500,
          data: {
            success: false,
            message: "Logout failed",
          },
        },
        meta: {
          arg: {
            endpointName: "logout",
          },
        },
      };

      expect(authApi.endpoints.logout.matchRejected(action)).toBe(true);
      const nextState = authReducer(loggedInState, action);
      expect(nextState.user).toBeNull();
      expect(nextState.isAuthenticated).toBe(false);
      expect(nextState.isInitialized).toBe(true);
      expect(nextState.status).toBe("idle");
    });
  });
});
