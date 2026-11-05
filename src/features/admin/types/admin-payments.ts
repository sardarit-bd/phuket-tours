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

export const PAYMENT_METHODS = ["BANK_TRANSFER", "CASH", "OTHER"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_RECORD_STATUSES = [
  "INITIATED",
  "SUBMITTED",
  "VERIFIED",
  "REJECTED",
] as const;
export type PaymentRecordStatus = (typeof PAYMENT_RECORD_STATUSES)[number];

export interface AdminPaymentBookingInfo {
  id: string;
  serviceId: string;
  agentId: string | null;
  status: string;
  paymentStatus: string;
  finalPrice: number | null;
}

export interface AdminPaymentRecord {
  id: string;
  bookingId: string;
  customerId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentRecordStatus;
  reference: string | null;
  receiptNote: string | null;
  submittedAt: string | null;
  receivedAt: string | null;
  reviewedById: string | null;
  reviewedAt: string | null;
  reviewNotes: string | null;
  createdAt: string;
  updatedAt: string;
  booking?: AdminPaymentBookingInfo;
}

export interface GetAdminPaymentsParams {
  page?: number;
  limit?: number;
  status?: PaymentRecordStatus;
  method?: PaymentMethod;
  bookingId?: string;
  customerId?: string;
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
