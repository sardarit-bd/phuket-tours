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

export type FulfillmentStatusValue = "NOT_STARTED" | "IN_PROGRESS" | "FULFILLED";

export type BookingPaymentStatus = "UNPAID" | "PARTIALLY_PAID" | "PAID";

export interface OperationalBookingRecord {
  id: string;
  status: OperationalBookingStatus;
  fulfillmentStatus: FulfillmentStatusValue;
  paymentStatus: BookingPaymentStatus;
  assignedStaffId: string | null;
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
    phone: string | null;
  };
  assignedStaff: {
    id: string;
    name: string;
  } | null;
}

export interface GetAdminBookingsParams {
  page?: number;
  limit?: number;
  fulfillmentStatus?: string;
  assignedStaffId?: string;
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
