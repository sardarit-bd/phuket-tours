import * as React from "react";
import { FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  className?: string;
  compact?: boolean;
}

export function EmptyState({
  title = "No results found",
  description = "We couldn't find anything matching your search criteria. Try adjusting your filters.",
  actionLabel,
  onAction,
  icon,
  className,
  compact = false,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        compact
          ? "rounded-xl border border-dashed border-[#E5EAED] bg-[#F8FAFB] py-6 px-4"
          : "rounded-2xl border border-dashed border-border bg-muted/40 p-12",
        className
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center",
          compact
            ? "mb-2.5 h-10 w-10 rounded-xl border border-[#E5EAED] bg-white text-[#74818A]"
            : "mb-4 h-14 w-14 rounded-2xl bg-muted text-muted-foreground"
        )}
      >
        {icon || (compact ? <FolderOpen className="h-5 w-5" /> : <FolderOpen className="h-7 w-7" />)}
      </div>
      <h3
        className={cn(
          "font-semibold text-foreground",
          compact ? "text-sm text-[#18282A]" : "text-lg"
        )}
      >
        {title}
      </h3>
      <p
        className={cn(
          "max-w-sm text-muted-foreground leading-relaxed",
          compact ? "mt-1 text-xs text-[#74818A]" : "mt-1.5 text-sm"
        )}
      >
        {description}
      </p>
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          variant="outline"
          size="sm"
          className={cn(compact ? "mt-3" : "mt-6")}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
