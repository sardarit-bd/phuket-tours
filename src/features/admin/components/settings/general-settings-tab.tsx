"use client";

import * as React from "react";
import { Save, AlertCircle, RefreshCw, CheckCircle2 } from "lucide-react";
import { CustomSelect, type SelectOption } from "@/components/ui/custom-select";
import type {
  GeneralSettingsSummary,
  UpdateGeneralSettingsInput,
} from "../../types/admin-settings";

interface GeneralSettingsTabProps {
  initialData: GeneralSettingsSummary;
  onSave: (input: UpdateGeneralSettingsInput) => Promise<void>;
  isLoading: boolean;
}

const CURRENCY_OPTIONS: SelectOption<string>[] = [
  { value: "THB", label: "THB — Thai Baht (฿)" },
  { value: "USD", label: "USD — US Dollar ($)" },
  { value: "EUR", label: "EUR — Euro (€)" },
  { value: "GBP", label: "GBP — British Pound (£)" },
  { value: "AUD", label: "AUD — Australian Dollar (A$)" },
  { value: "SGD", label: "SGD — Singapore Dollar (S$)" },
];

const TIMEZONE_OPTIONS: SelectOption<string>[] = [
  { value: "Asia/Bangkok", label: "Asia/Bangkok (UTC+07:00 — Phuket / Thailand)" },
  { value: "UTC", label: "UTC (Coordinated Universal Time)" },
  { value: "Asia/Singapore", label: "Asia/Singapore (UTC+08:00)" },
  { value: "Europe/London", label: "Europe/London (GMT/BST)" },
  { value: "America/New_York", label: "America/New_York (EST/EDT)" },
  { value: "Australia/Sydney", label: "Australia/Sydney (AEST/AEDT)" },
];

const LANGUAGE_OPTIONS: SelectOption<string>[] = [
  { value: "en", label: "English (en)" },
  { value: "th", label: "Thai — ภาษาไทย (th)" },
  { value: "ru", label: "Russian — Русский (ru)" },
  { value: "zh", label: "Chinese — 中文 (zh)" },
  { value: "de", label: "German — Deutsch (de)" },
  { value: "fr", label: "French — Français (fr)" },
];

