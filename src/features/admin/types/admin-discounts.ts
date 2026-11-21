/**
 * Staff Booking Discount Request & Admin Approval Types
 *
 * Strictly aligned with backend API contracts in:
 * - src/modules/discount/discountRoutes.ts
 * - src/modules/discount/discountTypes.ts
 * - src/modules/discount/discountValidators.ts
 */

export type DiscountType = "PERCENTAGE" | "FIXED_AMOUNT";

export type DiscountApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface CreateStaffDiscountRequestInput {
  bookingId: string;
  discountType: DiscountType;
  discountValue: number;
  reason: string;
}

export interface ReviewStaffDiscountRequestInput {
  requestId: string;
  decision: "APPROVE" | "REJECT";
  approvedDiscountValue?: number;
  adminNotes?: string;
  rejectionReason?: string;
}

export interface ListStaffDiscountRequestsQuery {
  page?: number;
  limit?: number;
  status?: DiscountApprovalStatus;
  bookingId?: string;
  requestedById?: string;
  reviewedById?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface StaffDiscountRequestRecord {
  id: string;
  bookingId: string;
  discountType: DiscountType;
  discountValue: number;
  originalPrice: number;
  discountAmount: number;
  proposedFinalPrice: number;
  approvedDiscountAmount: number | null;
  approvedFinalPrice: number | null;
  status: DiscountApprovalStatus;
  reason: string;
  rejectionReason: string | null;
  adminNotes: string | null;
  requestedById: string;
  reviewedById: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
  booking?: {
    id: string;
    currency: string;
    status: string;
    paymentStatus: string;
    customer?: {
      id: string;
      name: string;
      email: string;
      phone: string | null;
    };
    service?: {
      id: string;
      name: string;
      type: string;
    };
  };
  requestedBy?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  reviewedBy?: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
}

export interface StaffDiscountListResponse {
  items: StaffDiscountRequestRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface StaffDiscountStaffStats {
  staffId: string;
  staffName: string;
  staffEmail: string;
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  totalApprovedDiscountAmount: number;
}

export interface StaffDiscountSummaryResponse {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  totalApprovedDiscountAmount: number;
  staffStats: StaffDiscountStaffStats[];
}
