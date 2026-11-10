"use client";

import * as React from "react";
import {
  Plus,
  RotateCcw,
  Percent,
  Coins,
  CheckCircle2,
  XCircle,
  Eye,
  Edit2,
  Trash2,
  AlertCircle,
  ShieldAlert,
} from "lucide-react";
import {
  useGetAdminCommissionRulesQuery,
  useCreateDraftCommissionPolicyMutation,
  useUpdateCommissionPolicyMutation,
  useDeleteCommissionPolicyMutation,
  usePublishCommissionPolicyMutation,
  useDeactivateCommissionPolicyMutation,
} from "../../api/admin-api";
import { CommissionsPagination } from "./commissions-pagination";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ErrorAlert, SuccessAlert } from "@/components/ui/alert";
import { formatErrorMessage } from "@/features/auth/utils/error-mapper";
import type {
  AdminCommissionRule,
  CommissionRateType,
} from "../../types/admin-commissions";

const formatDate = (isoString?: string | null): string => {
  if (!isoString) return "—";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "—";
  }
};

const formatFullDate = (isoString?: string | null): string => {
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

export function CommissionRulesTab() {
  const [page, setPage] = React.useState<number>(1);
  const limit = 10;

  // Modals state
  const [isAddEditModalOpen, setIsAddEditModalOpen] = React.useState<boolean>(false);
  const [editingCommission, setEditingCommission] = React.useState<AdminCommissionRule | null>(null);

  const [viewingCommission, setViewingCommission] = React.useState<AdminCommissionRule | null>(null);

  const [deletingCommission, setDeletingCommission] = React.useState<AdminCommissionRule | null>(null);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);

  const [activatingCommission, setActivatingCommission] = React.useState<AdminCommissionRule | null>(null);
  const [deactivatingCommission, setDeactivatingCommission] = React.useState<AdminCommissionRule | null>(null);

  // Form State
  const [name, setName] = React.useState<string>("");
  const [rateType, setRateType] = React.useState<CommissionRateType>("PERCENTAGE");
  const [rateValueStr, setRateValueStr] = React.useState<string>("10");
  const [description, setDescription] = React.useState<string>("");
  const [status, setStatus] = React.useState<"ACTIVE" | "INACTIVE">("ACTIVE");
  const [formError, setFormError] = React.useState<string | null>(null);

  // Global Alerts
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // RTK Query Hooks
  const {
    data: rulesResponse,
    isLoading,
    isFetching,
    refetch,
  } = useGetAdminCommissionRulesQuery({ page, limit });

  const [createCommission, { isLoading: isCreating }] = useCreateDraftCommissionPolicyMutation();
  const [updateCommission, { isLoading: isUpdating }] = useUpdateCommissionPolicyMutation();
  const [deleteCommission, { isLoading: isDeleting }] = useDeleteCommissionPolicyMutation();
  const [publishCommission, { isLoading: isActivating }] = usePublishCommissionPolicyMutation();
  const [deactivateCommission, { isLoading: isDeactivating }] = useDeactivateCommissionPolicyMutation();

  const rules = rulesResponse?.data?.items || [];
  const activeRule = rulesResponse?.data?.activeRule || null;
  const total = rulesResponse?.data?.total || 0;

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingCommission(null);
    setName("");
    setRateType("PERCENTAGE");
    setRateValueStr("10");
    setDescription("");
    setStatus("ACTIVE");
    setFormError(null);
    setIsAddEditModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (rule: AdminCommissionRule) => {
    setEditingCommission(rule);
    setName(rule.name || (rule.rateType === "PERCENTAGE" ? `${rule.rateValue}% Rate` : `฿${rule.rateValue} Fee`));
    setRateType(rule.rateType);
    setRateValueStr(String(rule.rateValue));
    setDescription(rule.description || "");
    setStatus(rule.isActive ? "ACTIVE" : "INACTIVE");
    setFormError(null);
    setIsAddEditModalOpen(true);
  };

  // Form Submission
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);
    setErrorMessage(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setFormError("Commission Name is required.");
      return;
    }

    const numericRate = parseFloat(rateValueStr);
    if (isNaN(numericRate) || numericRate <= 0) {
      setFormError("Commission Rate must be a number greater than 0.");
      return;
    }

    if (rateType === "PERCENTAGE" && numericRate > 100) {
      setFormError("Percentage rate cannot exceed 100%.");
      return;
    }

    const trimmedDesc = description.trim();

    try {
      if (editingCommission) {
        await updateCommission({
          policyId: editingCommission.id,
          input: {
            name: trimmedName,
            description: trimmedDesc || undefined,
            rateType,
            rateValue: Math.round(numericRate * 100) / 100,
            status,
            isActive: status === "ACTIVE",
          },
        }).unwrap();

        setSuccessMessage(`Commission "${trimmedName}" updated successfully.`);
      } else {
        await createCommission({
          name: trimmedName,
          description: trimmedDesc || undefined,
          rateType,
          rateValue: Math.round(numericRate * 100) / 100,
          status,
          isActive: status === "ACTIVE",
        }).unwrap();

        setSuccessMessage(`Commission "${trimmedName}" created successfully.`);
      }

      setIsAddEditModalOpen(false);
    } catch (err: unknown) {
      setFormError(
        formatErrorMessage(err, {
          context: "admin",
          fallback: "Failed to save commission. Please verify the input values.",
        })
      );
    }
  };

  // Delete Action
  const handleConfirmDelete = async () => {
    if (!deletingCommission) return;
    setDeleteError(null);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      await deleteCommission(deletingCommission.id).unwrap();
      setSuccessMessage(`Commission "${deletingCommission.name || deletingCommission.id}" deleted successfully.`);
      setDeletingCommission(null);
    } catch (err: unknown) {
      setDeleteError(
        formatErrorMessage(err, {
          context: "admin",
          fallback: "Cannot delete this commission. It may be active or referenced by bookings.",
        })
      );
    }
  };

  // Activate Action
  const handleConfirmActivate = async () => {
    if (!activatingCommission) return;
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      await publishCommission(activatingCommission.id).unwrap();
      setSuccessMessage(`Commission "${activatingCommission.name || activatingCommission.id}" is now ACTIVE. Any previously active commission has been deactivated.`);
      setActivatingCommission(null);
    } catch (err: unknown) {
      setErrorMessage(
        formatErrorMessage(err, {
          context: "admin",
          fallback: "Failed to activate commission.",
        })
      );
      setActivatingCommission(null);
    }
  };

  // Deactivate Action
  const handleConfirmDeactivate = async () => {
    if (!deactivatingCommission) return;
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      await deactivateCommission(deactivatingCommission.id).unwrap();
      setSuccessMessage(`Commission "${deactivatingCommission.name || deactivatingCommission.id}" deactivated. Commission generation is currently paused.`);
      setDeactivatingCommission(null);
    } catch (err: unknown) {
      setErrorMessage(
        formatErrorMessage(err, {
          context: "admin",
          fallback: "Failed to deactivate commission.",
        })
      );
      setDeactivatingCommission(null);
    }
  };

  return (
    <div className="space-y-6" data-testid="commission-rules-tab">
      {/* Header & Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs">
        <div>
          <h2 className="font-outfit text-xl font-bold tracking-tight text-slate-900">
            Commission Management
          </h2>
          <p className="mt-1 text-xs text-slate-500 leading-relaxed max-w-2xl">
            Manage commission rates applied to partner bookings. Only one commission can be active at a time.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            variant="outline"
            size="sm"
            className="text-xs h-9 px-3 rounded-lg"
            title="Refresh list"
          >
            <RotateCcw className={`h-3.5 w-3.5 mr-1.5 ${isFetching ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>

          <Button
            type="button"
            data-testid="add-commission-btn"
            onClick={handleOpenAdd}
            className="bg-[#3297A3] hover:bg-[#287983] text-white text-xs font-semibold h-9 px-4 rounded-lg cursor-pointer shadow-2xs"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            <span>Add Commission</span>
          </Button>
        </div>
      </div>

      {/* Global Alerts */}
      {successMessage && (
        <SuccessAlert
          data-testid="commission-crud-success"
          description={successMessage}
        />
      )}

      {errorMessage && (
        <ErrorAlert
          data-testid="commission-crud-error"
          description={errorMessage}
        />
      )}

      {/* Active Commission Status Banner if none is active */}
      {!activeRule && !isLoading && (
        <div
          data-testid="no-active-commission-banner"
          className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 flex items-center justify-between gap-3 text-xs text-amber-900"
        >
          <div className="flex items-center gap-2.5">
            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
            <span>
              <strong>No commission is currently active.</strong> New partner bookings will not generate commissions until an active rate is configured.
            </span>
          </div>
          <Button
            type="button"
            size="sm"
            onClick={handleOpenAdd}
            className="bg-amber-600 hover:bg-amber-700 text-white text-xs h-8 px-3 rounded-lg shrink-0"
          >
            Add Active Rate
          </Button>
        </div>
      )}

      {/* Commission Table */}
      <div className="rounded-xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden" data-testid="rules-history-table">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" data-testid="commission-management-table">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Commission Name</th>
                <th className="py-3 px-4">Rate</th>
                <th className="py-3 px-4">Calculation Type</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Created Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Loading commission rates...
                  </td>
                </tr>
              ) : rules.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No commission rates found. Click &ldquo;+ Add Commission&rdquo; to create one.
                  </td>
                </tr>
              ) : (
                rules.map((rule) => {
                  const isCurrentActive = rule.isActive && rule.status === "ACTIVE";
                  const displayName = rule.name || (rule.rateType === "PERCENTAGE" ? `${rule.rateValue}% Rate` : `฿${rule.rateValue} Fee`);

                  return (
                    <tr
                      key={rule.id}
                      data-testid={`commission-row-${rule.id}`}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      {/* Commission Name */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{displayName}</div>
                        {rule.description && (
                          <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                            {rule.description}
                          </div>
                        )}
                      </td>

                      {/* Rate */}
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {rule.rateType === "PERCENTAGE"
                          ? `${Number(rule.rateValue).toFixed(2)}%`
                          : formatTHB(Number(rule.rateValue))}
                      </td>

                      {/* Calculation Type */}
                      <td className="py-3 px-4 text-slate-600">
                        {rule.rateType === "PERCENTAGE" ? (
                          <span className="inline-flex items-center gap-1 text-slate-700">
                            <Percent className="h-3 w-3 text-slate-400" />
                            <span>Percentage</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-slate-700">
                            <Coins className="h-3 w-3 text-slate-400" />
                            <span>Fixed Fee</span>
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        {isCurrentActive ? (
                          <span
                            data-testid={`status-active-${rule.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                            Active
                          </span>
                        ) : (
                          <span
                            data-testid={`status-inactive-${rule.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600"
                          >
                            Inactive
                          </span>
                        )}
                      </td>

                      {/* Created Date */}
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        {formatDate(rule.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center justify-end gap-1">
                          {/* Toggle Active / Inactive */}
                          {isCurrentActive ? (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              data-testid={`deactivate-btn-${rule.id}`}
                              onClick={() => setDeactivatingCommission(rule)}
                              className="h-8 px-2 text-[11px] text-amber-700 hover:text-amber-800 hover:bg-amber-50"
                              title="Deactivate this commission"
                            >
                              Deactivate
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              data-testid={`activate-btn-${rule.id}`}
                              onClick={() => setActivatingCommission(rule)}
                              className="h-8 px-2 text-[11px] text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 font-semibold"
                              title="Set as the single active commission"
                            >
                              Activate
                            </Button>
                          )}

                          {/* View */}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            data-testid={`view-commission-btn-${rule.id}`}
                            onClick={() => setViewingCommission(rule)}
                            className="h-8 w-8 p-0 text-slate-500 hover:text-slate-800"
                            title="View Commission Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>

                          {/* Edit */}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            data-testid={`edit-commission-btn-${rule.id}`}
                            onClick={() => handleOpenEdit(rule)}
                            className="h-8 w-8 p-0 text-slate-500 hover:text-slate-800"
                            title="Edit Commission"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>

                          {/* Delete */}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            data-testid={`delete-commission-btn-${rule.id}`}
                            onClick={() => {
                              setDeleteError(null);
                              setDeletingCommission(rule);
                            }}
                            disabled={isCurrentActive}
                            className={`h-8 w-8 p-0 ${
                              isCurrentActive
                                ? "text-slate-300 cursor-not-allowed"
                                : "text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                            }`}
                            title={isCurrentActive ? "Deactivate before deleting" : "Delete Commission"}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <CommissionsPagination
          page={page}
          limit={limit}
          total={total}
          onPageChange={setPage}
        />
      </div>

      {/* ================= MODAL: ADD / EDIT COMMISSION ================= */}
      <Dialog
        isOpen={isAddEditModalOpen}
        onClose={() => (isCreating || isUpdating ? undefined : setIsAddEditModalOpen(false))}
        title={
          <div className="flex items-center gap-2">
            <span className="font-outfit text-base font-bold text-slate-900">
              {editingCommission ? "Edit Commission" : "Add Commission"}
            </span>
          </div>
        }
        size="md"
      >
        <form onSubmit={handleSubmitForm} className="space-y-4 pt-1" data-testid="commission-form">
          {formError && (
            <ErrorAlert description={formError} />
          )}

          {/* Commission Name */}
          <div className="space-y-1">
            <label htmlFor="commission-name-input" className="text-xs font-semibold text-slate-700">
              Commission Name <span className="text-rose-500">*</span>
            </label>
            <input
              id="commission-name-input"
              data-testid="commission-name-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Standard Partner 10% or High Season Fixed Fee"
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 shadow-2xs transition-colors focus:border-[#3297A3] focus:outline-none focus:ring-2 focus:ring-[#3297A3]/20"
              required
            />
          </div>

          {/* Calculation Type */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">
              Calculation Type <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                data-testid="form-rate-type-percentage"
                onClick={() => setRateType("PERCENTAGE")}
                className={`flex items-center justify-center gap-2 h-9 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                  rateType === "PERCENTAGE"
                    ? "border-[#3297A3] bg-[#3297A3]/10 text-[#3297A3]"
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Percent className="h-3.5 w-3.5" />
                <span>Percentage (%)</span>
              </button>

              <button
                type="button"
                data-testid="form-rate-type-fixed"
                onClick={() => setRateType("FIXED")}
                className={`flex items-center justify-center gap-2 h-9 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                  rateType === "FIXED"
                    ? "border-[#3297A3] bg-[#3297A3]/10 text-[#3297A3]"
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Coins className="h-3.5 w-3.5" />
                <span>Fixed Fee (฿)</span>
              </button>
            </div>
          </div>

          {/* Commission Rate Value */}
          <div className="space-y-1">
            <label htmlFor="commission-rate-input" className="text-xs font-semibold text-slate-700">
              Commission Rate ({rateType === "PERCENTAGE" ? "% between 0.01 and 100" : "฿ THB"}) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs font-semibold text-slate-400">
                {rateType === "PERCENTAGE" ? "%" : "฿"}
              </span>
              <input
                id="commission-rate-input"
                data-testid="commission-rate-input"
                type="number"
                step="0.01"
                min="0.01"
                max={rateType === "PERCENTAGE" ? "100" : "99999999.99"}
                value={rateValueStr}
                onChange={(e) => setRateValueStr(e.target.value)}
                placeholder={rateType === "PERCENTAGE" ? "10.00" : "500.00"}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-8 pr-3 font-mono text-xs font-bold text-slate-900 shadow-2xs transition-colors focus:border-[#3297A3] focus:outline-none focus:ring-2 focus:ring-[#3297A3]/20"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label htmlFor="commission-desc-input" className="text-xs font-semibold text-slate-700">
              Description <span className="text-slate-400 text-[11px]">(Optional)</span>
            </label>
            <textarea
              id="commission-desc-input"
              data-testid="commission-desc-input"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add optional notes about where or why this commission is applied."
              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 shadow-2xs transition-colors focus:border-[#3297A3] focus:outline-none focus:ring-2 focus:ring-[#3297A3]/20"
            />
          </div>

          {/* Status Selection */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">
              Status
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                data-testid="form-status-active-btn"
                onClick={() => setStatus("ACTIVE")}
                className={`flex items-center justify-center gap-1.5 h-9 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                  status === "ACTIVE"
                    ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>Active</span>
              </button>

              <button
                type="button"
                data-testid="form-status-inactive-btn"
                onClick={() => setStatus("INACTIVE")}
                className={`flex items-center justify-center gap-1.5 h-9 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                  status === "INACTIVE"
                    ? "border-slate-400 bg-slate-100 text-slate-800"
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <XCircle className="h-3.5 w-3.5 text-slate-400" />
                <span>Inactive</span>
              </button>
            </div>
            {status === "ACTIVE" && (
              <p className="text-[11px] text-amber-700 mt-1">
                Note: Setting this commission as Active will automatically deactivate any currently active commission.
              </p>
            )}
          </div>

          {/* Dialog Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isCreating || isUpdating}
              onClick={() => setIsAddEditModalOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              data-testid="save-commission-btn"
              disabled={isCreating || isUpdating}
              className="bg-[#3297A3] hover:bg-[#287983] text-white text-xs font-semibold"
            >
              {isCreating || isUpdating ? "Saving..." : editingCommission ? "Save Changes" : "Create Commission"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* ================= MODAL: VIEW COMMISSION DETAILS ================= */}
      <Dialog
        isOpen={Boolean(viewingCommission)}
        onClose={() => setViewingCommission(null)}
        title={
          <div className="flex items-center gap-2">
            <span className="font-outfit text-base font-bold text-slate-900">
              Commission Details
            </span>
          </div>
        }
        size="md"
      >
        {viewingCommission && (
          <div className="space-y-4 pt-1 text-xs" data-testid="commission-view-details">
            <div className="grid grid-cols-2 gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Commission Name</span>
                <span className="font-bold text-slate-800 mt-0.5 block">
                  {viewingCommission.name || "—"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Current Status</span>
                <span className="mt-0.5 inline-block">
                  {viewingCommission.isActive ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
                      Inactive
                    </span>
                  )}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Calculation Type</span>
                <span className="font-medium text-slate-700 mt-0.5 block">
                  {viewingCommission.rateType === "PERCENTAGE" ? "Percentage" : "Fixed Fee"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Rate Value</span>
                <span className="font-mono font-bold text-slate-900 mt-0.5 block">
                  {viewingCommission.rateType === "PERCENTAGE"
                    ? `${Number(viewingCommission.rateValue).toFixed(2)}%`
                    : formatTHB(Number(viewingCommission.rateValue))}
                </span>
              </div>

              <div className="col-span-2">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Description</span>
                <span className="text-slate-700 mt-0.5 block">
                  {viewingCommission.description || "No description provided."}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Created Date</span>
                <span className="text-slate-600 mt-0.5 block">
                  {formatFullDate(viewingCommission.createdAt)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Last Updated</span>
                <span className="text-slate-600 mt-0.5 block">
                  {formatFullDate(viewingCommission.updatedAt || viewingCommission.createdAt)}
                </span>
              </div>

              <div className="col-span-2">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Created By</span>
                <span className="text-slate-700 mt-0.5 block font-medium">
                  {viewingCommission.createdBy?.name || viewingCommission.createdBy?.email || "Admin User"}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setViewingCommission(null)}
                className="text-xs"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* ================= MODAL: CONFIRM ACTIVATION ================= */}
      <Dialog
        isOpen={Boolean(activatingCommission)}
        onClose={() => (isActivating ? undefined : setActivatingCommission(null))}
        title={
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <span className="font-outfit text-base font-bold text-slate-900">
              Activate Commission
            </span>
          </div>
        }
        size="sm"
      >
        {activatingCommission && (
          <div className="space-y-4 pt-1 text-xs">
            <p className="text-slate-600 leading-relaxed">
              Are you sure you want to activate <strong>{activatingCommission.name || "this commission"}</strong>?
            </p>
            {activeRule && activeRule.id !== activatingCommission.id && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <span>Replaces Currently Active Commission</span>
                </div>
                <p className="text-[11px] text-amber-800">
                  The current active commission (<strong>{activeRule.name || `${activeRule.rateValue}%`}</strong>) will automatically be set to Inactive in an atomic transaction.
                </p>
              </div>
            )}
            <p className="text-slate-500 text-[11px]">
              This new rate will apply to future eligible partner bookings. Historical commissions remain untouched.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isActivating}
                onClick={() => setActivatingCommission(null)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                data-testid="confirm-activate-btn"
                disabled={isActivating}
                onClick={handleConfirmActivate}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
              >
                {isActivating ? "Activating..." : "Confirm & Activate"}
              </Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* ================= MODAL: CONFIRM DEACTIVATION ================= */}
      <Dialog
        isOpen={Boolean(deactivatingCommission)}
        onClose={() => (isDeactivating ? undefined : setDeactivatingCommission(null))}
        title={
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-amber-600" />
            <span className="font-outfit text-base font-bold text-slate-900">
              Deactivate Commission
            </span>
          </div>
        }
        size="sm"
      >
        {deactivatingCommission && (
          <div className="space-y-4 pt-1 text-xs">
            <p className="text-slate-600 leading-relaxed">
              Are you sure you want to deactivate <strong>{deactivatingCommission.name || "this commission"}</strong>?
            </p>
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-900 text-[11px] leading-relaxed">
              No commission will be active after this action. New partner bookings will not generate commissions until another rate is activated.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isDeactivating}
                onClick={() => setDeactivatingCommission(null)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                data-testid="confirm-deactivate-btn"
                disabled={isDeactivating}
                onClick={handleConfirmDeactivate}
                className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold"
              >
                {isDeactivating ? "Deactivating..." : "Yes, Deactivate"}
              </Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* ================= MODAL: CONFIRM DELETE ================= */}
      <Dialog
        isOpen={Boolean(deletingCommission)}
        onClose={() => (isDeleting ? undefined : setDeletingCommission(null))}
        title={
          <div className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-rose-600" />
            <span className="font-outfit text-base font-bold text-slate-900">
              Delete Commission
            </span>
          </div>
        }
        size="sm"
      >
        {deletingCommission && (
          <div className="space-y-4 pt-1 text-xs">
            {deleteError && (
              <ErrorAlert description={deleteError} />
            )}

            <p className="text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete <strong>{deletingCommission.name || "this commission"}</strong>?
            </p>
            <p className="text-slate-500 text-[11px]">
              Note: Commissions with associated historical booking or ledger records cannot be deleted to preserve financial audit integrity.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isDeleting}
                onClick={() => setDeletingCommission(null)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                data-testid="confirm-delete-commission-btn"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
              >
                {isDeleting ? "Deleting..." : "Yes, Delete Commission"}
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
