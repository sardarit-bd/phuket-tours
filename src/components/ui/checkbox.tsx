"use client";

import * as React from "react";
import { Check, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> {
  checked?: boolean;
  indeterminate?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  className?: string;
  id?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      checked = false,
      indeterminate = false,
      onCheckedChange,
      disabled = false,
      className,
      id,
      "aria-label": ariaLabel,
      ...props
    },
    ref
  ) => {
    const inputRef = React.useRef<HTMLInputElement>(null);

    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    React.useEffect(() => {
      if (inputRef.current) {
        inputRef.current.indeterminate = indeterminate;
      }
    }, [indeterminate]);

    const handleClick = () => {
      if (disabled) return;
      onCheckedChange?.(!checked);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (disabled) return;
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        onCheckedChange?.(!checked);
      }
    };

    return (
      <div className="relative inline-flex items-center justify-center">
        <input
          ref={inputRef}
          type="checkbox"
          id={id}
          checked={checked}
          disabled={disabled}
          onChange={(e) => onCheckedChange?.(e.target.checked)}
          className="sr-only"
          aria-label={ariaLabel}
          aria-checked={indeterminate ? "mixed" : checked}
          {...props}
        />
        <div
          role="checkbox"
          aria-checked={indeterminate ? "mixed" : checked}
          aria-label={ariaLabel}
          tabIndex={disabled ? -1 : 0}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          className={cn(
            "flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded-[4px] border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176779] focus-visible:ring-offset-1",
            checked || indeterminate
              ? "border-[#176779] bg-[#176779] text-white"
              : "border-[#CDD6DC] bg-white hover:border-[#74818A]",
            disabled && "cursor-not-allowed opacity-50 bg-[#F5F8F9] border-[#E5EAED]",
            className
          )}
        >
          {indeterminate ? (
            <Minus className="h-3 w-3 stroke-[3]" />
          ) : checked ? (
            <Check className="h-3 w-3 stroke-[3]" />
          ) : null}
        </div>
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";
