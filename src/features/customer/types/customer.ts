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

export interface CustomerBookingPayment {
  id: string;
  amount: number;
  currency: string;
  method: string;
  status: string;
  reference?: string | null;
  stripeSessionId?: string | null;
  createdAt: string;
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
  currency?: string;
  basePrice: number;
  finalPrice: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  service: CustomerBookingTour;
  availability: CustomerBookingAvailability | null;
  payments?: CustomerBookingPayment[];
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

export interface CreateCustomerBookingInput {
  customerId: string;
  serviceId: string;
  availabilityId?: string;
  travelDate?: string;
  adults?: number;
  children?: number;
  infants?: number;
  notes?: string;
}

export interface CreateCustomerBookingData {
  id: string;
  customerId: string;
  serviceId: string;
  availabilityId: string | null;
  currency: string;
  basePrice: number;
  finalPrice: number;
  status: string;
  paymentStatus?: string;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type CreateCustomerBookingResponse = ApiResponse<CreateCustomerBookingData>;

export interface CreateCustomerPaymentInput {
  bookingId: string;
  method: CustomerPaymentMethod;
  reference?: string;
  receiptNote?: string;
}

export type CreateCustomerPaymentResponse = ApiResponse<CustomerPaymentRecord>;

/* ── Customer payment shape ────────────────────────────────────────── */

export type CustomerPaymentMethod = "BANK_TRANSFER" | "CASH" | "OTHER" | "STRIPE";

export type CustomerPaymentStatus =
  | "INITIATED"
  | "SUBMITTED"
  | "VERIFIED"
  | "REJECTED"
  | "PROCESSING"
  | "FAILED"
  | "CANCELLED"
  | "REQUIRES_ACTION"
  | "REFUNDED"
  | "PARTIALLY_REFUNDED"
  | "DISPUTED";

export interface CustomerPaymentBookingInfo {
  id: string;
  serviceId: string;
  agentId: string | null;
  status: string;
  paymentStatus: string;
  currency?: string;
  finalPrice: number | null;
}

export interface CustomerPaymentRecord {
  id: string;
  bookingId: string;
  customerId: string;
  amount: number;
  currency?: string;
  method: CustomerPaymentMethod;
  status: CustomerPaymentStatus;
  reference: string | null;
  stripeSessionId?: string | null;
  stripePaymentIntentId?: string | null;
  failureReason?: string | null;
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

export interface StripeCheckoutSessionData {
  sessionId: string;
  sessionUrl: string;
  paymentId: string;
  amount: number;
  currency: string;
  status: CustomerPaymentStatus;
}

export type StripeCheckoutSessionResponse = ApiResponse<StripeCheckoutSessionData>;

export interface PaymentReconciliationData {
  paymentId: string;
  bookingId: string;
  previousStatus: CustomerPaymentStatus;
  newStatus: CustomerPaymentStatus;
  reconciled: boolean;
  notes?: string;
}

export type PaymentReconciliationResponse = ApiResponse<PaymentReconciliationData>;

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
