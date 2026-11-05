# PhuketTours — Admin Tours Management Completion Architecture Audit

**Target Milestone:** Admin Tours Management Completion  
**Frontend Path:** `/home/owakeel/Workspace/Owakeel/carlsimpson/phuket-tours`  
**Backend Path:** `/home/owakeel/Workspace/Owakeel/carlsimpson/qbictravel_backend-main`  
**Date:** November 1, 2026  
**Status:** Audit Completed — Ready for Implementation Planning  

---

## 0. Fundamental Project Principle & Data Boundary

> [!IMPORTANT]
> **CRITICAL ARCHITECTURAL DECISION:**
> The existing 462 Tours in the frontend dataset (`tours-data.ts`) are **dummy data**.
> Under strict instructions, **we will NOT work on these records** in this development phase.
> There will be **zero** imports, migrations, reconciliations, seeding, or processing of the 462 dummy tours.
> Our sole objective is to complete the Admin Tours Management functionality using the existing architecture, typed contracts, and real Backend APIs.

---

## 1. Completed Functionality (Preserved Baseline)

The Admin-2B Tours Listing and Admin-2D-B centralized component systems are already implemented and validated.

### 1.1 Frontend (PhuketTours)
- **Listing UI & Layout:**
  - `AdminToursView` (`src/features/admin/components/tours/admin-tours-view.tsx`): Main reactive console orchestrating table data, pagination, filters, summary cards, and modal dialogs.
  - `ToursHeader` (`src/features/admin/components/tours/tours-header.tsx`): Displays asset count badge, title, subtitle, and primary `Add New Tour` action.
  - `ToursSummaryCards` (`src/features/admin/components/tours/tours-summary-cards.tsx`): Live counts for All, Published, Draft, and Unpublished services.
  - `ToursToolbar` (`src/features/admin/components/tours/tours-toolbar.tsx`): Debounced search, status filter (`CustomDropdown`), dynamic sort field & direction, reset button.
  - `ToursTable` (`src/features/admin/components/tours/tours-table.tsx`): Multi-select checkbox column, name/slug, destination, pricing summary, availability summary, status badge (`TourStatusBadge`), and row action menu (`TourActionsMenu`).
  - `ToursPagination` (`src/features/admin/components/tours/tours-pagination.tsx`): Delegated to centralized `<Pagination />` with `CustomSelect` row selector (`10, 25, 50, 100`).
  - `BulkActionBar` & `BulkConfirmDialog`: Multi-row selection with bulk status updates (`DRAFT`, `PUBLISHED`, `UNPUBLISHED`).
  - `TourDetailsDialog` (`src/features/admin/components/tours/tour-details-dialog.tsx`): Read-only view for basic info, provider, pricing, and availability summary.
  - States: `ToursTableSkeleton`, `ToursEmptyState`, `ToursErrorState`.
- **Centralized Shared Components (Admin-2D-B):**
  - `CustomSelect` (`src/components/ui/custom-select.tsx`): Generic `<T extends string | number>`, WAI-ARIA combobox/listbox, size variants (`sm`, `md`, `lg`), keyboard navigation, auto-flip viewport detection.
  - `Pagination` (`src/components/shared/pagination/`): 3-column responsive CSS grid with visually centered navigation controls.
  - Media Library Components (`src/features/admin/components/media/`): `MediaGrid`, `MediaCard`, `MediaUploader`, `MediaGalleryManager`, Cloudinary signature and confirmation API endpoints (`admin-media-api.ts`).
- **Route Guards & Auth:**
  - Admin dashboard route protection via `src/app/dashboard/admin/layout.tsx` ensuring customer users cannot access the administration workspace.

