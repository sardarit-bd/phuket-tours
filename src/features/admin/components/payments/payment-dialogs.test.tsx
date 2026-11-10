import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { PaymentDetailsDialog } from "./payment-details-dialog";
import { VerifyPaymentDialog } from "./verify-payment-dialog";
import { RecordPaymentDialog } from "./record-payment-dialog";
import * as adminApiModule from "@/features/admin/api/admin-api";
import type { AdminPaymentRecord } from "../../types/admin-payments";

const MOCK_PAYMENT: AdminPaymentRecord = {
  id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  bookingId: "a1111111-2222-3333-4444-555555555555",
  customerId: "c1111111-2222-3333-4444-555555555555",
  amount: 4500,
  method: "BANK_TRANSFER",
  status: "SUBMITTED",
  reference: "REF-TRANS-4488",
  receiptNote: "Uploaded receipt transfer screenshot",
  submittedAt: "2026-10-21T08:00:00.000Z",
  receivedAt: null,
  reviewedById: null,
  reviewedAt: null,
  reviewNotes: null,
  createdAt: "2026-10-21T07:30:00.000Z",
  updatedAt: "2026-10-21T08:00:00.000Z",
  booking: {
    id: "a1111111-2222-3333-4444-555555555555",
    serviceId: "srv-islands",
    agentId: null,
    status: "CONFIRMED",
    paymentStatus: "PARTIALLY_PAID",
    finalPrice: 4500,
  },
};

const MOCK_INITIATED_PAYMENT: AdminPaymentRecord = {
  id: "d9999999-58cc-4372-a567-0e02b2c3d479",
  bookingId: "a3333333-2222-3333-4444-555555555555",
  customerId: "c3333333-2222-3333-4444-555555555555",
  amount: 2000,
  method: "CASH",
  status: "INITIATED",
  reference: null,
  receiptNote: null,
  submittedAt: null,
  receivedAt: null,
  reviewedById: null,
  reviewedAt: null,
  reviewNotes: null,
  createdAt: "2026-10-22T09:00:00.000Z",
  updatedAt: "2026-10-22T09:00:00.000Z",
  booking: {
    id: "a3333333-2222-3333-4444-555555555555",
    serviceId: "srv-city",
    agentId: null,
    status: "CONFIRMED",
    paymentStatus: "UNPAID",
    finalPrice: 2000,
  },
};

vi.mock("@/features/admin/api/admin-api", () => {
  return {
    useGetAdminPaymentByIdQuery: vi.fn(),
    useVerifyAdminPaymentMutation: vi.fn(),
    useRecordAdminPaymentMutation: vi.fn(),
  };
});

describe("PaymentDetailsDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders payment details when data is loaded", () => {
    vi.mocked(adminApiModule.useGetAdminPaymentByIdQuery).mockReturnValue({
      data: { success: true, message: "OK", data: MOCK_PAYMENT },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    render(
      <PaymentDetailsDialog
        paymentId={MOCK_PAYMENT.id}
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText("Payment Details")).toBeInTheDocument();
    expect(screen.getAllByText("฿4,500.00").length).toBeGreaterThan(0);
    expect(screen.getByText("REF-TRANS-4488")).toBeInTheDocument();
    expect(screen.getByText("Uploaded receipt transfer screenshot")).toBeInTheDocument();
    expect(screen.getByText(MOCK_PAYMENT.id)).toBeInTheDocument();
  });
});

describe("VerifyPaymentDialog", () => {
  const mockVerifyMutation = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockVerifyMutation.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({ success: true, message: "Payment verified successfully" }),
    });
    vi.mocked(adminApiModule.useVerifyAdminPaymentMutation).mockReturnValue([
      mockVerifyMutation,
      { isLoading: false } as any,
    ]);
  });

  it("submits verification decision successfully", async () => {
    const handleSuccess = vi.fn();
    const handleClose = vi.fn();

    render(
      <VerifyPaymentDialog
        payment={MOCK_PAYMENT}
        isOpen={true}
        onClose={handleClose}
        onSuccess={handleSuccess}
      />
    );

    expect(screen.getByText("Verify / Review Payment")).toBeInTheDocument();
    expect(screen.getByText("฿4,500.00")).toBeInTheDocument();

    const submitBtn = screen.getByTestId("submit-verify-decision-btn");
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockVerifyMutation).toHaveBeenCalledWith({
        paymentId: MOCK_PAYMENT.id,
        input: {
          decision: "VERIFIED",
          notes: undefined,
        },
      });
      expect(handleSuccess).toHaveBeenCalled();
      expect(handleClose).toHaveBeenCalled();
    });
  });

  it("enforces notes validation when rejecting a payment", async () => {
    const handleSuccess = vi.fn();

    render(
      <VerifyPaymentDialog
        payment={MOCK_PAYMENT}
        isOpen={true}
        onClose={vi.fn()}
        onSuccess={handleSuccess}
      />
    );

    // Select Reject decision
    const rejectBtn = screen.getByTestId("decision-rejected-btn");
    fireEvent.click(rejectBtn);

    // Try submit without notes
    const submitBtn = screen.getByTestId("submit-verify-decision-btn");
    fireEvent.click(submitBtn);

    expect(
      screen.getByText(/review notes are strictly required when rejecting a payment/i)
    ).toBeInTheDocument();
    expect(mockVerifyMutation).not.toHaveBeenCalled();

    // Now type notes and submit
    const notesInput = screen.getByTestId("verify-notes-input");
    fireEvent.change(notesInput, { target: { value: "Slip reference cannot be traced in bank" } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockVerifyMutation).toHaveBeenCalledWith({
        paymentId: MOCK_PAYMENT.id,
        input: {
          decision: "REJECTED",
          notes: "Slip reference cannot be traced in bank",
        },
      });
    });
  });
});

describe("RecordPaymentDialog", () => {
  const mockRecordMutation = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockRecordMutation.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({ success: true, message: "Payment recorded successfully" }),
    });
    vi.mocked(adminApiModule.useRecordAdminPaymentMutation).mockReturnValue([
      mockRecordMutation,
      { isLoading: false } as any,
    ]);
  });

  it("submits manual payment recording for an initiated payment", async () => {
    const handleSuccess = vi.fn();
    const handleClose = vi.fn();

    render(
      <RecordPaymentDialog
        payment={MOCK_INITIATED_PAYMENT}
        isOpen={true}
        onClose={handleClose}
        onSuccess={handleSuccess}
      />
    );

    expect(screen.getByText("Record Manual Payment")).toBeInTheDocument();
    expect(screen.getByText("฿2,000.00")).toBeInTheDocument();

    const refInput = screen.getByTestId("record-payment-reference-input");
    fireEvent.change(refInput, { target: { value: "CASH-DESK-901" } });

    const notesInput = screen.getByTestId("record-payment-notes-input");
    fireEvent.change(notesInput, { target: { value: "Received in Patong office" } });

    const submitBtn = screen.getByTestId("submit-record-payment-btn");
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockRecordMutation).toHaveBeenCalledWith({
        paymentId: MOCK_INITIATED_PAYMENT.id,
        input: expect.objectContaining({
          reference: "CASH-DESK-901",
          notes: "Received in Patong office",
        }),
      });
      expect(handleSuccess).toHaveBeenCalled();
      expect(handleClose).toHaveBeenCalled();
    });
  });
});
