export type AffiliateStatus = "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
export type AffiliateCommissionEntryType = "EARNED" | "REVERSAL" | "ADJUSTMENT";
export type AffiliateCommissionStatus = "PENDING" | "AVAILABLE" | "PAID" | "REVERSED";
export type AffiliatePayoutStatus = "PENDING" | "APPROVED" | "REJECTED" | "PAID";
export type AffiliateEligibleAmountPolicy = "NET_AFTER_DISCOUNTS" | "GROSS";

export interface AffiliateProfile {
  id: string;
  userId: string;
  code: string;
  status: AffiliateStatus;
  commissionRateOverride: string | number | null;
  effectiveCommissionRate: number;
  minimumPayoutAmount: number;
  attributionWindowDays: number;
  payoutMethod: string | null;
  payoutDetails: Record<string, unknown> | null;
  websiteUrl: string | null;
  promotionChannels: string | null;
  rejectionReason: string | null;
  approvedAt: string | null;
  suspendedAt: string | null;
  createdAt: string;
  user?: { id: string; name: string; email: string; role: string };
}

export interface AffiliateDashboardSummary {
  affiliateId: string;
  code: string;
  status: AffiliateStatus;
  effectiveCommissionRate: number;
  minimumPayoutAmount: number;
  totalClicks: number;
  referredBookings: number;
  conversionRate: number;
  totalEarned: number;
  pendingCommission: number;
  reservedForPayout: number;
  paidCommission: number;
  availableBalance: number;
}

export interface AffiliateLinkItem {
  id: string;
  affiliateId: string;
  label: string | null;
  tourId: string | null;
  targetPath: string;
  isActive: boolean;
  clickCount: number;
  createdAt: string;
}

export interface AffiliateClickItem {
  id: string;
  referralCode: string;
  landingUrl: string;
  referrer: string | null;
  expiresAt: string;
  createdAt: string;
  affiliateLinkId: string | null;
}

export interface AffiliateReferredBookingItem {
  id: string;
  bookingId: string;
  referralCode: string;
  attributedAt: string;
  affiliate?: { id: string; code: string; user: { name: string; email: string } };
  booking: {
    id: string;
    status: string;
    paymentStatus: string;
    currency: string;
    basePrice?: string | number;
    finalPrice: string | number;
    createdAt: string;
    service?: { id: string; name: string } | null;
    customer?: { id: string; name: string; email: string } | null;
  };
}

export interface AffiliateCommissionItem {
  id: string;
  affiliateId: string;
  bookingId: string;
  paymentId: string | null;
  entryType: AffiliateCommissionEntryType;
  eligibleAmount: string | number;
  commissionRate: string | number;
  amount: string | number;
  currency: string;
  status: AffiliateCommissionStatus;
  notes: string | null;
  createdAt: string;
  affiliate?: { id: string; code: string; user: { name: string; email: string } };
  booking?: {
    id: string;
    status: string;
    paymentStatus: string;
    service?: { id: string; name: string } | null;
  };
}

export interface AffiliatePayoutItem {
  id: string;
  affiliateId: string;
  amount: string | number;
  currency: string;
  status: AffiliatePayoutStatus;
  payoutMethod: string;
  payoutDetailsSnapshot: Record<string, unknown> | null;
  rejectionReason: string | null;
  transactionReference: string | null;
  paidAt: string | null;
  requestedAt: string;
  affiliate?: { id: string; code: string; user: { name: string; email: string } };
  processedBy?: { id: string; name: string; email: string } | null;
}

export interface AffiliateSettings {
  id: string;
  globalCommissionRate: string | number;
  attributionWindowDays: number;
  minimumPayoutAmount: string | number;
  eligibleAmountPolicy: AffiliateEligibleAmountPolicy;
  isProgramActive: boolean;
  updatedAt: string;
}

export interface AdminAffiliateOverview {
  totalAffiliates: number;
  pendingApplications: number;
  approvedAffiliates: number;
  totalClicks: number;
  totalAttributedBookings: number;
  totalNetCommissions: number;
  pendingPayoutsCount: number;
  pendingPayoutsAmount: number;
  totalPaidOut: number;
  settings: AffiliateSettings;
}

export interface AdminAffiliateListItem {
  id: string;
  userId: string;
  code: string;
  status: AffiliateStatus;
  commissionRateOverride: string | number | null;
  websiteUrl: string | null;
  promotionChannels: string | null;
  rejectionReason: string | null;
  createdAt: string;
  user: { id: string; name: string; email: string; role: string; status: string };
  _count: { clicks: number; attributions: number; commissions: number; payouts: number };
}

export interface AffiliateAuditEventItem {
  id: string;
  affiliateId: string | null;
  entityType: string;
  entityId: string;
  action: string;
  actorRole: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  actor?: { id: string; name: string; email: string; role: string } | null;
  affiliate?: { id: string; code: string } | null;
}

export interface PaginatedAffiliateData<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}
