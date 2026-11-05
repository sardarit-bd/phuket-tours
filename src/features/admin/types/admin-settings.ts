/**
 * Admin System Settings Types
 *
 * Strictly matched against backend contracts in:
 * - src/modules/setting/settingTypes.ts
 * - src/modules/setting/settingRoutes.ts
 */

export interface GeneralSettingsSummary {
  platformName: string;
  supportEmail: string;
  supportPhone: string;
  defaultCurrency: string;
  timezone: string;
  defaultLanguage: string;
  maintenanceMode: boolean;
  isCustomized: boolean;
}

export interface PaymentGatewaySummary {
  providerName: string;
  enabled: boolean;
  environment: "sandbox" | "live";
  publishableKey: string;
  hasSecretKey: boolean;
  maskedSecretKey: string;
  merchantId: string;
  isCustomized: boolean;
}

export interface WebhookConfigSummary {
  endpointUrl: string;
  hasSigningSecret: boolean;
  maskedSigningSecret: string;
  enabled: boolean;
  lastEventAt: string | null;
  lastEventType: string | null;
  lastVerifiedAt: string | null;
  lastEventStatus: string | null;
  isCustomized: boolean;
}

export interface CloudinaryConfigSummary {
  cloudName: string;
  apiKey: string;
  hasApiSecret: boolean;
  maskedApiSecret: string;
  folder: string;
  maxFileSizeBytes: number;
  allowedFormats: string[];
  connectionStatus: "VERIFIED" | "FAILED" | "NOT_CONFIGURED";
  lastVerifiedAt: string | null;
  isCustomized: boolean;
}

export interface SmtpConfigSummary {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  hasPass: boolean;
  maskedPass: string;
  fromEmail: string;
  fromName: string;
  enabled: boolean;
  connectionStatus: "VERIFIED" | "FAILED" | "NOT_CONFIGURED";
  lastVerifiedAt: string | null;
  isCustomized: boolean;
}

export interface SystemSettingsOverview {
  general: GeneralSettingsSummary;
  payment: PaymentGatewaySummary;
  webhook: WebhookConfigSummary;
  cloudinary: CloudinaryConfigSummary;
  smtp: SmtpConfigSummary;
  serverTime: string;
}

export interface SettingAuditLogItem {
  id: string;
  category: "GENERAL" | "PAYMENT" | "WEBHOOK" | "CLOUDINARY" | "SMTP" | "SECURITY";
  action: string;
  actorId: string | null;
  actorName: string | null;
  actorEmail: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  status: "SUCCESS" | "FAILED";
  errorMessage: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface SettingAuditLogsPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SettingAuditLogsResponse {
  logs: SettingAuditLogItem[];
  pagination: SettingAuditLogsPagination;
}

export interface UpdateGeneralSettingsInput {
  platformName?: string;
  supportEmail?: string;
  supportPhone?: string;
  defaultCurrency?: string;
  timezone?: string;
  defaultLanguage?: string;
  maintenanceMode?: boolean;
}

export interface UpdatePaymentSettingsInput {
  providerName?: string;
  enabled?: boolean;
  environment?: "sandbox" | "live";
  confirmLiveMode?: boolean;
  publishableKey?: string;
  secretKey?: string;
  merchantId?: string;
}

export interface UpdateWebhookSettingsInput {
  signingSecret?: string;
  enabled?: boolean;
}

export interface UpdateCloudinarySettingsInput {
  cloudName?: string;
  apiKey?: string;
  apiSecret?: string;
  folder?: string;
  maxFileSizeBytes?: number;
  allowedFormats?: string[];
}

export interface UpdateSmtpSettingsInput {
  host?: string;
  port?: number;
  secure?: boolean;
  user?: string;
  pass?: string;
  fromEmail?: string;
  fromName?: string;
  enabled?: boolean;
}

export interface TestConnectionResult {
  success: boolean;
  message: string;
  verifiedAt: string;
  details?: Record<string, unknown>;
}

export interface SendTestEmailInput {
  recipientEmail: string;
}

export interface SendTestEmailResult {
  success: boolean;
  message: string;
  messageId?: string;
  recipient: string;
}

export interface GetSettingAuditLogsParams {
  category?: string;
  actorId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}
