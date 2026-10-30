/**
 * Admin Reporting & Overview Types
 *
 * Strictly typed against verified backend report contracts in:
 * - src/modules/report/reportRoutes.ts
 * - src/modules/report/reportTypes.ts
 * - src/modules/report/reportService.ts
 * - src/modules/report/reportRepository.ts
 */

export const ADMIN_BOOKING_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "CANCELLED",
  "AWAITING_APPROVAL",
  "IN_PROGRESS",
  "COMPLETED",
  "FAILED",
] as const;

export type AdminBookingStatus = (typeof ADMIN_BOOKING_STATUSES)[number];

export interface AdminReportFiltersQuery {
  from?: string;
  to?: string;
  status?: AdminBookingStatus;
  serviceType?: string;
  agentId?: string;
}

export interface AdminServicesReportQuery extends AdminReportFiltersQuery {
  page?: number;
  limit?: number;
}

export interface AdminReportAppliedFilters {
  from: string | null;
  to: string | null;
  serviceType: string | null;
  agentId: string | null;
  status?: AdminBookingStatus | null;
}

/**
 * GET /api/v1/admin/reports/revenue
 *
 * Revenue is the final price of completed bookings.
 * Booked value covers confirmed, in-progress, and completed bookings.
 * Collected payments are verified payments.
 * Outstanding balance is the unpaid value of confirmed-or-later bookings.
 */
export interface AdminRevenueReportData {
  filters: AdminReportAppliedFilters;
  bookedValue: number;
  revenue: number;
  collectedPayments: number;
  outstandingBalance: number;
}

/**
 * Breakdown item for GET /api/v1/admin/reports/bookings
 */
export interface BookingStatusBreakdownItem {
  status: AdminBookingStatus;
  count: number;
  totalValue: number;
}

/**
 * GET /api/v1/admin/reports/bookings
 */
export interface AdminBookingsReportData {
  filters: AdminReportAppliedFilters;
  totalBookings: number;
  byStatus: BookingStatusBreakdownItem[];
}

/**
 * Breakdown item for GET /api/v1/admin/reports/payments
 */
export interface PaymentStatusBreakdownItem {
  status: string;
  count: number;
  totalAmount: number;
}

export interface PaymentMethodBreakdownItem {
  method: string;
  count: number;
  totalAmount: number;
}

export interface PaymentReconciliation {
  paidBookingsValue: number;
  verifiedPaymentsValue: number;
  difference: number;
  pendingVerificationCount: number;
  pendingVerificationValue: number;
}

/**
 * GET /api/v1/admin/reports/payments
 */
export interface AdminPaymentsReportData {
  filters: AdminReportAppliedFilters;
  byStatus: PaymentStatusBreakdownItem[];
  verifiedByMethod: PaymentMethodBreakdownItem[];
  reconciliation: PaymentReconciliation;
}

/**
 * Performance item for GET /api/v1/admin/reports/services
 */
export interface ServicePerformanceItem {
  serviceId: string;
  name: string | null;
  type: string | null;
  totalBookings: number;
  completedBookings: number;
  bookedValue: number;
  revenue: number;
}

/**
 * GET /api/v1/admin/reports/services
 */
export interface AdminServicesReportData {
  filters: AdminReportAppliedFilters;
  items: ServicePerformanceItem[];
  page: number;
  limit: number;
  total: number;
}

/**
 * Standard backend response envelope
 */
export interface AdminApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface AdminApiErrorResponse {
  success: false;
  message: string;
  data: null;
}

export * from "./admin-services";

