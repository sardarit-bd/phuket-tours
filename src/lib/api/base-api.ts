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
 * Single-flight in-memory refresh lock coordinating concurrent requests during token refresh.
 * Guarantees that only ONE refresh network request runs at a time.
 * All concurrent requests hitting 401 await the same refresh execution without deadlocks.
 */
class SingleFlightRefresh {
  private _refreshPromise: Promise<string | null> | null = null;

  isRefreshing(): boolean {
    return this._refreshPromise !== null;
  }

  async waitForRefresh(): Promise<string | null> {
    if (this._refreshPromise) {
      try {
        return await this._refreshPromise;
      } catch {
        return null;
      }
    }
    return null;
  }

  async executeRefresh(
    action: () => Promise<string | null>
  ): Promise<string | null> {
    if (this._refreshPromise) {
      return this.waitForRefresh();
    }

    this._refreshPromise = (async () => {
      try {
        return await action();
      } finally {
        this._refreshPromise = null;
      }
    })();

    return this._refreshPromise;
  }
}

const singleFlightRefresh = new SingleFlightRefresh();

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
  // If a refresh is currently running, wait for it before firing the request
  if (singleFlightRefresh.isRefreshing()) {
    await singleFlightRefresh.waitForRefresh();
  }

  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    const isAuthEndpoint =
      typeof args === "string"
        ? args.includes("/auth/refresh") || args.includes("/auth/login")
        : args.url.includes("/auth/refresh") || args.url.includes("/auth/login");

    if (!isAuthEndpoint) {
      // Execute refresh through single-flight coordinator
      const refreshedToken = await singleFlightRefresh.executeRefresh(async () => {
        try {
          // Coordinate cross-tab refresh via Web Locks API
          const refreshResult = await executeWithCrossTabLock(
            "phukettours_refresh_lock",
            async () => {
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
            return newAccessToken || null;
          } else {
            const refreshErrorStatus = refreshResult.error?.status;
            // Only clear credentials if refresh specifically failed with an authentication failure (401/403).
            // Do NOT log out the user on transient errors such as 429 (rate-limited) or 5xx (temporary server error).
            if (refreshErrorStatus === 401 || refreshErrorStatus === 403) {
              api.dispatch({ type: "auth/clearCredentials" });
            }
            return null;
          }
        } catch {
          return null;
        }
      });

      if (refreshedToken) {
        // Retry the original query with the newly refreshed access token
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
    "AdminDiscount",
    "AffiliateProfile",
    "AffiliateDashboard",
    "AffiliateLinks",
    "AffiliateClicks",
    "AffiliateBookings",
    "AffiliateCommissions",
    "AffiliatePayouts",
    "AdminAffiliates",
    "AdminAffiliateSettings",
    "AdminAffiliatePayouts",
    "Notification",
    "NotificationPreference",
  ],
  endpoints: () => ({}),
});
