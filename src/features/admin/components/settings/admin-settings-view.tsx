"use client";

import * as React from "react";
import {
  Sliders,
  CreditCard,
  Webhook,
  Cloud,
  Mail,
  ShieldCheck,
  RotateCcw,
  AlertCircle,
  User,
} from "lucide-react";
import { ErrorAlert, SuccessAlert } from "@/components/ui/alert";
import { formatErrorMessage } from "@/features/auth/utils/error-mapper";
import {
  useGetAdminSettingsQuery,
  useUpdateAdminGeneralSettingsMutation,
  useUpdateAdminPaymentSettingsMutation,
  useUpdateAdminWebhookSettingsMutation,
  useUpdateAdminCloudinarySettingsMutation,
  useTestAdminCloudinaryConnectionMutation,
  useUpdateAdminSmtpSettingsMutation,
  useTestAdminSmtpConnectionMutation,
  useSendAdminTestEmailMutation,
  useGetAdminSettingAuditLogsQuery,
} from "../../api/admin-api";
import { GeneralSettingsTab } from "./general-settings-tab";
import { PaymentSettingsTab } from "./payment-settings-tab";
import { WebhookSettingsTab } from "./webhook-settings-tab";
import { CloudinarySettingsTab } from "./cloudinary-settings-tab";
import { SmtpSettingsTab } from "./smtp-settings-tab";
import { SettingsAuditLogsTab } from "./settings-audit-logs-tab";
import { AdminProfileSettings } from "./admin-profile-settings";
import type {
  UpdateGeneralSettingsInput,
  UpdatePaymentSettingsInput,
  UpdateWebhookSettingsInput,
  UpdateCloudinarySettingsInput,
  UpdateSmtpSettingsInput,
  GetSettingAuditLogsParams,
} from "../../types/admin-settings";

type SettingsTab =
  | "profile"
  | "general"
  | "payment"
  | "webhook"
  | "cloudinary"
  | "smtp"
  | "audit";

interface TabItem {
  id: SettingsTab;
  label: string;
  description: string;
  icon: React.ElementType;
}

const SETTINGS_TABS: TabItem[] = [
  {
    id: "profile",
    label: "Profile",
    description: "Your account name, contact details & role",
    icon: User,
  },
  {
    id: "general",
    label: "General Settings",
    description: "Brand identity, support contacts & localization",
    icon: Sliders,
  },
  {
    id: "payment",
    label: "Payment Gateway",
    description: "Sandbox/Live gateways & merchant keys",
    icon: CreditCard,
  },
  {
    id: "webhook",
    label: "Webhook Configuration",
    description: "Inbound HMAC signatures & event endpoints",
    icon: Webhook,
  },
  {
    id: "cloudinary",
    label: "Cloudinary Settings",
    description: "Media storage credentials & upload policies",
    icon: Cloud,
  },
  {
    id: "smtp",
    label: "Email & SMTP",
    description: "Outbound relay, templates & connection test",
    icon: Mail,
  },
  {
    id: "audit",
    label: "Security & Audit Logs",
    description: "Configuration change trail & actor logs",
    icon: ShieldCheck,
  },
];

interface ActionFeedback {
  type: "success" | "error";
  message: string;
}