### 1.2 Backend (`qbictravel_backend-main`)
- **Prisma Data Models:**
  - `Service` (`prisma/schema/service.prisma`): `id`, `name`, `description`, `type` (`HOTEL`, `PACKAGE`, `TOUR`), `status` (`DRAFT`, `PUBLISHED`, `UNPUBLISHED`), `providerName`, `providerId`, `metadata` (Json), `createdAt`, `updatedAt`.
  - `ServiceAvailability` (`prisma/schema/service.prisma`): `id`, `serviceId`, `date` (Date), `isAvailable` (Boolean), `capacity` (Int?), `bookedCount` (Int), `externalReferenceId` (String?), `lastVerifiedAt` (DateTime?). Unique on `[serviceId, date]`.
  - `ServicePricing` (`prisma/schema/service.prisma`): `id`, `serviceId`, `currency` (String default USD), `basePrice` (Decimal 10,2), `discountedPrice` (Decimal 10,2?), `taxRate` (Decimal 5,2 default 0), `validFrom`, `validTo`.
  - `Media` (`prisma/schema/media.prisma`): `id`, `assetId`, `publicId`, `secureUrl`, `format`, `resourceType`, `width`, `height`, `bytes`, `folder`, `uploadedById`, `serviceId` (optional relation to `Service`).
- **Verified Endpoints:**
  - `GET /api/v1/admin/services`: Lists services with pagination, type filter, status filter, search phrase & word-based fuzzy ILIKE ranking, sorting, and computed pricing/availability summaries.
  - `POST /api/v1/admin/services`: Creates a service record (`name`, `description`, `type`, `providerName`, `providerId`, `metadata`).
  - `GET /api/v1/admin/services/:serviceId`: Retrieves service details including nested `availability` and `pricing`.
  - `PATCH /api/v1/admin/services/:serviceId`: Updates core fields and `metadata`.
  - `PATCH /api/v1/admin/services/:serviceId/status`: Updates publication status (`DRAFT`, `PUBLISHED`, `UNPUBLISHED`).
  - `PATCH /api/v1/admin/services/bulk-status`: Atomic transaction for bulk updating statuses.
  - `GET /api/v1/admin/services/:serviceId/pricing`: Retrieves service pricing records.
  - `PUT /api/v1/admin/services/:serviceId/pricing`: Upserts standard pricing.
  - `GET /api/v1/admin/services/:serviceId/availability`: Retrieves service availability dates.
  - `PUT /api/v1/admin/services/:serviceId/availability`: Upserts availability for a given date.
- **Test Baseline:**
  - All 31 backend test suites (604 unit & integration tests) pass with 100% success.

---

## 2. Missing Functionality & Gaps

| Module | Gap Description | Required Implementation |
| :--- | :--- | :--- |
| **Tour Create Form** | `AddTourDialog` (`add-tour-dialog.tsx`) is currently an unfunctional placeholder banner ("Scheduled for Phase Admin-2D"). | Build a multi-step / tabbed `TourEditorModal` supporting Basic Info, Pricing & Packages, Itinerary, Availability, and Media Gallery. |
| **Tour Edit Form** | Clicking "Edit Tour" opens the same placeholder dialog with no data pre-filling, no state synchronization, and no save handler. | Connect edit mode to load full tour details, populate all fields, and execute `PATCH /admin/services/:serviceId` with pricing and availability updates. |
| **Tour Details View** | `TourDetailsDialog` currently only shows description, basic summary cards, and partial metadata. It lacks media gallery preview, full day-by-day itinerary view, detailed pricing tiers, and schedule tables. | Expand `TourDetailsDialog` into a comprehensive inspector with cover photo, gallery carousel/grid, itinerary timeline, pricing breakdown, and departure calendar. |
| **RTK Query Endpoints** | `admin-api.ts` only has `getAdminServices`, `updateAdminServiceStatus`, and `bulkUpdateAdminServiceStatus`. Missing endpoints for create, getById, update, pricing, and availability. | Inject `createAdminService`, `getAdminServiceById`, `updateAdminService`, `getAdminServicePricing`, `updateAdminServicePricing`, `getAdminServiceAvailability`, and `updateAdminServiceAvailability` in `admin-api.ts`. |
| **Media Library Integration** | Currently no bridge between Tour Create/Edit and the existing Cloudinary Media Library (`MediaGrid` / `MediaGalleryManager`). | Integrate media picker allowing admins to choose existing assets from Cloudinary or upload new ones and attach them to `featuredImage` and `images`. |
| **Backend Service Detail Media** | `serviceRepository.findServiceById` includes `availability` and `pricing`, but does not include `media: { orderBy: { createdAt: "desc" } }`. | Enhance backend `findServiceById` to include `media` in the query so attached media is returned alongside metadata. |
| **Batch Availability Support** | `PUT /admin/services/:serviceId/availability` only handles one date at a time. | Support batch date availability updates or range generation in the frontend/backend without requiring manual date-by-date network calls. |

