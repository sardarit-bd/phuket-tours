import * as React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ToursErrorStateProps {
  errorMessage?: string;
  onRetry: () => void;
}

export function ToursErrorState({
  errorMessage = "Unable to load tour listings from the server. Please check your connection and try again.",
  onRetry,
}: ToursErrorStateProps) {
  return (
    <div
      data-testid="tours-error-state"
      className="flex flex-col items-center justify-center px-6 py-16 text-center"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FDF0EE] text-[#C0392B] border border-[#FCD2CD]">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-[#18282A]">
        Failed to load tours
      </h3>
      <p className="mt-1.5 max-w-sm text-xs text-[#74818A] leading-relaxed">
        {errorMessage}
      </p>
      <Button
        type="button"
        size="sm"
        onClick={onRetry}
        data-testid="tours-retry-button"
        className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-[#176779] px-4 text-xs font-semibold text-white shadow-sm hover:bg-[#125261] transition-colors cursor-pointer"
      >
        <RefreshCw className="h-3.5 w-3.5" />
        <span>Retry Connection</span>
      </Button>
    </div>
  );
}
