import * as React from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, ShieldAlert } from "lucide-react";
import type { CommissionRateType } from "../../types/admin-commissions";

interface CommissionRateChangeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  rateType: CommissionRateType;
  newRateValue: number;
  currentRateDisplay: string;
  isLoading: boolean;
}

export function CommissionRateChangeDialog({
  isOpen,
  onClose,
  onConfirm,
  rateType,
  newRateValue,
  currentRateDisplay,
  isLoading,
}: CommissionRateChangeDialogProps) {
  const newRateDisplay =
    rateType === "PERCENTAGE"
      ? `${newRateValue}%`
      : `฿${newRateValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={isLoading ? () => {} : onClose}
      title={
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-50 text-[#3297A3]">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <span className="font-outfit text-base font-bold text-slate-900 block">
              Confirm Commission Rate Update
            </span>
            <span className="text-xs text-slate-500 font-normal">
              Changing from {currentRateDisplay} to {newRateDisplay}
            </span>
          </div>
        </div>
      }
      size="sm"
    >
      <div className="space-y-4 pt-1">
        <p className="text-xs text-slate-600 leading-relaxed font-normal">
          Are you sure you want to update the platform commission rate? This change will apply to future eligible partner bookings. Previously calculated commissions will remain unchanged.
        </p>

        <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3 text-xs text-blue-900 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-blue-600 mt-0.5" />
          <span className="leading-relaxed">
            The previous rate is safely saved in history for financial records and audit compliance.
          </span>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={onConfirm}
            disabled={isLoading}
            className="text-xs bg-[#3297A3] hover:bg-[#287983] text-white font-semibold"
            data-testid="confirm-save-rate-btn"
          >
            {isLoading ? "Saving..." : "Confirm & Update Rate"}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}

interface DisableCommissionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

export function DisableCommissionDialog({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}: DisableCommissionDialogProps) {
  return (
    <Dialog
      isOpen={isOpen}
      onClose={isLoading ? () => {} : onClose}
      title={
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-50 text-amber-600">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <span className="font-outfit text-base font-bold text-slate-900 block">
              Disable Commission Generation
            </span>
            <span className="text-xs text-amber-700 font-normal">
              Pause all partner earnings for future bookings
            </span>
          </div>
        </div>
      }
      size="sm"
    >
      <div className="space-y-4 pt-1">
        <p className="text-xs text-slate-600 leading-relaxed font-normal">
          Are you sure you want to stop generating new commissions? Future eligible partner reservations will not earn commissions until a rate is re-enabled. All existing and historical commissions remain safe and unchanged.
        </p>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={onConfirm}
            disabled={isLoading}
            className="text-xs bg-amber-600 hover:bg-amber-700 text-white font-semibold"
            data-testid="confirm-disable-commission-btn"
          >
            {isLoading ? "Disabling..." : "Yes, Disable Commission"}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}

