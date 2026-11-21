import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CreateStaffBookingDialog } from "./create-staff-booking-dialog";
import * as toursApiModule from "@/features/tours/api/tours-api";
import * as adminApiModule from "@/features/admin/api/admin-api";

const MOCK_TOURS = [
  {
    id: "tour-1",
    title: "Phi Phi Island Speedboat Tour",
    slug: "phi-phi-island-tour",
    price: { amount: 120, currency: "USD", hasPrice: true },
    pricingTiers: [
      { tierName: "Adult", price: 120 },
      { tierName: "Child", price: 80 },
    ],
  },
  {
    id: "tour-2",
    title: "James Bond Island Luxury Catamaran",
    slug: "james-bond-catamaran",
    price: { amount: 150, currency: "USD", hasPrice: true },
    pricingTiers: [],
  },
];

const MOCK_CUSTOMERS = [
  {
    id: "cust-1",
    name: "Alice Johnson",
    email: "alice@example.com",
    phone: "+66 81 234 5678",
    role: "customer",
    status: "active",
  },
  {
    id: "cust-2",
    name: "Bob Williams",
    email: "bob@example.com",
    phone: null,
    role: "customer",
    status: "active",
  },
];

describe("CreateStaffBookingDialog component", () => {
  const mockCreateStaffBooking = vi.fn();
  const mockGeneratePaymentLink = vi.fn();
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(toursApiModule, "useGetToursQuery").mockReturnValue({
      data: { data: MOCK_TOURS },
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    vi.spyOn(adminApiModule, "useGetStaffCustomersQuery").mockReturnValue({
      data: {
        success: true,
        data: {
          items: MOCK_CUSTOMERS,
          pagination: { page: 1, limit: 50, total: 2, totalPages: 1 },
        },
      },
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    vi.spyOn(adminApiModule, "useCreateStaffBookingMutation").mockReturnValue([
      mockCreateStaffBooking,
      { isLoading: false },
    ] as any);

    vi.spyOn(adminApiModule, "useGenerateStaffPaymentLinkMutation").mockReturnValue([
      mockGeneratePaymentLink,
      { isLoading: false },
    ] as any);
  });

  it("renders dialog form and respects open/close controls", () => {
    const { rerender } = render(
      <CreateStaffBookingDialog isOpen={false} onClose={mockOnClose} />
    );
    expect(screen.queryByTestId("create-staff-booking-dialog")).not.toBeInTheDocument();

    rerender(<CreateStaffBookingDialog isOpen={true} onClose={mockOnClose} />);
    expect(screen.getByTestId("create-staff-booking-dialog")).toBeInTheDocument();
    expect(screen.getByText("Create Staff Direct Booking")).toBeInTheDocument();
  });

  it("toggles between New Guest and Existing Customer modes", () => {
    render(<CreateStaffBookingDialog isOpen={true} onClose={mockOnClose} />);

    // Default is New Guest
    expect(screen.getByTestId("staff-booking-customer-name")).toBeInTheDocument();
    expect(screen.getByTestId("staff-booking-customer-email")).toBeInTheDocument();

    // Toggle to Existing Customer
    fireEvent.click(screen.getByTestId("staff-customer-mode-existing"));
    expect(screen.getByTestId("staff-existing-customer-select")).toBeInTheDocument();
    expect(screen.queryByTestId("staff-booking-customer-name")).not.toBeInTheDocument();

    // Toggle back to New Guest
    fireEvent.click(screen.getByTestId("staff-customer-mode-new"));
    expect(screen.getByTestId("staff-booking-customer-name")).toBeInTheDocument();
  });

  it("calculates standard retail pricing estimate and does not display agent pricing UI", () => {
    render(<CreateStaffBookingDialog isOpen={true} onClose={mockOnClose} />);

    // Adults count starts at 2
    expect(screen.getByTestId("staff-booking-adults-count")).toHaveTextContent("2");
    // Standard retail price preview for 2 adults @ 120 = $240.00
    expect(screen.getByTestId("staff-booking-estimated-price")).toHaveTextContent("$240.00");
    expect(screen.getByText("No Commission Applied")).toBeInTheDocument();

    // Verify Agent-specific discount or proposal UI is strictly absent
    expect(screen.queryByText(/Propose Custom Partner Rate/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Instant Approval Floor/i)).not.toBeInTheDocument();
  });

  it("validates required passenger counts and inputs", async () => {
    render(<CreateStaffBookingDialog isOpen={true} onClose={mockOnClose} />);

    // Empty name & email submission
    fireEvent.click(screen.getByTestId("staff-booking-submit-btn"));

    await waitFor(() => {
      expect(screen.getByTestId("staff-booking-create-error")).toBeInTheDocument();
      expect(
        screen.getByText("Please provide the customer's full name and email address.")
      ).toBeInTheDocument();
    });

    expect(mockCreateStaffBooking).not.toHaveBeenCalled();
  });

  it("submits booking for new guest customer with exact backend payload contract", async () => {
    mockCreateStaffBooking.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({
        success: true,
        data: {
          id: "bkg-12345",
          serviceId: "tour-1",
          customerId: "cust-new-99",
          finalPrice: 240,
          currency: "USD",
          status: "PENDING",
          paymentStatus: "UNPAID",
          customer: {
            id: "cust-new-99",
            name: "John Traveler",
            email: "john@example.com",
            phone: "+66 89 000 1111",
          },
          service: {
            id: "tour-1",
            name: "Phi Phi Island Speedboat Tour",
            type: "TOUR",
          },
        },
      }),
    });

    render(
      <CreateStaffBookingDialog
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    fireEvent.change(screen.getByTestId("staff-booking-customer-name"), {
      target: { value: "John Traveler" },
    });
    fireEvent.change(screen.getByTestId("staff-booking-customer-email"), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByTestId("staff-booking-customer-phone"), {
      target: { value: "+66 89 000 1111" },
    });
    fireEvent.change(screen.getByTestId("staff-booking-notes-input"), {
      target: { value: "Vegetarian lunch" },
    });

    fireEvent.click(screen.getByTestId("staff-booking-submit-btn"));

    await waitFor(() => {
      expect(mockCreateStaffBooking).toHaveBeenCalledTimes(1);
    });

    const calledPayload = mockCreateStaffBooking.mock.calls[0][0];
    expect(calledPayload).toEqual({
      customer: {
        name: "John Traveler",
        email: "john@example.com",
        phone: "+66 89 000 1111",
      },
      serviceId: "tour-1",
      travelDate: expect.any(String),
      adults: 2,
      children: 0,
      infants: 0,
      notes: "Vegetarian lunch",
    });
    // Ensure no proposedPrice or agentId is sent
    expect(calledPayload).not.toHaveProperty("proposedPrice");
    expect(calledPayload).not.toHaveProperty("agentId");
    expect(calledPayload).not.toHaveProperty("customerId");

    // Success screen rendered
    await waitFor(() => {
      expect(screen.getByTestId("staff-booking-created-success")).toBeInTheDocument();
      expect(screen.getByText("John Traveler")).toBeInTheDocument();
      expect(screen.getByText("$240.00")).toBeInTheDocument();
    });

    expect(mockOnSuccess).toHaveBeenCalledWith("bkg-12345");
  });

  it("submits booking for existing customer with customerId (mutual exclusivity)", async () => {
    mockCreateStaffBooking.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({
        success: true,
        data: {
          id: "bkg-55555",
          serviceId: "tour-1",
          customerId: "cust-1",
          finalPrice: 240,
          currency: "USD",
          status: "PENDING",
          paymentStatus: "UNPAID",
          customer: {
            id: "cust-1",
            name: "Alice Johnson",
            email: "alice@example.com",
            phone: "+66 81 234 5678",
          },
        },
      }),
    });

    render(<CreateStaffBookingDialog isOpen={true} onClose={mockOnClose} />);

    fireEvent.click(screen.getByTestId("staff-customer-mode-existing"));
    fireEvent.click(screen.getByTestId("staff-booking-submit-btn"));

    await waitFor(() => {
      expect(mockCreateStaffBooking).toHaveBeenCalledTimes(1);
    });

    const calledPayload = mockCreateStaffBooking.mock.calls[0][0];
    expect(calledPayload.customerId).toBe("cust-1");
    expect(calledPayload).not.toHaveProperty("customer");
  });

  it("allows generating payment link only after booking creation succeeds", async () => {
    mockCreateStaffBooking.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({
        success: true,
        data: {
          id: "bkg-payment-test",
          serviceId: "tour-1",
          customerId: "cust-1",
          finalPrice: 240,
          currency: "USD",
          status: "PENDING",
          paymentStatus: "UNPAID",
        },
      }),
    });

    mockGeneratePaymentLink.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({
        success: true,
        data: {
          paymentLinkId: "link-123",
          bookingId: "bkg-payment-test",
          paymentUrl: "https://phuket-tours.com/payment/pay/raw-token-123",
          rawToken: "raw-token-123",
          expiresAt: "2026-11-20T10:00:00.000Z",
          status: "ACTIVE",
        },
      }),
    });

    render(<CreateStaffBookingDialog isOpen={true} onClose={mockOnClose} />);

    // Create booking first
    fireEvent.click(screen.getByTestId("staff-customer-mode-existing"));
    fireEvent.click(screen.getByTestId("staff-booking-submit-btn"));

    await waitFor(() => {
      expect(screen.getByTestId("staff-booking-created-success")).toBeInTheDocument();
    });

    // Payment link has not been generated yet
    expect(screen.getByTestId("staff-generate-payment-link-btn")).toBeInTheDocument();
    expect(screen.queryByTestId("staff-payment-url-input")).not.toBeInTheDocument();

    // Staff clicks Generate Payment Link
    fireEvent.click(screen.getByTestId("staff-generate-payment-link-btn"));

    await waitFor(() => {
      expect(mockGeneratePaymentLink).toHaveBeenCalledWith({
        bookingId: "bkg-payment-test",
      });
    });

    // Payment URL is displayed with Copy and WhatsApp share
    await waitFor(() => {
      expect(screen.getByTestId("staff-payment-url-input")).toHaveValue(
        "https://phuket-tours.com/payment/pay/raw-token-123"
      );
      expect(screen.getByTestId("staff-copy-link-btn")).toBeInTheDocument();
      expect(screen.getByTestId("staff-share-whatsapp-btn")).toBeInTheDocument();
    });

    // Test clipboard copy
    const writeTextSpy = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextSpy,
      },
    });

    fireEvent.click(screen.getByTestId("staff-copy-link-btn"));
    expect(writeTextSpy).toHaveBeenCalledWith(
      "https://phuket-tours.com/payment/pay/raw-token-123"
    );
  });

  it("handles payment link generation errors gracefully", async () => {
    mockCreateStaffBooking.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({
        success: true,
        data: {
          id: "bkg-err-test",
          serviceId: "tour-1",
          customerId: "cust-1",
          finalPrice: 240,
          currency: "USD",
          status: "PENDING",
          paymentStatus: "UNPAID",
        },
      }),
    });

    mockGeneratePaymentLink.mockReturnValue({
      unwrap: vi.fn().mockRejectedValue({
        data: { message: "You are not authorized to generate a payment link for this booking" },
      }),
    });

    render(<CreateStaffBookingDialog isOpen={true} onClose={mockOnClose} />);

    fireEvent.click(screen.getByTestId("staff-customer-mode-existing"));
    fireEvent.click(screen.getByTestId("staff-booking-submit-btn"));

    await waitFor(() => {
      expect(screen.getByTestId("staff-generate-payment-link-btn")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("staff-generate-payment-link-btn"));

    await waitFor(() => {
      expect(
        screen.getByText("You are not authorized to generate a payment link for this booking")
      ).toBeInTheDocument();
    });
  });

  it("submits booking with optional discount request when discount toggle is enabled", async () => {
    mockCreateStaffBooking.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({
        success: true,
        data: {
          id: "bkg-discount-req-1",
          serviceId: "tour-1",
          customerId: "cust-1",
          basePrice: 240,
          finalPrice: 240,
          currency: "USD",
          status: "AWAITING_APPROVAL",
          paymentStatus: "UNPAID",
          requiresApproval: true,
        },
      }),
    });

    render(<CreateStaffBookingDialog isOpen={true} onClose={mockOnClose} />);

    // Select existing customer
    fireEvent.click(screen.getByTestId("staff-customer-mode-existing"));

    await waitFor(() => {
      expect(screen.getByTestId("staff-existing-customer-select")).toBeInTheDocument();
    });

    // Enable discount toggle
    const toggle = screen.getByTestId("enable-discount-toggle");
    fireEvent.click(toggle);

    expect(screen.getByTestId("staff-discount-value-input")).toBeInTheDocument();
    expect(screen.getByTestId("staff-discount-reason-input")).toBeInTheDocument();

    // Fill in discount details: 10%
    fireEvent.change(screen.getByTestId("staff-discount-value-input"), {
      target: { value: "10" },
    });
    fireEvent.change(screen.getByTestId("staff-discount-reason-input"), {
      target: { value: "Loyal VIP Customer promotion" },
    });

    // Check preview calculation: 10% of 240 = 24 -> proposed: $216.00
    expect(screen.getByTestId("proposed-final-price-preview")).toHaveTextContent("$216.00");

    // Submit booking form
    fireEvent.submit(screen.getByTestId("create-staff-booking-dialog"));

    await waitFor(() => {
      expect(mockCreateStaffBooking).toHaveBeenCalledTimes(1);
    });

    const calledPayload = mockCreateStaffBooking.mock.calls[0][0];
    expect(calledPayload.discount).toEqual({
      discountType: "PERCENTAGE",
      discountValue: 10,
      reason: "Loyal VIP Customer promotion",
    });

    // Verify success banner states awaiting approval and locks payment link
    await waitFor(() => {
      expect(screen.getByText("Awaiting Admin Approval")).toBeInTheDocument();
      expect(screen.getByText("Payment Link Generation Locked")).toBeInTheDocument();
      expect(screen.queryByTestId("staff-generate-payment-link-btn")).not.toBeInTheDocument();
    });
  });

  it("accepts valid decimal percentage values (e.g., 10.5) and decimal fixed-amounts without HTML step mismatch", async () => {
    mockCreateStaffBooking.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({
        success: true,
        data: {
          id: "bkg-decimal-1",
          serviceId: "tour-1",
          customerId: "cust-1",
          basePrice: 240,
          finalPrice: 240,
          currency: "USD",
          status: "AWAITING_APPROVAL",
          paymentStatus: "UNPAID",
          requiresApproval: true,
        },
      }),
    });

    render(<CreateStaffBookingDialog isOpen={true} onClose={mockOnClose} />);

    fireEvent.click(screen.getByTestId("staff-customer-mode-existing"));
    await waitFor(() => {
      expect(screen.getByTestId("staff-existing-customer-select")).toBeInTheDocument();
    });

    // Enable discount toggle
    fireEvent.click(screen.getByTestId("enable-discount-toggle"));

    const input = screen.getByTestId("staff-discount-value-input") as HTMLInputElement;
    // Step should be 0.01 and min 0.01
    expect(input.step).toBe("0.01");
    expect(input.min).toBe("0.01");

    // Test decimal percentage: 10.5%
    fireEvent.change(input, { target: { value: "10.5" } });
    fireEvent.change(screen.getByTestId("staff-discount-reason-input"), {
      target: { value: "Partner 10.5% promo" },
    });

    // 10.5% of 240 = 25.20 -> proposed: $214.80
    expect(screen.getByTestId("proposed-final-price-preview")).toHaveTextContent("$214.80");

    // Switch to fixed amount and test decimal: 25.50 USD
    fireEvent.click(screen.getByTestId("discount-type-fixed"));
    expect(input.step).toBe("0.01");
    expect(input.min).toBe("0.01");

    fireEvent.change(input, { target: { value: "25.50" } });
    // 240 - 25.50 = 214.50
    expect(screen.getByTestId("proposed-final-price-preview")).toHaveTextContent("$214.50");

    fireEvent.submit(screen.getByTestId("create-staff-booking-dialog"));

    await waitFor(() => {
      expect(mockCreateStaffBooking).toHaveBeenCalledTimes(1);
    });

    const calledPayload = mockCreateStaffBooking.mock.calls[0][0];
    expect(calledPayload.discount).toEqual({
      discountType: "FIXED_AMOUNT",
      discountValue: 25.5,
      reason: "Partner 10.5% promo",
    });
  });
});
