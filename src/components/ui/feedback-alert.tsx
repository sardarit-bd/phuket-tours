import * as React from "react";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type FeedbackType = "error" | "warning" | "success" | "info";

export interface FeedbackAlertProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: FeedbackType;
  title?: string;
  message?: React.ReactNode;
  code?: string | number;
  icon?: React.ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  action?: React.ReactNode;
}

const FEEDBACK_CONFIG: Record<
  FeedbackType,
  {
    container: string;
    icon: React.ReactNode;
    title: string;
    text: string;
    codeBadge: string;
  }
> = {
  error: {
    container: "border-red-400/80 bg-red-50 text-red-950 shadow-xs",
    icon: (
      <AlertCircle
        className="h-5 w-5 shrink-0 text-red-600 mt-0.5"
        aria-hidden="true"
      />
    ),
    title: "text-red-900 font-bold text-sm",
    text: "text-red-800 text-xs",
    codeBadge: "bg-red-100 text-red-900 border-red-300",
  },
  warning: {
    container: "border-amber-400/80 bg-amber-50 text-amber-950 shadow-xs",
    icon: (
      <AlertTriangle
        className="h-5 w-5 shrink-0 text-amber-600 mt-0.5"
        aria-hidden="true"
      />
    ),
    title: "text-amber-900 font-bold text-sm",
    text: "text-amber-800 text-xs",
    codeBadge: "bg-amber-100 text-amber-900 border-amber-300",
  },
  success: {
    container: "border-emerald-400/80 bg-emerald-50 text-emerald-950 shadow-xs",
    icon: (
      <CheckCircle2
        className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5"
        aria-hidden="true"
      />
    ),
    title: "text-emerald-900 font-bold text-sm",
    text: "text-emerald-800 text-xs",
    codeBadge: "bg-emerald-100 text-emerald-900 border-emerald-300",
  },
  info: {
    container: "border-sky-400/80 bg-sky-50 text-sky-950 shadow-xs",
    icon: (
      <Info
        className="h-5 w-5 shrink-0 text-sky-600 mt-0.5"
        aria-hidden="true"
      />
    ),
    title: "text-sky-900 font-bold text-sm",
    text: "text-sky-800 text-xs",
    codeBadge: "bg-sky-100 text-sky-900 border-sky-300",
  },
};

export const FeedbackAlert = React.forwardRef<HTMLDivElement, FeedbackAlertProps>(
  (
    {
      type = "error",
      title,
      message,
      code,
      icon,
      dismissible,
      onDismiss,
      action,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const config = FEEDBACK_CONFIG[type];
    const canDismiss = dismissible || Boolean(onDismiss);

    return (
      <div
        ref={ref}
        role={type === "error" ? "alert" : "status"}
        aria-live={type === "error" ? "assertive" : "polite"}
        className={cn(
          "relative flex items-start gap-3 rounded-xl border p-3.5 transition-all",
          config.container,
          className
        )}
        {...props}
      >
        <div className="shrink-0">{icon ?? config.icon}</div>

        <div className="flex-1 min-w-0">
          {(title || code !== undefined) && (
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              {title && (
                <h5 className={cn("leading-tight font-outfit", config.title)}>
                  {title}
                </h5>
              )}
              {code !== undefined && (
                <span
                  className={cn(
                    "inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase",
                    config.codeBadge
                  )}
                  aria-label={`Status code ${code}`}
                >
                  HTTP {code}
                </span>
              )}
            </div>
          )}

          {message && (
            <div className={cn("leading-relaxed break-words", config.text)}>
              {message}
            </div>
          )}

          {children && (
            <div className={cn("leading-relaxed break-words mt-1", config.text)}>
              {children}
            </div>
          )}

          {action && <div className="mt-2.5">{action}</div>}
        </div>

        {canDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss alert"
            className="shrink-0 rounded-md p-1 text-current opacity-70 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current transition-opacity cursor-pointer"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
    );
  }
);

FeedbackAlert.displayName = "FeedbackAlert";

