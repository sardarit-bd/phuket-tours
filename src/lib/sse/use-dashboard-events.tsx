"use client";

import * as React from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectAccessToken,
  selectIsAuthenticated,
  selectIsAuthInitialized,
} from "@/features/auth/slices/auth-slice";
import { baseApi } from "@/lib/api/base-api";
import { env } from "@/config/env";
import {
  DashboardEvent,
  DashboardEventClient,
} from "./dashboard-event-client";

type TagType =
  | "Tour"
  | "Experience"
  | "Booking"
  | "Category"
  | "Auth"
  | "User"
  | "AdminReport"
  | "AdminService"
  | "AdminServicePricing"
  | "AdminServiceAvailability"
  | "AdminMedia"
  | "AdminPermission"
  | "AgentOverview"
  | "AgentBookings"
  | "AgentCommissions"
  | "AgentProfile"
  | "AdminCommissions"
  | "AdminCommissionRule"
  | "AdminPayment"
  | "AdminSetting"
  | "CustomerBookings"
  | "CustomerPayments"
  | "AdminDiscount"
  | "AffiliateProfile"
  | "AffiliateDashboard"
  | "AffiliateLinks"
  | "AffiliateClicks"
  | "AffiliateBookings"
  | "AffiliateCommissions"
  | "AffiliatePayouts"
  | "AdminAffiliates"
  | "AdminAffiliateSettings"
  | "AdminAffiliatePayouts"
  | "Notification"
  | "NotificationPreference";

type InvalidationTag = TagType | { type: TagType; id?: string | number };

/**
 * Maps an incoming SSE dashboard event into a list of RTK Query cache invalidation tags.
 */
export function getTagsForEvent(event: DashboardEvent): InvalidationTag[] {
  const { type, entityId, metadata } = event;
  const tags: InvalidationTag[] = [];

  switch (type) {
    case "booking.created":
      tags.push(
        { type: "Booking", id: "LIST" },
        { type: "Booking", id: "STAFF_LIST" },
        "AdminReport",
        "AgentOverview",
        "AgentBookings",
        "CustomerBookings"
      );
      break;

    case "booking.approved":
    case "booking.rejected":
      tags.push(
        { type: "Booking", id: "LIST" },
        { type: "Booking", id: "STAFF_LIST" },
        { type: "Booking", id: entityId },
        "AdminReport",
        "AgentOverview",
        "AgentBookings",
        "CustomerBookings"
      );
      break;

    case "booking.status_changed":
    case "booking.completed":
    case "booking.cancelled":
    case "booking.updated":
      tags.push(
        { type: "Booking", id: entityId },
        { type: "Booking", id: "LIST" },
        { type: "Booking", id: "STAFF_LIST" },
        "AdminReport",
        "AgentOverview",
        "AgentBookings",
        "CustomerBookings"
      );
      break;

    case "booking.staff_assigned":
      tags.push(
        { type: "Booking", id: entityId },
        { type: "Booking", id: "LIST" },
        { type: "Booking", id: "STAFF_LIST" }
      );
      break;

    case "payment.verified":
    case "payment.refunded": {
      const bookingId = (metadata?.bookingId as string) || entityId;
      tags.push(
        { type: "Booking", id: bookingId },
        { type: "Booking", id: "LIST" },
        "AdminReport",
        "AdminPayment",
        "CustomerPayments",
        "AgentCommissions",
        "AdminCommissions"
      );
      break;
    }

    case "notification.created":
      tags.push(
        { type: "Notification", id: "LIST" },
        { type: "Notification", id: "UNREAD_COUNT" }
      );
      break;

    default:
      // Unknown or generic event, refresh booking lists
      tags.push({ type: "Booking", id: "LIST" });
      break;
  }

  return tags;
}

/**
 * Custom React hook to subscribe to Server-Sent Events when authenticated.
 * Batches and debounces RTK Query cache invalidations over a 300ms window to prevent storming.
 */
export function useDashboardEvents() {
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector(selectAccessToken);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isInitialized = useAppSelector(selectIsAuthInitialized);

  const pendingTagsRef = React.useRef<Map<string, InvalidationTag>>(new Map());
  const debounceTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const tokenRef = React.useRef(accessToken);

  React.useEffect(() => {
    tokenRef.current = accessToken;
  }, [accessToken]);

  const flushTags = React.useCallback(() => {
    if (pendingTagsRef.current.size === 0) return;

    const tagsToInvalidate = Array.from(pendingTagsRef.current.values());
    pendingTagsRef.current.clear();

    dispatch(baseApi.util.invalidateTags(tagsToInvalidate));
  }, [dispatch]);

  const queueTagInvalidation = React.useCallback(
    (tags: InvalidationTag[]) => {
      for (const tag of tags) {
        const key = typeof tag === "string" ? tag : `${tag.type}_${tag.id ?? "ALL"}`;
        pendingTagsRef.current.set(key, tag);
      }

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        flushTags();
      }, 300);
    },
    [flushTags]
  );

  React.useEffect(() => {
    // Only connect when auth is fully initialized and user is authenticated
    if (!isInitialized || !isAuthenticated || !accessToken) {
      return;
    }

    const apiUrl = env.NEXT_PUBLIC_API_URL.replace(/\/+$/, "");
    const streamUrl = `${apiUrl}/events/stream`;

    const client = new DashboardEventClient({
      url: streamUrl,
      getAccessToken: () => tokenRef.current,
      onEvent: (event) => {
        const tags = getTagsForEvent(event);
        queueTagInvalidation(tags);
      },
      onError: (err) => {
        // SSE error handled silently with auto-reconnect
        if (process.env.NODE_ENV === "development") {
          console.debug("[SSE] Event stream error:", err);
        }
      },
    });

    client.start();

    return () => {
      client.stop();
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
    };
  }, [isInitialized, isAuthenticated, !!accessToken, queueTagInvalidation]);
}

/**
 * Component that mounts the SSE listener inside DashboardShell.
 */
export function DashboardEventsListener() {
  useDashboardEvents();
  return null;
}
