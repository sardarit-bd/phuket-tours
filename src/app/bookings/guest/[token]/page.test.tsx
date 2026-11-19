import { describe, it, expect, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import GuestItineraryPage from "./page";
import * as customerApi from "@/features/customer/api/customer-api";
import type { PublicGuestBookingDetails } from "@/features/customer/types/customer";

vi.mock("@/features/customer/api/customer-api", () => ({
  useGetPublicGuestBookingQuery: vi.fn(),
}));

describe("GuestItineraryPage", () => {
  const dummyToken = "abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890";
  const paramsPromise = Promise.resolve({ token: dummyToken });

  it("renders loading state when isLoading is true", async () => {
    vi.mocked(customerApi.useGetPublicGuestBookingQuery).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: undefined,
      refetch: vi.fn(),
    } as any);

    await act(async () => {
      render(<GuestItineraryPage params={paramsPromise} />);
    });

    expect(screen.getByText("Loading Itinerary...")).toBeInTheDocument();
    expect(
      screen.getByText("Please wait while we verify your secure booking link.")
    ).toBeInTheDocument();
  });

  it("renders expired link state when error status is 410", async () => {
    vi.mocked(customerApi.useGetPublicGuestBookingQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: { status: 410, data: { message: "Link expired" } },
      refetch: vi.fn(),
    } as any);

    await act(async () => {
      render(<GuestItineraryPage params={paramsPromise} />);
    });

    expect(screen.getByText("Access Link Expired")).toBeInTheDocument();
    expect(screen.getByText("Contact Support")).toBeInTheDocument();
  });

  it("renders revoked link state when error status is 403", async () => {
    vi.mocked(customerApi.useGetPublicGuestBookingQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: { status: 403, data: { message: "Link revoked" } },
      refetch: vi.fn(),
    } as any);

    await act(async () => {
      render(<GuestItineraryPage params={paramsPromise} />);
    });

    expect(screen.getByText("Access Link Revoked")).toBeInTheDocument();
  });

  it("renders generic not found error when booking cannot be found", async () => {
    vi.mocked(customerApi.useGetPublicGuestBookingQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: { status: 404, data: { message: "Not found" } },
      refetch: vi.fn(),
    } as any);

    await act(async () => {
      render(<GuestItineraryPage params={paramsPromise} />);
    });

    expect(screen.getByText("Booking Not Found")).toBeInTheDocument();
  });

  it("renders booking itinerary details when data is loaded successfully with payable balance", async () => {
    const mockBookingData: PublicGuestBookingDetails = {
      bookingReference: "BK-GUEST-1234",
      status: "CONFIRMED",
      paymentStatus: "UNPAID",
      fulfillmentStatus: "NOT_STARTED",
      currency: "THB",
      pricing: {
        basePrice: 4500,
        finalPrice: 4500,
        totalPaid: 0,
        remainingBalance: 4500,
      },
      guest: {
        name: "Sarah Connor",
        email: "sarah@example.com",
        phone: "+66812345678",
        party: {
          adults: 2,
          children: 1,
          infants: 0,
        },
      },
      service: {
        id: "srv-123",
        name: "Phi Phi Islands Early Bird Tour",
        type: "TOUR",
        description: "Spectacular island hopping experience.",
        providerName: "Phuket Marine Tours",
      },
      travelDate: "2026-12-01T08:00:00.000Z",
      createdAt: "2026-11-20T10:00:00.000Z",
      paymentAction: {
        isPayable: true,
        paymentUrl: "/pay/pay-tok-abc",
        expiresAt: "2026-11-22T10:00:00.000Z",
        remainingBalance: 4500,
      },
      cancellationPolicy: {
        allowed: false,
        notice:
          "Guests cannot cancel or alter bookings online. Please contact our support team at least 24 hours prior to departure.",
        supportEmail: "support@phukettours.com",
      },
    };

    vi.mocked(customerApi.useGetPublicGuestBookingQuery).mockReturnValue({
      data: {
        success: true,
        data: mockBookingData,
      },
      isLoading: false,
      isError: false,
      error: undefined,
      refetch: vi.fn(),
    } as any);

    await act(async () => {
      render(<GuestItineraryPage params={paramsPromise} />);
    });

    // Verify key fields
    expect(screen.getByText("BK-GUEST-1234")).toBeInTheDocument();
    expect(screen.getByText("Phi Phi Islands Early Bird Tour")).toBeInTheDocument();
    expect(screen.getByText("Sarah Connor")).toBeInTheDocument();
    expect(screen.getByText("sarah@example.com")).toBeInTheDocument();
    expect(screen.getByText("+66812345678")).toBeInTheDocument();

    // Verify support cancellation notice
    expect(screen.getByText("Contact Support to Modify or Cancel")).toBeInTheDocument();

    // Verify pay balance link
    expect(screen.getByRole("link", { name: /Pay Balance Now/i })).toHaveAttribute(
      "href",
      "/pay/pay-tok-abc"
    );
  });

  it("renders fully paid state badge and no pay button when balance is 0", async () => {
    const mockPaidBookingData: PublicGuestBookingDetails = {
      bookingReference: "BK-PAID-9999",
      status: "CONFIRMED",
      paymentStatus: "PAID",
      fulfillmentStatus: "CONFIRMED" as any,
      currency: "THB",
      pricing: {
        basePrice: 3200,
        finalPrice: 3200,
        totalPaid: 3200,
        remainingBalance: 0,
      },
      guest: {
        name: "John Doe",
        email: "john@example.com",
        phone: "+66899999999",
        party: {
          adults: 2,
          children: 0,
          infants: 0,
        },
      },
      service: {
        id: "srv-456",
        name: "James Bond Island Cruise",
        type: "TOUR",
        description: "Sightseeing cruise.",
        providerName: "Andaman Adventures",
      },
      travelDate: "2026-12-01T08:00:00.000Z",
      createdAt: "2026-11-20T10:00:00.000Z",
      paymentAction: {
        isPayable: false,
        paymentUrl: undefined,
        remainingBalance: 0,
      },
      cancellationPolicy: {
        allowed: false,
        notice: "Contact support for assistance.",
        supportEmail: "support@phukettours.com",
      },
    };

    vi.mocked(customerApi.useGetPublicGuestBookingQuery).mockReturnValue({
      data: {
        success: true,
        data: mockPaidBookingData,
      },
      isLoading: false,
      isError: false,
      error: undefined,
      refetch: vi.fn(),
    } as any);

    await act(async () => {
      render(<GuestItineraryPage params={paramsPromise} />);
    });

    expect(screen.getByText("BK-PAID-9999")).toBeInTheDocument();
    expect(screen.getByText("Your booking is fully paid.")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Pay Balance Now/i })).not.toBeInTheDocument();
  });
});
