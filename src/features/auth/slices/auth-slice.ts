import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { authApi } from "../api/auth-api";
import type { AuthUser, UserProfile } from "../types/auth";
import type { RootState } from "@/store";

export interface AuthState {
  user: AuthUser | UserProfile | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  status: "idle" | "loading" | "succeeded" | "failed";
}

const initialState: AuthState = {
  user: null,
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
    clearCredentials: (state) => {
      state.user = null;
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
          state.isAuthenticated = true;
          state.isInitialized = true;
          state.status = "succeeded";
        }
      )
      .addMatcher(
        authApi.endpoints.register.matchFulfilled,
        (state, { payload }) => {
          state.user = payload.data;
          state.isAuthenticated = true;
          state.isInitialized = true;
          state.status = "succeeded";
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
          state.user = null;
          state.isAuthenticated = false;
          state.status = "failed";
        }
      })
      .addMatcher(authApi.endpoints.logout.matchFulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.isInitialized = true;
        state.status = "idle";
      })
      .addMatcher(authApi.endpoints.logout.matchRejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.isInitialized = true;
        state.status = "idle";
      });
  },
});

export const {
  setCredentials,
  clearCredentials,
  setAuthStatus,
  setInitialized,
} = authSlice.actions;

export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) =>
  state.auth.isAuthenticated;
export const selectIsAuthInitialized = (state: RootState) =>
  state.auth.isInitialized;
export const selectAuthStatus = (state: RootState) => state.auth.status;

export const authReducer = authSlice.reducer;
export default authSlice.reducer;
