/**
 * Admin Payments Management Types
 *
 * Strictly aligned with verified backend payment contracts in:
 * - src/modules/payment/paymentRoutes.ts
 * - src/modules/payment/paymentTypes.ts
 * - src/modules/payment/paymentValidators.ts
 * - src/modules/payment/paymentRepository.ts
 * - src/modules/payment/paymentService.ts
 */

export const PAYMENT_METHODS = ["BANK_TRANSFER", "CASH", "OTHER", "STRIPE", "PAYPAL"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_RECORD_STATUSES = [
  "INITIATED",
  "SUBMITTED",
  "VERIFIED",
  "REJECTED",
  "PROCESSING",
  "FAILED",
  "CANCELLED",
  "REQUIRES_ACTION",
  "REFUNDED",
  "PARTIALLY_REFUNDED",
  "DISPUTED",
] as const;
export type PaymentRecordStatus = (typeof PAYMENT_RECORD_STATUSES)[number];

export interface AdminPaymentAgentInfo {
  id: string;
  name: string;
  email: string;
  agentProfile?: {
    agencyName: string | null;
  } | null;
}

export interface AdminPaymentBookingInfo {
  id: string;
  serviceId: string;
  agentId: string | null;
  source?: "AGENT" | "ADMIN" | "CUSTOMER" | "DIRECT" | null;
  createdById?: string | null;
  status: string;
  paymentStatus: string;
  finalPrice: number | null;
  agent?: AdminPaymentAgentInfo | null;
  createdBy?: {
    id: string;
    name: string;
    role: string;
  } | null;
  service?: {
    id: string;
    name: string;
  } | null;
}

export interface AdminPaymentCustomerInfo {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
}

export interface AdminPaymentRecord {
  id: string;
  bookingId: string;
  customerId: string;
  amount: number;
  currency?: string;
  method: PaymentMethod;
  status: PaymentRecordStatus;
  reference: string | null;
  stripeSessionId?: string | null;
  receiptNote: string | null;
  submittedAt: string | null;
  receivedAt: string | null;
  reviewedById: string | null;
  reviewedAt: string | null;
  reviewNotes: string | null;
  createdAt: string;
  updatedAt: string;
  customer?: AdminPaymentCustomerInfo;
  booking?: AdminPaymentBookingInfo;
}

export interface GetAdminPaymentsParams {
  page?: number;
  limit?: number;
  status?: PaymentRecordStatus | string;
  method?: PaymentMethod | string;
  bookingId?: string;
  customerId?: string;
  agentId?: string;
  source?: string;
}

export interface AdminPaymentListResponse {
  items: AdminPaymentRecord[];
  page: number;
  limit: number;
  total: number;
}

export interface VerifyPaymentInput {
  decision: "VERIFIED" | "REJECTED";
  notes?: string;
}

export interface RecordPaymentInput {
  reference?: string;
  receivedAt?: string;
  notes?: string;
}
