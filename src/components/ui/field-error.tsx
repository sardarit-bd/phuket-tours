import * as React from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FieldErrorProps extends React.HTMLAttributes<HTMLParagraphElement> {
  error?: string | null;
  id?: string;
  showIcon?: boolean;
}

export const FieldError = React.forwardRef<HTMLParagraphElement, FieldErrorProps>(
  ({ error, id, showIcon = false, className, ...props }, ref) => {
    if (!error) return null;

    return (
      <p
        ref={ref}
        id={id}
        role="alert"
        className={cn(
          "mt-1.5 flex items-center gap-1.5 text-xs font-medium text-destructive",
          className
        )}
        {...props}
      >
        {showIcon && <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
        <span>{error}</span>
      </p>
    );
  }
);
FieldError.displayName = "FieldError";

