# PhuketTours — Admin Users Management
# Phase 2: Comprehensive Frontend Audit (READ-ONLY)

**Target Frontend Path:** `/home/owakeel/Workspace/Owakeel/carlsimpson/phuket-tours`  
**Target Backend Path:** `/home/owakeel/Workspace/Owakeel/carlsimpson/qbictravel_backend-main`  
**Referenced Backend Audit:** [ADMIN-USERS-BACKEND-AUDIT.md](file:///home/owakeel/Workspace/Owakeel/carlsimpson/phuket-tours/ADMIN-USERS-BACKEND-AUDIT.md)  
**Audit Date:** November 1, 2026  
**Auditor:** Senior Frontend Engineer & UI/UX Auditor  
**Audit Mode:** STRICT READ-ONLY (No code, database, schema, or configuration modifications)  
**Status:** Audit Completed — Ready for Review & Implementation Planning  

---

## 1. Executive Summary

This report documents the forensic architectural and UI/UX audit of the **Users Management frontend** in `phuket-tours` compared against the verified capabilities, constraints, and contracts established in the Phase 1 backend audit ([ADMIN-USERS-BACKEND-AUDIT.md](file:///home/owakeel/Workspace/Owakeel/carlsimpson/phuket-tours/ADMIN-USERS-BACKEND-AUDIT.md)).

### Core Finding
The existing Users Management route at [src/app/dashboard/admin/users/page.tsx](file:///home/owakeel/Workspace/Owakeel/carlsimpson/phuket-tours/src/app/dashboard/admin/users/page.tsx) is currently an **empty, non-functional static placeholder** displaying a dashed outline box labeled `"Registered Customers Table Placeholder"`.

No user management API queries, mutation hooks, TypeScript schemas, tables, toolbars, pagination controls, or dialogs exist for the Users module in `phuket-tours`. The only user-related API hook currently present in the frontend is `useGetAdminStaffQuery`, which was implemented specifically for the Bookings staff assignment dropdown.

### High-Level Status Overview

| Capability | Status | Frontend Reality vs. Backend Contract |
| :--- | :---: | :--- |
| **Route & Auth Guard** | **IMPLEMENTED** | Route `/dashboard/admin/users` exists and is strictly protected by `DashboardGuard` (requires `admin` role; redirects non-admins and unauthenticated users). |
| **Navigation Sidebar Item** | **IMPLEMENTED** | Present in `adminNavConfig` with icon `Users` and title `"Users Management"`. |
| **Users API Endpoints in RTK Query** | **MISSING** | No user listing, user details, user update, agent invite, or staff invite endpoints are defined in `admin-api.ts`. |
| **User TypeScript Contracts** | **MISSING** | No `admin-users.ts` type definition file exists. Only a partial `AdminStaffMember` interface exists in `admin-bookings.ts`. |
| **Users Console View (`AdminUsersView`)** | **MISSING** | No orchestration component exists under `src/features/admin/components/users/`. |
| **Users Table & Row Actions** | **MISSING** | No table, badge components, row action menus, or loading skeletons exist. |
| **Search & Filtering Controls** | **MISSING** | No search input, role filter dropdown, or status filter dropdown exist for users. |
| **Pagination Controls** | **MISSING** | Centralized `<Pagination />` component is available in the design system, but not wired for users. |
| **User Details Dialog** | **MISSING** | No modal exists to view detailed user information or agent agency profiles. |
| **User Edit Dialog** | **MISSING** | No modal exists to update user/agent/staff name, phone, or status. |
| **Invite User Dialog** | **MISSING** | No modal exists to invite Agents (`POST /admin/agents`) or Staff (`POST /admin/staff`). |
| **Account Deactivation Action** | **MISSING** | No deactivation trigger exists; UI self-deactivation protection is not yet built. |
| **Test Coverage** | **MISSING** | 0 unit or integration tests exist for the Users Management module. |

---

## 2. Existing Frontend Architecture

### 2.1 Route & Access Control Architecture

- **Page Entrypoint:** [src/app/dashboard/admin/users/page.tsx](file:///home/owakeel/Workspace/Owakeel/carlsimpson/phuket-tours/src/app/dashboard/admin/users/page.tsx)
  - Exports standard Next.js metadata (`title: "Users Management — Admin"`).
  - Renders a simple placeholder `<div>`.
- **Layout Shell:** [src/app/dashboard/layout.tsx](file:///home/owakeel/Workspace/Owakeel/carlsimpson/phuket-tours/src/app/dashboard/layout.tsx)
  - Wraps the entire dashboard in [DashboardShell](file:///home/owakeel/Workspace/Owakeel/carlsimpson/phuket-tours/src/features/dashboard/components/dashboard-shell.tsx).
- **Security & Authorization Guard:** [DashboardGuard](file:///home/owakeel/Workspace/Owakeel/carlsimpson/phuket-tours/src/features/auth/components/dashboard-guard.tsx)
  - Checks Redux `auth` slice (`selectCurrentUser`, `selectIsAuthenticated`, `selectIsAuthInitialized`).
  - Verifies that `pathname.startsWith("/dashboard/admin")` matches `user.role === "admin"`.
  - If unauthenticated: redirects to `/sign-in?redirect=/dashboard/admin/users`.
  - If authenticated as a customer (`role === "customer"`): immediately redirects to customer portal `/dashboard`.
  - Renders `DashboardSidebar` (248px desktop fixed), `DashboardTopbar` (64px sticky), and `MobileNavDrawer` (<1024px responsive slide-over).
- **Navigation Configuration:** [src/features/dashboard/types/dashboard-nav.ts#L85-L89](file:///home/owakeel/Workspace/Owakeel/carlsimpson/phuket-tours/src/features/dashboard/types/dashboard-nav.ts#L85-L89)
  ```typescript
  {
    title: "Users Management",
    href: "/dashboard/admin/users",
    icon: Users,
  }
  ```

---

### 2.2 State Management & Networking Layer

- **Base API:** [src/lib/api/base-api.ts](file:///home/owakeel/Workspace/Owakeel/carlsimpson/phuket-tours/src/lib/api/base-api.ts)
  - Redux Toolkit Query configured with `fetchBaseQuery({ baseUrl: env.NEXT_PUBLIC_API_URL, credentials: "include" })`.
  - Relies on HttpOnly `token` cookies for seamless credentials dispatch.
  - Tag `"User"` is **already registered** in `baseApi.tagTypes` ([base-api.ts#L16](file:///home/owakeel/Workspace/Owakeel/carlsimpson/phuket-tours/src/lib/api/base-api.ts#L16)), making it immediately available for cache invalidation.
- **Admin API Endpoint Slice:** [src/features/admin/api/admin-api.ts](file:///home/owakeel/Workspace/Owakeel/carlsimpson/phuket-tours/src/features/admin/api/admin-api.ts)
  - Injects endpoints onto `baseApi`.
  - Currently contains Reports, Tours/Services, Bookings/Operations, and Staff list queries.
  - **Does NOT contain** any endpoints for listing users, viewing single users, updating users, creating agents, creating staff, or updating agents/staff.

---

### 2.3 Design System & Shared Primitives

The frontend has a mature, validated suite of UI components ready to be leveraged for the Users Management module:
- **`CustomDropdown` & `CustomSelect`:** [src/components/ui/custom-dropdown.tsx](file:///home/owakeel/Workspace/Owakeel/carlsimpson/phuket-tours/src/components/ui/custom-dropdown.tsx), [custom-select.tsx](file:///home/owakeel/Workspace/Owakeel/carlsimpson/phuket-tours/src/components/ui/custom-select.tsx)
  - WAI-ARIA combobox/listbox pattern, auto-flip viewport positioning, keyboard navigable, no clipping issues in overflow containers.
- **`Pagination`:** [src/components/shared/pagination/](file:///home/owakeel/Workspace/Owakeel/carlsimpson/phuket-tours/src/components/shared/pagination/)
  - Standardized 3-column responsive grid with page numbers, jump controls, and page-size selector.
- **`Dialog` & Modal System:** [src/components/ui/dialog.tsx](file:///home/owakeel/Workspace/Owakeel/carlsimpson/phuket-tours/src/components/ui/dialog.tsx)
  - Accessible modal dialogs with backdrop blur, focus trap, and escape key handling.
- **Form Controls:** [input.tsx](file:///home/owakeel/Workspace/Owakeel/carlsimpson/phuket-tours/src/components/ui/input.tsx), [button.tsx](file:///home/owakeel/Workspace/Owakeel/carlsimpson/phuket-tours/src/components/ui/button.tsx), [badge.tsx](file:///home/owakeel/Workspace/Owakeel/carlsimpson/phuket-tours/src/components/ui/badge.tsx).

---

## 3. Existing Users Management Functionality Audit

Each requested feature from the user prompt has been forensically audited against the codebase:

| # | Feature | Status | Existing Implementation State | Recommended Action |
| :---: | :--- | :---: | :--- | :--- |
| 1 | **Users listing** | **MISSING** | [page.tsx](file:///home/owakeel/Workspace/Owakeel/carlsimpson/phuket-tours/src/app/dashboard/admin/users/page.tsx) renders a static placeholder string. No table or card components exist. | Create `AdminUsersView` and `UsersTable` components wired to `useGetAdminUsersQuery`. |
| 2 | **User profile/details view** | **MISSING** | No component or modal exists to inspect user details. | Create `UserDetailsDialog` showing profile attributes, role badge, creation dates, and agency info for agents. |
| 3 | **Search by name and email** | **MISSING** | No search input exists in the module. | Implement debounced search input (300ms) in `UsersToolbar` passing `search` query parameter to `GET /admin/users`. |
| 4 | **Role filtering** | **MISSING** | No role filter exists. | Implement `CustomDropdown` in `UsersToolbar` supporting `ALL`, `customer`, `agent`, `staff`, `admin`. |
| 5 | **Account status filtering** | **MISSING** | No status filter exists. | Implement `CustomDropdown` in `UsersToolbar` supporting `ALL`, `active`, `deactivated`. |
| 6 | **Server-side pagination** | **MISSING** | No pagination controls exist in the module. | Implement `UsersPagination` wrapping `<Pagination />` with `page` and `limit` (10, 20, 50, 100) states. |
| 7 | **User information editing** | **MISSING** | No form or modal exists to edit user records. | Create `EditUserDialog` for `name`, `phone`, and `status`. Note: `email` and `role` must be rendered as read-only. |
| 8 | **Account activation/deactivation** | **MISSING** | No activation/deactivation actions exist. | Provide "Deactivate Account" / "Activate Account" actions in row action menu and `EditUserDialog`, with self-deactivation guard. |
| 9 | **Agent invitation** | **MISSING** | No agent invite flow exists. | Create `InviteUserDialog` with tab/selector for Agent (`name`, `email`, `phone`, `agencyName`) calling `POST /admin/agents`. |
| 10 | **Staff invitation** | **MISSING** | No staff invite flow exists. | Support Staff invite in `InviteUserDialog` (`name`, `email`, `phone`) calling `POST /admin/staff`. |
| 11 | **Agent profile/details management** | **MISSING** | No interface exists to view or update `agencyName`. | Integrate `agencyName` into `UserDetailsDialog` and `EditUserDialog` when user role is `agent` (calling `PATCH /admin/agents/:id`). |
| 12 | **Loading, error, and empty states** | **MISSING** | No skeleton loaders, error retry panels, or empty directory states exist. | Build `UsersTableSkeleton`, `UsersEmptyState`, and `UsersErrorState` matching the Tours and Bookings design patterns. |
| 13 | **Responsive layout** | **MISSING** | The placeholder renders inside a generic flex container; no table responsive overflow wrapper exists. | Wrap table in `overflow-x-auto rounded-[12px] border border-[#E5EAED] bg-white` with min-width enforcement. |
| 14 | **Modal & dropdown behavior** | **MISSING** | No dialogs or action menus are mounted on the page. | Use `CustomDropdown` with `align="end"` and Radix-based `Dialog` with fixed header/footer and scrollable body. |
| 15 | **Form validation & error feedback** | **MISSING** | No forms or mutation feedback alerts exist. | Add client-side validation (name required, email format, E.164 phone regex) and an `ActionFeedback` banner. |

---

## 4. API Integration Audit

### 4.1 Inspection of `src/features/admin/api/admin-api.ts`

- **Current Endpoints:**
  - `getAdminRevenueReport`, `getAdminBookingsReport`, `getAdminPaymentsReport`, `getAdminServicesReport`
  - `getAdminServices`, `getAdminService`, `createAdminService`, `updateAdminService`, `updateAdminServiceStatus`, `bulkUpdateServiceStatus`, `getAdminServicePricing`, `updateAdminPricing`, `getAdminServiceAvailability`, `updateAdminAvailability`
  - `getAdminBookings`, `assignBookingStaff`, `updateBookingFulfillmentStatus`, `reviewBookingPriceApproval`
  - `getAdminStaff`
- **Users Management Gap:**
  There are **zero** endpoints for user listing, user details, user updates, agent creation, or staff creation.

---

### 4.2 Inspection of Type Definitions (`src/features/admin/types/`)

Currently, `src/features/admin/types/` has:
- `admin.ts` (reports and re-exports)
- `admin-services.ts` (tours and pricing/availability)
- `admin-bookings.ts` (operational bookings and partial staff typing)

#### Critical Type Discrepancy Found in Existing Code:
In [src/features/admin/types/admin-bookings.ts#L91-L96](file:///home/owakeel/Workspace/Owakeel/carlsimpson/phuket-tours/src/features/admin/types/admin-bookings.ts#L91-L96):
```typescript
export interface AdminStaffListResponse {
  items: AdminStaffMember[];
  page: number;
  limit: number;
  total: number;
}
```
**Discrepancy with Backend Contract:**
In the backend ([adminRepository.ts#L51-L59](file:///home/owakeel/Workspace/Owakeel/carlsimpson/qbictravel_backend-main/src/modules/admin/adminRepository.ts#L51-L59)), pagination is returned as a **nested object**:
```json
{
  "items": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 42,
    "totalPages": 3
  }
}
```
When creating the new `admin-users.ts` type module, the response structure must match the actual backend envelope:
```typescript
export interface AdminPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AdminUserListResponse {
  items: AdminUserRecord[];
  pagination: AdminPaginationMeta;
}
```

---

## 5. Backend Compatibility Matrix

This matrix correlates the verified backend capabilities documented in `ADMIN-USERS-BACKEND-AUDIT.md` with the required frontend API integration:

| Backend Route | HTTP Method | Auth & Role | Verified Backend Contract & Parameters | Frontend Status | Implementation Action Needed |
| :--- | :---: | :---: | :--- | :---: | :--- |
| `/api/v1/admin/users` | `GET` | `admin` | Query: `page`, `limit`, `search`, `role`, `status`. Returns `{ items, pagination }`. | **MISSING** | Add `getAdminUsers` query to `admin-api.ts`. |
| `/api/v1/admin/users/:userId` | `GET` | `admin` | Path: `userId` (UUID). Returns single `AdminUser` record. | **MISSING** | Add `getAdminUserById` query to `admin-api.ts`. |
| `/api/v1/admin/users/:userId` | `PATCH` | `admin` | Path: `userId`. Body: `{ name?, phone?, status? }`. Strips `email` & `role`. Rejects self-status change with 400. | **MISSING** | Add `updateAdminUser` mutation to `admin-api.ts`. |
| `/api/v1/admin/agents` | `GET` | `admin` | Query: `page`, `limit`, `search`, `status`. Filtered to `role: agent`. | **MISSING** | Can be queried via `getAdminUsers({ role: 'agent' })` or dedicated `getAdminAgents`. |
| `/api/v1/admin/agents` | `POST` | `admin` | Body: `{ name, email, phone?, agencyName? }`. Returns 201 + sends 72h setup link. | **MISSING** | Add `createAdminAgent` mutation to `admin-api.ts`. |
| `/api/v1/admin/agents/:agentId` | `GET` | `admin` | Path: `agentId` (UUID). Returns 404 if role !== `agent`. | **MISSING** | Add `getAdminAgentById` query or reuse `getAdminUserById`. |
| `/api/v1/admin/agents/:agentId` | `PATCH` | `admin` | Body: `{ name?, phone?, status?, agencyName? }`. Upserts `agentProfile.agencyName`. | **MISSING** | Add `updateAdminAgent` mutation to `admin-api.ts`. |
| `/api/v1/admin/staff` | `GET` | `admin` | Query: `page`, `limit`, `search`, `status`. Filtered to `role: staff`. | **PARTIAL** | Already in `admin-api.ts` (`getAdminStaff`), but lacks search support in type query. |
| `/api/v1/admin/staff` | `POST` | `admin` | Body: `{ name, email, phone? }`. Returns 201 + sends 72h setup link. | **MISSING** | Add `createAdminStaff` mutation to `admin-api.ts`. |
| `/api/v1/admin/staff/:staffId` | `PATCH` | `admin` | Body: `{ name?, phone?, status? }`. Returns 404 if role !== `staff`. | **MISSING** | Can be handled via `updateAdminUser` or dedicated `updateAdminStaff`. |

---

## 6. Missing Features

To deliver a production-ready, fully functional Users Management console that matches the design quality of Tours Management and Bookings Management, the following elements must be built:

1. **Type Definitions (`src/features/admin/types/admin-users.ts`):**
   - User roles (`UserRole`: `"customer" | "agent" | "staff" | "admin"`).
   - User status (`UserStatus`: `"active" | "deactivated"`).
   - `AdminUserRecord`, `AdminAgentProfile`, `AdminPaginationMeta`, `AdminUserListResponse`.
   - Query filters (`GetAdminUsersParams`).
   - Mutation inputs (`CreateAdminAgentInput`, `CreateAdminStaffInput`, `UpdateAdminUserInput`, `UpdateAdminAgentInput`).
2. **RTK Query Endpoints (`src/features/admin/api/admin-api.ts`):**
   - `getAdminUsers` (Query)
   - `getAdminUserById` (Query)
   - `createAdminAgent` (Mutation)
   - `createAdminStaff` (Mutation)
   - `updateAdminUser` (Mutation)
   - `updateAdminAgent` (Mutation)
   - Cache invalidation tags on `"User"`.
3. **Core Console Orchestrator (`src/features/admin/components/users/admin-users-view.tsx`):**
   - State management: `search`, `role`, `status`, `page`, `limit`.
   - Data fetching and error handling.
   - Modal management (details, edit, invite).
   - Alert feedback banner (success, error, warning).
4. **Header & Summary Cards:**
   - `UsersHeader`: Title, description, asset count badge, `"Invite User"` button.
   - `UsersSummaryCards`: Live metric cards for Total Users, Customers, Agents, Staff, and Deactivated accounts.
5. **Toolbar & Filtering Controls:**
   - `UsersToolbar`: Debounced search input, Role filter (`CustomDropdown`), Status filter (`CustomDropdown`), Reset button.
6. **Users Table & Actions:**
   - `UsersTable`: Avatar/initials badge, name, email, phone, role badge (`RoleBadge`), status badge (`UserStatusBadge`), joined date (`formatDate`), action menu (`UserActionsMenu`).
   - Skeletons (`UsersTableSkeleton`), Empty state (`UsersEmptyState`), Error state (`UsersErrorState`).
7. **Modals & Dialogs:**
   - `UserDetailsDialog`: Modal displaying complete user profile and role-specific details (`agencyName` for agents, booking notes for customers).
   - `EditUserDialog`: Modal allowing updates to `name`, `phone`, and `status`. Protects current admin from self-deactivation. Disallows email and role changes.
   - `InviteUserDialog`: Modal providing role selection between **Agent** and **Staff**, dynamically rendering required and optional fields (`agencyName` only for agents). Explains the 72-hour email setup link flow.

---

## 7. Unsupported Features That Must Stay Out of Scope

Based on the Phase 1 backend audit, the following features **do not exist in the backend** and **MUST NOT** be implemented or faked in the frontend:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    STRICTLY OUT OF SCOPE (BACKEND GAPS)                     │
├─────────────────────────────────────────────────────────────────────────────┤
│ 1. Direct Customer Creation: Admin cannot create customers via API.         │
│ 2. Direct Admin Creation: Co-admins cannot be invited via API.              │
│ 3. Role Transitions: Cannot change a user's role (customer -> agent, etc.). │
│ 4. Custom Staff Roles: No granular permissions or custom role tags.         │
│ 5. Delete User: No hard-delete or soft-delete endpoints exist.              │
│ 6. Admin Password Reset: Admin cannot trigger password reset on demand.    │
│ 7. Email / Phone Verification: Backend has no verification mechanisms.      │
│ 8. Customer Booking History: No endpoint to query bookings by user ID.      │
│ 9. Bulk Operations: No bulk deactivation or bulk invite.                    │
│ 10. Data Export: No CSV or Excel user export.                              │
│ 11. Date Range Filters: User listing does not accept `from` or `to`.        │
│ 12. Google OAuth Management: Backend only supports email + password.       │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Security and Authorization Findings

1. **Admin Self-Deactivation Prevention:**
   - The backend explicitly rejects an admin deactivating their own account with HTTP 400 (`"You cannot change your own account status"`).
   - **Frontend Requirement:** The UI must compare `currentUser.id === targetUser.id`. For the currently logged-in admin, the "Deactivate" option must be disabled or hidden with an informative tooltip (`"You cannot deactivate your own account"`).
2. **Read-Only Sensitivity:**
   - `email` and `role` must be rendered as disabled/read-only in the edit modal. Modifying these fields on the backend is disallowed and stripped.
3. **No Password Fields in Frontend Modals:**
   - Inviting agents and staff generates an invitation link sent via email. The admin **never** sets, sees, or enters passwords for new users.
4. **Deactivation Terminology:**
   - The action must be labeled **"Deactivate Account"** with a confirmation warning that deactivating immediately revokes the user's active session. It must **not** be labeled "Delete User".
5. **Session Guarding:**
   - The route `/dashboard/admin/users` is already guarded by `DashboardGuard`. Non-admin users are barred from viewing this module.

---

## 9. UX and Design Audit

### Design Standards to Apply (Aligned with Tours and Bookings Modules)

1. **Page Hierarchy & Spacing:**
   - Consistent typography using Google Font `Outfit` for headers and `Plus Jakarta Sans` / `Inter` for data.
   - Palette: Deep Slate `#18282A` for primary text, Teal `#3297A3` for accents, Muted `#74818A` for secondary labels, Light `#F8FAFB` for background.
2. **Badges:**
   - **Role Badges:**
     - `Admin`: Purple/Indigo tint (`bg-purple-50 text-purple-700 border-purple-200`)
     - `Agent`: Blue/Cyan tint (`bg-blue-50 text-blue-700 border-blue-200`)
     - `Staff`: Amber/Orange tint (`bg-amber-50 text-amber-700 border-amber-200`)
     - `Customer`: Emerald/Green tint (`bg-emerald-50 text-emerald-700 border-emerald-200`)
   - **Status Badges:**
     - `Active`: Emerald tint with green status dot.
     - `Deactivated`: Rose/Red tint with red status dot.
3. **Table & Overflow Standards:**
   - Min-width on table columns to prevent squishing on medium screens.
   - `overflow-x-auto` on the table card container.
   - Dropdown action menus must use `CustomDropdown` or Radix Portal to prevent clipping by table overflow containers.
4. **Modals & Dialogs:**
   - Fixed header with modal title and close button.
   - Independently scrollable body (`max-h-[70vh] overflow-y-auto px-6 py-4`).
   - Sticky footer with Cancel and Submit actions.
   - Form inputs with clear label, placeholder, and helpful error text below each input.

---

## 10. Testing Findings

### Current Test Coverage: 0%
- There are currently **no test files** for the Users Management module in `phuket-tours`.
- `admin-api.test.ts` covers reports, services, and bookings, but has no tests for user endpoints.

### Required Test Suite for Phase 3 Implementation:
1. **API Integration Tests (`src/features/admin/api/admin-api.test.ts`):**
   - `GET /admin/users` query construction, search param encoding, role and status filtering, pagination response structure.
   - `GET /admin/users/:userId` single user retrieval.
   - `PATCH /admin/users/:userId` payload formatting and cache invalidation.
   - `POST /admin/agents` request body formatting and response handling.
   - `POST /admin/staff` request body formatting and response handling.
   - `PATCH /admin/agents/:agentId` agencyName updates.
2. **Component Tests:**
   - `admin-users-view.test.tsx`: Initial load, query state, search debounce, filter changes, pagination, modal opens.
   - `users-table.test.tsx`: Render rows, badges, formatting dates, action menu clicks, self-deactivation disabled state.
   - `users-toolbar.test.tsx`: Search input debouncing, dropdown selections, reset button.
   - `edit-user-dialog.test.tsx`: Form prefilling, validation, submission, self-deactivation block.
   - `invite-user-dialog.test.tsx`: Role switching between Agent and Staff, field validation, submission.

---

## 11. Recommended Frontend Implementation Plan

### Step 1: Types & API Layer
1. Create [src/features/admin/types/admin-users.ts](file:///home/owakeel/Workspace/Owakeel/carlsimpson/phuket-tours/src/features/admin/types/admin-users.ts) defining `AdminUserRecord`, `UserRole`, `UserStatus`, `AdminUserListResponse`, `GetAdminUsersParams`, `CreateAdminAgentInput`, `CreateAdminStaffInput`, `UpdateAdminUserInput`, `UpdateAdminAgentInput`.
2. Re-export `admin-users.ts` from `src/features/admin/types/admin.ts`.
3. Update [src/features/admin/api/admin-api.ts](file:///home/owakeel/Workspace/Owakeel/carlsimpson/phuket-tours/src/features/admin/api/admin-api.ts) with RTK Query endpoints:
   - `getAdminUsers`
   - `getAdminUserById`
   - `createAdminAgent`
   - `createAdminStaff`
   - `updateAdminUser`
   - `updateAdminAgent`
4. Add unit tests in `src/features/admin/api/admin-api.test.ts` to verify query parameters and response contracts.

### Step 2: Table, Filtering, and Header Components
1. Create `src/features/admin/components/users/users-header.tsx`: Header title, subtitle, total user counter badge, and primary "Invite User" button.
2. Create `src/features/admin/components/users/users-summary-cards.tsx`: Dynamic metric cards for Total Users, Customers, Agents, Staff, and Deactivated accounts.
3. Create `src/features/admin/components/users/users-toolbar.tsx`: Debounced search input, Role filter (`CustomDropdown`), Status filter (`CustomDropdown`), Reset button.
4. Create `src/features/admin/components/users/user-role-badge.tsx` and `user-status-badge.tsx`.
5. Create `src/features/admin/components/users/user-actions-menu.tsx`: Dropdown menu for View Details, Edit Details, and Activate/Deactivate Account.
6. Create `src/features/admin/components/users/users-table.tsx`: Clean, accessible responsive table with user initials avatars, formatted dates, and role/status badges.
7. Create `src/features/admin/components/users/users-pagination.tsx`: Delegating to centralized `<Pagination />`.
8. Create `users-table-skeleton.tsx`, `users-empty-state.tsx`, and `users-error-state.tsx`.

### Step 3: Modals and User Action Workflows
1. Create `src/features/admin/components/users/user-details-dialog.tsx`: Read-only profile overview modal showing full user data, role, status, and agency details if applicable.
2. Create `src/features/admin/components/users/edit-user-dialog.tsx`: Form modal for modifying `name`, `phone`, and `status`. Enforces read-only `email` and `role`. Disables self-deactivation when editing the current admin account.
3. Create `src/features/admin/components/users/invite-user-dialog.tsx`: Tabbed or selectable modal to invite an **Agent** or **Staff** member with validation.
4. Create `src/features/admin/components/users/deactivate-user-dialog.tsx`: Confirmation prompt clearly explaining that deactivation immediately halts all active user sessions.

### Step 4: Page Assembly & End-to-End Validation
1. Assemble all components into `src/features/admin/components/users/admin-users-view.tsx`.
2. Update [src/app/dashboard/admin/users/page.tsx](file:///home/owakeel/Workspace/Owakeel/carlsimpson/phuket-tours/src/app/dashboard/admin/users/page.tsx) to mount `AdminUsersView`.
3. Add full test coverage in `src/features/admin/components/users/*.test.tsx`.
4. Validate responsive design, accessibility (WCAG), and error states.

---

## 12. Exact Files to Modify / Create

### Files to Create
1. [src/features/admin/types/admin-users.ts](file:///home/owakeel/Workspace/Owakeel/carlsimpson/phuket-tours/src/features/admin/types/admin-users.ts): Complete user contracts.
2. [src/features/admin/components/users/admin-users-view.tsx](file:///home/owakeel/Workspace/Owakeel/carlsimpson/phuket-tours/src/features/admin/components/users/admin-users-view.tsx): Master console.
3. [src/features/admin/components/users/users-header.tsx](file:///home/owakeel/Workspace/Owakeel/carlsimpson/phuket-tours/src/features/admin/components/users/users-header.tsx): Header and primary action.
4. [src/features/admin/components/users/users-summary-cards.tsx](file:///home/owakeel/Workspace/Owakeel/carlsimpson/phuket-tours/src/features/admin/components/users/users-summary-cards.tsx): Metric overview cards.
5. [src/features/admin/components/users/users-toolbar.tsx](file:///home/owakeel/Workspace/Owakeel/carlsimpson/phuket-tours/src/features/admin/components/users/users-toolbar.tsx): Search and filter bar.
6. [src/features/admin/components/users/user-role-badge.tsx](file:///home/owakeel/Workspace/Owakeel/carlsimpson/phuket-tours/src/features/admin/components/users/user-role-badge.tsx): Role indicator badge.
7. [src/features/admin/components/users/user-status-badge.tsx](file:///home/owakeel/Workspace/Owakeel/carlsimpson/phuket-tours/src/features/admin/components/users/user-status-badge.tsx): Status indicator badge.
8. [src/features/admin/components/users/user-actions-menu.tsx](file:///home/owakeel/Workspace/Owakeel/carlsimpson/phuket-tours/src/features/admin/components/users/user-actions-menu.tsx): Row action dropdown.
9. [src/features/admin/components/users/users-table.tsx](file:///home/owakeel/Workspace/Owakeel/carlsimpson/phuket-tours/src/features/admin/components/users/users-table.tsx): User records table.
10. [src/features/admin/components/users/users-pagination.tsx](file:///home/owakeel/Workspace/Owakeel/carlsimpson/phuket-tours/src/features/admin/components/users/users-pagination.tsx): Pagination controls.
11. [src/features/admin/components/users/users-table-skeleton.tsx](file:///home/owakeel/Workspace/Owakeel/carlsimpson/phuket-tours/src/features/admin/components/users/users-table-skeleton.tsx): Skeleton loading table.
12. [src/features/admin/components/users/users-empty-state.tsx](file:///home/owakeel/Workspace/Owakeel/carlsimpson/phuket-tours/src/features/admin/components/users/users-empty-state.tsx): No users found state.
13. [src/features/admin/components/users/users-error-state.tsx](file:///home/owakeel/Workspace/Owakeel/carlsimpson/phuket-tours/src/features/admin/components/users/users-error-state.tsx): Server/network error state.
14. [src/features/admin/components/users/user-details-dialog.tsx](file:///home/owakeel/Workspace/Owakeel/carlsimpson/phuket-tours/src/features/admin/components/users/user-details-dialog.tsx): View user details modal.
15. [src/features/admin/components/users/edit-user-dialog.tsx](file:///home/owakeel/Workspace/Owakeel/carlsimpson/phuket-tours/src/features/admin/components/users/edit-user-dialog.tsx): Edit user modal.
16. [src/features/admin/components/users/invite-user-dialog.tsx](file:///home/owakeel/Workspace/Owakeel/carlsimpson/phuket-tours/src/features/admin/components/users/invite-user-dialog.tsx): Invite agent or staff modal.
17. [src/features/admin/components/users/deactivate-user-dialog.tsx](file:///home/owakeel/Workspace/Owakeel/carlsimpson/phuket-tours/src/features/admin/components/users/deactivate-user-dialog.tsx): Deactivation confirmation modal.
18. [src/features/admin/components/users/admin-users-view.test.tsx](file:///home/owakeel/Workspace/Owakeel/carlsimpson/phuket-tours/src/features/admin/components/users/admin-users-view.test.tsx): Unit & integration test suite.

### Files to Modify
1. [src/features/admin/types/admin.ts](file:///home/owakeel/Workspace/Owakeel/carlsimpson/phuket-tours/src/features/admin/types/admin.ts): Re-export `./admin-users`.
2. [src/features/admin/api/admin-api.ts](file:///home/owakeel/Workspace/Owakeel/carlsimpson/phuket-tours/src/features/admin/api/admin-api.ts): Add user management queries and mutations with tag invalidation.
3. [src/features/admin/api/admin-api.test.ts](file:///home/owakeel/Workspace/Owakeel/carlsimpson/phuket-tours/src/features/admin/api/admin-api.test.ts): Add tests for user management endpoints.
4. [src/app/dashboard/admin/users/page.tsx](file:///home/owakeel/Workspace/Owakeel/carlsimpson/phuket-tours/src/app/dashboard/admin/users/page.tsx): Mount `AdminUsersView`.

---

## 13. Final Verification

- [x] **No source code was modified.**
- [x] **No backend code was modified.**
- [x] **No database schema or migration was changed.**
- [x] **Only the audit report `ADMIN-USERS-FRONTEND-AUDIT.md` was created.**
