/**
 * Admin Permissions Management Types
 *
 * Strictly typed against verified backend contracts in:
 * - src/modules/permission/permissionConstants.ts
 * - src/modules/permission/permissionTypes.ts
 * - src/modules/permission/permissionRoutes.ts
 */

export const SUPPORTED_PERMISSION_IDS = [
  // Dashboard
  "dashboard.view",
  // Tours
  "tours.view",
  "tours.create",
  "tours.edit",
  // Bookings
  "bookings.view",
  "bookings.assign",
  "bookings.update_status",
  "bookings.approve_price",
  // Users
  "users.view",
  "users.edit",
  "users.invite_staff",
  "users.invite_agent",
  "users.deactivate",
  "users.delete",
  // Payments
  "payments.view",
  "payments.verify",
  "payments.record",
  // Media
  "media.view",
  "media.upload",
  "media.delete",
  // Reports
  "reports.view",
  // Settings
  "settings.view",
  "settings.general.manage",
  "settings.payment.manage",
  "settings.webhook.manage",
  "settings.cloudinary.manage",
  "settings.smtp.manage",
  "settings.audit.view",
] as const;

export type PermissionId = (typeof SUPPORTED_PERMISSION_IDS)[number];

export interface PermissionDefinition {
  id: PermissionId;
  name: string;
  module: string;
  description: string;
}

export interface PermissionModuleGroup {
  module: string;
  permissions: PermissionDefinition[];
}

export interface PermissionCatalogData {
  modules: PermissionModuleGroup[];
  totalPermissions: number;
}

export interface StaffPermissionsData {
  staffId: string;
  staffName: string;
  staffEmail: string;
  permissions: string[];
}

export interface UpdateStaffPermissionsInput {
  staffId: string;
  permissions: string[];
}

export interface EffectivePermissionsData {
  userId: string;
  role: string;
  isAdmin: boolean;
  permissions: string[];
}

export type AdminPermissionsCatalogResponse = {
  success: boolean;
  message?: string;
  data: PermissionCatalogData;
};

export type StaffPermissionsResponse = {
  success: boolean;
  message?: string;
  data: StaffPermissionsData;
};

export type EffectivePermissionsResponse = {
  success: boolean;
  message?: string;
  data: EffectivePermissionsData;
};
