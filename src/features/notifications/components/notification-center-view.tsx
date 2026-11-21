"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCheck,
  Calendar,
  CreditCard,
  UserCheck,
  Percent,
  ChevronLeft,
  ChevronRight,
  Filter,
  Loader2,
  Settings,
} from "lucide-react";
import {
  useGetNotificationsQuery,
  useGetNotificationPreferencesQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
  useUpdateNotificationPreferencesMutation,
} from "../api/notification-api";
import { formatRelativeTime } from "../utils/format-time";
import { cn } from "@/lib/utils";

type FilterStatus = "all" | "unread" | "read";
type CategoryFilter = "all" | "booking" | "payment" | "assignment" | "commission";

export function NotificationCenterView() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = React.useState<FilterStatus>("all");
  const [categoryFilter, setCategoryFilter] = React.useState<CategoryFilter>("all");
  const [page, setPage] = React.useState(1);
  const [showPreferences, setShowPreferences] = React.useState(false);

  const queryParams = React.useMemo(() => {
    const isRead =
      statusFilter === "unread"
        ? false
        : statusFilter === "read"
        ? true
        : undefined;
    return {
      page,
      limit: 20,
      isRead,
    };
  }, [page, statusFilter]);

  const { data, isLoading, isFetching, isError } = useGetNotificationsQuery(queryParams);
  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead, { isLoading: isMarkingAll }] = useMarkAllNotificationsReadMutation();

  const { data: preferences } = useGetNotificationPreferencesQuery();
  const [updatePreferences, { isLoading: isSavingPrefs }] = useUpdateNotificationPreferencesMutation();

  const handleNotificationClick = async (
    id: string,
    actionUrl?: string | null,
    isRead?: boolean
  ) => {
    if (!isRead) {
      try {
        await markRead(id).unwrap();
      } catch {
        // Continue
      }
    }
    if (actionUrl) {
      router.push(actionUrl);
    }
  };

  const getEntityIcon = (entityType: string) => {
    switch (entityType) {
      case "payment":
        return <CreditCard className="h-4 w-4 text-emerald-600" />;
      case "assignment":
        return <UserCheck className="h-4 w-4 text-blue-600" />;
      case "commission":
        return <Percent className="h-4 w-4 text-amber-600" />;
      case "booking":
      default:
        return <Calendar className="h-4 w-4 text-primary" />;
    }
  };

  // Filter items by category client-side if a specific category is chosen
  const filteredItems = React.useMemo(() => {
    if (!data?.items) return [];
    if (categoryFilter === "all") return data.items;
    return data.items.filter((item) => item.entityType === categoryFilter);
  }, [data?.items, categoryFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-outfit text-2xl font-bold text-[#18282A]">
            Notification Center
          </h1>
          <p className="text-sm text-[#74818A] mt-1">
            Stay updated with your bookings, payments, assignments, and account activities.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowPreferences((prev) => !prev)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#E5EAED] bg-white px-3.5 py-2 text-xs font-semibold text-[#18282A] hover:bg-[#F8FAFB] transition-colors cursor-pointer shadow-2xs"
            data-testid="toggle-preferences-button"
          >
            <Settings className="h-3.5 w-3.5 text-[#74818A]" />
            Preferences
          </button>

          <button
            type="button"
            onClick={() => markAllRead()}
            disabled={isMarkingAll || (data?.pagination?.unreadCount ?? 0) === 0}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-white hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
            data-testid="page-mark-all-read-button"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Mark all as read
          </button>
        </div>
      </div>

      {/* Preferences Panel */}
      {showPreferences && (
        <div
          data-testid="notification-preferences-panel"
          className="rounded-2xl border border-[#E5EAED] bg-white p-5 shadow-xs space-y-4 animate-in fade-in duration-150"
        >
          <div className="flex items-center justify-between border-b border-[#E5EAED] pb-3">
            <div>
              <h2 className="font-outfit text-sm font-bold text-[#18282A]">
                Notification Preferences
              </h2>
              <p className="text-xs text-[#74818A] mt-0.5">
                Configure channels for alerts. In-app alerts remain available independently from emails.
              </p>
            </div>
            {isSavingPrefs && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            {/* Booking */}
            <div className="p-3 rounded-xl border border-[#E5EAED] bg-[#FAFEFF] space-y-2">
              <span className="font-bold text-[#18282A] block">Bookings</span>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences?.bookingInApp ?? true}
                  onChange={(e) =>
                    updatePreferences({ bookingInApp: e.target.checked })
                  }
                  className="rounded border-[#CCD5D8] text-primary focus:ring-primary"
                />
                <span className="text-[#55696B]">In-App notifications</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences?.bookingEmail ?? true}
                  onChange={(e) =>
                    updatePreferences({ bookingEmail: e.target.checked })
                  }
                  className="rounded border-[#CCD5D8] text-primary focus:ring-primary"
                />
                <span className="text-[#55696B]">Email alerts</span>
              </label>
            </div>

            {/* Payment */}
            <div className="p-3 rounded-xl border border-[#E5EAED] bg-[#FAFEFF] space-y-2">
              <span className="font-bold text-[#18282A] block">Payments</span>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences?.paymentInApp ?? true}
                  onChange={(e) =>
                    updatePreferences({ paymentInApp: e.target.checked })
                  }
                  className="rounded border-[#CCD5D8] text-primary focus:ring-primary"
                />
                <span className="text-[#55696B]">In-App notifications</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences?.paymentEmail ?? true}
                  onChange={(e) =>
                    updatePreferences({ paymentEmail: e.target.checked })
                  }
                  className="rounded border-[#CCD5D8] text-primary focus:ring-primary"
                />
                <span className="text-[#55696B]">Email alerts</span>
              </label>
            </div>

            {/* Assignments */}
            <div className="p-3 rounded-xl border border-[#E5EAED] bg-[#FAFEFF] space-y-2">
              <span className="font-bold text-[#18282A] block">Assignments</span>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences?.assignmentInApp ?? true}
                  onChange={(e) =>
                    updatePreferences({ assignmentInApp: e.target.checked })
                  }
                  className="rounded border-[#CCD5D8] text-primary focus:ring-primary"
                />
                <span className="text-[#55696B]">In-App notifications</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences?.assignmentEmail ?? true}
                  onChange={(e) =>
                    updatePreferences({ assignmentEmail: e.target.checked })
                  }
                  className="rounded border-[#CCD5D8] text-primary focus:ring-primary"
                />
                <span className="text-[#55696B]">Email alerts</span>
              </label>
            </div>

            {/* Commissions */}
            <div className="p-3 rounded-xl border border-[#E5EAED] bg-[#FAFEFF] space-y-2">
              <span className="font-bold text-[#18282A] block">Commissions</span>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences?.commissionInApp ?? true}
                  onChange={(e) =>
                    updatePreferences({ commissionInApp: e.target.checked })
                  }
                  className="rounded border-[#CCD5D8] text-primary focus:ring-primary"
                />
                <span className="text-[#55696B]">In-App notifications</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences?.commissionEmail ?? true}
                  onChange={(e) =>
                    updatePreferences({ commissionEmail: e.target.checked })
                  }
                  className="rounded border-[#CCD5D8] text-primary focus:ring-primary"
                />
                <span className="text-[#55696B]">Email alerts</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs & Category Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#E5EAED] pb-3">
        {/* Status Tabs */}
        <div className="flex items-center gap-2">
          {(["all", "unread", "read"] as FilterStatus[]).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => {
                setStatusFilter(status);
                setPage(1);
              }}
              className={cn(
                "rounded-xl px-3 py-1.5 text-xs font-semibold capitalize transition-colors cursor-pointer",
                statusFilter === status
                  ? "bg-primary text-white shadow-2xs"
                  : "bg-white border border-[#E5EAED] text-[#74818A] hover:bg-[#F8FAFB]"
              )}
              data-testid={`filter-tab-${status}`}
            >
              {status}
              {status === "unread" && (data?.pagination?.unreadCount ?? 0) > 0 && (
                <span className="ml-1.5 rounded-full bg-white/20 px-1.5 py-0.2 text-[10px]">
                  {data?.pagination?.unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-[#74818A]" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as CategoryFilter)}
            className="rounded-xl border border-[#E5EAED] bg-white py-1.5 pl-2.5 pr-8 text-xs font-medium text-[#18282A] focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer shadow-2xs"
            data-testid="category-filter-select"
          >
            <option value="all">All Categories</option>
            <option value="booking">Bookings</option>
            <option value="payment">Payments</option>
            <option value="assignment">Assignments</option>
            <option value="commission">Commissions</option>
          </select>
        </div>
      </div>

      {/* Notifications List Container */}
      <div className="rounded-2xl border border-[#E5EAED] bg-white shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-[#74818A]">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : isError ? (
          <div className="py-16 text-center text-sm text-rose-500">
            Failed to load notifications. Please try again.
          </div>
        ) : filteredItems.length === 0 ? (
          <div
            className="py-16 text-center text-[#74818A]"
            data-testid="page-empty-state"
          >
            <Bell className="mx-auto h-8 w-8 text-[#CCD5D8] mb-2" />
            <p className="text-sm font-semibold text-[#18282A]">
              No notifications found
            </p>
            <p className="text-xs text-[#74818A] mt-1">
              {statusFilter === "unread"
                ? "You have no unread notifications right now."
                : "Your notifications will appear here when updates occur."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#F1F5F7]">
            {filteredItems.map((notif) => (
              <div
                key={notif.id}
                onClick={() =>
                  handleNotificationClick(notif.id, notif.actionUrl, notif.isRead)
                }
                data-testid={`notification-row-${notif.id}`}
                className={cn(
                  "flex items-start gap-4 p-4.5 hover:bg-[#F8FAFB] transition-colors cursor-pointer text-left",
                  !notif.isRead && "bg-primary/5"
                )}
              >
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white border border-[#E5EAED] shadow-2xs">
                  {getEntityIcon(notif.entityType)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3
                      className={cn(
                        "text-sm font-semibold text-[#18282A]",
                        !notif.isRead && "font-bold text-[#0D1819]"
                      )}
                    >
                      {notif.title}
                    </h3>
                    <span className="text-xs text-[#8A9A9C] shrink-0">
                      {formatRelativeTime(notif.createdAt)}
                    </span>
                  </div>

                  <p className="text-xs text-[#55696B] mt-1 leading-relaxed">
                    {notif.message}
                  </p>
                </div>

                {!notif.isRead && (
                  <span className="mt-2.5 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination Footer */}
        {data && data.pagination && data.pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[#E5EAED] bg-[#FAFEFF] px-4 py-3">
            <span className="text-xs text-[#74818A]">
              Page {data.pagination.page} of {data.pagination.totalPages} (
              {data.pagination.total} total)
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page <= 1 || isFetching}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5EAED] bg-white text-[#18282A] hover:bg-[#F8FAFB] disabled:opacity-40 cursor-pointer shadow-2xs"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() =>
                  setPage((p) => Math.min(p + 1, data.pagination.totalPages))
                }
                disabled={page >= data.pagination.totalPages || isFetching}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5EAED] bg-white text-[#18282A] hover:bg-[#F8FAFB] disabled:opacity-40 cursor-pointer shadow-2xs"
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
