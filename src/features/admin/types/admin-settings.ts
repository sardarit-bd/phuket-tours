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
  defaultCurrency?: string;
  timezone: string;
  defaultLanguage: string;
  maintenanceMode: boolean;
  isCustomized: boolean;
}

export interface StripePaymentConfigSummary {
  enabled: boolean;
  environment: "sandbox" | "live";
  publishableKey: string;
  hasSecretKey: boolean;
  maskedSecretKey: string;
  hasWebhookSecret: boolean;
  maskedWebhookSecret: string;
  configured: boolean;
  source: "database" | "environment" | "none";
}

export interface PayPalPaymentConfigSummary {
  enabled: boolean;
  environment: "sandbox" | "live";
  clientId: string;
  hasClientSecret: boolean;
  maskedClientSecret: string;
  webhookId: string;
  configured: boolean;
  source: "database" | "environment" | "none";
}

export interface PaymentGatewaySummary {
  activeProvider: "stripe" | "paypal";
  providerName: string;
  enabled: boolean;
  environment: "sandbox" | "live";
  publishableKey: string;
  hasSecretKey: boolean;
  maskedSecretKey: string;
  merchantId: string;
  stripe?: StripePaymentConfigSummary;
  paypal?: PayPalPaymentConfigSummary;
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
  activeProvider?: "stripe" | "paypal";
  providerName?: string;
  enabled?: boolean;
  environment?: "sandbox" | "live";
  confirmLiveMode?: boolean;
  publishableKey?: string;
  secretKey?: string;
  merchantId?: string;

  stripe?: {
    enabled?: boolean;
    environment?: "sandbox" | "live";
    publishableKey?: string;
    secretKey?: string;
    webhookSecret?: string;
  };
  paypal?: {
    enabled?: boolean;
    environment?: "sandbox" | "live";
    clientId?: string;
    clientSecret?: string;
    webhookId?: string;
  };
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
