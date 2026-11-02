"use client";

import * as React from "react";
import {
  Save,
  Copy,
  Check,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Lock,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import type {
  WebhookConfigSummary,
  UpdateWebhookSettingsInput,
} from "../../types/admin-settings";

interface WebhookSettingsTabProps {
  initialData: WebhookConfigSummary;
  onSave: (input: UpdateWebhookSettingsInput) => Promise<void>;
  isLoading: boolean;
}

export function WebhookSettingsTab({
  initialData,
  onSave,
  isLoading,
}: WebhookSettingsTabProps) {
  const [enabled, setEnabled] = React.useState(initialData.enabled);
  const [isReplacingSecret, setIsReplacingSecret] = React.useState(false);
  const [newSigningSecret, setNewSigningSecret] = React.useState("");
  const [copied, setCopied] = React.useState(false);

  const isDirty =
    enabled !== initialData.enabled ||
    (isReplacingSecret && newSigningSecret.trim().length > 0);

  const handleCopyEndpoint = async () => {
    try {
      await navigator.clipboard.writeText(initialData.endpointUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: UpdateWebhookSettingsInput = {
      enabled,
    };
    if (isReplacingSecret && newSigningSecret.trim().length > 0) {
      payload.signingSecret = newSigningSecret.trim();
    }
    await onSave(payload);
    setIsReplacingSecret(false);
    setNewSigningSecret("");
  };

  const formatDateTime = (dateStr: string | null) => {
    if (!dateStr) return "Never";
    try {
      return new Date(dateStr).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-[12px] border border-[#E5EAED] bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 mb-6 border-b border-[#F0F4F6] gap-2">
          <div>
            <h3 className="font-outfit text-lg font-bold text-[#18282A]">
              Payment Webhook & Asynchronous Event Processing
            </h3>
            <p className="text-sm text-[#74818A]">
              Configure payment provider webhook callbacks, cryptographic HMAC SHA-256 signature verification, and event idempotency.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {initialData.lastEventStatus === "VERIFIED" ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#E8F8F5] text-[#00A699]">
                <CheckCircle2 className="h-3.5 w-3.5" /> Signature Verified
              </span>
            ) : initialData.lastEventStatus?.includes("FAILED") ||
              initialData.lastEventStatus?.includes("REJECTED") ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FFF0E6] text-[#FF5A5F]">
                <XCircle className="h-3.5 w-3.5" /> Verification Failed
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#F0F4F6] text-[#74818A]">
                Pending Inbound Events
              </span>
            )}
          </div>
        </div>

        {/* Read-Only Webhook Endpoint URL with Copy */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-[#18282A] uppercase tracking-wider">
            Generated Public Webhook Endpoint URL
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={initialData.endpointUrl}
              className="w-full rounded-[8px] border border-[#D5DDE2] bg-[#F8FAFB] px-3.5 py-2.5 font-mono text-xs text-[#18282A] select-all focus:outline-none"
            />
            <button
              type="button"
              onClick={handleCopyEndpoint}
              className="inline-flex items-center gap-1.5 rounded-[8px] border border-[#D5DDE2] bg-white px-4 py-2.5 text-xs font-semibold text-[#18282A] hover:bg-[#F0F4F6] transition-colors shrink-0"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-[#00A699]" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-[#74818A]" /> Copy URL
                </>
              )}
            </button>
          </div>
          <p className="text-xs text-[#74818A] flex items-center gap-1.5 pt-1">
            <ExternalLink className="h-3.5 w-3.5 text-[#00A699]" />
            Configure this exact URL in your payment gateway dashboard (e.g. Stripe Webhooks / Omise Webhooks) to receive automated payment events.
          </p>
        </div>

        {/* Webhook Signing Secret */}
        <div className="mt-6 rounded-[10px] border border-[#E5EAED] bg-[#F8FAFB] p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
            <div>
              <h4 className="font-outfit text-sm font-bold text-[#18282A] flex items-center gap-1.5">
                <Lock className="h-4 w-4 text-[#00A699]" /> Webhook Signing Secret (HMAC-SHA256)
              </h4>
              <p className="text-xs text-[#74818A] mt-0.5">
                Used to cryptographically verify inbound webhook signatures. Payloads without valid signatures will be rejected with HTTP 401.
              </p>
            </div>
            {initialData.hasSigningSecret && !isReplacingSecret && (
              <button
                type="button"
                onClick={() => setIsReplacingSecret(true)}
                className="inline-flex items-center gap-1.5 rounded-[6px] border border-[#D5DDE2] bg-white px-3 py-1.5 text-xs font-semibold text-[#18282A] hover:bg-[#F0F4F6] transition-colors"
              >
                Replace Secret
              </button>
            )}
          </div>

          {isReplacingSecret ? (
            <div className="space-y-2 mt-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-[#18282A]">
                  Enter New Webhook Signing Secret:
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsReplacingSecret(false);
                    setNewSigningSecret("");
                  }}
                  className="text-xs font-medium text-[#74818A] hover:text-[#18282A]"
                >
                  Cancel Replacement
                </button>
              </div>
              <input
                type="password"
                value={newSigningSecret}
                onChange={(e) => setNewSigningSecret(e.target.value)}
                placeholder="whsec_... or gateway signing secret"
                className="w-full rounded-[8px] border border-[#D5DDE2] bg-white px-3.5 py-2.5 text-sm text-[#18282A] placeholder-[#74818A] focus:border-[#00A699] focus:outline-none focus:ring-1 focus:ring-[#00A699]"
              />
            </div>
          ) : initialData.hasSigningSecret ? (
            <div className="flex items-center gap-3 mt-2">
              <span className="font-mono text-xs bg-white border border-[#D5DDE2] rounded px-3 py-2 text-[#484848] select-none">
                {initialData.maskedSigningSecret}
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-[#00A699] font-medium">
                <ShieldCheck className="h-3.5 w-3.5" /> Secret Configured & Encrypted
              </span>
            </div>
          ) : (
            <div className="space-y-2 mt-3">
              <p className="text-xs text-[#74818A]">No webhook signing secret is currently configured.</p>
              <input
                type="password"
                value={newSigningSecret}
                onChange={(e) => {
                  setIsReplacingSecret(true);
                  setNewSigningSecret(e.target.value);
                }}
                placeholder="Enter webhook secret (e.g. whsec_...)"
                className="w-full rounded-[8px] border border-[#D5DDE2] bg-white px-3.5 py-2.5 text-sm text-[#18282A] placeholder-[#74818A] focus:border-[#00A699] focus:outline-none focus:ring-1 focus:ring-[#00A699]"
              />
            </div>
          )}
        </div>

        {/* Inbound Event Verification Status Panel */}
        <div className="mt-6 rounded-[10px] border border-[#E5EAED] bg-white p-5">
          <h4 className="font-outfit text-sm font-bold text-[#18282A] mb-4">
            Recent Inbound Webhook Activity
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-[8px] bg-[#F8FAFB] p-3.5 border border-[#E5EAED]">
              <span className="text-[11px] font-semibold text-[#74818A] uppercase tracking-wider block">
                Last Received Event
              </span>
              <span className="mt-1 text-xs font-semibold text-[#18282A] block font-mono">
                {initialData.lastEventType || "No events recorded"}
              </span>
              <span className="text-[11px] text-[#74818A] block mt-0.5">
                {formatDateTime(initialData.lastEventAt)}
              </span>
            </div>

            <div className="rounded-[8px] bg-[#F8FAFB] p-3.5 border border-[#E5EAED]">
              <span className="text-[11px] font-semibold text-[#74818A] uppercase tracking-wider block">
                Last Successful Verification
              </span>
              <span className="mt-1 text-xs font-semibold text-[#00A699] block font-mono">
                {initialData.lastVerifiedAt ? "Verified Cryptographically" : "No verified events"}
              </span>
              <span className="text-[11px] text-[#74818A] block mt-0.5">
                {formatDateTime(initialData.lastVerifiedAt)}
              </span>
            </div>

            <div className="rounded-[8px] bg-[#F8FAFB] p-3.5 border border-[#E5EAED]">
              <span className="text-[11px] font-semibold text-[#74818A] uppercase tracking-wider block">
                Security Status
              </span>
              <span className="mt-1 text-xs font-semibold text-[#18282A] block">
                {initialData.lastEventStatus || "READY"}
              </span>
              <span className="text-[11px] text-[#74818A] block mt-0.5">
                Constant-time HMAC comparison
              </span>
            </div>
          </div>
        </div>

        {/* Enable / Disable Webhooks Toggle */}
        <div className="mt-6 flex items-center justify-between rounded-[10px] border border-[#E5EAED] bg-[#F8FAFB] p-5">
          <div>
            <h4 className="font-outfit text-sm font-bold text-[#18282A]">
              Enable Webhook Processing
            </h4>
            <p className="mt-1 text-xs text-[#74818A]">
              When enabled, incoming HTTP callbacks from the payment gateway are automatically processed and verified.
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
                <AlertCircle className="h-4 w-4" /> You have unsaved webhook changes
              </span>
            ) : (
              <span className="text-[#74818A]">Webhook configuration is up to date.</span>
            )}
          </div>
          <button
            type="submit"
            disabled={isLoading || !isDirty}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-[8px] bg-[#00A699] px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#008f84] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" /> Save Webhook Settings
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
