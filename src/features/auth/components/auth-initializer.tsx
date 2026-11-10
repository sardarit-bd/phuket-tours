"use client";

import { useGetMeQuery } from "../api/auth-api";

/**
 * AuthInitializer mounts at the root Redux store level.
 * It initiates session restoration via useGetMeQuery on application startup.
 * The query response (or error) is automatically synchronized into authSlice
 * via extraReducers matchers without duplicating requests.
 */
export function AuthInitializer(): null {
  useGetMeQuery(undefined, {
    refetchOnMountOrArgChange: false,
  });

  return null;
}
