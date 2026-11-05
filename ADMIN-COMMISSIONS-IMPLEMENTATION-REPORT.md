# PhuketTours Admin Dashboard — Complete Commissions Management Implementation Report

**Date:** November 2, 2026  
**Module:** Admin Commissions Management (`/dashboard/admin/commissions`)  
**Frontend Application:** `phuket-tours`  
**Backend Application:** `qbictravel_backend-main`  
**Status:** Complete & Production Ready  

---

## 1. Completed Functionality

1. **Dedicated Commissions Management Route:**
   - Implemented route at `/dashboard/admin/commissions` utilizing Next.js App Router.
   - Built modular components under `src/features/admin/components/commissions/`.
   - Admin-only role enforcement via `DashboardGuard` and navigation filtering.

2. **Real Commission Overview & Volume Metrics:**
   - Real-time aggregation of active and cancelled commission volume from backend records.
   - Live system commission rate display directly from the active `CommissionRule` configuration.
   - Explicit ledger scope callout clarifying that records represent booking commission entitlements.

3. **Server-Driven Commission Ledger:**
   - Complete tabular display of real commission records including Commission UUID, Agent Name, Agency Name, Booking Reference, Commission Amount (THB), Calculation Rate/Type, Status Badge, and Created Date.
   - Backend-supported server-side pagination with custom page sizes (10, 20, 50).
   - Backend-supported status filtering (`ALL`, `ACTIVE`, `CANCELLED`).
   - Partner Agent filtering populated dynamically from `role=agent` users.
   - Exact Booking UUID lookup filter.
   - Debounced inputs, reset filters button, and manual refresh controls.
   - Fully accessible loading skeleton, error state with retry, and empty states.

4. **Commission Details & Audit History Dialog:**
   - Accessible modal with fixed header/footer and independently scrollable content.
   - Comprehensive breakdown of financial figures: Base Amount, Calculated Commission Amount, Calculation Rate/Type.
   - Contextual Agent metadata (Agent Name, Agency Name, Email) and Booking information.
   - Immutable audit trail showing sequential adjustments, timestamps, previous amounts, updated amounts, difference calculations, adjustment reasons, and actor identification.

5. **Commission Adjustment Workflow:**
   - Strict validation enforcing valid numeric adjustments between ฿0.00 and the booking base amount.
   - Reason validation (3 to 500 characters) as required by backend schema.
   - Mandatory admin confirmation checkbox before submission.
   - Prevents duplicate submissions and displays responsive loading states.
   - Immediate cache invalidation refreshing ledger and details modal upon success.

6. **Commission Rules Management Tab:**
   - Dual-tab interface seamlessly switching between "Commission Ledger" and "Commission Rules".
   - Active policy card highlighting active commission rate, type (`PERCENTAGE` vs `FIXED`), creator, and creation timestamp.
   - Interactive commission calculation preview showing how the active policy calculates commission on sample booking amounts (฿5,000, ฿15,000, ฿35,000).
   - Policy configuration form allowing Admins to set new system-wide commission rates with client & backend validation.
   - Historical revision log displaying previous commission rule configurations.

---

## 2. Page and Navigation Changes

- **Route:** Added `src/app/dashboard/admin/commissions/page.tsx` rendering `<AdminCommissionsView />`.
- **Navigation Configuration (`src/features/dashboard/types/dashboard-nav.ts`):**
  - Added `adminOnly?: boolean` property to `DashboardNavItem`.
  - Added entry:
    ```typescript
    {
      title: "Commissions Management",
      href: "/dashboard/admin/commissions",
      icon: Percent,
      adminOnly: true,
    }
    ```
- **Sidebar Integration (`src/features/dashboard/components/dashboard-sidebar.tsx`):**
  - Filtered navigation items to ensure `adminOnly` items are only rendered for users with `role === "admin"`.
- **Route Guard Protection (`src/features/auth/components/dashboard-guard.tsx`):**
  - Added check preventing staff users (`role === "staff"`) from viewing `/dashboard/admin/commissions`, displaying an explicit "Access Restricted" alert since commissions management is strictly restricted to system administrators.

---

## 3. API Endpoints Integrated

All endpoints align with existing backend routes in `qbictravel_backend-main`:

