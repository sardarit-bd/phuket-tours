import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { authApi } from "../api/auth-api";
import type { AuthUser, UserProfile } from "../types/auth";
import type { RootState } from "@/store";

export interface AuthState {
  user: AuthUser | UserProfile | null;
  accessToken?: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  status: "idle" | "loading" | "succeeded" | "failed";
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isInitialized: false,
  status: "idle",
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<AuthUser | UserProfile | null>
    ) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.isInitialized = true;
      state.status = action.payload ? "succeeded" : "idle";
    },
    setAccessToken: (state, action: PayloadAction<string | null>) => {
      state.accessToken = action.payload;
    },
    clearCredentials: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.isInitialized = true;
      state.status = "idle";
    },
    setAuthStatus: (state, action: PayloadAction<AuthState["status"]>) => {
      state.status = action.payload;
    },
    setInitialized: (state, action: PayloadAction<boolean>) => {
      state.isInitialized = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        authApi.endpoints.login.matchFulfilled,
        (state, { payload }) => {
          state.user = payload.data;
          state.accessToken = payload.data.accessToken || null;
          state.isAuthenticated = true;
          state.isInitialized = true;
          state.status = "succeeded";
        }
      )
      .addMatcher(
        authApi.endpoints.register.matchFulfilled,
        (state, { payload }) => {
          state.user = payload.data;
          state.accessToken = payload.data.accessToken || null;
          state.isAuthenticated = true;
          state.isInitialized = true;
          state.status = "succeeded";
        }
      )
      .addMatcher(
        authApi.endpoints.refresh.matchFulfilled,
        (state, { payload }) => {
          state.user = payload.data;
          state.accessToken = payload.data.accessToken || null;
          state.isAuthenticated = true;
          state.isInitialized = true;
          state.status = "succeeded";
        }
      )
      .addMatcher(
        authApi.endpoints.updateEmail.matchFulfilled,
        (state, { payload }) => {
          state.user = payload.data;
        }
      )
      .addMatcher(
        authApi.endpoints.updateProfile.matchFulfilled,
        (state, { payload }) => {
          state.user = payload.data;
        }
      )
      .addMatcher(authApi.endpoints.getMe.matchPending, (state) => {
        state.status = "loading";
      })
      .addMatcher(
        authApi.endpoints.getMe.matchFulfilled,
        (state, { payload }) => {
          state.user = payload.data;
          state.isAuthenticated = true;
          state.isInitialized = true;
          state.status = "succeeded";
        }
      )
      .addMatcher(authApi.endpoints.getMe.matchRejected, (state, action) => {
        state.isInitialized = true;
        const errorPayload = action.payload as
          | { status?: number | string }
          | undefined;
        const statusCode = errorPayload?.status;

        if (statusCode === 401) {
          state.user = null;
          state.isAuthenticated = false;
          state.status = "idle";
        } else {
          // On transient/non-401 errors (500, network failures, parsing
          // errors, or a conditional 304 that should never occur with the
          // no-store backend headers), preserve the existing user and
          // isAuthenticated flag so a single failed refresh cannot erase a
          // valid authenticated session. Only mark the status as failed.
          state.status = "failed";
        }
      })
      .addMatcher(authApi.endpoints.logout.matchFulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        state.isInitialized = true;
        state.status = "idle";
      })
      .addMatcher(authApi.endpoints.logout.matchRejected, (state) => {
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        state.isInitialized = true;
        state.status = "idle";
      });
  },
});

export const {
  setCredentials,
  setAccessToken,
  clearCredentials,
  setAuthStatus,
  setInitialized,
} = authSlice.actions;

export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectAccessToken = (state: RootState) => state.auth.accessToken;
export const selectIsAuthenticated = (state: RootState) =>
  state.auth.isAuthenticated;
export const selectIsAuthInitialized = (state: RootState) =>
  state.auth.isInitialized;
export const selectAuthStatus = (state: RootState) => state.auth.status;

export const authReducer = authSlice.reducer;
export default authSlice.reducer;
