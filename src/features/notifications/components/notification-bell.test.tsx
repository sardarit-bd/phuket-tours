import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { NotificationBell } from "./notification-bell";
import * as notificationApi from "../api/notification-api";

vi.mock("../api/notification-api", () => ({
  useGetNotificationsQuery: vi.fn(),
  useGetUnreadNotificationCountQuery: vi.fn(),
  useMarkNotificationReadMutation: vi.fn(),
  useMarkAllNotificationsReadMutation: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe("NotificationBell Component", () => {
  const mockMarkRead = vi.fn().mockReturnValue({ unwrap: vi.fn().mockResolvedValue({}) });
  const mockMarkAllRead = vi.fn().mockReturnValue({ unwrap: vi.fn().mockResolvedValue({}) });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(notificationApi.useMarkNotificationReadMutation).mockReturnValue([
      mockMarkRead,
      { isLoading: false },
    ] as any);
    vi.mocked(notificationApi.useMarkAllNotificationsReadMutation).mockReturnValue([
      mockMarkAllRead,
      { isLoading: false },
    ] as any);
  });

  it("renders the notification bell and shows unread badge when unreadCount > 0", () => {
    vi.mocked(notificationApi.useGetUnreadNotificationCountQuery).mockReturnValue({
      data: { unreadCount: 3 },
    } as any);

    vi.mocked(notificationApi.useGetNotificationsQuery).mockReturnValue({
      data: null,
      isLoading: false,
      isError: false,
    } as any);

    render(<NotificationBell />);

    const badge = screen.getByTestId("notification-unread-badge");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent("3");
  });

  it("opens dropdown on bell click and displays notification items", () => {
    vi.mocked(notificationApi.useGetUnreadNotificationCountQuery).mockReturnValue({
      data: { unreadCount: 1 },
    } as any);

    vi.mocked(notificationApi.useGetNotificationsQuery).mockReturnValue({
      data: {
        items: [
          {
            id: "n-1",
            recipientUserId: "u-1",
            type: "booking.created",
            title: "Booking Confirmed",
            message: "Your tour is ready",
            entityType: "booking",
            entityId: "b-1",
            actionUrl: "/dashboard/bookings/b-1",
            isRead: false,
            createdAt: new Date().toISOString(),
          },
        ],
        pagination: { page: 1, limit: 5, total: 1, totalPages: 1, unreadCount: 1 },
      },
      isLoading: false,
      isError: false,
    } as any);

    render(<NotificationBell />);

    const bell = screen.getByTestId("notification-bell-button");
    fireEvent.click(bell);

    expect(screen.getByTestId("notification-dropdown")).toBeInTheDocument();
    expect(screen.getByText("Booking Confirmed")).toBeInTheDocument();
    expect(screen.getByText("Your tour is ready")).toBeInTheDocument();
  });

  it("handles mark all read action", async () => {
    vi.mocked(notificationApi.useGetUnreadNotificationCountQuery).mockReturnValue({
      data: { unreadCount: 2 },
    } as any);

    vi.mocked(notificationApi.useGetNotificationsQuery).mockReturnValue({
      data: {
        items: [
          {
            id: "n-2",
            recipientUserId: "u-1",
            type: "booking.created",
            title: "New Booking",
            message: "Details",
            entityType: "booking",
            entityId: "b-2",
            isRead: false,
            createdAt: new Date().toISOString(),
          },
        ],
        pagination: { page: 1, limit: 5, total: 1, totalPages: 1, unreadCount: 2 },
      },
      isLoading: false,
      isError: false,
    } as any);

    render(<NotificationBell />);

    const bell = screen.getByTestId("notification-bell-button");
    fireEvent.click(bell);

    const markAllBtn = screen.getByTestId("mark-all-read-button");
    fireEvent.click(markAllBtn);

    expect(mockMarkAllRead).toHaveBeenCalled();
  });
});
