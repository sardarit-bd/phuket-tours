import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { DiscountRequestDialog } from "./discount-request-dialog";
import * as adminApiModule from "@/features/admin/api/admin-api";

vi.mock("@/features/admin/api/admin-api", () => ({
  useCreateStaffDiscountRequestMutation: vi.fn(),
}));

describe("DiscountRequestDialog component", () => {
  const mockCreateRequest = vi.fn();
  const mockClose = vi.fn();
  const mockSuccess = vi.fn();

  const mockBooking = {
    id: "bkg-uuid-123456",
    customerName: "Alice Wonderland",
    tourName: "Phi Phi Island Adventure",
    originalPrice: 1000,
    currency: "USD",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateRequest.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({
        success: true,
        data: { id: "req-uuid-999" },
      }),
    });
    vi.mocked(adminApiModule.useCreateStaffDiscountRequestMutation).mockReturnValue([
      mockCreateRequest,
      { isLoading: false } as any,
    ]);
  });

  it("renders dialog and displays booking context and standard price", () => {
    render(
      <DiscountRequestDialog
        isOpen={true}
        onClose={mockClose}
        booking={mockBooking}
      />
    );

    expect(screen.getByText("Request Booking Discount")).toBeInTheDocument();
    expect(screen.getByTestId("discount-original-price")).toHaveTextContent("$1,000.00");
  });

  it("calculates percentage discount live preview correctly", () => {
    render(
      <DiscountRequestDialog
        isOpen={true}
        onClose={mockClose}
        booking={mockBooking}
      />
    );

    const valueInput = screen.getByTestId("discount-value-input");
    fireEvent.change(valueInput, { target: { value: "20" } });

    // 20% of 1000 is 200, proposed final is 800
    expect(screen.getByTestId("discount-preview-amount")).toHaveTextContent("-$200.00");
    expect(screen.getByTestId("discount-preview-final-price")).toHaveTextContent("$800.00");
  });

  it("calculates fixed amount discount preview correctly", () => {
    render(
      <DiscountRequestDialog
        isOpen={true}
        onClose={mockClose}
        booking={mockBooking}
      />
    );

    const fixedTab = screen.getByTestId("discount-type-fixed");
    fireEvent.click(fixedTab);

    const valueInput = screen.getByTestId("discount-value-input");
    fireEvent.change(valueInput, { target: { value: "150" } });

    expect(screen.getByTestId("discount-preview-amount")).toHaveTextContent("-$150.00");
    expect(screen.getByTestId("discount-preview-final-price")).toHaveTextContent("$850.00");
  });

  it("validates missing reason and blocks submission", async () => {
    render(
      <DiscountRequestDialog
        isOpen={true}
        onClose={mockClose}
        booking={mockBooking}
      />
    );

    const valueInput = screen.getByTestId("discount-value-input");
    fireEvent.change(valueInput, { target: { value: "10" } });

    const submitBtn = screen.getByTestId("discount-submit-btn");
    expect(submitBtn).toBeDisabled();
  });

  it("submits request successfully and transitions to confirmation state", async () => {
    render(
      <DiscountRequestDialog
        isOpen={true}
        onClose={mockClose}
        booking={mockBooking}
        onSuccess={mockSuccess}
      />
    );

    const valueInput = screen.getByTestId("discount-value-input");
    fireEvent.change(valueInput, { target: { value: "15" } });

    const reasonInput = screen.getByTestId("discount-reason-input");
    fireEvent.change(reasonInput, { target: { value: "VIP corporate client repeat booking" } });

    const submitBtn = screen.getByTestId("discount-submit-btn");
    expect(submitBtn).not.toBeDisabled();
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockCreateRequest).toHaveBeenCalledWith({
        bookingId: "bkg-uuid-123456",
        discountType: "PERCENTAGE",
        discountValue: 15,
        reason: "VIP corporate client repeat booking",
      });
      expect(mockSuccess).toHaveBeenCalledWith("req-uuid-999");
    });

    expect(screen.getByTestId("discount-request-success")).toBeInTheDocument();
    expect(screen.getByText("Request Sent for Approval")).toBeInTheDocument();
  });
});