| Endpoint | Method | Purpose | Cache Tag |
|---|---|---|---|
| `/api/v1/admin/commissions` | `GET` | Paginated commission ledger | `AdminCommissions` |
| `/api/v1/admin/commissions/:id` | `GET` | Commission details & audit history | `AdminCommissions` (ID) |
| `/api/v1/admin/commissions/:id` | `PATCH` | Manual commission amount adjustment | Invalidate `AdminCommissions` |
| `/api/v1/admin/commission-rules` | `GET` | List commission policy history | `AdminCommissionRule` |
| `/api/v1/admin/commission-rules` | `PUT` | Configure new active commission policy | Invalidate `AdminCommissionRule` |
| `/api/v1/admin/reports/commissions` | `GET` | Summary report data | `AdminReport` |

---

## 4. Request / Response Contract Alignment

Direct verification against `commissionValidators.ts` and `commissionTypes.ts`:

- **List Commissions (`GET /api/v1/admin/commissions`):**
  - Query parameters: `page`, `limit`, `status` (`ACTIVE | CANCELLED`), `agentId`, `bookingId`.
  - Response: `{ status: "success", data: { items: AdminCommissionRecord[], pagination: { total, page, limit, pages } } }`.
- **Commission Details (`GET /api/v1/admin/commissions/:id`):**
  - Response: `{ status: "success", data: AdminCommissionDetail }`.
  - Includes nested `agent` (`user: { firstName, lastName, email }`, `agencyName`), `booking` (`id`, `bookingReference`, `totalAmount`, `status`), and `auditHistory`.
- **Commission Adjustment (`PATCH /api/v1/admin/commissions/:id`):**
  - Payload: `{ amount: number, reason: string }`.
  - Validation: `amount >= 0`, `reason.trim().length >= 3 && <= 500`.
- **Commission Rules (`GET /api/v1/admin/commission-rules`):**
  - Query parameters: `scope?: GLOBAL | AGENT_SPECIFIC`, `isActive?: boolean`.
  - Response: `{ status: "success", data: AdminCommissionRule[] }`.
- **Configure Commission Rule (`PUT /api/v1/admin/commission-rules`):**
  - Payload: `{ ruleType: "PERCENTAGE" | "FIXED", rate: number, scope: "GLOBAL", agentId?: string }`.
  - Backend requirement: Previous active rule is deactivated and new rule is created.

---

## 5. Commission Adjustment Behavior

1. **Availability:** Adjustment action is available on the table row and within the details dialog. It is disabled for `CANCELLED` commissions.
2. **Bounds Checking:**
   - Amount cannot be negative.
   - Amount cannot exceed the booking's base amount (`commission.baseAmount`).
   - Amount cannot equal the current commission amount.
   - Decimals capped at 2 places.
3. **Audit Reason:** Mandatory non-empty reason string between 3 and 500 characters explaining the administrative change.
4. **Safety & Confirmation:** Explicit confirmation checkbox requires administrator acknowledgement before the "Apply Adjustment" button becomes active.
5. **State Synchronization:** Submitting triggers RTK Query mutation, closes the modal, triggers a success toast, and refreshes both the ledger table and details view.

---

## 6. Audit History Integration

- Audit history records originate directly from backend `CommissionAudit` entities associated with the commission.
- Displayed in reverse chronological order in `CommissionDetailsDialog`.
- Each entry displays:
  - **Timestamp:** Formatted localized date and time.
  - **Previous Amount vs Updated Amount:** Formatted currency (THB) with highlighted delta (increase/decrease badge).
  - **Reason:** Administrator-supplied justification for the adjustment.
  - **Actor:** Administrator user identification.

---

## 7. Commission Rules Management

- **Policy Status:** Active rule is displayed prominently with rate type badge, percentage/flat rate, and activation date.
- **Form Controls:** Allows switching between `PERCENTAGE` (0% to 100%) and `FIXED` amount (THB).
- **Interactive Calculation Preview:** Dynamically computes sample commission payouts on typical tour booking prices to help admins visually verify rate impact before saving.
- **Revision History:** Full table of previous rules showing activation state, rule type, rate, scope, and effective dates.

---

## 8. Files Created and Modified

