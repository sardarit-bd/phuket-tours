import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { DiscountReviewDialog } from "./discount-review-dialog";
import * as adminApiModule from "@/features/admin/api/admin-api";
import type { StaffDiscountRequestRecord } from "@/features/admin/types/admin-discounts";

vi.mock("@/features/admin/api/admin-api", () => ({
  useReviewAdminDiscountMutation: vi.fn(),
}));

describe("DiscountReviewDialog component", () => {
  const mockReviewMutation = vi.fn();
  const mockClose = vi.fn();
  const mockSuccess = vi.fn();

  const mockRequest: StaffDiscountRequestRecord = {
    id: "req-101",
    bookingId: "bkg-202",
    discountType: "PERCENTAGE",
    discountValue: 20,
    originalPrice: 500,
    discountAmount: 100,
    proposedFinalPrice: 400,
    approvedDiscountAmount: null,
    approvedFinalPrice: null,
    status: "PENDING",
    reason: "Family group requested discount for 4 travelers",
    rejectionReason: null,
    adminNotes: null,
    requestedById: "staff-1",
    reviewedById: null,
    reviewedAt: null,
    createdAt: "2026-11-17T10:00:00.000Z",
    updatedAt: "2026-11-17T10:00:00.000Z",
    booking: {
      id: "bkg-202",
      currency: "USD",
      status: "PENDING",
      paymentStatus: "UNPAID",
      customer: {
        id: "cust-1",
        name: "Charlie Brown",
        email: "charlie@example.com",
        phone: "+66 89 123 4567",
      },
      service: {
        id: "srv-1",
        name: "Khao Sok Elephant Sanctuary",
        type: "TOUR",
      },
    },
    requestedBy: {
      id: "staff-1",
      name: "Staff Member",
      email: "staff@qbictravel.com",
      role: "staff",
    },
    reviewedBy: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockReviewMutation.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({ success: true }),
    });
    vi.mocked(adminApiModule.useReviewAdminDiscountMutation).mockReturnValue([
      mockReviewMutation,
      { isLoading: false } as any,
    ]);
  });

  it("renders review dialog with booking context and justification", () => {
    render(
      <DiscountReviewDialog
        isOpen={true}
        onClose={mockClose}
        request={mockRequest}
      />
    );

    expect(screen.getByText("Review Staff Discount Request")).toBeInTheDocument();
    expect(screen.getByText("Charlie Brown")).toBeInTheDocument();
    expect(screen.getByText("Khao Sok Elephant Sanctuary")).toBeInTheDocument();
    expect(screen.getByText(/Family group requested discount/)).toBeInTheDocument();
  });

  it("submits full approval successfully", async () => {
    render(
      <DiscountReviewDialog
        isOpen={true}
        onClose={mockClose}
        request={mockRequest}
        onSuccess={mockSuccess}
      />
    );

    const approveSubmitBtn = screen.getByTestId("discount-review-submit-btn");
    fireEvent.click(approveSubmitBtn);

    await waitFor(() => {
      expect(mockReviewMutation).toHaveBeenCalledWith({
        requestId: "req-101",
        decision: "APPROVE",
        approvedDiscountValue: undefined,
        adminNotes: undefined,
        rejectionReason: undefined,
      });
      expect(mockSuccess).toHaveBeenCalled();
      expect(mockClose).toHaveBeenCalled();
    });
  });

  it("allows partial approval with lower discount value", async () => {
    render(
      <DiscountReviewDialog
        isOpen={true}
        onClose={mockClose}
        request={mockRequest}
        onSuccess={mockSuccess}
      />
    );

    const partialCheckbox = screen.getByTestId("discount-partial-checkbox");
    fireEvent.click(partialCheckbox);

    const valueInput = screen.getByTestId("approved-discount-value-input");
    fireEvent.change(valueInput, { target: { value: "10" } });

    // 10% of 500 is 50, settled final is 450
    expect(screen.getByTestId("partial-preview-amount")).toHaveTextContent("-$50.00");
    expect(screen.getByTestId("partial-preview-final-price")).toHaveTextContent("$450.00");

    const approveSubmitBtn = screen.getByTestId("discount-review-submit-btn");
    fireEvent.click(approveSubmitBtn);

    await waitFor(() => {
      expect(mockReviewMutation).toHaveBeenCalledWith({
        requestId: "req-101",
        decision: "APPROVE",
        approvedDiscountValue: 10,
        adminNotes: undefined,
        rejectionReason: undefined,
      });
    });
  });

  it("requires rejection reason when rejecting and preserves standard booking price", async () => {
    render(
      <DiscountReviewDialog
        isOpen={true}
        onClose={mockClose}
        request={mockRequest}
        onSuccess={mockSuccess}
      />
    );

    const rejectTab = screen.getByTestId("discount-decision-reject");
    fireEvent.click(rejectTab);

    const submitBtn = screen.getByTestId("discount-review-submit-btn");
    // Initially disabled when reason is empty
    expect(submitBtn).toBeDisabled();

    const reasonInput = screen.getByTestId("rejection-reason-input");
    fireEvent.change(reasonInput, {
      target: { value: "High season peak demand prevents discounts" },
    });

    expect(submitBtn).not.toBeDisabled();
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockReviewMutation).toHaveBeenCalledWith({
        requestId: "req-101",
        decision: "REJECT",
        approvedDiscountValue: undefined,
        adminNotes: undefined,
        rejectionReason: "High season peak demand prevents discounts",
      });
      expect(mockSuccess).toHaveBeenCalled();
    });
  });
});
