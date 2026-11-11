import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { env } from "@/config/env";
import type { AuthUserResponse } from "@/features/auth/types/auth";

/**
 * Lightweight, zero-dependency async mutex lock for single-flight token refresh.
 * Ensures concurrent 401s share a single refresh request without duplicate calls.
 */
class SimpleMutex {
  private _isLocked = false;
  private _waitQueue: (() => void)[] = [];

  isLocked(): boolean {
    return this._isLocked;
  }

  async acquire(): Promise<() => void> {
    if (!this._isLocked) {
      this._isLocked = true;
      return () => this.release();
    }

    return new Promise<() => void>((resolve) => {
      this._waitQueue.push(() => {
        this._isLocked = true;
        resolve(() => this.release());
      });
    });
  }

  async waitForUnlock(): Promise<void> {
    if (!this._isLocked) {
      return;
    }
    return new Promise<void>((resolve) => {
      const check = () => {
        if (!this._isLocked) {
          resolve();
        } else {
          this._waitQueue.push(check);
        }
      };
      this._waitQueue.push(check);
    });
  }

  private release(): void {
    if (this._waitQueue.length > 0) {
      const next = this._waitQueue.shift();
      if (next) {
        next();
      }
    } else {
      this._isLocked = false;
    }
  }
}

const mutex = new SimpleMutex();

const rawBaseQuery = fetchBaseQuery({
  baseUrl: env.NEXT_PUBLIC_API_URL,
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as RootState;
    const token = state?.auth?.accessToken;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  // Wait until any active refresh completes before issuing requests
  await mutex.waitForUnlock();

  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    const isAuthEndpoint =
      typeof args === "string"
        ? args.includes("/auth/refresh") || args.includes("/auth/login")
        : args.url.includes("/auth/refresh") || args.url.includes("/auth/login");

    if (!isAuthEndpoint) {
      // Check whether mutex is currently locked
      if (!mutex.isLocked()) {
        const release = await mutex.acquire();
        try {
          const refreshResult = await rawBaseQuery(
            {
              url: "/auth/refresh",
              method: "POST",
            },
            api,
            extraOptions,
          );

          if (refreshResult.data) {
            const data = refreshResult.data as AuthUserResponse;
            const newAccessToken = data.data?.accessToken;
            if (newAccessToken) {
              api.dispatch(setAccessToken(newAccessToken));
            }
            if (data.data) {
              api.dispatch(setCredentials(data.data));
            }

            // Retry the original query with the newly refreshed access token
            result = await rawBaseQuery(args, api, extraOptions);
          } else {
            api.dispatch(clearCredentials());
          }
        } finally {
          release();
        }
      } else {
        // Another refresh is in flight; wait for unlock then retry
        await mutex.waitForUnlock();
        result = await rawBaseQuery(args, api, extraOptions);
      }
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  refetchOnFocus: false,
  refetchOnReconnect: true,
  tagTypes: [
    "Tour",
    "Experience",
    "Booking",
    "Category",
    "Auth",
    "User",
    "AdminReport",
    "AdminService",
    "AdminServicePricing",
    "AdminServiceAvailability",
    "AdminMedia",
    "AdminPermission",
    "AgentOverview",
    "AgentBookings",
    "AgentCommissions",
    "AgentProfile",
    "AdminCommissions",
    "AdminCommissionRule",
    "AdminPayment",
    "AdminSetting",
    "CustomerBookings",
    "CustomerPayments",
  ],
  endpoints: () => ({}),
});
