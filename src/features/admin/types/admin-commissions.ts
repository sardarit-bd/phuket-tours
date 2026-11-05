/**
 * Admin Commission Management Types
 *
 * Strictly aligned with verified backend commission contracts in:
 * - src/modules/commission/commissionRoutes.ts
 * - src/modules/commission/commissionTypes.ts
 * - src/modules/commission/commissionValidators.ts
 * - src/modules/commission/commissionRepository.ts
 * - src/modules/commission/commissionService.ts
 * - src/modules/report/reportRoutes.ts (adminCommissionsReport)
 */

export const COMMISSION_RATE_TYPES = ["PERCENTAGE", "FIXED"] as const;
export type CommissionRateType = (typeof COMMISSION_RATE_TYPES)[number];

export const COMMISSION_STATUSES = ["ACTIVE", "CANCELLED"] as const;
export type CommissionStatus = (typeof COMMISSION_STATUSES)[number];

export interface AdminCommissionAgent {
  id: string;
  name: string | null;
}

export interface AdminCommissionBookingService {
  id: string;
  name: string;
}

export interface AdminCommissionBookingCustomer {
  id: string;
  name: string;
  email: string;
}

export interface AdminCommissionBookingAvailability {
  id: string;
  date: string;
}

export interface AdminCommissionBooking {
  id: string;
  serviceId: string;
  status: string;
  paymentStatus: string;
  finalPrice: number;
  service?: AdminCommissionBookingService | null;
  customer?: AdminCommissionBookingCustomer | null;
  availability?: AdminCommissionBookingAvailability | null;
}

export interface AdminCommissionAdjustment {
  id: string;
  previousAmount: number;
  newAmount: number;
  reason: string;
  adminId: string;
  createdAt: string;
}

export interface AdminCommissionRecord {
  id: string;
  bookingId: string;
  agentId: string;
  ruleId: string;
  rateType: CommissionRateType;
  rateValue: number;
  baseAmount: number;
  amount: number;
  status: CommissionStatus;
  createdAt: string;
  updatedAt: string;
  agent?: AdminCommissionAgent;
  booking?: AdminCommissionBooking;
}

export interface AdminCommissionDetail extends AdminCommissionRecord {
  adjustments?: AdminCommissionAdjustment[];
}

export interface GetAdminCommissionsParams {
  page?: number;
  limit?: number;
  status?: CommissionStatus;
  agentId?: string;
  bookingId?: string;
}

export interface AdminCommissionsListResponse {
  items: AdminCommissionRecord[];
  page: number;
  limit: number;
  total: number;
}

export interface AdjustCommissionInput {
  amount: number;
  reason: string;
}

export interface AdminCommissionRule {
  id: string;
  rateType: CommissionRateType;
  rateValue: number;
  isActive: boolean;
  createdById: string;
  createdAt: string;
}

export interface GetAdminCommissionRulesParams {
  page?: number;
  limit?: number;
}

export interface AdminCommissionRulesResponse {
  activeRule: AdminCommissionRule | null;
  items: AdminCommissionRule[];
  page: number;
  limit: number;
  total: number;
}

export interface ConfigureCommissionRuleInput {
  rateType: CommissionRateType;
  rateValue: number;
}

export interface AdminCommissionStatusSummary {
  status: string;
  count: number;
  totalAmount: number;
}

export interface AdminCommissionAgentSummary {
  agentId: string;
  name: string | null;
  count: number;
  totalAmount: number;
}

export interface AdminCommissionsReportData {
  filters: {
    from: string | null;
    to: string | null;
    serviceType: string | null;
    agentId: string | null;
  };
  count: number;
  totalActiveAmount: number;
  byStatus: AdminCommissionStatusSummary[];
  items: AdminCommissionAgentSummary[];
  page: number;
  limit: number;
  total: number;
}
