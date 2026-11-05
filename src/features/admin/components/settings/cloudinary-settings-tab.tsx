"use client";

import * as React from "react";
import {
  Save,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Lock,
  RefreshCw,
  Activity,
  Cloud,
  FolderOpen,
} from "lucide-react";
import { CustomSelect, type SelectOption } from "@/components/ui/custom-select";
import type {
  CloudinaryConfigSummary,
  UpdateCloudinarySettingsInput,
  TestConnectionResult,
} from "../../types/admin-settings";

interface CloudinarySettingsTabProps {
  initialData: CloudinaryConfigSummary;
  onSave: (input: UpdateCloudinarySettingsInput) => Promise<void>;
  onTestConnection: () => Promise<TestConnectionResult>;
  isLoading: boolean;
  isTesting: boolean;
}

const MAX_SIZE_OPTIONS: SelectOption<number>[] = [
  { value: 5 * 1024 * 1024, label: "5 MB — Standard Image" },
  { value: 10 * 1024 * 1024, label: "10 MB — High Resolution (Recommended)" },
  { value: 20 * 1024 * 1024, label: "20 MB — Very High Resolution" },
  { value: 50 * 1024 * 1024, label: "50 MB — Maximum Asset Size" },
];

export function CloudinarySettingsTab({
  initialData,
  onSave,
  onTestConnection,
  isLoading,
  isTesting,
}: CloudinarySettingsTabProps) {
  const [cloudName, setCloudName] = React.useState(initialData.cloudName);
  const [apiKey, setApiKey] = React.useState(initialData.apiKey);
  const [folder, setFolder] = React.useState(initialData.folder);
  const [maxFileSizeBytes, setMaxFileSizeBytes] = React.useState(
    initialData.maxFileSizeBytes || 10 * 1024 * 1024
  );

  const [isReplacingSecret, setIsReplacingSecret] = React.useState(false);
  const [newApiSecret, setNewApiSecret] = React.useState("");

  const [testResult, setTestResult] = React.useState<TestConnectionResult | null>(null);

  const isDirty =
    cloudName !== initialData.cloudName ||
    apiKey !== initialData.apiKey ||
    folder !== initialData.folder ||
    maxFileSizeBytes !== initialData.maxFileSizeBytes ||
    (isReplacingSecret && newApiSecret.trim().length > 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: UpdateCloudinarySettingsInput = {
      cloudName: cloudName.trim(),
      apiKey: apiKey.trim(),
      folder: folder.trim(),
      maxFileSizeBytes,
      allowedFormats: initialData.allowedFormats,
    };
    if (isReplacingSecret && newApiSecret.trim().length > 0) {
      payload.apiSecret = newApiSecret.trim();
    }
    await onSave(payload);
    setIsReplacingSecret(false);
    setNewApiSecret("");
  };

  const handleTest = async () => {
    try {
      const result = await onTestConnection();
      setTestResult(result);
    } catch (err: unknown) {
      const errObj = err as { data?: { message?: string }; message?: string };
      setTestResult({
        success: false,
        message: errObj?.data?.message || errObj.message || "Failed to connect to Cloudinary API.",
        verifiedAt: new Date().toISOString(),
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-[12px] border border-[#E5EAED] bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 mb-6 border-b border-[#F0F4F6] gap-2">
          <div>
            <h3 className="font-outfit text-lg font-bold text-[#18282A] flex items-center gap-2">
              <Cloud className="h-5 w-5 text-[#00A699]" /> Cloudinary Media Storage Configuration
            </h3>
            <p className="text-sm text-[#74818A]">
              Manage Cloudinary cloud credentials, upload destination directory, and direct image asset verification.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {initialData.connectionStatus === "VERIFIED" ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#E8F8F5] text-[#00A699]">
                <CheckCircle2 className="h-3.5 w-3.5" /> API Connected & Verified
              </span>
            ) : initialData.connectionStatus === "FAILED" ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FFF0E6] text-[#FF5A5F]">
                <XCircle className="h-3.5 w-3.5" /> Connection Failed
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#F0F4F6] text-[#74818A]">
                Unverified Credentials
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cloud Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#18282A] uppercase tracking-wider">
              Cloudinary Cloud Name
            </label>
            <input
              type="text"
              required
              value={cloudName}
              onChange={(e) => setCloudName(e.target.value)}
              className="w-full rounded-[8px] border border-[#D5DDE2] bg-white px-3.5 py-2.5 text-sm text-[#18282A] placeholder-[#74818A] focus:border-[#00A699] focus:outline-none focus:ring-1 focus:ring-[#00A699]"
              placeholder="e.g. dg83pvgls"
            />
          </div>

          {/* API Key */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#18282A] uppercase tracking-wider">
              Cloudinary API Key
            </label>
            <input
              type="text"
              required
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full rounded-[8px] border border-[#D5DDE2] bg-white px-3.5 py-2.5 text-sm text-[#18282A] placeholder-[#74818A] focus:border-[#00A699] focus:outline-none focus:ring-1 focus:ring-[#00A699]"
              placeholder="e.g. 123456789012345"
            />
          </div>

          {/* Upload Folder */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#18282A] uppercase tracking-wider">
              Upload Folder Path
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={folder}
                onChange={(e) => setFolder(e.target.value)}
                className="w-full rounded-[8px] border border-[#D5DDE2] bg-white pl-9 pr-3.5 py-2.5 text-sm text-[#18282A] placeholder-[#74818A] focus:border-[#00A699] focus:outline-none focus:ring-1 focus:ring-[#00A699]"
                placeholder="e.g. phukettours/tours"
              />
              <FolderOpen className="absolute left-3 top-3 h-4 w-4 text-[#74818A]" />
            </div>
          </div>

          {/* Max File Size */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#18282A] uppercase tracking-wider">
              Maximum Upload File Size
            </label>
            <CustomSelect<number>
              options={MAX_SIZE_OPTIONS}
              value={maxFileSizeBytes}
              onChange={setMaxFileSizeBytes}
            />
          </div>
        </div>

        {/* API Secret Section */}
        <div className="mt-6 rounded-[10px] border border-[#E5EAED] bg-[#F8FAFB] p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
            <div>
              <h4 className="font-outfit text-sm font-bold text-[#18282A] flex items-center gap-1.5">
                <Lock className="h-4 w-4 text-[#00A699]" /> Cloudinary API Secret (Encrypted at Rest)
              </h4>
              <p className="text-xs text-[#74818A] mt-0.5">
                Used to generate cryptographic upload signatures for direct browser uploads and secure asset deletion.
              </p>
            </div>
            {initialData.hasApiSecret && !isReplacingSecret && (
              <button
                type="button"
                onClick={() => setIsReplacingSecret(true)}
                className="inline-flex items-center gap-1.5 rounded-[6px] border border-[#D5DDE2] bg-white px-3 py-1.5 text-xs font-semibold text-[#18282A] hover:bg-[#F0F4F6] transition-colors"
              >
                Replace API Secret
              </button>
            )}
          </div>

          {isReplacingSecret ? (
            <div className="space-y-2 mt-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-[#18282A]">
                  Enter New Cloudinary API Secret:
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsReplacingSecret(false);
                    setNewApiSecret("");
                  }}
                  className="text-xs font-medium text-[#74818A] hover:text-[#18282A]"
                >
                  Cancel Replacement
                </button>
              </div>
              <input
                type="password"
                value={newApiSecret}
                onChange={(e) => setNewApiSecret(e.target.value)}
                placeholder="Enter Cloudinary API secret"
                className="w-full rounded-[8px] border border-[#D5DDE2] bg-white px-3.5 py-2.5 text-sm text-[#18282A] placeholder-[#74818A] focus:border-[#00A699] focus:outline-none focus:ring-1 focus:ring-[#00A699]"
              />
            </div>
          ) : initialData.hasApiSecret ? (
            <div className="flex items-center gap-3 mt-2">
              <span className="font-mono text-xs bg-white border border-[#D5DDE2] rounded px-3 py-2 text-[#484848] select-none">
                {initialData.maskedApiSecret}
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-[#00A699] font-medium">
                <CheckCircle2 className="h-3.5 w-3.5" /> Secret Stored Securely
              </span>
            </div>
          ) : (
            <div className="space-y-2 mt-3">
              <p className="text-xs text-[#74818A]">No API secret is currently configured.</p>
              <input
                type="password"
                value={newApiSecret}
                onChange={(e) => {
                  setIsReplacingSecret(true);
                  setNewApiSecret(e.target.value);
                }}
                placeholder="Enter Cloudinary API secret"
                className="w-full rounded-[8px] border border-[#D5DDE2] bg-white px-3.5 py-2.5 text-sm text-[#18282A] placeholder-[#74818A] focus:border-[#00A699] focus:outline-none focus:ring-1 focus:ring-[#00A699]"
              />
            </div>
          )}
        </div>

        {/* Live Cloudinary Test Feedback */}
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
            {testResult.details && (
              <pre className="mt-2 text-[11px] bg-white/60 p-2 rounded overflow-x-auto font-mono">
                {JSON.stringify(testResult.details, null, 2)}
              </pre>
            )}
          </div>
        )}

        {/* Action Toolbar */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#F0F4F6] pt-5">
          <div className="flex items-center gap-2 text-xs">
            {isDirty ? (
              <span className="inline-flex items-center gap-1.5 font-medium text-[#D97706]">
                <AlertCircle className="h-4 w-4" /> You have unsaved Cloudinary changes
              </span>
            ) : (
              <span className="text-[#74818A]">
                {initialData.lastVerifiedAt
                  ? `Last verified at ${new Date(initialData.lastVerifiedAt).toLocaleString()}`
                  : "Cloudinary credentials active."}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleTest}
              disabled={isTesting || isLoading || !initialData.hasApiSecret}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-[8px] border border-[#D5DDE2] bg-white px-4 py-2.5 text-xs font-semibold text-[#18282A] hover:bg-[#F8FAFB] transition-colors disabled:opacity-50"
            >
              {isTesting ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Testing...
                </>
              ) : (
                <>
                  <Activity className="h-3.5 w-3.5 text-[#00A699]" /> Test Cloudinary Connection
                </>
              )}
            </button>
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
                  <Save className="h-3.5 w-3.5" /> Save Cloudinary Settings
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
