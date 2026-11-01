/**
 * Admin Users Management Types
 *
 * Strictly aligned with verified backend contracts in:
 * - src/modules/admin/adminRoutes.ts
 * - src/modules/admin/adminRepository.ts (adminUserSelect)
 * - src/modules/admin/adminTypes.ts
 * - src/modules/admin/adminValidators.ts
 */

export const USER_ROLES = ["customer", "agent", "staff", "admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const USER_STATUSES = ["active", "deactivated"] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export interface AdminAgentProfile {
  agencyName: string | null;
}

export interface AdminUserRecord {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
  agentProfile: AdminAgentProfile | null;
}

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

export interface GetAdminUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  status?: UserStatus;
}

export interface CreateAdminAgentInput {
  name: string;
  email: string;
  phone?: string;
  agencyName?: string;
}

export interface CreateAdminStaffInput {
  name: string;
  email: string;
  phone?: string;
}

export interface UpdateAdminUserInput {
  userId: string;
  name?: string;
  phone?: string | null;
  status?: UserStatus;
}

export interface UpdateAdminAgentInput {
  agentId: string;
  name?: string;
  phone?: string | null;
  status?: UserStatus;
  agencyName?: string | null;
}
