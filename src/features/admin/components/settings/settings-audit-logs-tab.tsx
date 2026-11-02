"use client";

import * as React from "react";
import {
  Shield,
  CheckCircle2,
  XCircle,
  Eye,
  RefreshCw,
} from "lucide-react";
import { CustomSelect, type SelectOption } from "@/components/ui/custom-select";
import type {
  SettingAuditLogItem,
  SettingAuditLogsResponse,
  GetSettingAuditLogsParams,
} from "../../types/admin-settings";

interface SettingsAuditLogsTabProps {
  data?: SettingAuditLogsResponse;
  isLoading: boolean;
  queryParams: GetSettingAuditLogsParams;
  onFilterChange: (params: Partial<GetSettingAuditLogsParams>) => void;
  onRefresh: () => void;
}

const CATEGORY_OPTIONS: SelectOption<string>[] = [
  { value: "ALL", label: "All Categories" },
  { value: "GENERAL", label: "General Settings" },
  { value: "PAYMENT", label: "Payment Gateway" },
  { value: "WEBHOOK", label: "Webhook Events" },
  { value: "CLOUDINARY", label: "Cloudinary Storage" },
  { value: "SMTP", label: "Email & SMTP" },
  { value: "SECURITY", label: "Security & Access" },
];

const STATUS_OPTIONS: SelectOption<string>[] = [
  { value: "ALL", label: "All Statuses" },
  { value: "SUCCESS", label: "Success Only" },
  { value: "FAILED", label: "Failed / Rejected Only" },
];

const LIMIT_OPTIONS: SelectOption<number>[] = [
  { value: 10, label: "Show 10 per page" },
  { value: 25, label: "Show 25 per page" },
  { value: 50, label: "Show 50 per page" },
];