### Created Files
- `src/features/admin/types/admin-commissions.ts` — TypeScript definitions matching Prisma backend schema.
- `src/features/admin/components/commissions/commission-status-badge.tsx` — Status badge component.
- `src/features/admin/components/commissions/commissions-summary-cards.tsx` — Volume and rate summary metrics.
- `src/features/admin/components/commissions/commissions-toolbar.tsx` — Status, Agent, Booking, and page size filters.
- `src/features/admin/components/commissions/commissions-pagination.tsx` — Accessible server-side pagination bar.
- `src/features/admin/components/commissions/commissions-table.tsx` — Server-driven ledger table.
- `src/features/admin/components/commissions/commission-details-dialog.tsx` — Details and audit history modal.
- `src/features/admin/components/commissions/adjust-commission-dialog.tsx` — Adjustment form modal with safety confirmation.
- `src/features/admin/components/commissions/commission-rules-tab.tsx` — Rule configuration and policy revision history.
- `src/features/admin/components/commissions/admin-commissions-view.tsx` — Root orchestrator view.
- `src/app/dashboard/admin/commissions/page.tsx` — Route entry point.
- `src/features/admin/components/commissions/commissions-table.test.tsx` — Unit test suite for ledger table.
- `src/features/admin/components/commissions/commission-dialogs.test.tsx` — Unit test suite for details & adjustment dialogs.
- `src/features/admin/components/commissions/commission-rules-tab.test.tsx` — Unit test suite for rules tab & calculator.
- `src/features/admin/components/commissions/admin-commissions-view.test.tsx` — Integration test suite for view switching and modals.

### Modified Files
- `src/lib/api/base-api.ts` — Added `"AdminCommissionRule"` tag type.
- `src/features/admin/types/admin.ts` — Re-exported all commission types.
- `src/features/admin/api/admin-api.ts` — Injected 6 commission endpoints and cache invalidation tags.
- `src/features/dashboard/types/dashboard-nav.ts` — Added Commissions navigation item with `adminOnly: true`.
- `src/features/dashboard/components/dashboard-sidebar.tsx` — Filtered `adminOnly` items for non-admin roles.
- `src/features/auth/components/dashboard-guard.tsx` — Blocked staff access to `/dashboard/admin/commissions`.

---

## 9. Test Results

Executed with Vitest (`npx vitest run`):

```text
 ✓ src/features/admin/api/admin-api.test.ts (39 tests)
 ✓ src/features/admin/components/commissions/commissions-table.test.tsx (4 tests)
 ✓ src/features/admin/components/commissions/commission-rules-tab.test.tsx (5 tests)
 ✓ src/features/admin/components/commissions/commission-dialogs.test.tsx (7 tests)
 ✓ src/features/admin/components/commissions/admin-commissions-view.test.tsx (5 tests)
 ✓ src/features/dashboard/components/dashboard-shell.test.tsx (11 tests)

 Test Files  6 passed (6)
      Tests  71 passed (71)
   Duration  1.73s
```

All 71 tests passed with 0 failures.

---

## 10. TypeScript, ESLint and Build Results

- **TypeScript Verification:**
  - Command: `npx tsc --noEmit`
  - Result: **0 errors** (Clean).
- **ESLint Verification:**
  - Command: `npx eslint` across all modified files and new components.
  - Result: **0 errors, 0 warnings** (Clean).
- **Production Next.js Build:**
  - Command: `npm run build`
  - Result: Compiled successfully in 4.0s. Prerendered static route `○ /dashboard/admin/commissions` with 0 build warnings or trace errors.

---

## 11. Unsupported Features Intentionally Omitted

To maintain strict fidelity to backend business logic and prevent fabricating capabilities:

1. **"Pending" vs "Paid" Commission Statuses:**
   - The Prisma backend schema defines `enum CommissionStatus { ACTIVE, CANCELLED }`.
   - The backend contains no payout workflow, bank disbursement status, or settlement ledger.
   - **Omitted:** Fabricated "Mark as Paid", payout approval buttons, and artificial pending metric cards.
   - **Alternative Provided:** An informative ledger notice clarifying that commission records represent booking entitlements.
2. **Arbitrary Field Editing:**
   - Backend only supports adjusting the commission `amount` with a required `reason`.
   - **Omitted:** Editing agent association, booking references, or calculation rates retroactively.
