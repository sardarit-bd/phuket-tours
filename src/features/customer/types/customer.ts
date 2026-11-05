import type { ApiResponse } from "@/types/common";

/* ── Shared helpers ────────────────────────────────────────────────── */

export interface PaginatedResult<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/* ── Customer-safe booking shape ───────────────────────────────────── */

export interface CustomerBookingTour {
  id: string;
  name: string;
  type: string;
}

export interface CustomerBookingAvailability {
  id: string;
  date: string;
}

export interface CustomerBookingRecord {
  id: string;
  status:
    | "PENDING"
    | "CONFIRMED"
    | "CANCELLED"
    | "AWAITING_APPROVAL"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "FAILED";
  paymentStatus: "UNPAID" | "PARTIALLY_PAID" | "PAID";
  fulfillmentStatus: "NOT_STARTED" | "IN_PROGRESS" | "FULFILLED";
  basePrice: number;
  finalPrice: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  service: CustomerBookingTour;
  availability: CustomerBookingAvailability | null;
  /** Agent-only fields intentionally omitted: commission, proposedPrice, priceApproval, customer, agentId */
}

export interface GetCustomerBookingsParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

export type CustomerBookingsListResponse = ApiResponse<PaginatedResult<CustomerBookingRecord>>;
export type CustomerBookingDetailResponse = ApiResponse<CustomerBookingRecord>;

/* ── Customer payment shape ────────────────────────────────────────── */

export type CustomerPaymentMethod = "BANK_TRANSFER" | "CASH" | "OTHER";

export type CustomerPaymentStatus =
  | "INITIATED"
  | "SUBMITTED"
  | "VERIFIED"
  | "REJECTED";

export interface CustomerPaymentBookingInfo {
  id: string;
  serviceId: string;
  agentId: string | null;
  status: string;
  paymentStatus: string;
  finalPrice: number | null;
}

export interface CustomerPaymentRecord {
  id: string;
  bookingId: string;
  customerId: string;
  amount: number;
  method: CustomerPaymentMethod;
  status: CustomerPaymentStatus;
  reference: string | null;
  receiptNote: string | null;
  submittedAt: string | null;
  receivedAt: string | null;
  reviewedById: string | null;
  reviewedAt: string | null;
  reviewNotes: string | null;
  createdAt: string;
  updatedAt: string;
  booking?: CustomerPaymentBookingInfo;
}

export interface GetCustomerPaymentsParams {
  page?: number;
  limit?: number;
  status?: CustomerPaymentStatus;
  method?: CustomerPaymentMethod;
  bookingId?: string;
}

/**
 * The backend returns a flat list shape (no nested `pagination` object),
 * matching the existing admin payment list contract.
 */
export interface CustomerPaymentsListResponse {
  success: boolean;
  message: string;
  data: {
    items: CustomerPaymentRecord[];
    page: number;
    limit: number;
    total: number;
  };
}

export type CustomerPaymentDetailResponse = ApiResponse<CustomerPaymentRecord>;
