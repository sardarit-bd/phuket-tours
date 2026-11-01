"use client";

import * as React from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption<T extends string | number = string | number> {
  value: T;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export type SelectSize = "sm" | "md" | "lg";

export interface CustomSelectProps<T extends string | number = string | number> {
  id?: string;
  name?: string;
  options: SelectOption<T>[];
  value?: T;
  defaultValue?: T;
  onChange?: (value: T) => void;
  placeholder?: string;
  size?: SelectSize;
  className?: string;
  triggerClassName?: string;
  menuClassName?: string;
  align?: "left" | "right";
  disabled?: boolean;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "data-testid"?: string;
}

const sizeStyles: Record<
  SelectSize,
  {
    trigger: string;
    text: string;
    icon: string;
    option: string;
  }
> = {
  sm: {
    trigger: "h-8 py-1 pl-2.5 pr-7 text-xs rounded-lg gap-1.5",
    text: "text-xs font-medium",
    icon: "h-3.5 w-3.5 right-2",
    option: "px-2.5 py-1.5 text-xs rounded-md",
  },
  md: {
    trigger: "h-9.5 py-1.5 pl-3.5 pr-8 text-xs sm:text-sm rounded-xl gap-2.5",
    text: "text-xs sm:text-sm font-semibold",
    icon: "h-4 w-4 right-2.5",
    option: "px-3 py-2 text-xs sm:text-sm rounded-lg",
  },
  lg: {
    trigger: "h-11 py-2 pl-4 pr-9 text-sm sm:text-base rounded-xl gap-3",
    text: "text-sm sm:text-base font-semibold",
    icon: "h-4.5 w-4.5 right-3",
    option: "px-3.5 py-2.5 text-sm rounded-lg",
  },
};

export function CustomSelect<T extends string | number = string | number>({
  id = "custom-select",
  name,
  options,
  value: controlledValue,
  defaultValue,
  onChange,
  placeholder = "Select option",
  size = "md",
  className = "",
  triggerClassName = "",
  menuClassName = "",
  align = "left",
  disabled = false,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  "data-testid": dataTestId,
}: CustomSelectProps<T>) {
  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = React.useState<T | undefined>(
    defaultValue ?? options[0]?.value
  );

  const currentValue = isControlled ? controlledValue : internalValue;

  const [isOpen, setIsOpen] = React.useState(false);
  const [highlightedIndex, setHighlightedIndex] = React.useState(-1);
  const [openUpwards, setOpenUpwards] = React.useState(false);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const menuRef = React.useRef<HTMLUListElement>(null);

  const selectedOption = options.find((opt) => opt.value === currentValue);

  // Auto-detect opening direction (upwards if space below is limited, e.g. in pagination footer)
  const updateDirection = React.useCallback(() => {
    if (triggerRef.current && typeof window !== "undefined") {
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const estimatedMenuHeight = Math.min(options.length * 38 + 16, 240);
      setOpenUpwards(spaceBelow < estimatedMenuHeight && rect.top > spaceBelow);
    }
  }, [options.length]);

  const toggleOpen = () => {
    if (disabled) return;
    if (!isOpen) {
      updateDirection();
      const currentIndex = options.findIndex((opt) => opt.value === currentValue);
      setHighlightedIndex(currentIndex >= 0 ? currentIndex : 0);
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  // Close when clicking outside
  React.useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [isOpen]);

  // Handle window resize and scroll
  React.useEffect(() => {
    if (!isOpen) return;

    const handleWindowEvents = () => {
      updateDirection();
    };

    window.addEventListener("resize", handleWindowEvents);
    window.addEventListener("scroll", handleWindowEvents, true);

    return () => {
      window.removeEventListener("resize", handleWindowEvents);
      window.removeEventListener("scroll", handleWindowEvents, true);
    };
  }, [isOpen, updateDirection]);

  // Scroll highlighted item into view during keyboard navigation
  React.useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && menuRef.current) {
      const itemEl = menuRef.current.children[highlightedIndex] as HTMLElement;
      if (typeof itemEl?.scrollIntoView === "function") {
        itemEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [isOpen, highlightedIndex]);

  // Keyboard accessibility
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;

    if (!isOpen) {
      if (
        e.key === "ArrowDown" ||
        e.key === "ArrowUp" ||
        e.key === "Enter" ||
        e.key === " "
      ) {
        e.preventDefault();
        updateDirection();
        const currentIndex = options.findIndex((opt) => opt.value === currentValue);
        setHighlightedIndex(currentIndex >= 0 ? currentIndex : 0);
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        triggerRef.current?.focus();
        break;

      case "Tab":
        setIsOpen(false);
        break;

      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) => {
          let next = (prev + 1) % options.length;
          // Skip disabled options
          while (options[next]?.disabled && next !== prev) {
            next = (next + 1) % options.length;
          }
          return next;
        });
        break;

      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => {
          let next = (prev - 1 + options.length) % options.length;
          // Skip disabled options
          while (options[next]?.disabled && next !== prev) {
            next = (next - 1 + options.length) % options.length;
          }
          return next;
        });
        break;

      case "Home":
        e.preventDefault();
        setHighlightedIndex(0);
        break;

      case "End":
        e.preventDefault();
        setHighlightedIndex(options.length - 1);
        break;

      case "Enter":
      case " ":
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < options.length) {
          const opt = options[highlightedIndex];
          if (!opt.disabled) {
            handleSelectOption(opt.value);
          }
        }
        break;
    }
  };

  const handleSelectOption = (optValue: T) => {
    if (!isControlled) {
      setInternalValue(optValue);
    }
    onChange?.(optValue);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const currentSize = sizeStyles[size] || sizeStyles.md;

  return (
    <div
      ref={containerRef}
      className={cn("relative inline-block text-left", className)}
      data-testid={dataTestId}
    >
      {/* Hidden input for HTML form compatibility if name is provided */}
      {name && (
        <input
          type="hidden"
          name={name}
          value={currentValue !== undefined ? String(currentValue) : ""}
        />
      )}

      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        id={id}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={`${id}-menu`}
        aria-activedescendant={
          isOpen && highlightedIndex >= 0
            ? `${id}-option-${highlightedIndex}`
            : undefined
        }
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        disabled={disabled}
        onClick={toggleOpen}
        onKeyDown={handleKeyDown}
        className={cn(
          "inline-flex w-full items-center justify-between border border-[#E5EAED] bg-white text-[#18282A] shadow-2xs hover:border-[#176779]/60 focus:border-[#176779] focus:outline-none focus:ring-1 focus:ring-[#176779] cursor-pointer transition-colors relative select-none disabled:opacity-40 disabled:cursor-not-allowed",
          currentSize.trigger,
          isOpen && "border-[#176779] ring-1 ring-[#176779]/30",
          triggerClassName
        )}
      >
        <span className={cn("truncate", currentSize.text)}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={cn(
            "pointer-events-none absolute text-[#74818A] transition-transform duration-200",
            currentSize.icon,
            isOpen && "rotate-180 text-[#176779]"
          )}
          aria-hidden="true"
        />
      </button>

      {/* Dropdown Menu Listbox */}
      {isOpen && (
        <ul
          ref={menuRef}
          id={`${id}-menu`}
          role="listbox"
          tabIndex={-1}
          aria-labelledby={ariaLabelledBy || id}
          className={cn(
            "absolute z-50 min-w-full w-max max-w-[280px] max-h-60 overflow-y-auto rounded-xl border border-[#E5EAED] bg-white p-1 shadow-lg shadow-slate-900/10 focus:outline-none",
            openUpwards ? "bottom-full mb-1.5" : "top-full mt-1.5",
            align === "right" ? "right-0" : "left-0",
            menuClassName
          )}
        >
          {options.map((opt, index) => {
            const isSelected = opt.value === currentValue;
            const isHighlighted = index === highlightedIndex;

            return (
              <li
                key={String(opt.value)}
                id={`${id}-option-${index}`}
                role="option"
                aria-selected={isSelected}
                aria-disabled={opt.disabled}
                onClick={() => {
                  if (!opt.disabled) {
                    handleSelectOption(opt.value);
                  }
                }}
                onMouseEnter={() => {
                  if (!opt.disabled) {
                    setHighlightedIndex(index);
                  }
                }}
                className={cn(
                  "group flex items-center justify-between gap-2.5 font-medium transition-colors cursor-pointer select-none outline-none",
                  currentSize.option,
                  opt.disabled && "opacity-40 cursor-not-allowed",
                  isSelected
                    ? "bg-[#E8F8F5] text-[#176779] font-semibold"
                    : isHighlighted
                    ? "bg-[#F8FAFB] text-[#18282A]"
                    : "text-[#5C6C6E] hover:bg-[#F8FAFB] hover:text-[#18282A]"
                )}
              >
                <div className="flex items-center gap-2 truncate">
                  {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                  <span className="truncate">{opt.label}</span>
                </div>
                {isSelected && (
                  <Check
                    className="h-3.5 w-3.5 text-[#176779] shrink-0 ml-1.5"
                    aria-hidden="true"
                  />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