export function AdminSettingsView() {
  const [activeTab, setActiveTab] = React.useState<SettingsTab>("general");
  const [feedback, setFeedback] = React.useState<ActionFeedback | null>(null);

  // Auto-dismiss feedback
  React.useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(null), 6000);
    return () => clearTimeout(timer);
  }, [feedback]);

  // Settings Queries & Mutations
  const {
    data: settingsResponse,
    isLoading: isSettingsLoading,
    isError: isSettingsError,
    error: settingsError,
    refetch: refetchSettings,
  } = useGetAdminSettingsQuery();

  const [updateGeneral, { isLoading: isUpdatingGeneral }] =
    useUpdateAdminGeneralSettingsMutation();
  const [updatePayment, { isLoading: isUpdatingPayment }] =
    useUpdateAdminPaymentSettingsMutation();
  const [updateWebhook, { isLoading: isUpdatingWebhook }] =
    useUpdateAdminWebhookSettingsMutation();
  const [updateCloudinary, { isLoading: isUpdatingCloudinary }] =
    useUpdateAdminCloudinarySettingsMutation();
  const [testCloudinary, { isLoading: isTestingCloudinary }] =
    useTestAdminCloudinaryConnectionMutation();
  const [updateSmtp, { isLoading: isUpdatingSmtp }] =
    useUpdateAdminSmtpSettingsMutation();
  const [testSmtp, { isLoading: isTestingSmtp }] =
    useTestAdminSmtpConnectionMutation();
  const [sendTestEmail, { isLoading: isSendingEmail }] =
    useSendAdminTestEmailMutation();

  // Audit Logs Query State
  const [auditParams, setAuditParams] = React.useState<GetSettingAuditLogsParams>({
    page: 1,
    limit: 10,
    category: "ALL",
    status: "ALL",
  });

  const {
    data: auditResponse,
    isLoading: isAuditLoading,
    refetch: refetchAudit,
  } = useGetAdminSettingAuditLogsQuery(auditParams);

  const settingsOverview = settingsResponse?.data;

  // Handlers for tab actions
  const handleSaveGeneral = async (input: UpdateGeneralSettingsInput) => {
    try {
      await updateGeneral(input).unwrap();
      setFeedback({
        type: "success",
        message: "General platform settings saved and applied successfully.",
      });
    } catch (err: unknown) {
      setFeedback({
        type: "error",
        message: formatErrorMessage(err, {
          context: "admin",
          fallback: "Failed to update general settings.",
        }),
      });
    }
  };

  const handleSavePayment = async (input: UpdatePaymentSettingsInput) => {
    try {
      await updatePayment(input).unwrap();
      setFeedback({
        type: "success",
        message: "Payment gateway credentials saved and active at runtime.",
      });
    } catch (err: unknown) {
      setFeedback({
        type: "error",
        message: formatErrorMessage(err, {
          context: "payment",
          fallback: "Failed to update payment settings.",
        }),
      });
    }
  };

  const handleSaveWebhook = async (input: UpdateWebhookSettingsInput) => {
    try {
      await updateWebhook(input).unwrap();
      setFeedback({
        type: "success",
        message: "Webhook configuration saved successfully.",
      });
    } catch (err: unknown) {
      setFeedback({
        type: "error",
        message: formatErrorMessage(err, {
          context: "admin",
          fallback: "Failed to update webhook settings.",
        }),
      });
    }
  };

  const handleSaveCloudinary = async (input: UpdateCloudinarySettingsInput) => {
    try {
      await updateCloudinary(input).unwrap();
      setFeedback({
        type: "success",
        message: "Cloudinary settings persisted and applied to media operations.",
      });
    } catch (err: unknown) {
      setFeedback({
        type: "error",
        message: formatErrorMessage(err, {
          context: "admin",
          fallback: "Failed to update Cloudinary settings.",
        }),
      });
    }
  };

  const handleTestCloudinary = async () => {
    const res = await testCloudinary().unwrap();
    if (res.data?.success) {
      setFeedback({
        type: "success",
        message: res.data.message || "Cloudinary connection verified successfully.",
      });
    }
    return res.data;
  };

  const handleSaveSmtp = async (input: UpdateSmtpSettingsInput) => {
    try {
      await updateSmtp(input).unwrap();
      setFeedback({
        type: "success",
        message: "Email & SMTP configuration updated successfully.",
      });
    } catch (err: unknown) {
      setFeedback({
        type: "error",
        message: formatErrorMessage(err, {
          context: "admin",
          fallback: "Failed to update SMTP settings.",
        }),
      });
    }
  };

  const handleTestSmtp = async () => {
    const res = await testSmtp().unwrap();
    if (res.data?.success) {
      setFeedback({
        type: "success",
        message: res.data.message || "SMTP connection handshake succeeded.",
      });
    }
    return res.data;
  };

  const handleSendTestEmail = async (recipientEmail: string) => {
    const res = await sendTestEmail({ recipientEmail }).unwrap();
    if (res.data?.success) {
      setFeedback({
        type: "success",
        message: `Test email successfully dispatched to ${recipientEmail}.`,
      });
    }
    return res.data;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-outfit text-2xl font-bold tracking-tight text-[#18282A]">
            System Settings & Security Center
          </h2>
          <p className="mt-1 text-sm text-[#74818A]">
            Manage platform identity, payment credentials, webhook secrets, Cloudinary storage, SMTP relay, and audit history.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            refetchSettings();
            refetchAudit();
          }}
          className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-[8px] border border-[#D5DDE2] bg-white px-3.5 py-2 text-xs font-semibold text-[#18282A] hover:bg-[#F8FAFB] transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Reload Config
        </button>
      </div>

      {/* Global Feedback Banner */}
      {feedback && (
        feedback.type === "success" ? (
          <SuccessAlert
            description={feedback.message}
            onDismiss={() => setFeedback(null)}
          />
        ) : (
          <ErrorAlert
            description={feedback.message}
            onDismiss={() => setFeedback(null)}
          />
        )
      )}

      {/* Navigation Tabs Bar */}
      <div className="border-b border-[#E5EAED] bg-white rounded-t-[12px] px-2 shadow-xs">
        <nav className="flex space-x-1 sm:space-x-4 overflow-x-auto py-2 no-scrollbar">
          {SETTINGS_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-[8px] text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-[#E8F8F5] text-[#00A699] shadow-xs"
                    : "text-[#74818A] hover:text-[#18282A] hover:bg-[#F8FAFB]"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-[#00A699]" : "text-[#74818A]"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Tab Content */}
      {activeTab === "profile" ? (
        <AdminProfileSettings />
      ) : isSettingsLoading ? (
        <div className="rounded-[12px] border border-[#E5EAED] bg-white p-12 text-center">
          <RotateCcw className="h-6 w-6 animate-spin mx-auto text-[#00A699] mb-3" />
          <p className="font-outfit text-sm font-semibold text-[#18282A]">
            Loading System Configuration...
          </p>
          <p className="text-xs text-[#74818A] mt-1">
            Retrieving settings summaries and encrypted credentials status.
          </p>
        </div>
      ) : isSettingsError || !settingsOverview ? (
        <div className="rounded-[12px] border border-destructive/20 bg-destructive/10 p-8 text-center">
          <AlertCircle className="h-6 w-6 mx-auto text-destructive mb-2" />
          <p className="font-outfit text-sm font-bold text-destructive">
            Failed to Load System Settings
          </p>
          <p className="text-xs text-destructive/80 mt-1">
            {formatErrorMessage(settingsError, {
              context: "admin",
              fallback: "Please ensure you have authorized administrator permissions.",
            })}
          </p>
          <button
            type="button"
            onClick={() => refetchSettings()}
            className="mt-4 rounded-[8px] bg-[#00A699] px-4 py-2 text-xs font-semibold text-white hover:bg-[#008f84]"
          >
            Retry
          </button>
        </div>
      ) : (
        <div>
          {activeTab === "general" && (
            <GeneralSettingsTab
              key={`gen-${settingsOverview.general.platformName}-${settingsOverview.general.supportEmail}`}
              initialData={settingsOverview.general}
              onSave={handleSaveGeneral}
              isLoading={isUpdatingGeneral}
            />
          )}

          {activeTab === "payment" && (
            <PaymentSettingsTab
              key={`pay-${settingsOverview.payment.providerName}-${settingsOverview.payment.environment}`}
              initialData={settingsOverview.payment}
              onSave={handleSavePayment}
              isLoading={isUpdatingPayment}
            />
          )}

          {activeTab === "webhook" && (
            <WebhookSettingsTab
              key={`wh-${settingsOverview.webhook.endpointUrl}-${settingsOverview.webhook.enabled}`}
              initialData={settingsOverview.webhook}
              onSave={handleSaveWebhook}
              isLoading={isUpdatingWebhook}
            />
          )}

          {activeTab === "cloudinary" && (
            <CloudinarySettingsTab
              key={`cld-${settingsOverview.cloudinary.cloudName}-${settingsOverview.cloudinary.apiKey}`}
              initialData={settingsOverview.cloudinary}
              onSave={handleSaveCloudinary}
              onTestConnection={handleTestCloudinary}
              isLoading={isUpdatingCloudinary}
              isTesting={isTestingCloudinary}
            />
          )}

          {activeTab === "smtp" && (
            <SmtpSettingsTab
              key={`smtp-${settingsOverview.smtp.host}-${settingsOverview.smtp.port}`}
              initialData={settingsOverview.smtp}
              onSave={handleSaveSmtp}
              onTestConnection={handleTestSmtp}
              onSendTestEmail={handleSendTestEmail}
              isLoading={isUpdatingSmtp}
              isTesting={isTestingSmtp}
              isSendingEmail={isSendingEmail}
            />
          )}

          {activeTab === "audit" && (
            <SettingsAuditLogsTab
              data={auditResponse?.data}
              isLoading={isAuditLoading}
              queryParams={auditParams}
              onFilterChange={(newFilters) =>
                setAuditParams((prev) => ({ ...prev, ...newFilters }))
              }
              onRefresh={refetchAudit}
            />
          )}
        </div>
      )}
    </div>
  );
}
