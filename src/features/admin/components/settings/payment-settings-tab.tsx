"use client";

import * as React from "react";
import {
  Save,
  AlertTriangle,
  CheckCircle2,
  Lock,
  KeyRound,
  RefreshCw,
  AlertCircle,
  ShieldAlert,
} from "lucide-react";
import { CustomSelect, type SelectOption } from "@/components/ui/custom-select";
import type {
  PaymentGatewaySummary,
  UpdatePaymentSettingsInput,
} from "../../types/admin-settings";

interface PaymentSettingsTabProps {
  initialData: PaymentGatewaySummary;
  onSave: (input: UpdatePaymentSettingsInput) => Promise<void>;
  isLoading: boolean;
}

const ENVIRONMENT_OPTIONS: SelectOption<"sandbox" | "live">[] = [
  { value: "sandbox", label: "Sandbox / Test Mode (Safe for testing)" },
  { value: "live", label: "Live Mode (Real Customer Charges & Settlement)" },
];

export function PaymentSettingsTab({
  initialData,
  onSave,
  isLoading,
}: PaymentSettingsTabProps) {
  const [providerName, setProviderName] = React.useState(initialData.providerName);
  const [enabled, setEnabled] = React.useState(initialData.enabled);
  const [environment, setEnvironment] = React.useState<"sandbox" | "live">(
    initialData.environment
  );
  const [publishableKey, setPublishableKey] = React.useState(initialData.publishableKey);
  const [merchantId, setMerchantId] = React.useState(initialData.merchantId);

  // Secret Key replacement mode
  const [isReplacingSecret, setIsReplacingSecret] = React.useState(false);
  const [newSecretKey, setNewSecretKey] = React.useState("");

  // Live Mode Confirmation Dialog Modal
  const [showLiveConfirmModal, setShowLiveConfirmModal] = React.useState(false);
  const [liveModeConfirmed, setLiveModeConfirmed] = React.useState(false);

  const isDirty =
    providerName !== initialData.providerName ||
    enabled !== initialData.enabled ||
    environment !== initialData.environment ||
    publishableKey !== initialData.publishableKey ||
    merchantId !== initialData.merchantId ||
    (isReplacingSecret && newSecretKey.trim().length > 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // If switching from sandbox to live or saving in live mode without prior confirmation
    if (environment === "live" && initialData.environment !== "live") {
      setShowLiveConfirmModal(true);
      return;
    }

    await performSave(false);
  };

  const performSave = async (confirmedLive: boolean) => {
    const payload: UpdatePaymentSettingsInput = {
      providerName: providerName.trim(),
      enabled,
      environment,
      publishableKey: publishableKey.trim(),
      merchantId: merchantId.trim(),
    };

    if (environment === "live") {
      payload.confirmLiveMode = confirmedLive || liveModeConfirmed;
    }

    if (isReplacingSecret && newSecretKey.trim().length > 0) {
      payload.secretKey = newSecretKey.trim();
    }

    await onSave(payload);
    setIsReplacingSecret(false);
    setNewSecretKey("");
    setShowLiveConfirmModal(false);
    setLiveModeConfirmed(false);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-[12px] border border-[#E5EAED] bg-white p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 mb-6 border-b border-[#F0F4F6] gap-2">
            <div>
              <h3 className="font-outfit text-lg font-bold text-[#18282A]">
                Payment Gateway & Settlement Credentials
              </h3>
              <p className="text-sm text-[#74818A]">
                Securely manage payment provider credentials, sandbox/live environment routing, and publishable API keys.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {environment === "live" ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FFF0E6] text-[#FF5A5F]">
                  <AlertTriangle className="h-3.5 w-3.5" /> LIVE PRODUCTION MODE
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#EBF3FF] text-[#0066CC]">
                  <CheckCircle2 className="h-3.5 w-3.5" /> SANDBOX MODE
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Provider Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#18282A] uppercase tracking-wider">
                Supported Provider
              </label>
              <input
                type="text"
                required
                value={providerName}
                onChange={(e) => setProviderName(e.target.value)}
                className="w-full rounded-[8px] border border-[#D5DDE2] bg-white px-3.5 py-2.5 text-sm text-[#18282A] placeholder-[#74818A] focus:border-[#00A699] focus:outline-none focus:ring-1 focus:ring-[#00A699]"
                placeholder="e.g. Direct Bank Transfer / Stripe"
              />
            </div>

            {/* Gateway Environment */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#18282A] uppercase tracking-wider">
                Gateway Environment
              </label>
              <CustomSelect<"sandbox" | "live">
                options={ENVIRONMENT_OPTIONS}
                value={environment}
                onChange={setEnvironment}
              />
            </div>

            {/* Publishable API Key */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#18282A] uppercase tracking-wider">
                Publishable API Key
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={publishableKey}
                  onChange={(e) => setPublishableKey(e.target.value)}
                  className="w-full rounded-[8px] border border-[#D5DDE2] bg-white pl-9 pr-3.5 py-2.5 text-sm text-[#18282A] placeholder-[#74818A] focus:border-[#00A699] focus:outline-none focus:ring-1 focus:ring-[#00A699]"
                  placeholder="pk_test_... or pk_live_..."
                />
                <KeyRound className="absolute left-3 top-3 h-4 w-4 text-[#74818A]" />
              </div>
            </div>

            {/* Merchant ID */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#18282A] uppercase tracking-wider">
                Merchant ID (Optional)
              </label>
              <input
                type="text"
                value={merchantId}
                onChange={(e) => setMerchantId(e.target.value)}
                className="w-full rounded-[8px] border border-[#D5DDE2] bg-white px-3.5 py-2.5 text-sm text-[#18282A] placeholder-[#74818A] focus:border-[#00A699] focus:outline-none focus:ring-1 focus:ring-[#00A699]"
                placeholder="e.g. acct_123456789"
              />
            </div>
          </div>

          {/* Secret API Key Section */}
          <div className="mt-6 rounded-[10px] border border-[#E5EAED] bg-[#F8FAFB] p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
              <div>
                <h4 className="font-outfit text-sm font-bold text-[#18282A] flex items-center gap-1.5">
                  <Lock className="h-4 w-4 text-[#00A699]" /> Secret API Key (Encrypted at Rest)
                </h4>
                <p className="text-xs text-[#74818A] mt-0.5">
                  Encrypted using authenticated AES-256-GCM. Decrypted values are never returned to client browsers.
                </p>
              </div>
              {initialData.hasSecretKey && !isReplacingSecret && (
                <button
                  type="button"
                  onClick={() => setIsReplacingSecret(true)}
                  className="inline-flex items-center gap-1.5 rounded-[6px] border border-[#D5DDE2] bg-white px-3 py-1.5 text-xs font-semibold text-[#18282A] hover:bg-[#F0F4F6] transition-colors"
                >
                  <KeyRound className="h-3.5 w-3.5" /> Replace Secret Key
                </button>
              )}
            </div>

            {isReplacingSecret ? (
              <div className="space-y-2 mt-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-[#18282A]">
                    Enter New Secret API Key:
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsReplacingSecret(false);
                      setNewSecretKey("");
                    }}
                    className="text-xs font-medium text-[#74818A] hover:text-[#18282A]"
                  >
                    Cancel Replacement
                  </button>
                </div>
                <input
                  type="password"
                  value={newSecretKey}
                  onChange={(e) => setNewSecretKey(e.target.value)}
                  placeholder="sk_test_... or sk_live_..."
                  className="w-full rounded-[8px] border border-[#D5DDE2] bg-white px-3.5 py-2.5 text-sm text-[#18282A] placeholder-[#74818A] focus:border-[#00A699] focus:outline-none focus:ring-1 focus:ring-[#00A699]"
                />
                <p className="text-[11px] text-[#74818A]">
                  The new secret will replace the existing key upon saving and will immediately take effect at runtime.
                </p>
              </div>
            ) : initialData.hasSecretKey ? (
              <div className="flex items-center gap-3 mt-2">
                <span className="font-mono text-xs bg-white border border-[#D5DDE2] rounded px-3 py-2 text-[#484848] select-none">
                  {initialData.maskedSecretKey}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-[#00A699] font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Key Saved & Active
                </span>
              </div>
            ) : (
              <div className="space-y-2 mt-3">
                <p className="text-xs text-[#74818A]">No secret key is currently configured.</p>
                <input
                  type="password"
                  value={newSecretKey}
                  onChange={(e) => {
                    setIsReplacingSecret(true);
                    setNewSecretKey(e.target.value);
                  }}
                  placeholder="Enter secret API key (e.g. sk_test_...)"
                  className="w-full rounded-[8px] border border-[#D5DDE2] bg-white px-3.5 py-2.5 text-sm text-[#18282A] placeholder-[#74818A] focus:border-[#00A699] focus:outline-none focus:ring-1 focus:ring-[#00A699]"
                />
              </div>
            )}
          </div>

          {/* Enable / Disable Gateway Toggle */}
          <div className="mt-6 flex items-center justify-between rounded-[10px] border border-[#E5EAED] bg-[#F8FAFB] p-5">
            <div>
              <h4 className="font-outfit text-sm font-bold text-[#18282A]">
                Enable Payment Gateway
              </h4>
              <p className="mt-1 text-xs text-[#74818A]">
                Controls whether online checkout and automatic booking charges are processed through this provider.
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
                  <AlertCircle className="h-4 w-4" /> You have unsaved payment credentials
                </span>
              ) : (
                <span className="text-[#74818A]">Payment configuration is securely persisted.</span>
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
                  <Save className="h-3.5 w-3.5" /> Save Payment Settings
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Live Mode Confirmation Modal */}
      {showLiveConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-[12px] bg-white p-6 shadow-xl animate-in fade-in zoom-in-95">
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-[#FFF0E6] p-3 text-[#FF5A5F]">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <h3 className="font-outfit text-lg font-bold text-[#18282A]">
                  Confirm Activation of Live Payment Mode
                </h3>
                <p className="text-xs text-[#484848] leading-relaxed">
                  You are about to switch the PhuketTours payment gateway to <strong className="text-[#FF5A5F]">LIVE PRODUCTION MODE</strong>. Real payment charges will be executed on customer credit cards and transactions will be routed to production bank settlements.
                </p>
                <div className="mt-4 rounded-[8px] bg-[#FFF5F5] border border-[#FED7D7] p-3 text-xs text-[#9B2C2C]">
                  Please ensure you have entered valid live credentials and verified your merchant account status.
                </div>
                <label className="mt-4 flex items-center gap-2.5 cursor-pointer pt-2">
                  <input
                    type="checkbox"
                    checked={liveModeConfirmed}
                    onChange={(e) => setLiveModeConfirmed(e.target.checked)}
                    className="h-4 w-4 rounded border-[#D5DDE2] text-[#FF5A5F] focus:ring-[#FF5A5F]"
                  />
                  <span className="text-xs font-semibold text-[#18282A]">
                    I confirm that I want to activate Live Production Mode.
                  </span>
                </label>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t border-[#F0F4F6] pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowLiveConfirmModal(false);
                  setLiveModeConfirmed(false);
                }}
                className="rounded-[8px] border border-[#D5DDE2] bg-white px-4 py-2 text-xs font-semibold text-[#484848] hover:bg-[#F8FAFB]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!liveModeConfirmed || isLoading}
                onClick={() => performSave(true)}
                className="rounded-[8px] bg-[#FF5A5F] px-4 py-2 text-xs font-semibold text-white hover:bg-[#e0484d] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Activating..." : "Confirm & Save Live Mode"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
