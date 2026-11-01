# PhuketTours — Admin Users Management
# Phase 1: Comprehensive Backend Audit (READ-ONLY)

**Target Backend Path:** `/home/owakeel/Workspace/Owakeel/carlsimpson/qbictravel_backend-main`  
**Target Frontend Path:** `/home/owakeel/Workspace/Owakeel/carlsimpson/phuket-tours`  
**Audit Date:** November 1, 2026  
**Auditor:** Senior Backend Engineer & Security Auditor  
**Audit Mode:** STRICT READ-ONLY (No code, database, schema, or configuration modifications)  
**Status:** Audit Completed — Ready for Admin Frontend Review  

---

## 1. Executive Summary

This report documents the forensic architectural and security audit of the existing **Users Management backend** in `qbictravel_backend-main` prior to developing or updating the Admin Users frontend in `phuket-tours`.

The backend implementation follows a modular Express + Prisma architecture with TypeScript, structured under [src/modules/admin](file:///home/owakeel/Workspace/Owakeel/carlsimpson/qbictravel_backend-main/src/modules/admin), [src/modules/user](file:///home/owakeel/Workspace/Owakeel/carlsimpson/qbictravel_backend-main/src/modules/user), and [src/modules/auth](file:///home/owakeel/Workspace/Owakeel/carlsimpson/qbictravel_backend-main/src/modules/auth).

### High-Level Summary of Findings

| Capability Category | Status | Notes |
| :--- | :---: | :--- |
| **User Listing & Search** | **IMPLEMENTED** | Server-side pagination, case-insensitive name/email search, role filter, status filter. |
| **User Detail Retrieval** | **IMPLEMENTED** | UUID-based lookup for users, agents, and own profile (`/users/me`). |
| **Account Creation** | **PARTIALLY IMPLEMENTED** | Admin can invite Agents and Staff (with auto-generated setup link). Public can self-register as Customer. Admin **cannot** directly create Customer or Admin accounts via API. |
| **Profile Updates** | **PARTIALLY IMPLEMENTED** | Admins can update name, phone, and status for users/staff, plus agencyName for agents. Email and role **cannot** be modified. Users can update own name and phone. |
| **Role Management** | **NOT IMPLEMENTED** | Roles are strictly immutable after creation. Role changes are explicitly stripped by validators. |
| **Account Deactivation** | **IMPLEMENTED** | Supported via `status: "deactivated"`. Instant session revocation on next request. Self-deactivation by admin blocked. |
| **Account Deletion** | **NOT IMPLEMENTED** | No soft-delete (`deletedAt`) or hard-delete (`DELETE`) endpoints exist. |
| **Password Reset** | **PARTIALLY IMPLEMENTED** | Public forgot/reset token flow and initial invite token flow are implemented. Admins **cannot** trigger a manual reset for existing users. |
| **Email/Phone Verification** | **NOT IMPLEMENTED** | No email verification token, no phone verification OTP, and no verification flags on `User` model. |
| **Customer Booking History** | **NOT IMPLEMENTED** | No API exists to query bookings by customer/user ID for the Admin console. |
| **Sorting** | **PARTIALLY IMPLEMENTED** | Hardcoded to `createdAt: "desc"`. No query parameters for sort column or direction. |
| **Date Range Filtering** | **NOT IMPLEMENTED** | No registration date filtering (`from`, `to`) on user list endpoints. |
| **Bulk Operations** | **NOT IMPLEMENTED** | No bulk status toggle, bulk role change, or bulk invite for users. |
| **Data Export** | **NOT IMPLEMENTED** | No CSV, Excel, or JSON export endpoints exist. |
| **Social / Google OAuth** | **NOT IMPLEMENTED** | Only local email + password authentication is supported. |

---

## 2. Database Models & Relationships

The database schema is defined across split Prisma files in [prisma/schema/](file:///home/owakeel/Workspace/Owakeel/carlsimpson/qbictravel_backend-main/prisma/schema).

### 2.1 Enums

- **`UserRole`** ([prisma/schema/user.prisma#L1-L6](file:///home/owakeel/Workspace/Owakeel/carlsimpson/qbictravel_backend-main/prisma/schema/user.prisma#L1-L6)):
  ```prisma
  enum UserRole {
    customer
    agent
    staff
    admin
  }
  ```
- **`UserStatus`** ([prisma/schema/user.prisma#L8-L11](file:///home/owakeel/Workspace/Owakeel/carlsimpson/qbictravel_backend-main/prisma/schema/user.prisma#L8-L11)):
  ```prisma
  enum UserStatus {
    active
    deactivated
  }
  ```

---

### 2.2 `User` Model

Located at [prisma/schema/user.prisma#L13-L38](file:///home/owakeel/Workspace/Owakeel/carlsimpson/qbictravel_backend-main/prisma/schema/user.prisma#L13-L38):

```prisma
model User {
  id                    String                 @id @default(uuid())
  name                  String
  email                 String                 @unique
  password              String
  phone                 String?
  role                  UserRole               @default(customer)
  status                UserStatus             @default(active)
  tokenVersion          Int                    @default(0)
  createdAt             DateTime               @default(now())
  updatedAt             DateTime               @updatedAt
  agentProfile          AgentProfile?
  passwordResetTokens   PasswordResetToken[]
  customerBookings      Booking[]              @relation("CustomerBookings")
  agentBookings         Booking[]              @relation("AgentBookings")
  adminApprovals        PriceApproval[]        @relation("AdminApprovals")
  customerPayments      Payment[]              @relation("CustomerPayments")
  reviewedPayments      Payment[]              @relation("PaymentReviews")
  assignedBookings      Booking[]              @relation("StaffAssignments")
  commissionRules       CommissionRule[]       @relation("CommissionRuleAuthor")
  agentCommissions      Commission[]           @relation("AgentCommissions")
  commissionAdjustments CommissionAdjustment[] @relation("CommissionAdjustments")
  notificationSettings  NotificationSetting[]  @relation("NotificationSettingEditor")
  uploadedMedia         Media[]
  mediaUploadAuths      MediaUploadAuth[]
}
```

#### Field Specifications:
| Field | Type | Modifiers / Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | String | `@id @default(uuid())` | Primary key UUID. |
| `name` | String | Required | Full display name of the user. |
| `email` | String | Required, `@unique` | Login email; case-insensitive unique in practice. |
| `password` | String | Required | 60-character bcrypt password hash (salt rounds = 10). |
| `phone` | String? | Nullable, Optional | Contact phone number (E.164-compatible regex in validator). |
| `role` | `UserRole` | Default: `customer` | Role flag: `customer`, `agent`, `staff`, `admin`. |
| `status` | `UserStatus` | Default: `active` | Account status: `active` or `deactivated`. |
| `tokenVersion` | Int | Default: `0` | Incremented on password reset to invalidate active JWTs. |
| `createdAt` | DateTime | `@default(now())` | Account creation timestamp. |
| `updatedAt` | DateTime | `@updatedAt` | Automatic record modification timestamp. |

#### Omissions & Observations in `User`:
- **No Verification Fields:** No `emailVerified`, `phoneVerified`, `isVerified`, or `emailVerifiedAt`.
- **No Soft Deletion:** No `deletedAt` timestamp; deactivation is purely status-driven.
- **No Profile Media:** No `avatar`, `avatarUrl`, or `profileImage` field.
- **No Custom Metadata:** No JSONB metadata field on `User`.
- **Indexes:** Only PK index on `id` and unique index on `email`. No composite or single-column indexes on `[role]`, `[status]`, or `[createdAt]`.

---

### 2.3 `AgentProfile` Model

Located at [prisma/schema/agent.prisma#L1-L8](file:///home/owakeel/Workspace/Owakeel/carlsimpson/qbictravel_backend-main/prisma/schema/agent.prisma#L1-L8):

```prisma
model AgentProfile {
  id         String   @id @default(uuid())
  userId     String   @unique
  agencyName String?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

- **Relationship:** 1-to-1 with `User` via foreign key `userId`. Deleting the user cascades to `AgentProfile`.
- **Fields:** Only stores `agencyName`. No agency license numbers, addresses, logos, or tax IDs exist.

---

### 2.4 `PasswordResetToken` Model

Located at [prisma/schema/auth.prisma#L1-L11](file:///home/owakeel/Workspace/Owakeel/carlsimpson/qbictravel_backend-main/prisma/schema/auth.prisma#L1-L11):

```prisma
model PasswordResetToken {
  id        String    @id @default(uuid())
  userId    String
  tokenHash String    @unique
  expiresAt DateTime
  usedAt    DateTime?
  createdAt DateTime  @default(now())
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}
```

- **Security Implementation:** Stores SHA-256 hash of random 32-byte hex token. Raw token is never stored in DB.
- **Single-use:** Verified via `usedAt: null` and atomically stamped on use.

---

### 2.5 `RevokedToken` Model

Located at [prisma/schema/auth.prisma#L13-L18](file:///home/owakeel/Workspace/Owakeel/carlsimpson/qbictravel_backend-main/prisma/schema/auth.prisma#L13-L18):

```prisma
model RevokedToken {
  jti       String   @id
  expiresAt DateTime

  @@index([expiresAt])
}
```

- **Purpose:** Blacklists revoked JWT tokens (`jti` claim) upon user logout until token expiration.

---

### 2.6 Related Relational Dependencies

```
User (id)
 ├── 1:1 AgentProfile (userId)
 ├── 1:N PasswordResetToken (userId)
 ├── 1:N Booking (customerId)               [CustomerBookings]
 ├── 1:N Booking (agentId)                  [AgentBookings]
 ├── 1:N Booking (assignedStaffId)          [StaffAssignments]
 ├── 1:N PriceApproval (adminId)            [AdminApprovals]
 ├── 1:N Payment (customerId)               [CustomerPayments]
 ├── 1:N Payment (reviewedById)             [PaymentReviews]
 ├── 1:N Commission (agentId)               [AgentCommissions]
 ├── 1:N CommissionRule (createdById)       [CommissionRuleAuthor]
 ├── 1:N CommissionAdjustment (adminId)     [CommissionAdjustments]
 ├── 1:N NotificationSetting (updatedById)  [NotificationSettingEditor]
 ├── 1:N Media (uploadedById)               [Media.uploadedBy]
 └── 1:N MediaUploadAuth (adminId)          [MediaUploadAuth.admin]
```

---

## 3. User Roles & Permissions

The system implements Role-Based Access Control (RBAC) via the [requireRole](file:///home/owakeel/Workspace/Owakeel/carlsimpson/qbictravel_backend-main/src/shared/middleware/requireRole.ts) middleware.

```
       ┌────────────────────────┐
       │   Public Registration  │ ──► Creates "customer"
       └────────────────────────┘
                    │
       ┌────────────────────────┐
       │  Admin Invite Endpoint │ ──► Creates "agent" or "staff"
       └────────────────────────┘
                    │
       ┌────────────────────────┐
       │ Database / Seed Script │ ──► Creates "admin"
       └────────────────────────┘
```

| Role | Role Purpose | Allowed Capabilities | Restricted Capabilities |
| :--- | :--- | :--- | :--- |
| **`admin`** | Platform Administrator | • Full user/agent/staff list & search<br>• View details & update name/phone/status<br>• Create agents & staff<br>• Review price approvals<br>• Assign operational bookings to staff<br>• Verify/record manual payments<br>• Configure commission policies & adjustments<br>• Upload, view & delete media assets<br>• Configure notification toggles<br>• View all reports | • Cannot change own status (`assertNotSelfStatusChange`)<br>• Cannot modify user roles<br>• Cannot create customers or admins via API<br>• Cannot hard delete users |
| **`agent`** | Travel Agency Partner | • Create bookings for customers at negotiated prices<br>• View own bookings & reports<br>• View permitted pricing discount limits<br>• View own payments & commissions<br>• View own profile (`/users/me` or `/auth/me`) | • Cannot access admin routes (`/api/v1/admin/*`)<br>• Cannot view other agents' commissions or bookings<br>• Cannot approve prices or verify payments |
| **`staff`** | Operations Team Member | • View operational booking queue assigned to them<br>• Update booking fulfillment status (`NOT_STARTED` → `IN_PROGRESS` → `FULFILLED`)<br>• View own profile | • Cannot reassign bookings<br>• Cannot access admin routes or agent commissions<br>• Cannot update other staff accounts |
| **`customer`** | End Traveler | • Self-register via public endpoint<br>• Create direct bookings at base price<br>• Initiate manual payments (bank transfer/cash) and upload references<br>• View own payment records<br>• View & update own profile (name, phone) | • Cannot propose custom prices<br>• Cannot view operational queues<br>• Cannot access agent, staff, or admin endpoints |

---

## 4. Existing API Endpoints

### 4.1 Complete Endpoint Inventory

All user-related and admin user management routes are defined in:
- [src/modules/admin/adminRoutes.ts](file:///home/owakeel/Workspace/Owakeel/carlsimpson/qbictravel_backend-main/src/modules/admin/adminRoutes.ts)
- [src/modules/user/userRoutes.ts](file:///home/owakeel/Workspace/Owakeel/carlsimpson/qbictravel_backend-main/src/modules/user/userRoutes.ts)
- [src/modules/auth/authRoutes.ts](file:///home/owakeel/Workspace/Owakeel/carlsimpson/qbictravel_backend-main/src/modules/auth/authRoutes.ts)

| HTTP Method | Route Path | Auth Required | Required Role | Summary | Status |
| :--- | :--- | :---: | :---: | :--- | :---: |
| `POST` | `/api/v1/auth/register` | No | Public | Register customer account | **IMPLEMENTED** |
| `POST` | `/api/v1/auth/login` | No | Public | Authenticate account (Rate limited: 10/15m) | **IMPLEMENTED** |
| `POST` | `/api/v1/auth/logout` | Yes | Any | End session & blacklist token | **IMPLEMENTED** |
| `POST` | `/api/v1/auth/forgot-password` | No | Public | Request password recovery email | **IMPLEMENTED** |
| `POST` | `/api/v1/auth/reset-password` | No | Public | Reset password using recovery token | **IMPLEMENTED** |
| `GET` | `/api/v1/auth/me` | Yes | Any | Retrieve profile and role | **IMPLEMENTED** |
| `GET` | `/api/v1/users/me` | Yes | Any | Retrieve own user profile | **IMPLEMENTED** |
| `PATCH` | `/api/v1/users/me` | Yes | Any | Update own name and phone | **IMPLEMENTED** |
| `GET` | `/api/v1/admin/users` | Yes | `admin` | List & search users with pagination/filters | **IMPLEMENTED** |
| `GET` | `/api/v1/admin/users/:userId` | Yes | `admin` | View single user details | **IMPLEMENTED** |
| `PATCH` | `/api/v1/admin/users/:userId` | Yes | `admin` | Update user name, phone, or status | **IMPLEMENTED** |
| `GET` | `/api/v1/admin/agents` | Yes | `admin` | List all agent accounts | **IMPLEMENTED** |
| `POST` | `/api/v1/admin/agents` | Yes | `admin` | Create agent and email setup link | **IMPLEMENTED** |
| `GET` | `/api/v1/admin/agents/:agentId` | Yes | `admin` | View agent details (checks role = agent) | **IMPLEMENTED** |
| `PATCH` | `/api/v1/admin/agents/:agentId` | Yes | `admin` | Update agent details, status, or agencyName | **IMPLEMENTED** |
| `GET` | `/api/v1/admin/staff` | Yes | `admin` | List all staff accounts | **IMPLEMENTED** |
| `POST` | `/api/v1/admin/staff` | Yes | `admin` | Create staff and email setup link | **IMPLEMENTED** |
| `PATCH` | `/api/v1/admin/staff/:staffId` | Yes | `admin` | Update staff details or status | **IMPLEMENTED** |

---

### 4.2 Audit of 18 Admin User Operations

| # | Requested Admin Operation | Classification | Detailed Verification Findings |
| :---: | :--- | :---: | :--- |
| 1 | **List all users** | **IMPLEMENTED** | `GET /api/v1/admin/users`. Returns paginated list with total counts and items. |
| 2 | **View user details** | **IMPLEMENTED** | `GET /api/v1/admin/users/:userId`. Returns full profile including `agentProfile`. |
| 3 | **Search users** | **IMPLEMENTED** | `?search=...` query param on `/admin/users`. Matches `name` or `email` (ILIKE `contains`). |
| 4 | **Filter by role** | **IMPLEMENTED** | `?role=customer\|agent\|staff\|admin` query param on `/admin/users`. |
| 5 | **Filter by account status** | **IMPLEMENTED** | `?status=active\|deactivated` query param on `/admin/users`, `/admin/agents`, `/admin/staff`. |
| 6 | **Filter by registration date** | **NOT IMPLEMENTED** | No `from`, `to`, or date parameters exist on any user listing query schemas. |
| 7 | **Server-side pagination** | **IMPLEMENTED** | `?page=1&limit=20` (max limit 100). Returns `pagination: { page, limit, total, totalPages }`. |
| 8 | **Sorting** | **PARTIALLY IMPLEMENTED** | Hardcoded to `orderBy: { createdAt: "desc" }` in repository. No query params for custom sorting. |
| 9 | **Create users** | **PARTIALLY IMPLEMENTED** | `POST /admin/agents` creates agents; `POST /admin/staff` creates staff. **No** generic user creation, **no** customer creation by admin, **no** admin creation by admin. |
| 10 | **Edit user profiles** | **PARTIALLY IMPLEMENTED** | `PATCH /admin/users/:userId` updates `name`, `phone`, `status`. `agencyName` editable on agents. Email is **not** editable. |
| 11 | **Change user roles** | **NOT IMPLEMENTED** | `role` field is stripped by validators. Attempting to change role returns HTTP 400 or has no effect. |
| 12 | **Activate/deactivate accounts** | **IMPLEMENTED** | Status toggle via `PATCH /admin/users/:userId` (`status: "active" \| "deactivated"`). Self-deactivation by admin blocked with HTTP 400. |
| 13 | **Delete users** | **NOT IMPLEMENTED** | No `DELETE` endpoint and no soft-delete column in database. Deactivation is the only deprecation path. |
| 14 | **Reset passwords** | **PARTIALLY IMPLEMENTED** | Public forgot/reset token flow and initial invite token flow exist. Admin **cannot** trigger a password reset for an existing user. |
| 15 | **Verify email or phone** | **NOT IMPLEMENTED** | No verification endpoints, no verification tokens, and no database flags. |
| 16 | **View customer booking history** | **NOT IMPLEMENTED** | No endpoint retrieves bookings for a specific customer or user ID (`/admin/users/:userId/bookings` is missing). |
| 17 | **View agent-related information** | **PARTIALLY IMPLEMENTED** | Profile (`agencyName`) available via `GET /admin/agents/:agentId`. Commissions available via `GET /admin/commissions?agentId=...`. Reports available via `GET /admin/reports/agents?agentId=...`. No single consolidated endpoint. |
| 18 | **Bulk operations** | **NOT IMPLEMENTED** | No bulk status change, bulk delete, or bulk invite endpoints exist for users. |
| 19 | **Export users** | **NOT IMPLEMENTED** | No export endpoints (CSV, Excel, or JSON) exist for users. |

---

## 5. Authentication & Authorization

### 5.1 Authentication Flow

- **Password Hashing:**
  - Uses `bcryptjs` with salt work factor of `10` ([authService.ts#L47](file:///home/owakeel/Workspace/Owakeel/carlsimpson/qbictravel_backend-main/src/modules/auth/authService.ts#L47), [adminService.ts#L42](file:///home/owakeel/Workspace/Owakeel/carlsimpson/qbictravel_backend-main/src/modules/admin/adminService.ts#L42)).
- **JWT Architecture:**
  - Token signed with `env.jwtSecret` (HS256).
  - Fixed expiration: **7 days** (`expiresIn: "7d"`).
  - Claims: `{ id, role, tv (tokenVersion), jti, iat, exp }`.
  - **No refresh tokens.** Tokens are long-lived access tokens.
- **Dual Transport:**
  - Supports both `Authorization: Bearer <token>` header and `req.cookies.token` (httpOnly, sameSite: lax, secure in production).
- **Session Invalidation:**
  - **Explicit Logout:** Token's `jti` is inserted into `RevokedToken` table with its `expiresAt` ([authRepository.ts#L62-L71](file:///home/owakeel/Workspace/Owakeel/carlsimpson/qbictravel_backend-main/src/modules/auth/authRepository.ts#L62-L71)).
  - **Global Invalidation on Password Reset:** `User.tokenVersion` is incremented. `authMiddleware` verifies `user.tokenVersion === payload.tv` on every request, instantly invalidating all existing JWTs across all devices ([authMiddleware.ts#L66-L68](file:///home/owakeel/Workspace/Owakeel/carlsimpson/qbictravel_backend-main/src/shared/middleware/authMiddleware.ts#L66-L68)).
  - **Instant Deactivation Blocking:** `authMiddleware` checks `user.status !== "active"` on every authenticated request, returning HTTP 403 immediately without waiting for token expiry ([authMiddleware.ts#L70-L72](file:///home/owakeel/Workspace/Owakeel/carlsimpson/qbictravel_backend-main/src/shared/middleware/authMiddleware.ts#L70-L72)).

---

### 5.2 Security Vulnerability Analysis

| Vulnerability Vector | Assessment | Backend Safeguard Verification |
| :--- | :---: | :--- |
| **Privilege Escalation via Register** | **SECURE** | `registerUser` hardcodes `role: "customer"`. Any role supplied in request body is stripped/ignored ([authService.ts#L54](file:///home/owakeel/Workspace/Owakeel/carlsimpson/qbictravel_backend-main/src/modules/auth/authService.ts#L54)). |
| **Privilege Escalation via Profile Update** | **SECURE** | `updateProfileSchema` only permits `name` and `phone`. Roles, status, and email are rejected ([userValidators.ts#L25-L36](file:///home/owakeel/Workspace/Owakeel/carlsimpson/qbictravel_backend-main/src/modules/user/userValidators.ts#L25-L36)). |
| **Privilege Escalation via Admin Update** | **SECURE** | `updateUserSchema` permits only `name`, `phone`, `status`. `role` is stripped ([adminValidators.ts#L105-L111](file:///home/owakeel/Workspace/Owakeel/carlsimpson/qbictravel_backend-main/src/modules/admin/adminValidators.ts#L105-L111)). |
| **Self-Deactivation Lockout** | **SECURE** | `assertNotSelfStatusChange` throws HTTP 400 if `actor.id === targetId && input.status !== undefined` ([adminService.ts#L23-L31](file:///home/owakeel/Workspace/Owakeel/carlsimpson/qbictravel_backend-main/src/modules/admin/adminService.ts#L23-L31)). |
| **User Enumeration in Forgot Password** | **SECURE** | Always returns generic HTTP 200 message whether email exists, is deactivated, or does not exist ([authController.ts#L83-L88](file:///home/owakeel/Workspace/Owakeel/carlsimpson/qbictravel_backend-main/src/modules/auth/authController.ts#L83-L88)). |
| **Timing Attacks in Login** | **SECURE** | If user does not exist, `loginUser` executes `bcrypt.compare(password, DUMMY_PASSWORD_HASH)` before throwing HTTP 401 ([authService.ts#L70](file:///home/owakeel/Workspace/Owakeel/carlsimpson/qbictravel_backend-main/src/modules/auth/authService.ts#L70)). |
| **Password Leakage in Responses** | **SECURE** | All queries use explicit Prisma select objects (`adminUserSelect`, `profileSelect`, `authUserSelect`) omitting `password` ([adminRepository.ts#L10-L20](file:///home/owakeel/Workspace/Owakeel/carlsimpson/qbictravel_backend-main/src/modules/admin/adminRepository.ts#L10-L20)). |
| **Mass Assignment** | **SECURE** | Yup validation middleware applies `{ stripUnknown: true, abortEarly: false }` ([validate.ts#L11-L14](file:///home/owakeel/Workspace/Owakeel/carlsimpson/qbictravel_backend-main/src/shared/middleware/validate.ts#L11-L14)). |
| **IDOR in User Operations** | **SECURE** | `GET /me` and `PATCH /me` strictly resolve from `req.user.id`. Admin user endpoints require authenticated `admin` role. |
| **Rate Limiting** | **SECURE** | `authRateLimiter` restricts `/auth/login`, `/auth/forgot-password`, and `/auth/reset-password` to 10 requests per 15 minutes per IP ([rateLimiter.ts#L4-L15](file:///home/owakeel/Workspace/Owakeel/carlsimpson/qbictravel_backend-main/src/shared/middleware/rateLimiter.ts#L4-L15)). |

---

## 6. User Management Workflows

### Workflow 1: Public Customer Self-Registration
1. Client sends `POST /api/v1/auth/register` with `{ name, email, password }`.
2. Validates schema; normalizes email to lowercase.
3. Checks email availability (HTTP 409 if exists).
4. Hashes password with bcrypt (10 rounds).
5. Creates record in `User` with `role: "customer"`, `status: "active"`, `tokenVersion: 0`.
6. Issues 7-day JWT; sets `token` httpOnly cookie.
7. Responds with HTTP 201: `{ success: true, data: { id, name, email, role: "customer" } }`.

---

### Workflow 2: Admin Inviting Agent
1. Admin sends `POST /api/v1/admin/agents` with `{ name, email, phone?, agencyName? }`.
2. Requires `admin` role.
3. Checks email uniqueness (HTTP 409 if taken).
4. Generates cryptographically random 32-byte password, hashed with bcrypt (unusable directly).
5. Atomically creates `User` (`role: "agent"`) and linked `AgentProfile` (`agencyName`).
6. Generates 32-byte hex reset token, hashes with SHA-256, and stores in `PasswordResetToken` with 72-hour TTL (`env.inviteTokenTtlHours`).
7. Sends invitation email with setup link: `${frontendUrl}/reset-password?token=${rawToken}`.
8. If email delivery fails, error is logged; agent record remains created.
9. Responds with HTTP 201 and `AdminUser` payload.

---

### Workflow 3: Admin Inviting Staff
1. Admin sends `POST /api/v1/admin/staff` with `{ name, email, phone? }`.
2. Requires `admin` role.
3. Checks email uniqueness (HTTP 409 if taken).
4. Generates unusable random bcrypt password.
5. Creates `User` (`role: "staff"`, `agentProfile: null`).
6. Issues 72-hour setup token and emails link.
7. Responds with HTTP 201 and `AdminUser` payload.

---

### Workflow 4: Invited Agent / Staff Account Activation
1. User receives setup link via email.
2. User submits `POST /api/v1/auth/reset-password` with `{ token, password }`.
3. Backend validates password length (6–72 chars).
4. Hashes token with SHA-256 and finds active, unexpired token where `usedAt === null` and `user.status === "active"`.
5. In an atomic transaction:
   - Sets `usedAt = new Date()`.
   - Updates `user.password` with new bcrypt hash.
   - Increments `user.tokenVersion`.
   - Deletes any other pending tokens for this user.
6. User can now authenticate via `POST /api/v1/auth/login`.

---

### Workflow 5: Account Deactivation & Reactivation
1. Admin sends `PATCH /api/v1/admin/users/:userId` with `{ status: "deactivated" }`.
2. Backend verifies target user exists.
3. Checks `assertNotSelfStatusChange`: Admin cannot change their own status (HTTP 400).
4. Updates `status` to `deactivated`.
5. Immediate Effect:
   - Any active JWT presented by the deactivated user will be rejected on the next request by `authMiddleware` with HTTP 403 (`"Account is deactivated"`).
   - Future login attempts return HTTP 403.
   - Password reset requests for deactivated users return generic 200 but send no email.
6. Reactivation: Admin sends `{ status: "active" }`. User can log in immediately with previous credentials.

---

## 7. Security Findings & Recommendations

### Security Positives
1. **Password Safety:** Zero instances of passwords returned in any API responses. Explicit Prisma select masks.
2. **Session Revocation:** Dual-layer invalidation (`RevokedToken` for logout, `tokenVersion` for password reset).
3. **Privilege Defense:** Immutability of roles prevents role-manipulation attacks.
4. **Anti-Brute Force:** Rate limiting on auth endpoints (10 attempts / 15 mins).
5. **Anti-Enumeration:** Uniform responses on password recovery and timing attack padding on login.

### Security Concerns & Technical Debt
1. **[Low/Performance] Missing Database Indexes on User Attributes:**
   - [prisma/schema/user.prisma](file:///home/owakeel/Workspace/Owakeel/carlsimpson/qbictravel_backend-main/prisma/schema/user.prisma) has no indexes on `role`, `status`, or `createdAt`.
   - Listing with `status=active&role=agent` performs a sequential table scan on PostgreSQL.
2. **[Low/Performance] ILIKE Substring Search:**
   - Search uses `mode: "insensitive"` `contains` on `name` and `email` without Trigram (`pg_trgm`) indexes. Large user tables will experience slow search queries.
3. **[Architecture] Long-Lived JWTs (7 Days) without Refresh Token:**
   - Because tokens are valid for 7 days, the database must be queried on every single authenticated request in `authMiddleware` to check `tokenVersion`, `status`, and `RevokedToken`. This negates the stateless benefit of JWTs.
4. **[Operational] Lack of Admin Password Reset Override:**
   - If a customer or agent loses email access, an admin has no API method to generate a temporary password or reset link on their behalf.
5. **[Operational] Email Provider in Production:**
   - [mailer.ts#L10-L17](file:///home/owakeel/Workspace/Owakeel/carlsimpson/qbictravel_backend-main/src/shared/utils/mailer.ts#L10-L17) logs: `"Email not sent: no mail provider configured"` when `NODE_ENV === "production"`. A real SMTP/SES/SendGrid provider must be wired before live deployment.

---

## 8. Related Module Integrations

| Module | Integration Level | Implementation Summary |
| :--- | :---: | :--- |
| **Bookings** | **PARTIAL** | `Booking` links to `customerId`, `agentId`, and `assignedStaffId`. When creating bookings, `findActiveCustomer` validates customer status. **Missing:** Query bookings by customer ID or agent ID from user management. |
| **Payments** | **PARTIAL** | `Payment` links to `customerId` and `reviewedById` (admin). Admin can filter payments by `?customerId=uuid` via `GET /api/v1/admin/payments`. |
| **Commissions** | **IMPLEMENTED** | `Commission` links to `agentId`. Admin can view agent commissions via `GET /api/v1/admin/commissions?agentId=uuid`. |
| **Operations** | **IMPLEMENTED** | Staff can be assigned to bookings via `PATCH /api/v1/admin/operations/bookings/:bookingId/assignment`. Operational queue filtered by `assignedStaffId`. |
| **Media Library** | **IMPLEMENTED** | `Media` records track `uploadedById` (admin). `MediaUploadAuth` binds upload tickets to `adminId`. |
| **Notifications** | **PARTIAL** | `NotificationSetting` tracks `updatedById`. Notifications are sent via email for password reset, account setup, and booking/payment events. No in-app inbox. |
| **Reviews / Ratings** | **NOT IMPLEMENTED** | No reviews model or system exists in schema or backend. |
| **Auth Providers** | **NOT IMPLEMENTED** | Local password only. No OAuth, SAML, or social identity providers. |

---

## 9. Test Coverage

### 9.1 Existing Test Files

| Test File | Type | Line Count | Key Scenarios Covered |
| :--- | :---: | :---: | :--- |
| [src/modules/admin/tests/integration/admin.test.ts](file:///home/owakeel/Workspace/Owakeel/carlsimpson/qbictravel_backend-main/src/modules/admin/tests/integration/admin.test.ts) | Integration | 367 lines | • Access control (401 unauthenticated, 403 for customer/agent/staff, deactivated admin blocked)<br>• User list pagination, search, role filtering, validation<br>• View user by ID (200, 404, 400 on malformed UUID)<br>• Update user name, phone, status<br>• Deactivation immediately blocks session and login; reactivation restores<br>• Disallow role changes via update<br>• Prevent admin self-deactivation<br>• Create agent, email setup link, set password & login<br>• Agent duplicate email conflict (409)<br>• List & view agents only, update agencyName<br>• Create staff, duplicate staff conflict, list staff only, staff deactivation |
| [src/modules/admin/tests/unit/adminService.test.ts](file:///home/owakeel/Workspace/Owakeel/carlsimpson/qbictravel_backend-main/src/modules/admin/tests/unit/adminService.test.ts) | Unit | 153 lines | • `assertNotSelfStatusChange` blocks admin self-deactivation<br>• Admin updating own name is allowed<br>• 404 on missing target user<br>• Role scoping: `getAgent` rejects non-agent, `updateStaff` rejects non-staff<br>• `createAgent` rejects existing email (409)<br>• Generates random password hash and calls setup mailer |
| [src/modules/user/tests/integration/user.test.ts](file:///home/owakeel/Workspace/Owakeel/carlsimpson/qbictravel_backend-main/src/modules/user/tests/integration/user.test.ts) | Integration | 123 lines | • `GET /users/me` with session, deactivated session blocked (403)<br>• `PATCH /users/me` update name & phone, phone clearing with `null`<br>• Stripping forbidden fields (`role`, `status`, `email`)<br>• 400 on empty update or invalid phone |
| [src/modules/auth/tests/integration/auth.test.ts](file:///home/owakeel/Workspace/Owakeel/carlsimpson/qbictravel_backend-main/src/modules/auth/tests/integration/auth.test.ts) | Integration | 309 lines | • Register customer, httpOnly cookie set, password omitted<br>• Ignore role in register body<br>• Login success, invalid credentials, deactivated account blocked<br>• Token header Bearer vs Cookie<br>• Logout revokes token<br>• Forgot password uniform responses<br>• Reset password, session invalidation across old tokens, token single-use |
| [src/modules/auth/tests/unit/authService.test.ts](file:///home/owakeel/Workspace/Owakeel/carlsimpson/qbictravel_backend-main/src/modules/auth/tests/unit/authService.test.ts) | Unit | 258 lines | • Password hashing on register, duplicate email handling<br>• Dummy password comparison for timing attack prevention<br>• Token version claim inclusion<br>• Token revocation routines |
| [src/shared/middleware/tests/requireRole.test.ts](file:///home/owakeel/Workspace/Owakeel/carlsimpson/qbictravel_backend-main/src/shared/middleware/tests/requireRole.test.ts) | Unit | 31 lines | • 401 unauthenticated, 403 forbidden role, allowed roles |

### 9.2 Missing Test Scenarios
- **Search Special Characters:** No tests for punctuation, wildcard symbols (`%`, `_`), or single-quote SQL/regex escaping in user search.
- **Rate Limiting Tests:** Rate limiter tests are skipped in test environment (`skip: () => env.nodeEnv === "test"`).
- **Concurrent Update Collisions:** No test validating behavior when two admins update the same user simultaneously.

---

## 10. Frontend Integration Contracts

All endpoints return the standard envelope:
```json
{
  "success": true,
  "message": "...",
  "data": { ... }
}
```

Standard error response:
```json
{
  "success": false,
  "message": "Error description",
  "data": null
}
```

---

### 10.1 Existing & Usable APIs for Admin Users Console

#### 1. List Users
- **Method & URL:** `GET /api/v1/admin/users`
- **Auth:** Bearer Token or Cookie (`token`)
- **Required Role:** `admin`
- **Query Parameters:**
  | Parameter | Type | Required | Default | Validation / Values |
  | :--- | :---: | :---: | :---: | :--- |
  | `page` | integer | No | 1 | Min: 1 |
  | `limit` | integer | No | 20 | Min: 1, Max: 100 |
  | `search` | string | No | - | Max 100 chars; matches name or email (case-insensitive) |
  | `role` | string | No | - | `customer`, `agent`, `staff`, `admin` |
  | `status` | string | No | - | `active`, `deactivated` |
- **Response `data` (200 OK):**
  ```json
  {
    "items": [
      {
        "id": "c1f7a0b3-9e45-4299-80cf-9188a1b63e9f",
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+66812345678",
        "role": "customer",
        "status": "active",
        "createdAt": "2026-10-15T08:30:00.000Z",
        "updatedAt": "2026-10-15T08:30:00.000Z",
        "agentProfile": null
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 42,
      "totalPages": 3
    }
  }
  ```

---

#### 2. Get Single User Details
- **Method & URL:** `GET /api/v1/admin/users/:userId`
- **Auth:** Bearer Token or Cookie
- **Required Role:** `admin`
- **URL Parameters:** `userId` (UUID, required)
- **Response `data` (200 OK):**
  ```json
  {
    "id": "c1f7a0b3-9e45-4299-80cf-9188a1b63e9f",
    "name": "Sky Agent",
    "email": "sky@example.com",
    "phone": "+66812345678",
    "role": "agent",
    "status": "active",
    "createdAt": "2026-10-15T08:30:00.000Z",
    "updatedAt": "2026-10-15T08:30:00.000Z",
    "agentProfile": {
      "agencyName": "Sky Travel Agency"
    }
  }
  ```
- **Error Codes:** 400 (Invalid UUID), 404 (`"User not found"`).

---

#### 3. Update User (Name, Phone, Status)
- **Method & URL:** `PATCH /api/v1/admin/users/:userId`
- **Auth:** Bearer Token or Cookie
- **Required Role:** `admin`
- **URL Parameters:** `userId` (UUID, required)
- **Request Body (min 1 field):**
  ```json
  {
    "name": "Updated Name",
    "phone": "+66898765432",
    "status": "deactivated"
  }
  ```
  *(Note: `phone` can be `null` to clear it. `role` and `email` are not allowed.)*
- **Response `data` (200 OK):** Returns updated `AdminUser` object.
- **Error Codes:**
  - 400: Empty body, invalid phone regex, invalid status enum, or admin attempting self-status change (`"You cannot change your own account status"`).
  - 404: User not found.

---

#### 4. Create Agent Account
- **Method & URL:** `POST /api/v1/admin/agents`
- **Auth:** Bearer Token or Cookie
- **Required Role:** `admin`
- **Request Body:**
  ```json
  {
    "name": "Phuket Sea Tours Agent",
    "email": "agent@phuketsea.com",
    "phone": "+66811122233",
    "agencyName": "Phuket Sea Tours Co., Ltd."
  }
  ```
  *(Required: `name`, `email`. Optional: `phone`, `agencyName`.)*
- **Response `data` (201 Created):**
  ```json
  {
    "id": "d2a8b1c4-1111-2222-3333-444455556666",
    "name": "Phuket Sea Tours Agent",
    "email": "agent@phuketsea.com",
    "phone": "+66811122233",
    "role": "agent",
    "status": "active",
    "createdAt": "2026-11-01T10:00:00.000Z",
    "updatedAt": "2026-11-01T10:00:00.000Z",
    "agentProfile": {
      "agencyName": "Phuket Sea Tours Co., Ltd."
    }
  }
  ```
- **Side Effect:** Sends invitation email with set-password token.
- **Error Codes:** 400 (validation), 409 (`"Email already registered"`).

---

#### 5. List Agents
- **Method & URL:** `GET /api/v1/admin/agents`
- **Auth:** Bearer Token or Cookie
- **Required Role:** `admin`
- **Query Parameters:** `page`, `limit`, `search`, `status`
- **Response `data` (200 OK):** Same pagination structure as `/admin/users`, filtered automatically to `role: "agent"`.

---

#### 6. View Single Agent
- **Method & URL:** `GET /api/v1/admin/agents/:agentId`
- **Auth:** Bearer Token or Cookie
- **Required Role:** `admin`
- **Response `data` (200 OK):** `AdminUser` record. Returns 404 if user exists but has a role other than `agent`.

---

#### 7. Update Agent
- **Method & URL:** `PATCH /api/v1/admin/agents/:agentId`
- **Auth:** Bearer Token or Cookie
- **Required Role:** `admin`
- **Request Body:**
  ```json
  {
    "name": "Updated Agent Name",
    "phone": "+66811122233",
    "status": "active",
    "agencyName": "Updated Agency Ltd."
  }
  ```
  *(Upserts `AgentProfile.agencyName`.)*
- **Response `data` (200 OK):** Returns updated `AdminUser`.

---

#### 8. Create Staff Account
- **Method & URL:** `POST /api/v1/admin/staff`
- **Auth:** Bearer Token or Cookie
- **Required Role:** `admin`
- **Request Body:**
  ```json
  {
    "name": "Operations Lead",
    "email": "ops@phukettours.com",
    "phone": "+66899988877"
  }
  ```
- **Response `data` (201 Created):** Returns `AdminUser` with `role: "staff"` and `agentProfile: null`.
- **Side Effect:** Sends invitation email with set-password token.

---

#### 9. List Staff Accounts
- **Method & URL:** `GET /api/v1/admin/staff`
- **Auth:** Bearer Token or Cookie
- **Required Role:** `admin`
- **Query Parameters:** `page`, `limit`, `search`, `status`
- **Response `data` (200 OK):** Same pagination structure as `/admin/users`, filtered automatically to `role: "staff"`.

---

#### 10. Update Staff Account
- **Method & URL:** `PATCH /api/v1/admin/staff/:staffId`
- **Auth:** Bearer Token or Cookie
- **Required Role:** `admin`
- **Request Body:** `{ "name"?, "phone"?, "status"? }`
- **Response `data` (200 OK):** Returns updated `AdminUser`. Returns 404 if user is not `staff`.

---

#### 11. Cross-Module Customer Payment History
- **Method & URL:** `GET /api/v1/admin/payments?customerId=:userId`
- **Auth:** Bearer Token or Cookie
- **Required Role:** `admin`
- **Response `data` (200 OK):** Paginated payments initiated or submitted by this specific customer. Can be used by the Admin User Details view to show customer financial history.

---

#### 12. Cross-Module Agent Commissions
- **Method & URL:** `GET /api/v1/admin/commissions?agentId=:agentId`
- **Auth:** Bearer Token or Cookie
- **Required Role:** `admin`
- **Response `data` (200 OK):** Paginated commission records for this specific agent. Can be used by the Admin Agent Details view to show commission earnings.

---

### 10.2 Incomplete APIs

1. **`GET /api/v1/admin/users`:** Missing date range parameters (`from`, `to`) and sorting parameters (`sortBy`, `sortOrder`).
2. **`PATCH /api/v1/admin/users/:userId`:** Email cannot be changed (even if customer made a typo upon registration).
3. **`GET /api/v1/admin/staff/:staffId`:** No dedicated route exists; frontend must use `GET /api/v1/admin/users/:userId`.

---

### 10.3 Missing APIs

1. **`POST /api/v1/admin/users`:** No direct endpoint for an admin to create a Customer or co-Admin.
2. **`DELETE /api/v1/admin/users/:userId`:** No deletion or account purge endpoint.
3. **`POST /api/v1/admin/users/:userId/reset-password`:** No admin-triggered password reset email or temporary password issue.
4. **`PATCH /api/v1/admin/users/:userId/role`:** Role transition endpoint does not exist.
5. **`GET /api/v1/admin/users/:userId/bookings`:** No endpoint to view a customer's or agent's booking history.
6. **`PATCH /api/v1/admin/users/bulk-status`:** No bulk deactivation or activation.
7. **`GET /api/v1/admin/users/export`:** No user export to CSV/Excel.
8. **`POST /api/v1/admin/users/:userId/resend-invite`:** No endpoint to resend an expired setup link to an agent or staff member.

---

## 11. Missing Backend Capabilities Summary

1. **Customer Direct Creation by Admin:** The backend assumes customers always self-register. Admin cannot register walk-in or offline customers directly without using the public registration endpoint.
2. **Customer Booking Query for Admin:** While bookings link to `customerId`, there is no endpoint for an administrator to list bookings belonging to a specific customer.
3. **Role Elevation / Demotion:** An administrator cannot promote a customer to an agent or staff member, nor demote an agent to a customer.
4. **Resend Invite Token:** Agents and staff invitation tokens expire in 72 hours. If the token expires before the recipient uses it, the admin has no endpoint to resend or regenerate the invite.
5. **Admin-Initiated Password Reset:** No endpoint exists for an admin to send a reset link to a locked-out user.
6. **Audit Logs for User Changes:** Status changes and updates are saved directly in PostgreSQL without an audit trail (unlike bookings which have `BookingHistory` and commissions which have `CommissionAdjustment`).

---

## 12. Risks & Recommendations for Frontend Implementation

### Frontend Architectural Recommendations
1. **Design Around Existing Endpoints:**
   - Use `GET /api/v1/admin/users` as the master user table, utilizing `role` and `status` dropdowns for filtering.
   - Use `POST /api/v1/admin/agents` and `POST /api/v1/admin/staff` for the "Add New User" modal (providing a role selector between Agent and Staff). Disable or explain the inability to create Customer accounts directly.
2. **Read-Only Roles:**
   - Display role as a visual badge (e.g., `Customer`, `Agent`, `Staff`, `Admin`) in the user editor, but **do not** provide a role-change selector in the edit dialog because the backend strictly rejects role modifications.
3. **Deactivation as Account Deprecation:**
   - Because `DELETE` is not implemented, label the primary destructive action as **"Deactivate Account"** rather than "Delete User". Provide clear messaging that deactivating immediately revokes all user sessions and prevents login.
4. **Self-Deactivation Guard in UI:**
   - Disable or hide the "Deactivate" action on the row corresponding to the currently logged-in admin (`currentUser.id === user.id`) to avoid predictable HTTP 400 errors from `assertNotSelfStatusChange`.
5. **Integrate Available Related Data:**
   - In the Customer Details view, leverage `GET /api/v1/admin/payments?customerId=:id` to show payment records.
   - In the Agent Details view, leverage `GET /api/v1/admin/commissions?agentId=:id` and `agencyName` from `agentProfile`.
6. **No Client-Side Assumptions on Verification:**
   - Do not render "Email Verified" or "Phone Verified" badges or filters in the UI, as the backend does not track verification statuses.

---

## 13. Exact File References

### Backend Core Implementation Files
- **Routes:**
  - [src/modules/admin/adminRoutes.ts](file:///home/owakeel/Workspace/Owakeel/carlsimpson/qbictravel_backend-main/src/modules/admin/adminRoutes.ts)
  - [src/modules/user/userRoutes.ts](file:///home/owakeel/Workspace/Owakeel/carlsimpson/qbictravel_backend-main/src/modules/user/userRoutes.ts)
  - [src/modules/auth/authRoutes.ts](file:///home/owakeel/Workspace/Owakeel/carlsimpson/qbictravel_backend-main/src/modules/auth/authRoutes.ts)
- **Controllers:**
  - [src/modules/admin/adminController.ts](file:///home/owakeel/Workspace/Owakeel/carlsimpson/qbictravel_backend-main/src/modules/admin/adminController.ts)
  - [src/modules/user/userController.ts](file:///home/owakeel/Workspace/Owakeel/carlsimpson/qbictravel_backend-main/src/modules/user/userController.ts)
  - [src/modules/auth/authController.ts](file:///home/owakeel/Workspace/Owakeel/carlsimpson/qbictravel_backend-main/src/modules/auth/authController.ts)
- **Services:**
  - [src/modules/admin/adminService.ts](file:///home/owakeel/Workspace/Owakeel/carlsimpson/qbictravel_backend-main/src/modules/admin/adminService.ts)
  - [src/modules/user/userService.ts](file:///home/owakeel/Workspace/Owakeel/carlsimpson/qbictravel_backend-main/src/modules/user/userService.ts)
  - [src/modules/auth/authService.ts](file:///home/owakeel/Workspace/Owakeel/carlsimpson/qbictravel_backend-main/src/modules/auth/authService.ts)
- **Repositories:**
  - [src/modules/admin/adminRepository.ts](file:///home/owakeel/Workspace/Owakeel/carlsimpson/qbictravel_backend-main/src/modules/admin/adminRepository.ts)
  - [src/modules/user/userRepository.ts](file:///home/owakeel/Workspace/Owakeel/carlsimpson/qbictravel_backend-main/src/modules/user/userRepository.ts)
  - [src/modules/auth/authRepository.ts](file:///home/owakeel/Workspace/Owakeel/carlsimpson/qbictravel_backend-main/src/modules/auth/authRepository.ts)
- **Validators & Schemas:**
  - [src/modules/admin/adminValidators.ts](file:///home/owakeel/Workspace/Owakeel/carlsimpson/qbictravel_backend-main/src/modules/admin/adminValidators.ts)
  - [src/modules/user/userValidators.ts](file:///home/owakeel/Workspace/Owakeel/carlsimpson/qbictravel_backend-main/src/modules/user/userValidators.ts)
  - [src/modules/auth/authValidators.ts](file:///home/owakeel/Workspace/Owakeel/carlsimpson/qbictravel_backend-main/src/modules/auth/authValidators.ts)
- **Types:**
  - [src/modules/admin/adminTypes.ts](file:///home/owakeel/Workspace/Owakeel/carlsimpson/qbictravel_backend-main/src/modules/admin/adminTypes.ts)
  - [src/modules/user/userTypes.ts](file:///home/owakeel/Workspace/Owakeel/carlsimpson/qbictravel_backend-main/src/modules/user/userTypes.ts)
  - [src/modules/auth/authTypes.ts](file:///home/owakeel/Workspace/Owakeel/carlsimpson/qbictravel_backend-main/src/modules/auth/authTypes.ts)
  - [src/types/common.ts](file:///home/owakeel/Workspace/Owakeel/carlsimpson/qbictravel_backend-main/src/types/common.ts)
- **Database Schemas & Migrations:**
  - [prisma/schema/user.prisma](file:///home/owakeel/Workspace/Owakeel/carlsimpson/qbictravel_backend-main/prisma/schema/user.prisma)
  - [prisma/schema/agent.prisma](file:///home/owakeel/Workspace/Owakeel/carlsimpson/qbictravel_backend-main/prisma/schema/agent.prisma)
  - [prisma/schema/auth.prisma](file:///home/owakeel/Workspace/Owakeel/carlsimpson/qbictravel_backend-main/prisma/schema/auth.prisma)
  - [prisma/migrations/20261010110413_add_agent_profile_models/migration.sql](file:///home/owakeel/Workspace/Owakeel/carlsimpson/qbictravel_backend-main/prisma/migrations/20261010110413_add_agent_profile_models/migration.sql)
- **Middleware & Utilities:**
  - [src/shared/middleware/authMiddleware.ts](file:///home/owakeel/Workspace/Owakeel/carlsimpson/qbictravel_backend-main/src/shared/middleware/authMiddleware.ts)
  - [src/shared/middleware/requireRole.ts](file:///home/owakeel/Workspace/Owakeel/carlsimpson/qbictravel_backend-main/src/shared/middleware/requireRole.ts)
  - [src/shared/middleware/rateLimiter.ts](file:///home/owakeel/Workspace/Owakeel/carlsimpson/qbictravel_backend-main/src/shared/middleware/rateLimiter.ts)
  - [src/shared/middleware/validate.ts](file:///home/owakeel/Workspace/Owakeel/carlsimpson/qbictravel_backend-main/src/shared/middleware/validate.ts)
  - [src/shared/utils/response.ts](file:///home/owakeel/Workspace/Owakeel/carlsimpson/qbictravel_backend-main/src/shared/utils/response.ts)
  - [src/shared/utils/mailer.ts](file:///home/owakeel/Workspace/Owakeel/carlsimpson/qbictravel_backend-main/src/shared/utils/mailer.ts)
- **Tests:**
  - [src/modules/admin/tests/integration/admin.test.ts](file:///home/owakeel/Workspace/Owakeel/carlsimpson/qbictravel_backend-main/src/modules/admin/tests/integration/admin.test.ts)
  - [src/modules/admin/tests/unit/adminService.test.ts](file:///home/owakeel/Workspace/Owakeel/carlsimpson/qbictravel_backend-main/src/modules/admin/tests/unit/adminService.test.ts)
  - [src/modules/user/tests/integration/user.test.ts](file:///home/owakeel/Workspace/Owakeel/carlsimpson/qbictravel_backend-main/src/modules/user/tests/integration/user.test.ts)
  - [src/modules/auth/tests/integration/auth.test.ts](file:///home/owakeel/Workspace/Owakeel/carlsimpson/qbictravel_backend-main/src/modules/auth/tests/integration/auth.test.ts)
  - [src/modules/auth/tests/unit/authService.test.ts](file:///home/owakeel/Workspace/Owakeel/carlsimpson/qbictravel_backend-main/src/modules/auth/tests/unit/authService.test.ts)
  - [src/shared/middleware/tests/requireRole.test.ts](file:///home/owakeel/Workspace/Owakeel/carlsimpson/qbictravel_backend-main/src/shared/middleware/tests/requireRole.test.ts)
  - [src/test/helpers.ts](file:///home/owakeel/Workspace/Owakeel/carlsimpson/qbictravel_backend-main/src/test/helpers.ts)
