# PhuketTours — Admin Bookings Management
# Phase 2: Comprehensive Frontend Audit (READ-ONLY)

> **Document Type**: Frontend Architecture & API Contract Compatibility Audit (Read-Only)  
> **Audited Repository**: `/home/owakeel/Workspace/Owakeel/carlsimpson/phuket-tours`  
> **Backend Reference**: `/home/owakeel/Workspace/Owakeel/carlsimpson/qbictravel_backend-main`  
> **Backend Audit Reference**: [`ADMIN-BOOKINGS-BACKEND-AUDIT.md`](file:///home/owakeel/Workspace/Owakeel/carlsimpson/phuket-tours/ADMIN-BOOKINGS-BACKEND-AUDIT.md)  
> **Audit Status**: Complete & Verified  
> **Date**: November 1, 2026  

---

## 1. Executive Summary

This read-only audit inspects the current state of Bookings Management within the PhuketTours frontend application, cross-referencing findings against the verified capabilities and constraints established in the Phase 1 Backend Audit.

### Key Audit Conclusions

1. **Current State: Static Placeholder**:
   - The Admin Bookings route at [`/dashboard/admin/bookings`](file:///home/owakeel/Workspace/Owakeel/carlsimpson/phuket-tours/src/app/dashboard/admin/bookings/page.tsx) is currently a **static UI placeholder**. It renders an empty dashed card containing the label *"Master Bookings Table Placeholder"*.
   - There are **no booking management components**, **no Redux slices**, **no RTK Query booking queries or mutations**, and **no automated tests** for this module.

2. **Frontend Architecture Alignment**:
   - The application provides a robust administrative shell, including [`DashboardGuard`](file:///home/owakeel/Workspace/Owakeel/carlsimpson/phuket-tours/src/features/auth/components/dashboard-guard.tsx) for strict role-based access control, [`DashboardShell`](file:///home/owakeel/Workspace/Owakeel/carlsimpson/phuket-tours/src/features/dashboard/components/dashboard-shell.tsx) with a responsive sidebar and topbar, and [`baseApi`](file:///home/owakeel/Workspace/Owakeel/carlsimpson/phuket-tours/src/lib/api/base-api.ts) with `"Booking"` pre-registered in `tagTypes`.
   - The modular design patterns established in Tours Management ([`admin-tours-view.tsx`](file:///home/owakeel/Workspace/Owakeel/carlsimpson/phuket-tours/src/features/admin/components/tours/admin-tours-view.tsx), [`tours-table.tsx`](file:///home/owakeel/Workspace/Owakeel/carlsimpson/phuket-tours/src/features/admin/components/tours/tours-table.tsx), portal-based [`tour-actions-menu.tsx`](file:///home/owakeel/Workspace/Owakeel/carlsimpson/phuket-tours/src/features/admin/components/tours/tour-actions-menu.tsx)) provide a direct architectural blueprint for Bookings Management.

3. **Backend Compatibility Constraints for Phase 3**:
   - **No All-Status Bookings List**: The backend only supports `GET /api/v1/admin/operations/bookings`, which hardcodes `where: { status: { in: ["CONFIRMED", "IN_PROGRESS", "COMPLETED"] } }`. Any booking with status `PENDING`, `AWAITING_APPROVAL`, `CANCELLED`, or `FAILED` is omitted by the backend.
   - **No Direct Admin Booking Details Endpoint**: The backend provides no `GET /api/v1/admin/bookings/:id`. Detail dialogs must rely on the fields returned by the operational list or cross-reference related payment records.
   - **No Guest Counts in Database**: The backend has no `adults`, `children`, or `infants` fields. The frontend must not invent or attempt to display fabricated guest counters.
   - **Price Missing in Operational List Response**: The backend's `operationalSelect` (`src/modules/operations/operationsRepository.ts:9-23`) selects `service`, `availability`, `customer`, and `assignedStaff`, but **omits `basePrice`, `proposedPrice`, and `finalPrice`**. Financial values must either be retrieved via payment records or calculated through services report metrics.

---

## 2. Frontend Architecture Audit

### 2.1 File & Route Structure

| File Path | Role / Purpose | Classification |
| :--- | :--- | :--- |
| [`src/app/dashboard/admin/bookings/page.tsx`](file:///home/owakeel/Workspace/Owakeel/carlsimpson/phuket-tours/src/app/dashboard/admin/bookings/page.tsx) | Next.js Server Component page for Admin Bookings route. | **UI ONLY** (Static placeholder) |
| [`src/app/dashboard/bookings/page.tsx`](file:///home/owakeel/Workspace/Owakeel/carlsimpson/phuket-tours/src/app/dashboard/bookings/page.tsx) | Customer-facing user dashboard bookings page. | **UI ONLY** (Static placeholder) |
| [`src/features/dashboard/components/dashboard-shell.tsx`](file:///home/owakeel/Workspace/Owakeel/carlsimpson/phuket-tours/src/features/dashboard/components/dashboard-shell.tsx) | Core layout wrapper: desktop fixed sidebar (248px), mobile drawer, sticky topbar. | **WORKING** |
| [`src/features/dashboard/types/dashboard-nav.ts`](file:///home/owakeel/Workspace/Owakeel/carlsimpson/phuket-tours/src/features/dashboard/types/dashboard-nav.ts) | Navigation config: maps `/dashboard/admin/bookings` with `ClipboardList` icon. | **WORKING** |
| [`src/features/auth/components/dashboard-guard.tsx`](file:///home/owakeel/Workspace/Owakeel/carlsimpson/phuket-tours/src/features/auth/components/dashboard-guard.tsx) | Client-side RBAC guard enforcing `role === "admin"`. | **WORKING** |
| [`src/lib/api/base-api.ts`](file:///home/owakeel/Workspace/Owakeel/carlsimpson/phuket-tours/src/lib/api/base-api.ts) | RTK Query base API; pre-registers `"Booking"` tag. | **WORKING** |
| [`src/store/index.ts`](file:///home/owakeel/Workspace/Owakeel/carlsimpson/phuket-tours/src/store/index.ts) | Redux store with `baseApi.reducer` and `authReducer`. | **WORKING** |
| [`src/features/admin/types/admin.ts`](file:///home/owakeel/Workspace/Owakeel/carlsimpson/phuket-tours/src/features/admin/types/admin.ts) | Defines `ADMIN_BOOKING_STATUSES` enum and report interfaces. | **WORKING** |
| [`src/features/admin/utils/format.ts`](file:///home/owakeel/Workspace/Owakeel/carlsimpson/phuket-tours/src/features/admin/utils/format.ts) | Defines `BOOKING_STATUS_CONFIG` with badge styles for all 7 statuses. | **WORKING** |
| [`src/features/booking/types/booking.ts`](file:///home/owakeel/Workspace/Owakeel/carlsimpson/phuket-tours/src/features/booking/types/booking.ts) | Client-side public wizard types (`BookingGuestsCount`, `GuestDetails`). | **NOT APPLICABLE** (Wizard only) |

---

### 2.2 Component Hierarchy (Current vs. Target)

#### Current Hierarchy
```
AdminBookingsPage (src/app/dashboard/admin/bookings/page.tsx)
 └── Page Header (Title + Subtitle)
      └── Placeholder <div> ("Master Bookings Table Placeholder")
```

#### Target Architecture (Matching Tours Management Pattern)
```
AdminBookingsPage (src/app/dashboard/admin/bookings/page.tsx)
 └── AdminBookingsView (Container & State Orchestrator)
      ├── BookingsHeader (Title, Subtitle, Refresh button)
      ├── BookingsSummaryCards (Fulfillment counts & pending approval alert)
      ├── BookingsToolbar (Status filter, Staff filter, Search, Refresh)
      ├── BookingsTable (Tabular list, sorting headers, responsive scroll wrapper)
      │    ├── BookingStatusBadge (Color-coded badge for booking/fulfillment/payment)
      │    └── BookingActionsMenu (Portal-based dropdown: Assign, Status, Approval)
      ├── BookingsPagination (Centralized Pagination with CustomSelect portal)
      ├── BookingDetailsDialog (Drawer or Modal displaying operational details)
      ├── AssignStaffDialog (Modal for assigning operational staff member)
      ├── UpdateFulfillmentDialog (Modal for advancing fulfillment with required note)
      └── PriceApprovalDialog (Modal for reviewing agent proposed prices)
```

---

## 3. Bookings Management UI Audit

The following table evaluates each UI component and data field requested in the audit specification against the current frontend and verified backend reality:

| UI Component / Field | Frontend Status | Backend Availability | Classification | Details & Constraints |
| :--- | :--- | :--- | :--- | :--- |
| **Booking Summary Cards** | Missing | `GET /api/v1/admin/reports/bookings` | **NOT IMPLEMENTED** | Overview page has `BookingStatusChart`, but the bookings page itself has no summary metric cards. |
| **Booking Table** | Missing | `GET /api/v1/admin/operations/bookings` | **NOT IMPLEMENTED** | Page renders only a dashed placeholder container. |
| **Booking ID** | Missing | Returned as `id: UUID` | **NOT IMPLEMENTED** | Supported by backend; not yet rendered in UI. |
| **Customer Name** | Missing | Returned in `customer.name` | **NOT IMPLEMENTED** | Supported by backend; not yet rendered in UI. |
| **Customer Phone** | Missing | Returned in `customer.phone` | **NOT IMPLEMENTED** | Supported by backend; not yet rendered in UI. |
| **Customer Email** | Missing | **OMITTED** in `operationalSelect` | **BACKEND DEPENDENCY** | Backend `operationsRepository.ts:21` only selects `{ id, name, phone }`. Email is omitted. |
| **Tour / Package Name** | Missing | Returned in `service.name` | **NOT IMPLEMENTED** | Supported by backend; not yet rendered in UI. |
| **Tour Type** | Missing | Returned in `service.type` | **NOT IMPLEMENTED** | Supported by backend (`"TOUR"`, `"PACKAGE"`, `"HOTEL"`). |
| **Booking Date (Created)** | Missing | Returned in `createdAt: ISO` | **NOT IMPLEMENTED** | Supported by backend; not yet rendered in UI. |
| **Travel Date (Availability)** | Missing | Returned in `availability.date` | **NOT IMPLEMENTED** | Supported by backend (`availability.date: ISO`). |
| **Guest Information** | Missing | **NOT SUPPORTED** in DB schema | **BACKEND DEPENDENCY** | Adults, children, and infants counts do not exist in the backend Prisma schema. Must not be fabricated. |
| **Booking Amount (Price)** | Missing | **OMITTED** in `operationalSelect` | **BACKEND DEPENDENCY** | Backend operational query omits `finalPrice`. Can only cross-reference via `/admin/payments`. |
| **Booking Status** | Missing | Returned in `status` | **NOT IMPLEMENTED** | Returns `CONFIRMED`, `IN_PROGRESS`, `COMPLETED` for operational bookings. |
| **Fulfillment Status** | Missing | Returned in `fulfillmentStatus` | **NOT IMPLEMENTED** | Returns `NOT_STARTED`, `IN_PROGRESS`, `FULFILLED`. |
| **Payment Status** | Missing | Returned in `paymentStatus` | **NOT IMPLEMENTED** | Returns `UNPAID`, `PARTIALLY_PAID`, `PAID`. |
| **Assigned Staff** | Missing | Returned in `assignedStaff` | **NOT IMPLEMENTED** | Returns `{ id, name } \| null`. |
| **Row Action Menu** | Missing | Backend action endpoints exist | **NOT IMPLEMENTED** | No action menu rendered yet. |
| **Booking Details Modal** | Missing | Partial data in operational list | **NOT IMPLEMENTED** | No details dialog rendered yet. |

---

## 4. Search, Filters & Pagination Audit

| Control / Filter | Frontend State | Backend Support | Classification | Impact & Technical Reality |
| :--- | :--- | :--- | :--- | :--- |
| **Search Input** | Not Implemented | **NOT SUPPORTED** | **BACKEND DEPENDENCY** | Backend `listAdminBookings` does not accept a `search` or `q` parameter. Client-side filtering across current page items is possible, but full server-side search does not exist. |
| **Booking Status Filter** | Not Implemented | **NOT SUPPORTED** | **BACKEND DEPENDENCY** | Backend operational query hardcodes `status IN ("CONFIRMED", "IN_PROGRESS", "COMPLETED")` and ignores status query params. |
| **Fulfillment Status Filter** | Not Implemented | `query.fulfillmentStatus` | **NOT IMPLEMENTED** | Backend fully supports filtering by `NOT_STARTED`, `IN_PROGRESS`, `FULFILLED` via `parseEnumQuery`. |
| **Assigned Staff Filter** | Not Implemented | `query.assignedStaffId` | **NOT IMPLEMENTED** | Backend fully supports filtering by staff UUID via `parseUuidQuery`. |
| **Payment Status Filter** | Not Implemented | **NOT SUPPORTED** on Bookings | **BACKEND DEPENDENCY** | Supported on `GET /api/v1/admin/payments`, but not supported on the operational bookings endpoint. |
| **Date Range Filters** | Not Implemented | **NOT SUPPORTED** on Bookings | **BACKEND DEPENDENCY** | Supported on `/admin/reports/*`, but not on operational bookings endpoint. |
| **Tour / Service Filter** | Not Implemented | **NOT SUPPORTED** on Bookings | **BACKEND DEPENDENCY** | Backend operational query has no `serviceId` filter. |
| **Customer Filter** | Not Implemented | **NOT SUPPORTED** on Bookings | **BACKEND DEPENDENCY** | Backend operational query has no `customerId` filter. |
| **Dynamic Sorting** | Not Implemented | **NOT SUPPORTED** | **BACKEND DEPENDENCY** | Backend hardcodes `orderBy: { createdAt: "desc" }`. |
| **Server-Side Pagination** | Not Implemented | `query.page`, `query.limit` | **NOT IMPLEMENTED** | Backend repository supports `skip` and `take`, returning `{ items, page, limit, total }`. |
| **Page-Size Selector** | Not Implemented | `query.limit` (default: 10) | **NOT IMPLEMENTED** | Can use centralized `<CustomSelect>` and `<Pagination>` component. |

---

## 5. Booking Actions & API Integration Audit

This section audits each intended Admin action, comparing the frontend integration with the verified backend API:

### 5.1 Action 1: View Booking Details
- **UI Control**: None (Placeholder).
- **Frontend Handler**: None.
- **Backend Endpoint**: `GET /api/v1/staff/operations/bookings/:bookingId` exists for staff only. **No dedicated admin detail endpoint exists.**
- **Classification**: **BACKEND DEPENDENCY**.
- **Implementation Strategy**: A modal/drawer can be rendered using the existing record already loaded in the operational table row.

### 5.2 Action 2: Assign Operational Staff Member
- **UI Control**: None.
- **Frontend Handler**: None.
- **Backend Endpoint**: `PATCH /api/v1/admin/operations/bookings/:bookingId/assignment` (Verified in Phase 1).
- **Payload**: `{ "staffId": "uuid | null", "notes": "string" }`.
- **Backend Support**: **IMPLEMENTED**.
- **Classification**: **NOT IMPLEMENTED IN FRONTEND**.
- **Implementation Strategy**: Build `AssignStaffDialog` with a dropdown populated from `GET /api/v1/admin/staff`.

### 5.3 Action 3: Update Fulfillment Status
- **UI Control**: None.
- **Frontend Handler**: None.
- **Backend Endpoint**: `PATCH /api/v1/admin/operations/bookings/:bookingId/status` (Verified in Phase 1).
- **Payload**: `{ "fulfillmentStatus": "NOT_STARTED | IN_PROGRESS | FULFILLED", "notes": "string" }`.
- **Business Rule**: Transition to `FULFILLED` requires `paymentStatus === "PAID"`. Admin can make backward corrections with a mandatory note.
- **Backend Support**: **IMPLEMENTED**.
- **Classification**: **NOT IMPLEMENTED IN FRONTEND**.

### 5.4 Action 4: Review Agent Price Approval
- **UI Control**: None.
- **Frontend Handler**: None.
- **Backend Endpoint**: `POST /api/v1/admin/bookings/:bookingId/price-approvals` (Verified in Phase 1).
- **Payload**: `{ "status": "APPROVED | REJECTED", "approvedPrice": number, "notes": "string" }`.
- **Backend Support**: **IMPLEMENTED**.
- **Classification**: **NOT IMPLEMENTED IN FRONTEND**.

### 5.5 Action 5: Verify Submitted Payment
- **UI Control**: None.
- **Frontend Handler**: None.
- **Backend Endpoint**: `POST /api/v1/admin/payments/:paymentId/verify` (Verified in Phase 1).
- **Payload**: `{ "decision": "VERIFIED | REJECTED", "notes": "string" }`.
- **Backend Support**: **IMPLEMENTED**.
- **Classification**: **NOT IMPLEMENTED IN FRONTEND**.

### 5.6 Action 6: Direct Booking Cancellation
- **UI Control**: None.
- **Frontend Handler**: None.
- **Backend Endpoint**: **DOES NOT EXIST**.
- **Backend Reality**: The backend has **no standalone cancellation endpoint**. Cancellation only occurs as a side-effect when an admin rejects an agent's price proposal (`rejectPriceApproval`).
- **Classification**: **BACKEND DEPENDENCY / NOT IMPLEMENTED IN BACKEND**.
- **Guardrail**: The frontend must **not** display a generic "Cancel Booking" action button unless an actual backend cancellation route is introduced.

### 5.7 Action 7: Reschedule Booking / Change Dates
- **UI Control**: None.
- **Frontend Handler**: None.
- **Backend Endpoint**: **DOES NOT EXIST**.
- **Classification**: **BACKEND DEPENDENCY / NOT IMPLEMENTED IN BACKEND**.

### 5.8 Action 8: Edit Booking / Change Guests
- **UI Control**: None.
- **Frontend Handler**: None.
- **Backend Endpoint**: **DOES NOT EXIST**.
- **Classification**: **BACKEND DEPENDENCY / NOT IMPLEMENTED IN BACKEND**.

---

## 6. Backend Contract Compatibility Matrix

| Backend Capability | Backend Endpoint | Frontend Target | Status / Compatibility |
| :--- | :--- | :--- | :--- |
| **Operational Bookings List** | `GET /api/v1/admin/operations/bookings` | `adminBookingsApi.getOperationsBookings` | **COMPATIBLE**; must be added to RTK Query. |
| **All-Status Bookings List** | None | None | **INCOMPATIBLE**; backend cannot supply unconfirmed/cancelled bookings. |
| **Assign Staff** | `PATCH /api/v1/admin/operations/bookings/:id/assignment` | `adminBookingsApi.assignStaff` | **COMPATIBLE**; mutation ready to be built. |
| **Update Fulfillment** | `PATCH /api/v1/admin/operations/bookings/:id/status` | `adminBookingsApi.updateFulfillmentStatus` | **COMPATIBLE**; mutation ready to be built. |
| **Price Approval Review** | `POST /api/v1/admin/bookings/:id/price-approvals` | `adminBookingsApi.reviewPriceApproval` | **COMPATIBLE**; mutation ready to be built. |
| **List Payments** | `GET /api/v1/admin/payments` | `adminPaymentsApi.getPayments` | **COMPATIBLE**; can cross-reference payments. |
| **Verify Payment** | `POST /api/v1/admin/payments/:id/verify` | `adminPaymentsApi.verifyPayment` | **COMPATIBLE**; mutation ready to be built. |
| **Record Offline Payment** | `POST /api/v1/admin/payments/:id/record` | `adminPaymentsApi.recordPayment` | **COMPATIBLE**; mutation ready to be built. |
| **Staff Accounts List** | `GET /api/v1/admin/staff` | `adminApi.getStaff` | **COMPATIBLE**; exists in backend to populate staff dropdown. |
| **Direct Cancellation** | None | None | **INCOMPATIBLE**; unsupported by backend. |
| **Guest Counts** | None | None | **INCOMPATIBLE**; unsupported by backend. |

---

## 7. Data Integrity & State Management Audit

### 7.1 Existing Format & Utility Assets
- [`src/features/admin/utils/format.ts`](file:///home/owakeel/Workspace/Owakeel/carlsimpson/phuket-tours/src/features/admin/utils/format.ts) provides robust utilities:
  - `formatReportMoney(amount, currency)`: Avoids fabricating currency symbols when `currency` is null.
  - `formatReportCount(count)`: Formats counts with locale comma separation.
  - `BOOKING_STATUS_CONFIG`: Accurately maps all 7 statuses (`COMPLETED`, `CONFIRMED`, `IN_PROGRESS`, `PENDING`, `AWAITING_APPROVAL`, `CANCELLED`, `FAILED`) to accessible labels, badge classes, and hex colors.

### 7.2 Data Integrity Gaps Identified
1. **Price Omission in Operational Response**:
   - As noted in Section 3, `GET /api/v1/admin/operations/bookings` does not return `finalPrice`. If the UI table requires a price column, displaying `"N/A"` or fetching related payments is necessary to avoid displaying fabricated numbers.
2. **Missing Invalidation Tags**:
   - While `baseApi.ts` includes `"Booking"` in `tagTypes`, mutating staff assignments or fulfillment statuses will require explicit tag invalidation (`invalidatesTags: ["Booking", "AdminReport"]`) to keep the Overview charts synchronized.
3. **Optimistic Updates**:
   - Given the strict state machine rules (e.g., fulfillment transition to `FULFILLED` requires verified payment and may fail with HTTP 409), optimistic updates should be avoided. Standard server-validated invalidation is safer.

---

## 8. UI/UX & Responsive Layout Audit

The Admin Dashboard layout rules established in previous phases must be applied to Bookings Management:

1. **Table Layout & Scrolling**:
   - The table wrapper must use `overflow-x-auto rounded-t-2xl` without nested vertical scrollbars.
   - The outer card wrapper must avoid `overflow-hidden` to prevent clipping bottom pagination dropdowns.
2. **Dropdowns & Action Menus**:
   - Row action menus must use `createPortal(..., document.body)` with dynamic collision detection (identical to [`TourActionsMenu`](file:///home/owakeel/Workspace/Owakeel/carlsimpson/phuket-tours/src/features/admin/components/tours/tour-actions-menu.tsx)).
   - The page-size selector must pass `usePortal={true}` to [`CustomSelect`](file:///home/owakeel/Workspace/Owakeel/carlsimpson/phuket-tours/src/components/ui/custom-select.tsx).
3. **Modals & Drawers**:
   - Action dialogs (Staff Assignment, Fulfillment Status, Price Approval) must use `Dialog` with `max-h-[calc(100dvh-32px)]` and `noBodyWrapper={true}` where multi-section content is scrollable.
4. **Responsive Breakpoints**:
   - The interface must remain functional across all target viewports: 1920×1080, 1440×900, 1366×768, 1024×768, 768×1024, and 390×844.

---

## 9. Test Coverage Audit

### 9.1 Existing Booking Tests
- **Frontend Booking Tests**: **0 files, 0 tests**.
- Neither `AdminBookingsPage` nor any booking-related components currently have unit or integration tests.

### 9.2 Critical Missing Test Suites for Phase 3
1. **API Integration Tests**:
   - Querying operational bookings with pagination and filters.
   - Staff assignment mutation.
   - Fulfillment status update mutation.
   - Price approval review mutation.
2. **Component & View Tests**:
   - Rendering operational bookings table with empty, loading, error, and populated states.
   - Filtering by fulfillment status and assigned staff.
   - Triggering row actions and modal dialogs.
   - Responsive layout and pagination interaction.

---

## 10. Prioritized Implementation Plan (Phase 3 Roadmap)

### Step 1: Define TypeScript Interfaces & RTK Query Endpoints
- Create `src/features/admin/types/admin-bookings.ts` representing the verified backend operational booking structure.
- Extend `adminApi` (or create `adminBookingsApi`) injecting:
  - `getAdminOperationsBookings` query (`GET /admin/operations/bookings`).
  - `assignBookingStaff` mutation (`PATCH /admin/operations/bookings/:id/assignment`).
  - `updateBookingFulfillmentStatus` mutation (`PATCH /admin/operations/bookings/:id/status`).
  - `reviewBookingPriceApproval` mutation (`POST /admin/bookings/:id/price-approvals`).
  - `getAdminStaffList` query (`GET /admin/staff`).

### Step 2: Build Reusable Booking UI Components
- Create `src/features/admin/components/bookings/`:
  - `bookings-header.tsx`: Page title, subtitle, refresh action.
  - `bookings-toolbar.tsx`: Fulfillment status filter, staff filter, client-side search.
  - `bookings-table.tsx`: Clean tabular presentation with date formatting and status badges.
  - `booking-actions-menu.tsx`: Portal-based 3-dots action dropdown.
  - `bookings-empty-state.tsx` & `bookings-error-state.tsx`.
  - `assign-staff-dialog.tsx`: Staff assignment modal with active staff select.
  - `update-fulfillment-dialog.tsx`: Fulfillment status updater with required notes.
  - `booking-details-dialog.tsx`: Operational details modal.

### Step 3: Implement Container View & Page Wiring
- Create `admin-bookings-view.tsx` orchestrating queries, pagination, filters, and modals.
- Update `src/app/dashboard/admin/bookings/page.tsx` replacing the placeholder with `<AdminBookingsView />`.

### Step 4: Verification & Automated Testing
- Write comprehensive Vitest test suites (`admin-bookings-view.test.tsx`, `bookings-table.test.tsx`, `booking-actions-menu.test.tsx`).
- Run `tsc --noEmit`, `npm run lint`, and `npm run build`.
- Validate responsive layout across all target viewports using headless Chrome.
