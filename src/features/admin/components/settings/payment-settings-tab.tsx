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
  HelpCircle,
  Check,
} from "lucide-react";
import { CustomSelect, type SelectOption } from "@/components/ui/custom-select";
import { StripeLogo, PayPalLogo } from "@/components/ui/payment-provider-logos";
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
  { value: "live", label: "Live Production Mode (Real charges)" },
];

export function PaymentSettingsTab({
  initialData,
  onSave,
  isLoading,
}: PaymentSettingsTabProps) {
  // Selected Provider Tab: 'stripe' | 'paypal'
  const [selectedProvider, setSelectedProvider] = React.useState<"stripe" | "paypal">(
    initialData.activeProvider || "stripe"
  );

  // Stripe state
  const stripeInitial = initialData.stripe || {
    enabled: initialData.enabled,
    environment: initialData.environment,
    publishableKey: initialData.publishableKey,
    hasSecretKey: initialData.hasSecretKey,
    maskedSecretKey: initialData.maskedSecretKey,
    hasWebhookSecret: false,
    maskedWebhookSecret: "",
  };

  const [stripeEnabled, setStripeEnabled] = React.useState(stripeInitial.enabled);
  const [stripeEnv, setStripeEnv] = React.useState<"sandbox" | "live">(stripeInitial.environment);
  const [stripePublishableKey, setStripePublishableKey] = React.useState(stripeInitial.publishableKey);
  const [isReplacingStripeSecret, setIsReplacingStripeSecret] = React.useState(false);
  const [newStripeSecret, setNewStripeSecret] = React.useState("");
  const [isReplacingStripeWebhook, setIsReplacingStripeWebhook] = React.useState(false);
  const [newStripeWebhook, setNewStripeWebhook] = React.useState("");

  // PayPal state
  const paypalInitial = initialData.paypal || {
    enabled: false,
    environment: "sandbox",
    clientId: "",
    hasClientSecret: false,
    maskedClientSecret: "",
    webhookId: "",
  };

  const [paypalEnabled, setPaypalEnabled] = React.useState(paypalInitial.enabled);
  const [paypalEnv, setPaypalEnv] = React.useState<"sandbox" | "live">(paypalInitial.environment);
  const [paypalClientId, setPaypalClientId] = React.useState(paypalInitial.clientId);
  const [paypalWebhookId, setPaypalWebhookId] = React.useState(paypalInitial.webhookId);
  const [isReplacingPaypalSecret, setIsReplacingPaypalSecret] = React.useState(false);
  const [newPaypalSecret, setNewPaypalSecret] = React.useState("");

  // Live Confirmation Dialog
  const [showLiveConfirmModal, setShowLiveConfirmModal] = React.useState(false);
  const [liveModeConfirmed, setLiveModeConfirmed] = React.useState(false);

  // Compute dirty state
  const isStripeDirty =
    stripeEnabled !== stripeInitial.enabled ||
    stripeEnv !== stripeInitial.environment ||
    stripePublishableKey !== stripeInitial.publishableKey ||
    (isReplacingStripeSecret && newStripeSecret.trim().length > 0) ||
    (isReplacingStripeWebhook && newStripeWebhook.trim().length > 0);

  const isPaypalDirty =
    paypalEnabled !== paypalInitial.enabled ||
    paypalEnv !== paypalInitial.environment ||
    paypalClientId !== paypalInitial.clientId ||
    paypalWebhookId !== paypalInitial.webhookId ||
    (isReplacingPaypalSecret && newPaypalSecret.trim().length > 0);

  const isDirty =
    selectedProvider !== initialData.activeProvider ||
    (selectedProvider === "stripe" ? isStripeDirty : isPaypalDirty);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const targetEnv = selectedProvider === "stripe" ? stripeEnv : paypalEnv;
    const initialEnv = selectedProvider === "stripe" ? stripeInitial.environment : paypalInitial.environment;

    if (targetEnv === "live" && initialEnv !== "live") {
      setShowLiveConfirmModal(true);
      return;
    }

    await performSave(false);
  };

  const performSave = async (confirmedLive: boolean) => {
    const payload: UpdatePaymentSettingsInput = {
      activeProvider: selectedProvider,
      confirmLiveMode: confirmedLive || liveModeConfirmed,
    };

    if (selectedProvider === "stripe") {
      payload.providerName = "Stripe";
      payload.enabled = stripeEnabled;
      payload.environment = stripeEnv;
      payload.publishableKey = stripePublishableKey.trim();
      payload.stripe = {
        enabled: stripeEnabled,
        environment: stripeEnv,
        publishableKey: stripePublishableKey.trim(),
      };
      if (isReplacingStripeSecret && newStripeSecret.trim().length > 0) {
        payload.stripe.secretKey = newStripeSecret.trim();
        payload.secretKey = newStripeSecret.trim();
      }
      if (isReplacingStripeWebhook && newStripeWebhook.trim().length > 0) {
        payload.stripe.webhookSecret = newStripeWebhook.trim();
      }
    } else {
      payload.providerName = "PayPal";
      payload.enabled = paypalEnabled;
      payload.environment = paypalEnv;
      payload.publishableKey = paypalClientId.trim();
      payload.paypal = {
        enabled: paypalEnabled,
        environment: paypalEnv,
        clientId: paypalClientId.trim(),
        webhookId: paypalWebhookId.trim(),
      };
      if (isReplacingPaypalSecret && newPaypalSecret.trim().length > 0) {
        payload.paypal.clientSecret = newPaypalSecret.trim();
      }
    }

    await onSave(payload);
    setIsReplacingStripeSecret(false);
    setNewStripeSecret("");
    setIsReplacingStripeWebhook(false);
    setNewStripeWebhook("");
    setIsReplacingPaypalSecret(false);
    setNewPaypalSecret("");
    setShowLiveConfirmModal(false);
    setLiveModeConfirmed(false);
  };

  const isStripeConfigured = stripeInitial.hasSecretKey && stripeInitial.publishableKey;
  const isPaypalConfigured = paypalInitial.hasClientSecret && paypalInitial.clientId;

  // Effective enabled/needs-credentials badges: only show "Enabled" when the
  // backend reports configured=true AND the DB preference allows it.
  const stripeEffectiveEnabled = stripeInitial.enabled && stripeInitial.configured;
  const paypalEffectiveEnabled = paypalInitial.enabled && paypalInitial.configured;

  const stripeSourceLabel =
    stripeInitial.source === "database"
      ? "Configured via Database"
      : stripeInitial.source === "environment"
      ? "Configured via Environment"
      : "Not Configured";
  const paypalSourceLabel =
    paypalInitial.source === "database"
      ? "Configured via Database"
      : paypalInitial.source === "environment"
      ? "Configured via Environment"
      : "Not Configured";

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Provider Cards Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Stripe Card */}
          <button
            type="button"
            onClick={() => setSelectedProvider("stripe")}
            className={`flex flex-col text-left p-5 rounded-[12px] border transition-all cursor-pointer relative ${
              selectedProvider === "stripe"
                ? "border-[#00A699] bg-[#E8F8F5]/30 ring-2 ring-[#00A699] shadow-sm"
                : "border-[#E5EAED] bg-white hover:border-[#CBD5E1]"
            }`}
          >
            <div className="flex items-center justify-between w-full mb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-md bg-white border border-[#E5EAED] shadow-2xs">
                  <StripeLogo className="h-4 w-auto" />
                </div>
                <span className="font-outfit font-bold text-sm text-[#18282A]">Stripe</span>
              </div>
              {selectedProvider === "stripe" && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#00A699] text-white">
                  <Check className="h-3 w-3 stroke-[3]" />
                </span>
              )}
            </div>
            <p className="text-xs text-[#74818A] mb-3">
              Credit/Debit cards (Visa, Mastercard, Amex), Apple Pay, Google Pay, and PromptPay.
            </p>
            <div className="mt-auto flex items-center gap-2 pt-2 border-t border-[#F0F4F6] text-[11px]">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-medium ${
                  stripeEffectiveEnabled
                    ? "bg-[#E6F4EA] text-[#137333]"
                    : "bg-[#F1F3F4] text-[#5F6368]"
                }`}
              >
                {stripeEffectiveEnabled ? "Enabled" : "Disabled"}
              </span>
              <span className="text-[#9AA0A6]">•</span>
              <span
                className={`inline-flex items-center gap-1 font-medium ${
                  stripeInitial.configured ? "text-[#137333]" : "text-[#D97706]"
                }`}
              >
                {stripeInitial.configured ? "Credentials Configured" : "Needs Credentials"}
              </span>
               <span className="text-[#9AA0A6]">•</span>
               <span className="text-[#5F6368]">{stripeSourceLabel}</span>
            </div>
          </button>

          {/* PayPal Card */}
          <button
            type="button"
            onClick={() => setSelectedProvider("paypal")}
            className={`flex flex-col text-left p-5 rounded-[12px] border transition-all cursor-pointer relative ${
              selectedProvider === "paypal"
                ? "border-[#00A699] bg-[#E8F8F5]/30 ring-2 ring-[#00A699] shadow-sm"
                : "border-[#E5EAED] bg-white hover:border-[#CBD5E1]"
            }`}
          >
            <div className="flex items-center justify-between w-full mb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-md bg-white border border-[#E5EAED] shadow-2xs">
                  <PayPalLogo className="h-4 w-auto" />
                </div>
                <span className="font-outfit font-bold text-sm text-[#18282A]">PayPal</span>
              </div>
              {selectedProvider === "paypal" && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#00A699] text-white">
                  <Check className="h-3 w-3 stroke-[3]" />
                </span>
              )}
            </div>
            <p className="text-xs text-[#74818A] mb-3">
              PayPal wallet balances, Pay in 4, and international PayPal customer accounts.
            </p>
            <div className="mt-auto flex items-center gap-2 pt-2 border-t border-[#F0F4F6] text-[11px]">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-medium ${
                  paypalEffectiveEnabled
                    ? "bg-[#E6F4EA] text-[#137333]"
                    : "bg-[#F1F3F4] text-[#5F6368]"
                }`}
              >
                {paypalEffectiveEnabled ? "Enabled" : "Disabled"}
              </span>
              <span className="text-[#9AA0A6]">•</span>
              <span
                className={`inline-flex items-center gap-1 font-medium ${
                  paypalInitial.configured ? "text-[#137333]" : "text-[#D97706]"
                }`}
              >
                {paypalInitial.configured ? "Credentials Configured" : "Needs Credentials"}
              </span>
               <span className="text-[#9AA0A6]">•</span>
               <span className="text-[#5F6368]">{paypalSourceLabel}</span>
            </div>
          </button>
        </div>

        {/* Selected Provider Form */}
        <div className="rounded-[12px] border border-[#E5EAED] bg-white p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 mb-6 border-b border-[#F0F4F6] gap-2">
            <div>
              <h3 className="font-outfit text-base font-bold text-[#18282A]">
                {selectedProvider === "stripe" ? "Stripe Gateway Configuration" : "PayPal Gateway Configuration"}
              </h3>
              <p className="text-xs text-[#74818A]">
                {selectedProvider === "stripe"
                  ? "Configure Stripe publishable, secret keys, and webhook signing secret."
                  : "Configure PayPal REST Client ID, Client Secret, and Webhook ID."}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {(selectedProvider === "stripe" ? stripeEnv : paypalEnv) === "live" ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FFF0E6] text-[#FF5A5F]">
                  <AlertTriangle className="h-3.5 w-3.5" /> LIVE PRODUCTION MODE
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#EBF3FF] text-[#0066CC]">
                  <CheckCircle2 className="h-3.5 w-3.5" /> SANDBOX MODE
                </span>
              )}
            </div>
          </div>

          {/* Form Fields: Only show for selectedProvider */}
          {selectedProvider === "stripe" ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Stripe Environment */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#18282A] uppercase tracking-wider">
                    Environment
                  </label>
                  <CustomSelect<"sandbox" | "live">
                    options={ENVIRONMENT_OPTIONS}
                    value={stripeEnv}
                    onChange={setStripeEnv}
                  />
                </div>

                {/* Stripe Publishable Key */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#18282A] uppercase tracking-wider">
                    Publishable Key
                  </label>
                  <input
                    type="text"
                    value={stripePublishableKey}
                    onChange={(e) => setStripePublishableKey(e.target.value)}
                    className="w-full rounded-[8px] border border-[#D5DDE2] bg-white px-3.5 py-2.5 text-xs font-mono text-[#18282A] placeholder-[#74818A] focus:border-[#00A699] focus:outline-none focus:ring-1 focus:ring-[#00A699]"
                    placeholder="pk_test_... or pk_live_..."
                  />
                </div>
              </div>

              {/* Stripe Secret Key */}
              <div className="space-y-2 rounded-[8px] border border-[#F0F4F6] bg-[#FAFCFD] p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <KeyRound className="h-4 w-4 text-[#74818A]" />
                    <span className="text-xs font-semibold text-[#18282A]">Stripe Secret Key</span>
                  </div>
                  {stripeInitial.hasSecretKey && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#137333]">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Key Saved & Active
                    </span>
                  )}
                </div>

                {stripeInitial.hasSecretKey && !isReplacingStripeSecret ? (
                  <div className="flex items-center justify-between rounded-[6px] border border-[#E5EAED] bg-white px-3 py-2 text-xs">
                    <span className="font-mono text-[#74818A]">{stripeInitial.maskedSecretKey}</span>
                    <button
                      type="button"
                      onClick={() => setIsReplacingStripeSecret(true)}
                      className="text-xs font-semibold text-[#00A699] hover:underline cursor-pointer"
                    >
                      Replace Key
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="password"
                      autoComplete="new-password"
                      value={newStripeSecret}
                      onChange={(e) => setNewStripeSecret(e.target.value)}
                      placeholder="sk_test_... or sk_live_..."
                      className="w-full rounded-[6px] border border-[#D5DDE2] bg-white px-3 py-2 text-xs font-mono text-[#18282A] focus:border-[#00A699] focus:outline-none focus:ring-1 focus:ring-[#00A699]"
                    />
                    {isReplacingStripeSecret && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsReplacingStripeSecret(false);
                          setNewStripeSecret("");
                        }}
                        className="text-xs text-[#74818A] hover:underline cursor-pointer"
                      >
                        Cancel replacement
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Stripe Webhook Signing Secret */}
              <div className="space-y-2 rounded-[8px] border border-[#F0F4F6] bg-[#FAFCFD] p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-[#74818A]" />
                    <span className="text-xs font-semibold text-[#18282A]">Webhook Signing Secret</span>
                  </div>
                  {stripeInitial.hasWebhookSecret && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#137333]">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Secret Saved
                    </span>
                  )}
                </div>

                {stripeInitial.hasWebhookSecret && !isReplacingStripeWebhook ? (
                  <div className="flex items-center justify-between rounded-[6px] border border-[#E5EAED] bg-white px-3 py-2 text-xs">
                    <span className="font-mono text-[#74818A]">{stripeInitial.maskedWebhookSecret}</span>
                    <button
                      type="button"
                      onClick={() => setIsReplacingStripeWebhook(true)}
                      className="text-xs font-semibold text-[#00A699] hover:underline cursor-pointer"
                    >
                      Replace Secret
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="password"
                      autoComplete="new-password"
                      value={newStripeWebhook}
                      onChange={(e) => setNewStripeWebhook(e.target.value)}
                      placeholder="whsec_..."
                      className="w-full rounded-[6px] border border-[#D5DDE2] bg-white px-3 py-2 text-xs font-mono text-[#18282A] focus:border-[#00A699] focus:outline-none focus:ring-1 focus:ring-[#00A699]"
                    />
                    {isReplacingStripeWebhook && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsReplacingStripeWebhook(false);
                          setNewStripeWebhook("");
                        }}
                        className="text-xs text-[#74818A] hover:underline cursor-pointer"
                      >
                        Cancel replacement
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Stripe Enable Toggle */}
              <div className="flex items-center justify-between rounded-[8px] border border-[#F0F4F6] p-4">
                <div>
                  <h4 className="text-xs font-bold text-[#18282A]">Enable Stripe Gateway</h4>
                  <p className="text-xs text-[#74818A]">
                    Allow customers to checkout using Credit/Debit cards via Stripe.
                  </p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={stripeEnabled}
                    onChange={(e) => setStripeEnabled(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="h-6 w-11 rounded-full bg-[#D5DDE2] peer-checked:bg-[#00A699] peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full"></div>
                </label>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* PayPal Environment */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#18282A] uppercase tracking-wider">
                    Environment
                  </label>
                  <CustomSelect<"sandbox" | "live">
                    options={ENVIRONMENT_OPTIONS}
                    value={paypalEnv}
                    onChange={setPaypalEnv}
                  />
                </div>

                {/* PayPal Client ID */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#18282A] uppercase tracking-wider">
                    Client ID
                  </label>
                  <input
                    type="text"
                    value={paypalClientId}
                    onChange={(e) => setPaypalClientId(e.target.value)}
                    className="w-full rounded-[8px] border border-[#D5DDE2] bg-white px-3.5 py-2.5 text-xs font-mono text-[#18282A] placeholder-[#74818A] focus:border-[#00A699] focus:outline-none focus:ring-1 focus:ring-[#00A699]"
                    placeholder="PayPal REST Client ID"
                  />
                </div>
              </div>

              {/* PayPal Client Secret */}
              <div className="space-y-2 rounded-[8px] border border-[#F0F4F6] bg-[#FAFCFD] p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <KeyRound className="h-4 w-4 text-[#74818A]" />
                    <span className="text-xs font-semibold text-[#18282A]">PayPal Client Secret</span>
                  </div>
                  {paypalInitial.hasClientSecret && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#137333]">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Secret Saved & Active
                    </span>
                  )}
                </div>

                {paypalInitial.hasClientSecret && !isReplacingPaypalSecret ? (
                  <div className="flex items-center justify-between rounded-[6px] border border-[#E5EAED] bg-white px-3 py-2 text-xs">
                    <span className="font-mono text-[#74818A]">{paypalInitial.maskedClientSecret}</span>
                    <button
                      type="button"
                      onClick={() => setIsReplacingPaypalSecret(true)}
                      className="text-xs font-semibold text-[#00A699] hover:underline cursor-pointer"
                    >
                      Replace Secret
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="password"
                      autoComplete="new-password"
                      value={newPaypalSecret}
                      onChange={(e) => setNewPaypalSecret(e.target.value)}
                      placeholder="PayPal REST API Secret"
                      className="w-full rounded-[6px] border border-[#D5DDE2] bg-white px-3 py-2 text-xs font-mono text-[#18282A] focus:border-[#00A699] focus:outline-none focus:ring-1 focus:ring-[#00A699]"
                    />
                    {isReplacingPaypalSecret && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsReplacingPaypalSecret(false);
                          setNewPaypalSecret("");
                        }}
                        className="text-xs text-[#74818A] hover:underline cursor-pointer"
                      >
                        Cancel replacement
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* PayPal Webhook ID */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#18282A] uppercase tracking-wider">
                  PayPal Webhook ID (Optional)
                </label>
                <input
                  type="text"
                  value={paypalWebhookId}
                  onChange={(e) => setPaypalWebhookId(e.target.value)}
                  className="w-full rounded-[8px] border border-[#D5DDE2] bg-white px-3.5 py-2.5 text-xs font-mono text-[#18282A] placeholder-[#74818A] focus:border-[#00A699] focus:outline-none focus:ring-1 focus:ring-[#00A699]"
                  placeholder="e.g. 4JH39824X8834011L"
                />
                <p className="text-[11px] text-[#74818A]">
                  Generated in PayPal Developer Dashboard for webhook notifications.
                </p>
              </div>

              {/* PayPal Enable Toggle */}
              <div className="flex items-center justify-between rounded-[8px] border border-[#F0F4F6] p-4">
                <div>
                  <h4 className="text-xs font-bold text-[#18282A]">Enable PayPal Gateway</h4>
                  <p className="text-xs text-[#74818A]">
                    Allow customers to checkout with PayPal balance or connected payment accounts.
                  </p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={paypalEnabled}
                    onChange={(e) => setPaypalEnabled(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="h-6 w-11 rounded-full bg-[#D5DDE2] peer-checked:bg-[#00A699] peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full"></div>
                </label>
              </div>
            </div>
          )}

          {/* Action Toolbar */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#F0F4F6] pt-5">
            <div className="flex items-center gap-2 text-xs">
              {isDirty ? (
                <span className="inline-flex items-center gap-1.5 font-medium text-[#D97706]">
                  <AlertCircle className="h-4 w-4" /> You have unsaved payment credentials
                </span>
              ) : (
                <span className="text-[#74818A]">Configuration is securely stored and active.</span>
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
                  <Save className="h-3.5 w-3.5" /> Save {selectedProvider === "stripe" ? "Stripe" : "PayPal"} Settings
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
                  You are about to switch the PhuketTours payment gateway to <strong className="text-[#FF5A5F]">LIVE PRODUCTION MODE</strong>. Real payment charges will be executed on customer credit cards or accounts.
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
