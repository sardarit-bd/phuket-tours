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
 * Single-flight in-memory mutex for coordinating concurrent 401s within the current tab.
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

/**
 * Cross-tab leader synchronization mechanism using standard Web Locks API / BroadcastChannel.
 * Fallback to in-tab mutex if navigator.locks is unavailable (SSR or older environments).
 */
const executeWithCrossTabLock = async <T>(
  lockName: string,
  action: () => Promise<T>,
): Promise<T> => {
  if (typeof window !== "undefined" && "locks" in navigator && navigator.locks) {
    return navigator.locks.request(lockName, { mode: "exclusive" }, async () => {
      return await action();
    });
  }
  return await action();
};

const rawBaseQuery = fetchBaseQuery({
  baseUrl: env.NEXT_PUBLIC_API_URL,
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as { auth?: { accessToken?: string | null } };
    const token = state?.auth?.accessToken;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

/**
 * Parse standard Retry-After header (in seconds or HTTP Date) with bounded maximum
 */
export const parseRetryAfter = (responseHeaders?: Headers): number | null => {
  if (!responseHeaders) return null;
  const retryVal = responseHeaders.get("retry-after") || responseHeaders.get("Retry-After");
  if (!retryVal) return null;

  const seconds = Number(retryVal);
  if (!isNaN(seconds) && seconds >= 0) {
    return Math.min(seconds * 1000, 30000); // capped at 30s
  }

  const dateMs = Date.parse(retryVal);
  if (!isNaN(dateMs)) {
    const delta = dateMs - Date.now();
    return delta > 0 ? Math.min(delta, 30000) : 0;
  }

  return null;
};

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
      if (!mutex.isLocked()) {
        const release = await mutex.acquire();
        try {
          // Coordinate cross-tab refresh via Web Locks API
          const refreshResult = await executeWithCrossTabLock(
            "phukettours_refresh_lock",
            async () => {
              // Check if another tab refreshed right before we acquired the lock:
              // Try refreshing with rotating cookie
              return await rawBaseQuery(
                {
                  url: "/auth/refresh",
                  method: "POST",
                },
                api,
                extraOptions,
              );
            },
          );

          if (refreshResult.data) {
            const data = refreshResult.data as AuthUserResponse;
            const newAccessToken = data.data?.accessToken;
            if (newAccessToken) {
              api.dispatch({
                type: "auth/setAccessToken",
                payload: newAccessToken,
              });
            }
            if (data.data) {
              api.dispatch({
                type: "auth/setCredentials",
                payload: data.data,
              });
            }

            // Retry the original query with the newly refreshed access token
            result = await rawBaseQuery(args, api, extraOptions);
          } else {
            const refreshErrorStatus = refreshResult.error?.status;
            // Only clear credentials if refresh specifically failed with an authentication failure (401/403).
            // Do NOT log out the user on transient errors such as 429 (rate-limited) or 5xx (temporary server error).
            if (refreshErrorStatus === 401 || refreshErrorStatus === 403) {
              api.dispatch({ type: "auth/clearCredentials" });
            }
          }
        } finally {
          release();
        }
      } else {
        // Another refresh in this tab is in flight; wait for unlock then retry
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