export function GeneralSettingsTab({
  initialData,
  onSave,
  isLoading,
}: GeneralSettingsTabProps) {
  const [platformName, setPlatformName] = React.useState(initialData.platformName);
  const [supportEmail, setSupportEmail] = React.useState(initialData.supportEmail);
  const [supportPhone, setSupportPhone] = React.useState(initialData.supportPhone);
  const [defaultCurrency, setDefaultCurrency] = React.useState(initialData.defaultCurrency);
  const [timezone, setTimezone] = React.useState(initialData.timezone);
  const [defaultLanguage, setDefaultLanguage] = React.useState(initialData.defaultLanguage);
  const [maintenanceMode, setMaintenanceMode] = React.useState(initialData.maintenanceMode);

  // Compute dirty state directly
  const isDirty =
    platformName !== initialData.platformName ||
    supportEmail !== initialData.supportEmail ||
    supportPhone !== initialData.supportPhone ||
    defaultCurrency !== initialData.defaultCurrency ||
    timezone !== initialData.timezone ||
    defaultLanguage !== initialData.defaultLanguage ||
    maintenanceMode !== initialData.maintenanceMode;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({
      platformName: platformName.trim(),
      supportEmail: supportEmail.trim(),
      supportPhone: supportPhone.trim(),
      defaultCurrency,
      timezone,
      defaultLanguage,
      maintenanceMode,
    });
  };

  const handleReset = () => {
    setPlatformName(initialData.platformName);
    setSupportEmail(initialData.supportEmail);
    setSupportPhone(initialData.supportPhone);
    setDefaultCurrency(initialData.defaultCurrency);
    setTimezone(initialData.timezone);
    setDefaultLanguage(initialData.defaultLanguage);
    setMaintenanceMode(initialData.maintenanceMode);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-[12px] border border-[#E5EAED] bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 mb-6 border-b border-[#F0F4F6] gap-2">
          <div>
            <h3 className="font-outfit text-lg font-bold text-[#18282A]">
              Platform & Brand Identity
            </h3>
            <p className="text-sm text-[#74818A]">
              Configure platform name, support contact channels, default localization, and maintenance status.
            </p>
          </div>
          {initialData.isCustomized ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#E8F8F5] text-[#00A699]">
              <CheckCircle2 className="h-3.5 w-3.5" /> Database Managed
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#F0F4F6] text-[#74818A]">
              Default Configuration
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Platform Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#18282A] uppercase tracking-wider">
              Platform Name
            </label>
            <input
              type="text"
              required
              value={platformName}
              onChange={(e) => setPlatformName(e.target.value)}
              className="w-full rounded-[8px] border border-[#D5DDE2] bg-white px-3.5 py-2.5 text-sm text-[#18282A] placeholder-[#74818A] focus:border-[#00A699] focus:outline-none focus:ring-1 focus:ring-[#00A699]"
              placeholder="e.g. PhuketTours"
            />
          </div>

          {/* Support Email */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#18282A] uppercase tracking-wider">
              Support Email
            </label>
            <input
              type="email"
              required
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              className="w-full rounded-[8px] border border-[#D5DDE2] bg-white px-3.5 py-2.5 text-sm text-[#18282A] placeholder-[#74818A] focus:border-[#00A699] focus:outline-none focus:ring-1 focus:ring-[#00A699]"
              placeholder="e.g. support@phukettours.com"
            />
          </div>

          {/* Support Phone */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#18282A] uppercase tracking-wider">
              Support Phone
            </label>
            <input
              type="text"
              value={supportPhone}
              onChange={(e) => setSupportPhone(e.target.value)}
              className="w-full rounded-[8px] border border-[#D5DDE2] bg-white px-3.5 py-2.5 text-sm text-[#18282A] placeholder-[#74818A] focus:border-[#00A699] focus:outline-none focus:ring-1 focus:ring-[#00A699]"
              placeholder="e.g. +66 76 123 4567"
            />
          </div>

          {/* Default Currency */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#18282A] uppercase tracking-wider">
              Default Currency
            </label>
            <CustomSelect<string>
              options={CURRENCY_OPTIONS}
              value={defaultCurrency}
              onChange={setDefaultCurrency}
            />
          </div>

          {/* Timezone */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#18282A] uppercase tracking-wider">
              Operational Timezone
            </label>
            <CustomSelect<string>
              options={TIMEZONE_OPTIONS}
              value={timezone}
              onChange={setTimezone}
            />
          </div>

          {/* Default Language */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#18282A] uppercase tracking-wider">
              Default Language
            </label>
            <CustomSelect<string>
              options={LANGUAGE_OPTIONS}
              value={defaultLanguage}
              onChange={setDefaultLanguage}
            />
          </div>
        </div>

        {/* Platform Maintenance Mode */}
        <div className="mt-8 rounded-[10px] border border-[#E5EAED] bg-[#F8FAFB] p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-outfit text-sm font-bold text-[#18282A]">
                  Platform Maintenance Mode
                </h4>
                {maintenanceMode && (
                  <span className="rounded-full bg-[#FFF0E6] px-2 py-0.5 text-[11px] font-semibold text-[#FF5A5F]">
                    Active
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-[#74818A]">
                When enabled, platform displays maintenance indicators to public visitors while allowing staff and admin users to log in and inspect the dashboard.
              </p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={maintenanceMode}
                onChange={(e) => setMaintenanceMode(e.target.checked)}
                className="peer sr-only"
              />
              <div className="h-6 w-11 rounded-full bg-[#D5DDE2] peer-checked:bg-[#FF5A5F] peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full"></div>
            </label>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#F0F4F6] pt-5">
          <div className="flex items-center gap-2 text-xs">
            {isDirty ? (
              <span className="inline-flex items-center gap-1.5 font-medium text-[#D97706]">
                <AlertCircle className="h-4 w-4" /> You have unsaved changes
              </span>
            ) : (
              <span className="text-[#74818A]">All general settings are up to date.</span>
            )}
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {isDirty && (
              <button
                type="button"
                onClick={handleReset}
                disabled={isLoading}
                className="flex-1 sm:flex-none rounded-[8px] border border-[#D5DDE2] bg-white px-4 py-2 text-xs font-semibold text-[#484848] hover:bg-[#F8FAFB] transition-colors"
              >
                Reset
              </button>
            )}
            <button
              type="submit"
              disabled={isLoading || !isDirty}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-[8px] bg-[#00A699] px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#008f84] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" /> Save General Settings
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
