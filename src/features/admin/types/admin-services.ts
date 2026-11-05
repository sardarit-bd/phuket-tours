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

export interface AdminServicePricingRecord {
  id: string;
  serviceId: string;
  currency: string;
  basePrice: number;
  discountedPrice: number | null;
  taxRate: number;
  validFrom: string | null;
  validTo: string | null;
}

export interface AdminServiceAvailabilityRecord {
  id: string;
  serviceId: string;
  date: string;
  isAvailable: boolean;
  capacity: number | null;
  bookedCount: number;
  externalReferenceId: string | null;
  lastVerifiedAt: string | null;
}

export interface AdminServiceMediaRecord {
  id: string;
  assetId: string;
  publicId: string;
  secureUrl: string;
  originalFilename?: string | null;
  format: string;
  width?: number | null;
  height?: number | null;
  bytes: number;
  folder: string;
  createdAt: string;
}

export interface AdminServiceDetail extends AdminServiceRecord {
  availability?: AdminServiceAvailabilityRecord[];
  pricing?: AdminServicePricingRecord[];
  media?: AdminServiceMediaRecord[];
}

export interface CreateAdminServiceInput {
  name: string;
  description?: string;
  type: AdminServiceType;
  providerName?: string;
  providerId?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateAdminServiceInput {
  serviceId: string;
  name?: string;
  description?: string;
  type?: AdminServiceType;
  providerName?: string;
  providerId?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateAdminPricingInput {
  serviceId: string;
  currency?: string;
  basePrice?: number;
  discountedPrice?: number | null;
  taxRate?: number;
  validFrom?: string | null;
  validTo?: string | null;
}

export interface UpdateAdminAvailabilityInput {
  serviceId: string;
  date: string; // YYYY-MM-DD
  isAvailable: boolean;
  capacity?: number;
  externalReferenceId?: string;
}

export interface TourPricingTier {
  tierName: string; // "Adult", "Child (4-11)", "Infant (0-3)", "Private Boat"
  price: number;
  description?: string;
}

export interface TourItineraryItem {
  day?: number;
  time?: string;
  title: string;
  description: string;
}

export interface TourScheduleDetails {
  isDaily?: boolean;
  daysOfWeek?: number[]; // 0 = Sunday, 1 = Monday...
  timeSlots?: string[];
  operatingHours?: string;
}

export interface TourMetadata {
  slug?: string;
  subtitle?: string;
  categoryId?: string;
  categoryName?: string;
  destination?: string;
  destinationCategory?: string;
  location?: {
    city?: string;
    country?: string;
    departurePoint?: string;
  };
  duration?: string;
  durationCategory?: "half-day" | "full-day" | "multi-day" | "custom" | string;
  tourType?: string;
  groupSize?: string;
  languages?: string[];
  badge?: "Popular" | "Bestseller" | "New";
  isFeatured?: boolean;
  featuredImage?: string;
  images?: string[];
  highlights?: string[];
  itinerary?: TourItineraryItem[];
  included?: string[];
  excluded?: string[];
  pricingTiers?: TourPricingTier[];
  scheduleDetails?: TourScheduleDetails;
  importantInfo?: string;
  [key: string]: unknown;
}
