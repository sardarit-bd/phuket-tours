import * as React from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { History, ShieldCheck, Clock, User } from "lucide-react";
import type { AdminCommissionRule } from "../../types/admin-commissions";

interface PolicyDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  policy: AdminCommissionRule | null;
}

const formatDate = (isoString?: string | null): string => {
  if (!isoString) return "—";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch {
    return "—";
  }
};

const formatTHB = (amount: number): string => {
  return `฿${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export function PolicyDetailsDialog({
  isOpen,
  onClose,
  policy,
}: PolicyDetailsDialogProps) {
  if (!policy) return null;

  const rateDisplay =
    policy.rateType === "PERCENTAGE"
      ? `${Number(policy.rateValue).toFixed(2)}%`
      : formatTHB(Number(policy.rateValue));

  const statusBadge = {
    DRAFT: "bg-slate-100 text-slate-700 border-slate-300",
    ACTIVE: "bg-emerald-50 text-emerald-800 border-emerald-300",
    INACTIVE: "bg-amber-50 text-amber-800 border-amber-300",
    ARCHIVED: "bg-slate-100 text-slate-600 border-slate-200",
  }[policy.status || (policy.isActive ? "ACTIVE" : "INACTIVE")];

  const auditLogs = policy.auditLogs || [];

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center justify-between w-full pr-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-[#3297A3]" />
            <span className="font-outfit text-base font-bold text-slate-900">
              Commission Policy Details
            </span>
          </div>
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${statusBadge}`}>
            {policy.status || (policy.isActive ? "ACTIVE" : "INACTIVE")}
          </span>
        </div>
      }
      size="md"
    >
      <div className="space-y-4 pt-1 text-xs">
        <div className="font-mono text-[11px] text-slate-400">
          Policy ID: {policy.id}
        </div>

        {/* Policy Summary Details */}
        <div className="grid grid-cols-2 gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Policy Type</span>
            <span className="font-bold text-slate-800 mt-0.5 block">
              {policy.rateType === "PERCENTAGE" ? "Percentage of Booking" : "Fixed Fee per Reservation"}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Rate Value</span>
            <span className="font-mono font-extrabold text-slate-900 text-base mt-0.5 block">
              {rateDisplay}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Configured Date</span>
            <span className="text-slate-700 mt-0.5 block">
              {formatDate(policy.createdAt)}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Author Admin</span>
            <span className="font-mono text-slate-700 mt-0.5 block truncate" title={policy.createdBy?.name || policy.createdById}>
              {policy.createdBy?.name || policy.createdById.substring(0, 12) + "..."}
            </span>
          </div>
        </div>

        {/* Chronological Policy Audit Trail */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <History className="h-3.5 w-3.5 text-[#3297A3]" />
              <span>Audit & Action History</span>
            </span>
            <span className="text-[11px] text-slate-400">
              {auditLogs.length} action{auditLogs.length === 1 ? "" : "s"} logged
            </span>
          </div>

          {auditLogs.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 p-4 text-center text-slate-400 text-[11px]">
              No specific audit transitions recorded for this policy revision.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[240px] overflow-y-auto pr-1">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="rounded-lg border border-slate-200/80 bg-white p-3 space-y-1.5 shadow-3xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800 text-[11px] uppercase tracking-wide">
                      {log.action.replace(/_/g, " ")}
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(log.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-slate-500">
                    <User className="h-3 w-3 text-slate-400" />
                    <span>Admin: </span>
                    <span className="font-medium text-slate-700">
                      {log.admin?.name || log.admin?.email || (log.adminId ? log.adminId.substring(0, 8) : "Admin")}
                    </span>
                  </div>

                  {(log.previousValues || log.newValues) && (
                    <div className="text-[10px] bg-slate-50 p-2 rounded border border-slate-100 font-mono space-y-0.5">
                      {log.previousValues && (
                        <div className="text-slate-500 truncate">
                          <strong>Before:</strong> {JSON.stringify(log.previousValues)}
                        </div>
                      )}
                      {log.newValues && (
                        <div className="text-teal-900 truncate">
                          <strong>After:</strong> {JSON.stringify(log.newValues)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end pt-3 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs"
          >
            Close Details
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
