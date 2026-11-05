"use client";

import * as React from "react";
import {
  Save,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Lock,
  RefreshCw,
  Mail,
  Send,
  Activity,
} from "lucide-react";
import { CustomSelect, type SelectOption } from "@/components/ui/custom-select";
import type {
  SmtpConfigSummary,
  UpdateSmtpSettingsInput,
  TestConnectionResult,
  SendTestEmailResult,
} from "../../types/admin-settings";

interface SmtpSettingsTabProps {
  initialData: SmtpConfigSummary;
  onSave: (input: UpdateSmtpSettingsInput) => Promise<void>;
  onTestConnection: () => Promise<TestConnectionResult>;
  onSendTestEmail: (recipientEmail: string) => Promise<SendTestEmailResult>;
  isLoading: boolean;
  isTesting: boolean;
  isSendingEmail: boolean;
}

const TLS_MODE_OPTIONS: SelectOption<string>[] = [
  { value: "starttls", label: "STARTTLS (Standard — Port 587)" },
  { value: "ssl", label: "SSL / TLS (Direct Secure — Port 465)" },
  { value: "none", label: "Plain / Unencrypted (Port 25 — Not recommended)" },
];

export function SmtpSettingsTab({
  initialData,
  onSave,
  onTestConnection,
  onSendTestEmail,
  isLoading,
  isTesting,
  isSendingEmail,
}: SmtpSettingsTabProps) {
  const [host, setHost] = React.useState(initialData.host);
  const [port, setPort] = React.useState(initialData.port || 587);
  const [tlsMode, setTlsMode] = React.useState(
    initialData.secure ? "ssl" : "starttls"
  );
  const [user, setUser] = React.useState(initialData.user);
  const [fromEmail, setFromEmail] = React.useState(initialData.fromEmail);
  const [fromName, setFromName] = React.useState(initialData.fromName);
  const [enabled, setEnabled] = React.useState(initialData.enabled);

  const [isReplacingPass, setIsReplacingPass] = React.useState(false);
  const [newPass, setNewPass] = React.useState("");

  const [testResult, setTestResult] = React.useState<TestConnectionResult | null>(null);

  // Send Test Email Modal State
  const [showSendModal, setShowSendModal] = React.useState(false);
  const [recipientEmail, setRecipientEmail] = React.useState("");
  const [sendResult, setSendResult] = React.useState<SendTestEmailResult | null>(null);

  const isDirty =
    host !== initialData.host ||
    port !== initialData.port ||
    (tlsMode === "ssl") !== initialData.secure ||
    user !== initialData.user ||
    fromEmail !== initialData.fromEmail ||
    fromName !== initialData.fromName ||
    enabled !== initialData.enabled ||
    (isReplacingPass && newPass.trim().length > 0);

  const handleTlsChange = (newMode: string) => {
    setTlsMode(newMode);
    if (newMode === "ssl" && port === 587) {
      setPort(465);
    } else if (newMode === "starttls" && port === 465) {
      setPort(587);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: UpdateSmtpSettingsInput = {
      host: host.trim(),
      port: Number(port),
      secure: tlsMode === "ssl",
      user: user.trim(),
      fromEmail: fromEmail.trim(),
      fromName: fromName.trim(),
      enabled,
    };
    if (isReplacingPass && newPass.trim().length > 0) {
      payload.pass = newPass.trim();
    }
    await onSave(payload);
    setIsReplacingPass(false);
    setNewPass("");
  };

  const handleTestConnection = async () => {
    try {
      const result = await onTestConnection();
      setTestResult(result);
    } catch (err: unknown) {
      const errObj = err as { data?: { message?: string }; message?: string };
      setTestResult({
        success: false,
        message: errObj?.data?.message || errObj.message || "Failed to verify SMTP server connection.",
        verifiedAt: new Date().toISOString(),
      });
    }
  };

  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientEmail.trim()) return;

    try {
      const result = await onSendTestEmail(recipientEmail.trim());
      setSendResult(result);
    } catch (err: unknown) {
      const errObj = err as { data?: { message?: string }; message?: string };
      setSendResult({
        success: false,
        message: errObj?.data?.message || errObj.message || "Failed to deliver test email.",
        recipient: recipientEmail.trim(),
      });
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-[12px] border border-[#E5EAED] bg-white p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 mb-6 border-b border-[#F0F4F6] gap-2">
            <div>
              <h3 className="font-outfit text-lg font-bold text-[#18282A] flex items-center gap-2">
                <Mail className="h-5 w-5 text-[#00A699]" /> Email Delivery & SMTP Configuration
              </h3>
              <p className="text-sm text-[#74818A]">
                Configure transactional email relay, automated staff invitations, password reset delivery, and booking confirmation notices.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {initialData.connectionStatus === "VERIFIED" ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#E8F8F5] text-[#00A699]">
                  <CheckCircle2 className="h-3.5 w-3.5" /> SMTP Verified
                </span>
              ) : initialData.connectionStatus === "FAILED" ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FFF0E6] text-[#FF5A5F]">
                  <XCircle className="h-3.5 w-3.5" /> Handshake Failed
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#F0F4F6] text-[#74818A]">
                  Unverified
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* SMTP Host */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="block text-xs font-semibold text-[#18282A] uppercase tracking-wider">
                SMTP Server Host
              </label>
              <input
                type="text"
                required
                value={host}
                onChange={(e) => setHost(e.target.value)}
                className="w-full rounded-[8px] border border-[#D5DDE2] bg-white px-3.5 py-2.5 text-sm text-[#18282A] placeholder-[#74818A] focus:border-[#00A699] focus:outline-none focus:ring-1 focus:ring-[#00A699]"
                placeholder="e.g. smtp.gmail.com or smtp.sendgrid.net"
              />
            </div>

            {/* SMTP Port */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#18282A] uppercase tracking-wider">
                Port
              </label>
              <input
                type="number"
                required
                value={port}
                onChange={(e) => setPort(Number(e.target.value))}
                className="w-full rounded-[8px] border border-[#D5DDE2] bg-white px-3.5 py-2.5 text-sm text-[#18282A] placeholder-[#74818A] focus:border-[#00A699] focus:outline-none focus:ring-1 focus:ring-[#00A699]"
                placeholder="587"
              />
            </div>

            {/* TLS Mode */}
            <div className="space-y-1.5 md:col-span-1">
              <label className="block text-xs font-semibold text-[#18282A] uppercase tracking-wider">
                Encryption Mode
              </label>
              <CustomSelect<string>
                options={TLS_MODE_OPTIONS}
                value={tlsMode}
                onChange={handleTlsChange}
              />
            </div>

            {/* SMTP Username */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="block text-xs font-semibold text-[#18282A] uppercase tracking-wider">
                SMTP Username
              </label>
              <input
                type="text"
                value={user}
                onChange={(e) => setUser(e.target.value)}
                className="w-full rounded-[8px] border border-[#D5DDE2] bg-white px-3.5 py-2.5 text-sm text-[#18282A] placeholder-[#74818A] focus:border-[#00A699] focus:outline-none focus:ring-1 focus:ring-[#00A699]"
                placeholder="e.g. apikey or user@domain.com"
              />
            </div>

            {/* Sender From Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#18282A] uppercase tracking-wider">
                Sender Name
              </label>
              <input
                type="text"
                required
                value={fromName}
                onChange={(e) => setFromName(e.target.value)}
                className="w-full rounded-[8px] border border-[#D5DDE2] bg-white px-3.5 py-2.5 text-sm text-[#18282A] placeholder-[#74818A] focus:border-[#00A699] focus:outline-none focus:ring-1 focus:ring-[#00A699]"
                placeholder="PhuketTours"
              />
            </div>

            {/* Sender From Email */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="block text-xs font-semibold text-[#18282A] uppercase tracking-wider">
                Sender Email Address
              </label>
              <input
                type="email"
                required
                value={fromEmail}
                onChange={(e) => setFromEmail(e.target.value)}
                className="w-full rounded-[8px] border border-[#D5DDE2] bg-white px-3.5 py-2.5 text-sm text-[#18282A] placeholder-[#74818A] focus:border-[#00A699] focus:outline-none focus:ring-1 focus:ring-[#00A699]"
                placeholder="noreply@phukettours.com"
              />
            </div>
          </div>

          {/* SMTP Password Section */}
          <div className="mt-6 rounded-[10px] border border-[#E5EAED] bg-[#F8FAFB] p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
              <div>
                <h4 className="font-outfit text-sm font-bold text-[#18282A] flex items-center gap-1.5">
                  <Lock className="h-4 w-4 text-[#00A699]" /> SMTP Password / API Key (Encrypted at Rest)
                </h4>
                <p className="text-xs text-[#74818A] mt-0.5">
                  Securely stored using AES-256-GCM authenticated encryption. Never returned in plain text to the dashboard.
                </p>
              </div>
              {initialData.hasPass && !isReplacingPass && (
                <button
                  type="button"
                  onClick={() => setIsReplacingPass(true)}
                  className="inline-flex items-center gap-1.5 rounded-[6px] border border-[#D5DDE2] bg-white px-3 py-1.5 text-xs font-semibold text-[#18282A] hover:bg-[#F0F4F6] transition-colors"
                >
                  Replace Password
                </button>
              )}
            </div>

            {isReplacingPass ? (
              <div className="space-y-2 mt-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-[#18282A]">
                    Enter New SMTP Password:
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsReplacingPass(false);
                      setNewPass("");
                    }}
                    className="text-xs font-medium text-[#74818A] hover:text-[#18282A]"
                  >
                    Cancel Replacement
                  </button>
                </div>
                <input
                  type="password"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  placeholder="Enter SMTP password or app password"
                  className="w-full rounded-[8px] border border-[#D5DDE2] bg-white px-3.5 py-2.5 text-sm text-[#18282A] placeholder-[#74818A] focus:border-[#00A699] focus:outline-none focus:ring-1 focus:ring-[#00A699]"
                />
              </div>
            ) : initialData.hasPass ? (
              <div className="flex items-center gap-3 mt-2">
                <span className="font-mono text-xs bg-white border border-[#D5DDE2] rounded px-3 py-2 text-[#484848] select-none">
                  {initialData.maskedPass}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-[#00A699] font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Password Encrypted & Active
                </span>
              </div>
            ) : (
              <div className="space-y-2 mt-3">
                <p className="text-xs text-[#74818A]">No SMTP password is currently configured.</p>
                <input
                  type="password"
                  value={newPass}
                  onChange={(e) => {
                    setIsReplacingPass(true);
                    setNewPass(e.target.value);
                  }}
                  placeholder="Enter SMTP password"
                  className="w-full rounded-[8px] border border-[#D5DDE2] bg-white px-3.5 py-2.5 text-sm text-[#18282A] placeholder-[#74818A] focus:border-[#00A699] focus:outline-none focus:ring-1 focus:ring-[#00A699]"
                />
              </div>
            )}
          </div>

          {/* Test Connection Result Banner */}
          {testResult && (
            <div
              className={`mt-6 rounded-[10px] p-4 text-xs ${
                testResult.success
                  ? "bg-[#E8F8F5] border border-[#A2E2D8] text-[#006A62]"
                  : "bg-[#FFF0E6] border border-[#FFC7A8] text-[#9B2C2C]"
              }`}
            >
              <div className="flex items-center gap-2 font-semibold">
                {testResult.success ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                {testResult.message}
              </div>
            </div>
          )}

          {/* Enable / Disable Delivery Toggle */}
          <div className="mt-6 flex items-center justify-between rounded-[10px] border border-[#E5EAED] bg-[#F8FAFB] p-5">
            <div>
              <h4 className="font-outfit text-sm font-bold text-[#18282A]">
                Enable Outbound Email Delivery
              </h4>
              <p className="mt-1 text-xs text-[#74818A]">
                Controls whether system emails are dispatched to real mailboxes via this SMTP server.
              </p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="peer sr-only"
              />
              <div className="h-6 w-11 rounded-full bg-[#D5DDE2] peer-checked:bg-[#00A699] peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full"></div>
            </label>
          </div>

          {/* Action Toolbar */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#F0F4F6] pt-5">
            <div className="flex items-center gap-2 text-xs">
              {isDirty ? (
                <span className="inline-flex items-center gap-1.5 font-medium text-[#D97706]">
                  <AlertCircle className="h-4 w-4" /> You have unsaved SMTP changes
                </span>
              ) : (
                <span className="text-[#74818A]">SMTP configuration is up to date.</span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting || isLoading || !initialData.host}
                className="inline-flex items-center justify-center gap-1.5 rounded-[8px] border border-[#D5DDE2] bg-white px-3.5 py-2.5 text-xs font-semibold text-[#18282A] hover:bg-[#F8FAFB] transition-colors disabled:opacity-50"
              >
                {isTesting ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Verifying...
                  </>
                ) : (
                  <>
                    <Activity className="h-3.5 w-3.5 text-[#00A699]" /> Test Connection
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowSendModal(true);
                  setSendResult(null);
                }}
                disabled={!initialData.host}
                className="inline-flex items-center justify-center gap-1.5 rounded-[8px] border border-[#D5DDE2] bg-white px-3.5 py-2.5 text-xs font-semibold text-[#18282A] hover:bg-[#F8FAFB] transition-colors disabled:opacity-50"
              >
                <Send className="h-3.5 w-3.5 text-[#0066CC]" /> Send Test Email
              </button>

              <button
                type="submit"
                disabled={isLoading || !isDirty}
                className="inline-flex items-center justify-center gap-2 rounded-[8px] bg-[#00A699] px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#008f84] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-3.5 w-3.5" /> Save SMTP Settings
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Send Test Email Modal */}
      {showSendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-[12px] bg-white p-6 shadow-xl animate-in fade-in zoom-in-95">
            <h3 className="font-outfit text-lg font-bold text-[#18282A] mb-1">
              Send Test Email
            </h3>
            <p className="text-xs text-[#74818A] mb-4">
              Dispatches an immediate diagnostic email to verify real end-to-end SMTP mail server delivery.
            </p>

            <form onSubmit={handleSendTestEmail} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#18282A] mb-1">
                  Recipient Email Address
                </label>
                <input
                  type="email"
                  required
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="admin@yourdomain.com"
                  className="w-full rounded-[8px] border border-[#D5DDE2] bg-white px-3.5 py-2 text-sm text-[#18282A] focus:border-[#00A699] focus:outline-none"
                />
              </div>

              {sendResult && (
                <div
                  className={`rounded-[8px] p-3 text-xs ${
                    sendResult.success
                      ? "bg-[#E8F8F5] text-[#006A62] border border-[#A2E2D8]"
                      : "bg-[#FFF0E6] text-[#9B2C2C] border border-[#FFC7A8]"
                  }`}
                >
                  <p className="font-semibold">{sendResult.message}</p>
                  {sendResult.messageId && (
                    <p className="mt-1 font-mono text-[10px] text-[#74818A]">
                      Message ID: {sendResult.messageId}
                    </p>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-2.5 pt-3 border-t border-[#F0F4F6]">
                <button
                  type="button"
                  onClick={() => setShowSendModal(false)}
                  className="rounded-[8px] border border-[#D5DDE2] bg-white px-3.5 py-2 text-xs font-semibold text-[#484848] hover:bg-[#F8FAFB]"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={isSendingEmail || !recipientEmail.trim()}
                  className="inline-flex items-center gap-1.5 rounded-[8px] bg-[#00A699] px-4 py-2 text-xs font-semibold text-white hover:bg-[#008f84] disabled:opacity-50"
                >
                  {isSendingEmail ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" /> Dispatch Test Email
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
