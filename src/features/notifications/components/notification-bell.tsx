"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCheck,
  Calendar,
  CreditCard,
  UserCheck,
  Percent,
  ChevronRight,
  Loader2,
} from "lucide-react";
import {
  useGetNotificationsQuery,
  useGetUnreadNotificationCountQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from "../api/notification-api";
import { formatRelativeTime } from "../utils/format-time";
import { cn } from "@/lib/utils";

export function NotificationBell() {
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const { data: countData } = useGetUnreadNotificationCountQuery();
  const unreadCount = countData?.unreadCount ?? 0;

  const {
    data: listData,
    isLoading,
    isError,
  } = useGetNotificationsQuery(
    { page: 1, limit: 5 },
    { skip: !isOpen }
  );

  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead, { isLoading: isMarkingAll }] =
    useMarkAllNotificationsReadMutation();

  // Close dropdown on outside click
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleNotificationClick = async (
    id: string,
    actionUrl?: string | null,
    isRead?: boolean
  ) => {
    if (!isRead) {
      try {
        await markRead(id).unwrap();
      } catch {
        // Continue navigation even if marking read fails
      }
    }
    setIsOpen(false);
    if (actionUrl) {
      router.push(actionUrl);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllRead().unwrap();
    } catch {
      // Ignored
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

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#E5EAED] bg-[#FAFEFF] text-[#263238] hover:border-primary/40 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer transition-colors shadow-2xs"
        aria-expanded={isOpen}
        aria-label={`Notifications (${unreadCount} unread)`}
        data-testid="notification-bell-button"
      >
        <Bell className="h-4 w-4 text-[#74818A]" />
        {unreadCount > 0 && (
          <span
            data-testid="notification-unread-badge"
            className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-xs"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div
          role="region"
          aria-label="Notification dropdown"
          data-testid="notification-dropdown"
          className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-[#E5EAED] bg-white p-0 shadow-xl animate-in fade-in zoom-in-95 duration-150 z-50 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#E5EAED] px-4 py-3 bg-[#FAFEFF]">
            <div className="flex items-center gap-2">
              <h3 className="font-outfit text-sm font-bold text-[#18282A]">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={isMarkingAll}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline cursor-pointer disabled:opacity-50"
                data-testid="mark-all-read-button"
              >
                <CheckCheck className="h-3 w-3" />
                Mark all read
              </button>
            )}
          </div>

          {/* List Area */}
          <div className="max-h-80 overflow-y-auto divide-y divide-[#F1F5F7]">
            {isLoading ? (
              <div className="flex items-center justify-center py-8 text-[#74818A]">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : isError ? (
              <div className="py-6 px-4 text-center text-xs text-rose-500">
                Failed to load notifications.
              </div>
            ) : !listData || listData.items.length === 0 ? (
              <div
                className="py-8 px-4 text-center text-xs text-[#74818A]"
                data-testid="notification-empty-state"
              >
                You're all caught up! No notifications.
              </div>
            ) : (
              listData.items.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() =>
                    handleNotificationClick(
                      notif.id,
                      notif.actionUrl,
                      notif.isRead
                    )
                  }
                  data-testid={`notification-item-${notif.id}`}
                  className={cn(
                    "flex items-start gap-3 p-3.5 hover:bg-[#F8FAFB] transition-colors cursor-pointer text-left",
                    !notif.isRead && "bg-primary/5"
                  )}
                >
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white border border-[#E5EAED] shadow-2xs">
                    {getEntityIcon(notif.entityType)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <p
                        className={cn(
                          "text-xs truncate font-medium text-[#18282A]",
                          !notif.isRead && "font-bold text-[#0D1819]"
                        )}
                      >
                        {notif.title}
                      </p>
                      <span className="text-[10px] text-[#8A9A9C] shrink-0">
                        {formatRelativeTime(notif.createdAt)}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#55696B] line-clamp-2 mt-0.5 leading-relaxed">
                      {notif.message}
                    </p>
                  </div>
                  {!notif.isRead && (
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer View All */}
          <div className="border-t border-[#E5EAED] bg-[#FAFEFF] p-2 text-center">
            <Link
              href="/dashboard/notifications"
              onClick={() => setIsOpen(false)}
              className="inline-flex w-full items-center justify-center gap-1 rounded-xl py-1.5 text-xs font-semibold text-primary hover:bg-primary/5 transition-colors cursor-pointer"
              data-testid="view-all-notifications-link"
            >
              <span>View all notifications</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
