import type { ApiResponse } from "@/types/common";

export interface PaginatedResult<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AgentOverviewMetrics {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalCommission: number;
  paidCommission: number;
  pendingCommission: number;
  activeCommissionsCount: number;
}

export interface AgentBookingCustomer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
}

export interface AgentBookingTour {
  id: string;
  name: string;
  type: string;
}

export interface AgentBookingAvailability {
  id: string;
  date: string;
}

export interface AgentBookingPriceApproval {
  id: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  requestedPrice: number;
  approvedPrice: number | null;
  notes: string | null;
  reviewedAt?: string | null;
}

export interface AgentBookingCommission {
  id: string;
  amount: number;
  status: "ACTIVE" | "CANCELLED";
}

export interface AgentBookingRecord {
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
  proposedPrice: number | null;
  finalPrice: number;
  requiresApproval: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  service: AgentBookingTour;
  availability: AgentBookingAvailability | null;
  customer: AgentBookingCustomer;
  priceApproval?: AgentBookingPriceApproval | null;
  commission?: AgentBookingCommission | null;
}

export interface AgentCommissionAdjustment {
  id: string;
  previousAmount: number;
  newAmount: number;
  createdAt: string;
}

export interface AgentCommissionRecord {
  id: string;
  bookingId: string;
  agentId: string;
  ruleId: string;
  rateType: "PERCENTAGE" | "FIXED";
  rateValue: number;
  baseAmount: number;
  amount: number;
  status: "ACTIVE" | "CANCELLED";
  createdAt: string;
  updatedAt: string;
  booking?: {
    id: string;
    serviceId: string;
    status: string;
    paymentStatus: string;
    finalPrice: number;
    service?: { id: string; name: string };
    customer?: { id: string; name: string; email: string };
    availability?: { id: string; date: string };
  };
  adjustments?: AgentCommissionAdjustment[];
}

export interface AgentProfileRecord {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: "agent";
  status: "active" | "deactivated";
  agencyName: string | null;
  createdAt: string;
}

export interface UpdateAgentProfileInput {
  agencyName?: string;
  name?: string;
  phone?: string | null;
}

export interface GetAgentBookingsParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

export interface GetAgentCommissionsParams {
  page?: number;
  limit?: number;
  status?: string;
  agentId?: string;
}

export type AgentOverviewResponse = ApiResponse<AgentOverviewMetrics>;
export type AgentBookingsListResponse = ApiResponse<PaginatedResult<AgentBookingRecord>>;
export type AgentBookingDetailResponse = ApiResponse<AgentBookingRecord>;
export type AgentCommissionsListResponse = ApiResponse<PaginatedResult<AgentCommissionRecord>>;
export type AgentProfileResponse = ApiResponse<AgentProfileRecord>;