3. **Staff Commission Access:**
   - Backend routes strictly enforce `requireRole("admin")`. No `commissions.*` permission exists in the Staff Permission Catalog.
   - **Enforced:** Commissions module is strictly Admin-only. Navigation hides it for non-admins, and `DashboardGuard` displays an explicit restriction block if directly requested by staff.

---

## 12. Manual Browser Verification Checklist

When launching the application locally (`npm run dev`), administrators can verify the following flows:

- [ ] **Navigation & Access:**
  - Log in as an Administrator (`admin@qbictravel.com`).
  - Verify "Commissions Management" appears in the sidebar with a percentage icon.
  - Navigate to `/dashboard/admin/commissions`.
  - Log in as a Staff member and verify the link is hidden and direct URL access displays the "Access Restricted" screen.
- [ ] **Commission Ledger Overview:**
  - Verify overview cards display total active volume, active policy rate, and cancelled volume.
  - Verify the ledger table loads real records from `/api/v1/admin/commissions`.
  - Test the Status dropdown (`ALL`, `ACTIVE`, `CANCELLED`).
  - Test the Agent filter dropdown to narrow records by partner agent.
  - Test the Booking ID search input.
  - Change page sizes (10, 20, 50) and test pagination controls.
- [ ] **Commission Details & Audit History:**
  - Click the "View details" button on an active commission.
  - Confirm the dialog displays agent information, booking reference, and financial breakdown.
  - Confirm any audit history entries display original amount, updated amount, reason, and timestamp.
- [ ] **Adjust Commission:**
  - Click "Adjust" on an active commission row or within the details dialog.
  - Input a new amount and reason. Verify validation prevents invalid values (e.g., negative or exceeding base amount).
  - Check the confirmation box and click "Apply Adjustment".
  - Verify the table refreshes, the amount updates, and an audit entry is created.
- [ ] **Commission Rules Management:**
  - Switch to the "Commission Rules" tab.
  - Verify the current active commission rule is displayed.
  - Test the interactive calculation preview with sample booking amounts.
  - Update the rule (e.g., set a new percentage rate), confirm the prompt, and verify the revision history table updates.

---

## 13. Custom Dropdown Standardization (Zero Native Selects)

Per the global design requirement, all native HTML `<select>` elements across the Admin Dashboard have been completely eliminated and replaced with the project's accessible, portal-enabled `CustomSelect` component (`src/components/ui/custom-select.tsx`).

### Dropdowns Replaced in Admin UI:

1. **Admin Commissions Management (`/dashboard/admin/commissions`):**
   - **Status Filter:** Replaced native `<select>` with `<CustomSelect>` supporting `ALL`, `ACTIVE`, `CANCELLED`.
   - **Partner Agent Filter:** Replaced native `<select>` with `<CustomSelect>` displaying agent names and agencies.
   - **Records Per Page Selector:** Replaced native `<select>` with `<CustomSelect>` for page limits (10, 20, 50).
2. **Admin Payments Management (`/dashboard/admin/payments`):**
   - **Payment Method Filter:** Replaced native `<select>` in `payments-toolbar.tsx` with `<CustomSelect>` for Credit Card, Bank Transfer, PromptPay, and Cash.
   - **Record Payment Modal:** Replaced native `<select>` in `record-payment-dialog.tsx` with `<CustomSelect>` for selecting initiated payments with formatted amount, method, and booking references.
3. **Admin Tours Editor (`/dashboard/admin/tours`):**
   - **New Date Status Selector:** Replaced native `<select>` in `availability-tab.tsx` with `<CustomSelect>` for Available vs Unavailable.
   - **Inline Edit Date Status:** Replaced native `<select>` in `selected-date-list.tsx` with `<CustomSelect>` for per-row inline availability editing.

### Design & Architecture Adherence:
- **Design System:** Clean white background (`bg-white`), subtle border (`border-[#E5EAED]`), rounded corners (`rounded-xl`), professional shadow (`shadow-lg shadow-slate-900/10`), active indicator (`#176779` & `#E8F8F5`), and animated rotating chevron (`rotate-180`).
- **Portal Rendering:** `usePortal={true}` mounts menus to `document.body` with automated viewport collision detection to prevent overflow clipping.
- **Accessibility:** Full ARIA combobox pattern (`role="combobox"`, `role="listbox"`, `role="option"`, `aria-expanded`, `aria-selected`) with Arrow keys, Enter, Escape, and click-outside dismissal.

