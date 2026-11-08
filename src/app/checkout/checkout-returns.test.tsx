/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { makeStore } from "@/store";
import CheckoutSuccessPage from "@/app/checkout/success/page";
import CheckoutCancelPage from "@/app/checkout/cancel/page";
import {
  useGetCustomerBookingByIdQuery,
  useGetCustomerPaymentsQuery,
  useReconcileCustomerPaymentMutation,
} from "@/features/customer/api/customer-api";

const mockGetSearchParams = vi.fn();
vi.mock("next/navigation", () => ({
  useSearchParams: () => mockGetSearchParams(),
}));

vi.mock("@/features/customer/api/customer-api", () => ({
  useGetCustomerBookingByIdQuery: vi.fn(),
  useGetCustomerPaymentsQuery: vi.fn(),
  useReconcileCustomerPaymentMutation: vi.fn(),
}));

describe("Checkout Return Pages", () => {
  const mockRefetchBooking = vi.fn();
  const mockRefetchPayments = vi.fn();
  const mockReconcile = vi.fn();

  beforeEach(() => {
    vi.restoreAllMocks();
    mockGetSearchParams.mockReturnValue(new URLSearchParams("bookingId=b1&session_id=cs_1"));
    mockReconcile.mockReturnValue({
      unwrap: () => Promise.resolve({ success: true, data: { reconciled: true, newStatus: "VERIFIED" } }),
    });
    vi.mocked(useReconcileCustomerPaymentMutation).mockReturnValue([
      mockReconcile,
      { isLoading: false } as any,
    ]);
  });

  function renderPage(ui: React.ReactElement) {
    const store = makeStore();
    return render(<Provider store={store}>{ui}</Provider>);
  }

  describe("CheckoutSuccessPage", () => {
    it("displays verifying/processing state while payment status is UNPAID (webhook pending)", () => {
      vi.mocked(useGetCustomerBookingByIdQuery).mockReturnValue({
        data: {
          success: true,
          data: { id: "b1", paymentStatus: "UNPAID", service: { name: "Snorkeling" } },
        },
        isLoading: false,
        refetch: mockRefetchBooking,
      } as any);

      vi.mocked(useGetCustomerPaymentsQuery).mockReturnValue({
        data: {
          success: true,
          data: { items: [{ id: "p1", method: "STRIPE", status: "PROCESSING" }] },
        },
        refetch: mockRefetchPayments,
      } as any);

      renderPage(<CheckoutSuccessPage />);
      expect(screen.getByText("Verifying Payment...")).toBeInTheDocument();
      expect(screen.getByText("Check Status Now")).toBeInTheDocument();
    });

    it("displays confirmation only after backend confirms paymentStatus is PAID", () => {
      vi.mocked(useGetCustomerBookingByIdQuery).mockReturnValue({
        data: {
          success: true,
          data: { id: "b1", paymentStatus: "PAID", service: { name: "Snorkeling" } },
        },
        isLoading: false,
        refetch: mockRefetchBooking,
      } as any);

      vi.mocked(useGetCustomerPaymentsQuery).mockReturnValue({
        data: {
          success: true,
          data: { items: [{ id: "p1", method: "STRIPE", status: "VERIFIED" }] },
        },
        refetch: mockRefetchPayments,
      } as any);

      renderPage(<CheckoutSuccessPage />);
      expect(screen.getByText("Payment Confirmed!")).toBeInTheDocument();
      expect(screen.getByText("PAID")).toBeInTheDocument();
      expect(screen.getByText("View Reservation")).toBeInTheDocument();
    });

    it("triggers reconciliation when Stripe payment is unverified on customer return", async () => {
      mockReconcile.mockReturnValue({
        unwrap: () => Promise.resolve({ success: true, data: { reconciled: true, newStatus: "VERIFIED" } }),
      });

      vi.mocked(useGetCustomerBookingByIdQuery).mockReturnValue({
        data: {
          success: true,
          data: { id: "b1", paymentStatus: "UNPAID", service: { name: "Snorkeling" } },
        },
        isLoading: false,
        refetch: mockRefetchBooking,
      } as any);

      vi.mocked(useGetCustomerPaymentsQuery).mockReturnValue({
        data: {
          success: true,
          data: { items: [{ id: "p1", method: "STRIPE", status: "PROCESSING", stripeSessionId: "cs_1" }] },
        },
        refetch: mockRefetchPayments,
      } as any);

      renderPage(<CheckoutSuccessPage />);

      await waitFor(() => {
        expect(mockReconcile).toHaveBeenCalledWith("p1");
      });
    });

    it("displays Payment Incomplete when payment attempt fails on Stripe", () => {
      vi.mocked(useGetCustomerBookingByIdQuery).mockReturnValue({
        data: {
          success: true,
          data: { id: "b1", paymentStatus: "UNPAID", service: { name: "Snorkeling" } },
        },
        isLoading: false,
        refetch: mockRefetchBooking,
      } as any);

      vi.mocked(useGetCustomerPaymentsQuery).mockReturnValue({
        data: {
          success: true,
          data: { items: [{ id: "p1", method: "STRIPE", status: "FAILED" }] },
        },
        refetch: mockRefetchPayments,
      } as any);

      renderPage(<CheckoutSuccessPage />);
      expect(screen.getByText("Payment Incomplete")).toBeInTheDocument();
      expect(screen.getByText("Return to Booking")).toBeInTheDocument();
    });

    it("displays Verification Notice when payment status requires action", () => {
      vi.mocked(useGetCustomerBookingByIdQuery).mockReturnValue({
        data: {
          success: true,
          data: { id: "b1", paymentStatus: "UNPAID", service: { name: "Snorkeling" } },
        },
        isLoading: false,
        refetch: mockRefetchBooking,
      } as any);

      vi.mocked(useGetCustomerPaymentsQuery).mockReturnValue({
        data: {
          success: true,
          data: { items: [{ id: "p1", method: "STRIPE", status: "REQUIRES_ACTION" }] },
        },
        refetch: mockRefetchPayments,
      } as any);

      renderPage(<CheckoutSuccessPage />);
      expect(screen.getByText("Verification Notice")).toBeInTheDocument();
    });
  });

  describe("CheckoutCancelPage", () => {
    beforeEach(() => {
      vi.mocked(useGetCustomerPaymentsQuery).mockReturnValue({
        data: {
          success: true,
          data: { items: [] },
        },
      } as any);
    });

    it("renders payment cancelled message and link back to booking without marking failed", () => {
      vi.mocked(useGetCustomerBookingByIdQuery).mockReturnValue({
        data: {
          success: true,
          data: { id: "b1", paymentStatus: "UNPAID" },
        },
      } as any);

      renderPage(<CheckoutCancelPage />);
      expect(screen.getByText("Checkout Cancelled")).toBeInTheDocument();
      expect(screen.getByText("Return to Booking")).toBeInTheDocument();
      expect(screen.getByText("My Bookings")).toBeInTheDocument();
    });

    it("shows already confirmed status if booking was actually already paid", () => {
      vi.mocked(useGetCustomerBookingByIdQuery).mockReturnValue({
        data: {
          success: true,
          data: { id: "b1", paymentStatus: "PAID" },
        },
      } as any);

      renderPage(<CheckoutCancelPage />);
      expect(screen.getByText("Payment Confirmed")).toBeInTheDocument();
      expect(screen.getByText("View Booking")).toBeInTheDocument();
    });
  });
});