---

## 3. Metadata Schema Alignment

The backend `Service` table stores flexible tour attributes in the `metadata` JSON field. To guarantee complete interoperability between the Admin Portal, Customer Catalog (`Tour` interface in `src/features/tours/types/tour.ts`), and Backend, the `metadata` payload must adhere to the following contract:

```typescript
export interface TourMetadata {
  slug: string;
  subtitle?: string;
  categoryId?: string;
  categoryName?: string;
  destination: string;
  destinationCategory?: string;
  location?: {
    city: string;
    country: string;
    departurePoint?: string;
  };
  duration: string;
  durationCategory: "half-day" | "full-day" | "multi-day";
  tourType: string;
  groupSize?: string;
  languages?: string[];
  badge?: "Popular" | "Bestseller" | "New";
  isFeatured?: boolean;
  featuredImage?: string;
  images?: string[];
  highlights?: string[];
  itinerary?: Array<{
    day?: number;
    time?: string;
    title: string;
    description: string;
  }>;
  included?: string[];
  excluded?: string[];
  pricingTiers?: Array<{
    tierName: string; // e.g. "Adult", "Child (4-11)", "Infant"
    price: number;
    description?: string;
  }>;
  scheduleDetails?: {
    isDaily?: boolean;
    daysOfWeek?: number[]; // 0=Sun, 1=Mon, etc.
    timeSlots?: string[];
    operatingHours?: string;
  };
  importantInfo?: string;
}
```

---

## 4. API Limitations & Backend Enhancements Needed

### 4.1 Backend Service Detail Media Inclusion
- **Limitation:** `findServiceById` in `serviceRepository.ts` currently only includes `availability` and `pricing`.
- **Enhancement:** Add `media: { orderBy: { createdAt: "desc" } }` to the Prisma query in `findServiceById` and update `ServiceDetail` type to include `media?: Media[]`.
- **Impact:** Zero breaking changes; purely additive.

### 4.2 Multi-Date Availability Support
- **Limitation:** `availabilityUpdateSchema` validates only a single date object.
- **Enhancement:** Support batch upsert `POST /admin/services/:serviceId/availability/batch` or enhance `availabilityUpdateSchema` to accept an array of date records, allowing admins to set schedules for a date range (e.g. daily for the next 30 days) in a single request.
- **Fallback (Frontend):** If keeping backend untouched, frontend can issue concurrent or sequential calls for selected dates while persisting general recurrence in `metadata.scheduleDetails`.

---

## 5. Implementation Dependencies & Milestones

The implementation must strictly proceed through the following 10 milestones:

1. **Architecture Audit (This Milestone):** Document current state, contracts, gaps, and implementation plan.
2. **Tour Create — Basic Information:** Title, slug auto-generation, subtitle, description, category, destination/location, duration, group size, languages, provider name.
3. **Tour Create — Pricing & Packages:** Currency, base price, discount price, tax rate, and multi-tier pricing matrices (Adult/Child/Infant).
4. **Tour Create — Itinerary:** Dynamic day/item builder with titles, time slots, rich descriptions, reordering, and item removal.
5. **Tour Create — Availability:** Calendar date selection, daily schedule defaults, capacity limits, and departure time slots.
6. **Tour Create — Image Management:** Integration with existing Cloudinary Media Library, cover photo selection, gallery management, and image reordering.
7. **Tour Edit — Complete Data Loading and Updating:** Deep pre-population of all tabs, preserving unchanged metadata, patch update, and optimistic/refetch cache updates.
8. **Tour Details View:** Upgrading `TourDetailsDialog` to a rich multi-section modal with photo galleries, itinerary timeline, pricing breakdown, and schedule overview.
9. **Publication Workflow:** Save as Draft, Publish, Unpublish, confirmation modal, and status badge synchronization across table and details.
10. **Full Regression Testing:** Unit, integration, typecheck, lint, build, and end-to-end verification.

---

## 6. Audit Conclusion

The existing architecture in both the Next.js frontend and Express/Prisma backend is clean, well-tested, and fully capable of supporting the complete Admin Tours Management lifecycle. All necessary UI primitives, design tokens, and database schemas are already in place. We are ready to proceed with the milestone execution plan.