export function SettingsAuditLogsTab({
  data,
  isLoading,
  queryParams,
  onFilterChange,
  onRefresh,
}: SettingsAuditLogsTabProps) {
  const [selectedLog, setSelectedLog] = React.useState<SettingAuditLogItem | null>(null);

  const logs = data?.logs || [];
  const pagination = data?.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 };

  const formatDateTime = (dateStr: string) => {
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

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case "PAYMENT":
        return "bg-[#FFF0E6] text-[#FF5A5F] border-[#FFD0B8]";
      case "WEBHOOK":
        return "bg-[#EBF3FF] text-[#0066CC] border-[#BCD8FF]";
      case "CLOUDINARY":
        return "bg-[#F3E8FF] text-[#7E22CE] border-[#E9D5FF]";
      case "SMTP":
        return "bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]";
      case "SECURITY":
        return "bg-[#FEE2E2] text-[#991B1B] border-[#FECACA]";
      default:
        return "bg-[#E8F8F5] text-[#00A699] border-[#A2E2D8]";
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[12px] border border-[#E5EAED] bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 mb-6 border-b border-[#F0F4F6] gap-2">
          <div>
            <h3 className="font-outfit text-lg font-bold text-[#18282A] flex items-center gap-2">
              <Shield className="h-5 w-5 text-[#00A699]" /> Configuration Audit History & Security Log
            </h3>
            <p className="text-sm text-[#74818A]">
              Immutable audit trail recording administrative configuration changes, secret replacements, and verification actions.
            </p>
          </div>
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 rounded-[8px] border border-[#D5DDE2] bg-white px-3.5 py-2 text-xs font-semibold text-[#18282A] hover:bg-[#F8FAFB] transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} /> Refresh Log
          </button>
        </div>

        {/* Filters Toolbar */}
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-[#74818A] uppercase tracking-wider block">
              Filter Category
            </label>
            <CustomSelect<string>
              options={CATEGORY_OPTIONS}
              value={queryParams.category || "ALL"}
              onChange={(val) => onFilterChange({ category: val, page: 1 })}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-[#74818A] uppercase tracking-wider block">
              Filter Status
            </label>
            <CustomSelect<string>
              options={STATUS_OPTIONS}
              value={queryParams.status || "ALL"}
              onChange={(val) => onFilterChange({ status: val, page: 1 })}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-[#74818A] uppercase tracking-wider block">
              Records Per Page
            </label>
            <CustomSelect<number>
              options={LIMIT_OPTIONS}
              value={queryParams.limit || 10}
              onChange={(val) => onFilterChange({ limit: val, page: 1 })}
            />
          </div>
        </div>

        {/* Audit Table */}
        <div className="overflow-x-auto rounded-[8px] border border-[#E5EAED]">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F8FAFB] text-[#74818A] border-b border-[#E5EAED]">
                <th className="py-3 px-4 font-semibold">Timestamp</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold">Action</th>
                <th className="py-3 px-4 font-semibold">Actor</th>
                <th className="py-3 px-4 font-semibold">IP Address</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5EAED] text-[#18282A]">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#74818A]">
                    <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-[#00A699]" />
                    Loading configuration audit history...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#74818A]">
                    No audit log records match the current filters.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#F8FAFB] transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap text-[#74818A] font-mono text-[11px]">
                      {formatDateTime(log.createdAt)}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${getCategoryBadgeClass(
                          log.category
                        )}`}
                      >
                        {log.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold font-mono text-[11px]">
                      {log.action}
                    </td>
                    <td className="py-3 px-4">
                      {log.actorName ? (
                        <div>
                          <div className="font-semibold text-[#18282A]">{log.actorName}</div>
                          <div className="text-[11px] text-[#74818A]">{log.actorEmail}</div>
                        </div>
                      ) : (
                        <span className="text-[#74818A]">System</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-[#74818A] font-mono text-[11px]">
                      {log.ipAddress || "—"}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {log.status === "SUCCESS" ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-[#00A699]">
                          <CheckCircle2 className="h-3.5 w-3.5" /> SUCCESS
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-semibold text-[#FF5A5F]">
                          <XCircle className="h-3.5 w-3.5" /> FAILED
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedLog(log)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#00A699] hover:text-[#008f84]"
                      >
                        <Eye className="h-3 w-3" /> View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {pagination.totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between text-xs text-[#74818A]">
            <div>
              Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total logs)
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={pagination.page <= 1 || isLoading}
                onClick={() => onFilterChange({ page: pagination.page - 1 })}
                className="rounded-[6px] border border-[#D5DDE2] bg-white px-3 py-1.5 font-semibold text-[#18282A] hover:bg-[#F8FAFB] disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={pagination.page >= pagination.totalPages || isLoading}
                onClick={() => onFilterChange({ page: pagination.page + 1 })}
                className="rounded-[6px] border border-[#D5DDE2] bg-white px-3 py-1.5 font-semibold text-[#18282A] hover:bg-[#F8FAFB] disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Audit Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-[12px] bg-white p-6 shadow-xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F4F6]">
              <h3 className="font-outfit text-base font-bold text-[#18282A] flex items-center gap-2">
                <Shield className="h-4 w-4 text-[#00A699]" /> Audit Log Record
              </h3>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${getCategoryBadgeClass(
                  selectedLog.category
                )}`}
              >
                {selectedLog.category}
              </span>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div>
                <span className="font-semibold text-[#74818A] uppercase tracking-wider block text-[10px]">
                  Action
                </span>
                <span className="font-mono text-sm font-bold text-[#18282A]">
                  {selectedLog.action}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="font-semibold text-[#74818A] uppercase tracking-wider block text-[10px]">
                    Actor
                  </span>
                  <span className="text-[#18282A]">
                    {selectedLog.actorName || "System Actor"}
                  </span>
                  {selectedLog.actorEmail && (
                    <span className="text-[11px] text-[#74818A] block">
                      {selectedLog.actorEmail}
                    </span>
                  )}
                </div>

                <div>
                  <span className="font-semibold text-[#74818A] uppercase tracking-wider block text-[10px]">
                    Recorded Timestamp
                  </span>
                  <span className="text-[#18282A]">
                    {formatDateTime(selectedLog.createdAt)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="font-semibold text-[#74818A] uppercase tracking-wider block text-[10px]">
                    IP Address
                  </span>
                  <span className="font-mono text-[#18282A]">
                    {selectedLog.ipAddress || "Internal / Local"}
                  </span>
                </div>

                <div>
                  <span className="font-semibold text-[#74818A] uppercase tracking-wider block text-[10px]">
                    Status
                  </span>
                  <span
                    className={`font-semibold ${
                      selectedLog.status === "SUCCESS"
                        ? "text-[#00A699]"
                        : "text-[#FF5A5F]"
                    }`}
                  >
                    {selectedLog.status}
                  </span>
                </div>
              </div>

              {selectedLog.errorMessage && (
                <div className="rounded-[8px] bg-[#FFF0E6] p-3 text-[#9B2C2C] border border-[#FFD0B8]">
                  <span className="font-bold block">Error Message:</span>
                  {selectedLog.errorMessage}
                </div>
              )}

              <div>
                <span className="font-semibold text-[#74818A] uppercase tracking-wider block text-[10px] mb-1">
                  Non-Sensitive Metadata Payload
                </span>
                <pre className="rounded-[8px] bg-[#F8FAFB] p-3 font-mono text-[11px] text-[#18282A] border border-[#E5EAED] overflow-x-auto max-h-48">
                  {JSON.stringify(selectedLog.metadata || {}, null, 2)}
                </pre>
                <p className="mt-1 text-[10px] text-[#74818A]">
                  Sensitive secret values and passwords are never recorded in the audit history.
                </p>
              </div>
            </div>

            <div className="mt-5 flex justify-end border-t border-[#F0F4F6] pt-3">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="rounded-[8px] bg-[#18282A] px-4 py-2 text-xs font-semibold text-white hover:bg-[#2c3e40]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
