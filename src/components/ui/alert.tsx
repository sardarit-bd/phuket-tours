import * as React from "react";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type AlertVariant = "error" | "warning" | "success" | "info";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  title?: string;
  description?: React.ReactNode;
  message?: React.ReactNode;
  icon?: React.ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  action?: React.ReactNode;
}

const variantStyles: Record<
  AlertVariant,
  {
    container: string;
    icon: React.ReactNode;
    title: string;
    text: string;
  }
> = {
  error: {
    container: "border-destructive/30 bg-destructive/10 text-destructive",
    icon: <AlertCircle className="h-4 w-4 shrink-0 text-destructive mt-0.5" aria-hidden="true" />,
    title: "text-destructive font-semibold",
    text: "text-destructive/90 text-xs",
  },
  warning: {
    container: "border-amber-500/30 bg-amber-500/10 text-amber-900",
    icon: <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" aria-hidden="true" />,
    title: "text-amber-900 font-semibold",
    text: "text-amber-800 text-xs",
  },
  success: {
    container: "border-emerald-500/30 bg-emerald-500/10 text-emerald-950",
    icon: <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" aria-hidden="true" />,
    title: "text-emerald-950 font-semibold",
    text: "text-emerald-800 text-xs",
  },
  info: {
    container: "border-sky-500/30 bg-sky-500/10 text-sky-950",
    icon: <Info className="h-4 w-4 shrink-0 text-sky-600 mt-0.5" aria-hidden="true" />,
    title: "text-sky-950 font-semibold",
    text: "text-sky-800 text-xs",
  },
};

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      variant = "error",
      title,
      description,
      message,
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
    const config = variantStyles[variant];
    const content = message ?? description;
    const canDismiss = dismissible || Boolean(onDismiss);

    return (
      <div
        ref={ref}
        role={variant === "error" ? "alert" : "status"}
        className={cn(
          "relative flex items-start gap-3 rounded-xl border p-3.5 transition-all text-xs",
          config.container,
          className
        )}
        {...props}
      >
        <div className="shrink-0">{icon ?? config.icon}</div>

        <div className="flex-1 min-w-0">
          {title && <h5 className={cn("text-xs font-semibold leading-tight mb-1", config.title)}>{title}</h5>}
          {content && <div className={cn("leading-relaxed", config.text)}>{content}</div>}
          {children && <div className={cn("leading-relaxed", config.text)}>{children}</div>}
          {action && <div className="mt-2.5">{action}</div>}
        </div>

        {canDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss alert"
            className="shrink-0 rounded-md p-1 text-current opacity-70 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current transition-opacity cursor-pointer"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        )}
      </div>
    );
  }
);
Alert.displayName = "Alert";

/**
 * Specialized semantic alerts for convenience
 */
export const ErrorAlert = React.forwardRef<HTMLDivElement, Omit<AlertProps, "variant">>(
  (props, ref) => <Alert ref={ref} variant="error" {...props} />
);
ErrorAlert.displayName = "ErrorAlert";

export const WarningAlert = React.forwardRef<HTMLDivElement, Omit<AlertProps, "variant">>(
  (props, ref) => <Alert ref={ref} variant="warning" {...props} />
);
WarningAlert.displayName = "WarningAlert";

export const SuccessAlert = React.forwardRef<HTMLDivElement, Omit<AlertProps, "variant">>(
  (props, ref) => <Alert ref={ref} variant="success" {...props} />
);
SuccessAlert.displayName = "SuccessAlert";

export const InfoAlert = React.forwardRef<HTMLDivElement, Omit<AlertProps, "variant">>(
  (props, ref) => <Alert ref={ref} variant="info" {...props} />
);
InfoAlert.displayName = "InfoAlert";

