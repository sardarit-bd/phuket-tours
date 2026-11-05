import * as React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface UsersErrorStateProps {
  errorMessage?: string;
  onRetry: () => void;
  isRetrying?: boolean;
}

export function UsersErrorState({
  errorMessage = "Failed to load user accounts. Please check your connection or permissions and try again.",
  onRetry,
  isRetrying = false,
}: UsersErrorStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center p-12 text-center"
      role="alert"
      data-testid="users-error-state"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 mb-4">
        <AlertCircle className="h-6 w-6" aria-hidden="true" />
      </div>

      <h3 className="font-outfit text-base font-bold text-[#18282A]">
        Error Loading Users
      </h3>

      <p className="mt-1.5 max-w-sm text-xs text-rose-700 leading-relaxed">
        {errorMessage}
      </p>

      <div className="mt-5">
        <Button
          type="button"
          onClick={onRetry}
          disabled={isRetrying}
          variant="outline"
          size="sm"
          className="border-rose-200 bg-white text-xs font-semibold text-rose-700 hover:bg-rose-50 cursor-pointer"
          data-testid="users-retry-btn"
        >
          <RefreshCw
            className={`mr-1.5 h-3.5 w-3.5 ${isRetrying ? "animate-spin" : ""}`}
          />
          {isRetrying ? "Retrying..." : "Retry Loading"}
        </Button>
      </div>
    </div>
  );
}
