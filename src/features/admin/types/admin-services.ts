/**
 * Admin Services & Tours Management Types
 *
 * Strictly aligned with verified backend contracts in:
 * - src/modules/service/serviceTypes.ts
 * - src/modules/service/serviceValidators.ts
 * - src/modules/service/serviceRepository.ts
 */

export type AdminServiceType = "HOTEL" | "PACKAGE" | "TOUR";
export type AdminServiceStatus = "DRAFT" | "PUBLISHED" | "UNPUBLISHED";
export type AdminServiceSortField = "name" | "createdAt" | "updatedAt" | "status" | "relevance";
export type AdminSortOrder = "asc" | "desc";

export interface AdminServicePricingSummary {
  currency: string;
  basePrice: number;
  discountedPrice: number | null;
  taxRate: number;
  validFrom: string | null;
  validTo: string | null;
}

export interface AdminServiceAvailabilitySummary {
  availableDateCount: number;
  unavailableDateCount: number;
  totalCapacity: number | null;
  bookedCount: number;
}

export interface AdminServiceRecord {
  id: string;
  name: string;
  description: string | null;
  type: AdminServiceType;
  status: AdminServiceStatus;
  providerName: string | null;
  providerId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  relevanceScore?: number;
  pricingSummary?: AdminServicePricingSummary | null;
  availabilitySummary?: AdminServiceAvailabilitySummary | null;
}

export interface AdminServicesPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AdminServicesListResponse {
  items: AdminServiceRecord[];
  pagination: AdminServicesPagination;
}

export interface GetAdminServicesParams {
  page?: number;
  limit?: number;
  type?: AdminServiceType;
  status?: AdminServiceStatus;
  search?: string;
  q?: string;
  sortBy?: AdminServiceSortField;
  sortOrder?: AdminSortOrder;
}

export interface BulkUpdateServiceStatusInput {
  serviceIds: string[];
  status: AdminServiceStatus;
}

export interface BulkUpdateServiceStatusResult {
  updatedCount: number;
  requestedCount: number;
  updatedIds: string[];
  notFoundIds: string[];
  status: AdminServiceStatus;
}

export interface UpdateServiceStatusInput {
  serviceId: string;
  status: AdminServiceStatus;
}
