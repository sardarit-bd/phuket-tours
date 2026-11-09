/**
 * Admin Operational Bookings Types
 *
 * Strictly aligned with verified backend operational contracts in:
 * - src/modules/operations/operationsRoutes.ts
 * - src/modules/operations/operationsRepository.ts (operationalSelect)
 * - src/modules/operations/operationsService.ts
 * - src/modules/operations/operationsTypes.ts
 */

export type OperationalBookingStatus = "CONFIRMED" | "IN_PROGRESS" | "COMPLETED";

export type AdminUnifiedBookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "AWAITING_APPROVAL"
  | "FAILED";

export type FulfillmentStatusValue = "NOT_STARTED" | "IN_PROGRESS" | "FULFILLED";

export type BookingPaymentStatus = "UNPAID" | "PARTIALLY_PAID" | "PAID";

export interface OperationalBookingRecord {
  id: string;
  status: OperationalBookingStatus | AdminUnifiedBookingStatus;
  fulfillmentStatus: FulfillmentStatusValue;
  paymentStatus: BookingPaymentStatus;
  assignedStaffId: string | null;
  currency?: string;
  finalPrice?: number | string;
  basePrice?: number | string;
  notes: string | null;
  internalNotes: string | null;
  createdAt: string;
  updatedAt: string;
  service: {
    id: string;
    name: string;
    type: string;
  };
  availability: {
    id: string;
    date: string;
  } | null;
  customer: {
    id: string;
    name: string;
    email?: string;
    phone: string | null;
  };
  assignedStaff: {
    id: string;
    name: string;
  } | null;
  payments?: Array<{
    id: string;
    amount: number | string;
    currency: string;
    method: string;
    status: string;
    reference: string | null;
    stripeSessionId: string | null;
    receivedAt: string | null;
    createdAt: string;
  }>;
}

export interface GetAdminBookingsParams {
  page?: number;
  limit?: number;
  fulfillmentStatus?: string;
  assignedStaffId?: string;
}

export interface GetStaffBookingsParams {
  page?: number;
  limit?: number;
  fulfillmentStatus?: string;
}

export interface StaffBookingRecord extends OperationalBookingRecord {}

export interface StaffBookingsListResponse {
  items: StaffBookingRecord[];
  page: number;
  limit: number;
  total: number;
}

export interface AdminBookingsListResponse {
  items: OperationalBookingRecord[];
  page: number;
  limit: number;
  total: number;
}

export interface AssignBookingStaffInput {
  bookingId: string;
  staffId: string | null;
  notes?: string;
}

export interface UpdateBookingFulfillmentInput {
  bookingId: string;
  fulfillmentStatus: FulfillmentStatusValue;
  notes: string;
}

export interface ReviewBookingPriceApprovalInput {
  bookingId: string;
  status: "APPROVED" | "REJECTED";
  approvedPrice?: number;
  notes?: string;
}

export interface AdminStaffMember {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: "staff";
  status: "active" | "deactivated";
  createdAt: string;
  updatedAt: string;
}

export interface AdminStaffListResponse {
  items: AdminStaffMember[];
  page: number;
  limit: number;
  total: number;
}

export interface PendingReservationRecord {
  id: string;
  status: "PENDING" | "AWAITING_APPROVAL" | "CONFIRMED" | "CANCELLED";
  paymentStatus: BookingPaymentStatus;
  fulfillmentStatus: FulfillmentStatusValue;
  currency: string;
  basePrice: number | string;
  proposedPrice?: number | string | null;
  finalPrice: number | string;
  requiresApproval: boolean;
  notes: string | null;
  internalNotes: string | null;
  assignedStaffId?: string | null;
  assignedStaff?: {
    id: string;
    name: string;
  } | null;
  createdAt: string;
  updatedAt: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };
  agent?: {
    id: string;
    name: string;
    email: string;
  } | null;
  service: {
    id: string;
    name: string;
    type: string;
  };
  availability?: {
    id: string;
    date: string;
  } | null;
  payments?: Array<{
    id: string;
    amount: number | string;
    currency: string;
    method: string;
    status: string;
    reference: string | null;
    stripeSessionId: string | null;
    receivedAt: string | null;
    createdAt: string;
  }>;
  priceApproval?: {
    id: string;
    requestedPrice: number | string;
    approvedPrice: number | string | null;
    status: string;
    notes: string | null;
    reviewedAt: string | null;
  } | null;
}

export interface AdminPendingReservationsResponse {
  items: PendingReservationRecord[];
  page: number;
  limit: number;
  total: number;
}

export interface ReviewPendingReservationInput {
  bookingId: string;
  action: "CONFIRM" | "REJECT";
  notes?: string;
}

