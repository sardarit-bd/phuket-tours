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

export interface AgentBookingStaff {
  id: string;
  name: string;
  email?: string;
  phone?: string | null;
}

export interface AgentBookingPayment {
  id: string;
  amount: number;
  currency: string;
  method: "STRIPE" | "BANK_TRANSFER" | "CASH" | "OTHER";
  status:
    | "INITIATED"
    | "SUBMITTED"
    | "PROCESSING"
    | "REQUIRES_ACTION"
    | "VERIFIED"
    | "REJECTED"
    | "FAILED"
    | "CANCELLED";
  reference: string | null;
  stripeSessionId?: string | null;
  receivedAt?: string | null;
  createdAt: string;
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
  currency?: string;
  basePrice: number;
  proposedPrice: number | null;
  finalPrice: number;
  requiresApproval: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  assignedStaffId?: string | null;
  assignedStaff?: AgentBookingStaff | null;
  service: AgentBookingTour;
  availability: AgentBookingAvailability | null;
  customer: AgentBookingCustomer;
  payments?: AgentBookingPayment[];
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
    currency?: string;
    finalPrice: number;
    notes?: string | null;
    service?: { id: string; name: string };
    customer?: { id: string; name: string; email: string };
    availability?: { id: string; date: string };
  };
  adjustments?: AgentCommissionAdjustment[];
}

export interface AgentCustomerRecord {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  createdAt: string;
  bookingsCount?: number;
}

export interface CreateAgentCustomerInput {
  name: string;
  email: string;
  phone?: string | null;
}

export interface AgentPricingLimit {
  maxDiscountPercentage: number;
  applicableRuleId: string | null;
}

export interface CreateAgentBookingInput {
  customerId: string;
  serviceId: string;
  availabilityId?: string;
  travelDate?: string;
  adults?: number;
  children?: number;
  infants?: number;
  proposedPrice: number;
  notes?: string;
}

export interface UpdateAgentBookingPriceInput {
  bookingId: string;
  proposedPrice: number;
}

export interface AgentBookingHistoryItem {
  id: string;
  bookingId: string;
  actorId: string;
  actorName?: string | null;
  actorRole: string;
  action: string;
  changes: Record<string, unknown>;
  note?: string | null;
  actor?: {
    id: string;
    name: string;
    email?: string;
    role: string;
  };
  createdAt: string;
}

export interface AgentBookingHistoryList {
  items: AgentBookingHistoryItem[];
  page: number;
  limit: number;
  total: number;
}

export interface AgentProfileRecord {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: "agent";
  status: "active" | "deactivated";
  avatarUrl?: string | null;
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
  paymentStatus?: string;
  fulfillmentStatus?: string;
  search?: string;
}

export interface GetAgentCommissionsParams {
  page?: number;
  limit?: number;
  status?: string;
  agentId?: string;
}

export interface GetAgentCustomersParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface AgentCommissionsPaginatedResult extends PaginatedResult<AgentCommissionRecord> {
  page?: number;
  limit?: number;
  total?: number;
}

export type AgentOverviewResponse = ApiResponse<AgentOverviewMetrics>;
export type AgentBookingsListResponse = ApiResponse<PaginatedResult<AgentBookingRecord>>;
export type AgentBookingDetailResponse = ApiResponse<AgentBookingRecord>;
export type AgentCommissionsListResponse = ApiResponse<AgentCommissionsPaginatedResult>;
export type AgentProfileResponse = ApiResponse<AgentProfileRecord>;
export type AgentCustomersListResponse = ApiResponse<PaginatedResult<AgentCustomerRecord>>;
export type AgentCustomerResponse = ApiResponse<AgentCustomerRecord>;
export type AgentPricingLimitsResponse = ApiResponse<AgentPricingLimit>;
export type AgentBookingHistoryResponse = ApiResponse<AgentBookingHistoryList>;

export interface AgentPaymentLinkResponse {
  paymentLinkId: string;
  bookingId: string;
  paymentUrl: string;
  rawToken: string;
  expiresAt: string;
  status: "ACTIVE" | "EXPIRED" | "COMPLETED" | "REVOKED";
}

export interface PublicPaymentLinkData {
  bookingId: string;
  tourTitle: string;
  tourDescription?: string | null;
  travelDate?: string | null;
  customerName: string;
  customerEmailMasked: string;
  currency: string;
  totalAmount: number;
  paidAmount: number;
  remainingBalance: number;
  paymentStatus: string;
  bookingStatus: string;
  linkStatus: "ACTIVE" | "EXPIRED" | "COMPLETED" | "REVOKED";
  expiresAt: string;
  isPayable: boolean;
  supportedPaymentMethods: ("STRIPE" | "PAYPAL")[];
  stripeAvailable: boolean;
  paypalAvailable: boolean;
}
