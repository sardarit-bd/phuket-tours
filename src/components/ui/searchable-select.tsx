"use client";

import * as React from "react";
import { ChevronDown, Check, Search, X, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SelectOption, SelectSize } from "./custom-select";

export interface SearchableSelectProps {
  id?: string;
  name?: string;
  options: SelectOption<string>[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  errorMessage?: string | null;
  isLoading?: boolean;
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

export function SearchableSelect({
  id = "searchable-select",
  name,
  options,
  value: controlledValue,
  defaultValue,
  onChange,
  placeholder = "Select an option",
  searchPlaceholder = "Search options...",
  emptyMessage = "No matching options found.",
  errorMessage = null,
  isLoading = false,
  size = "md",
  className = "",
  triggerClassName = "",
  menuClassName = "",
  align = "left",
  disabled = false,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  "data-testid": dataTestId,
}: SearchableSelectProps) {
  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = React.useState<string | undefined>(
    defaultValue ?? options[0]?.value
  );

  const currentValue = isControlled ? controlledValue : internalValue;

  const [isOpen, setIsOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [highlightedIndex, setHighlightedIndex] = React.useState(-1);
  const [openUpwards, setOpenUpwards] = React.useState(false);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const menuRef = React.useRef<HTMLUListElement>(null);

  const selectedOption = options.find((opt) => opt.value === currentValue);

  // Filter options based on search query
  const filteredOptions = React.useMemo(() => {
    const trimmed = searchQuery.trim().toLowerCase();
    if (!trimmed) return options;
    return options.filter((opt) =>
      opt.label.toLowerCase().includes(trimmed)
    );
  }, [options, searchQuery]);

  // Direction calculation
  const updateDirection = React.useCallback(() => {
    if (triggerRef.current && typeof window !== "undefined") {
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const estimatedMenuHeight = Math.min(filteredOptions.length * 40 + 70, 280);
      setOpenUpwards(spaceBelow < estimatedMenuHeight && rect.top > spaceBelow);
    }
  }, [filteredOptions.length]);

  const toggleOpen = () => {
    if (disabled || isLoading) return;
    if (!isOpen) {
      updateDirection();
      setSearchQuery("");
      const currentIndex = filteredOptions.findIndex((opt) => opt.value === currentValue);
      setHighlightedIndex(currentIndex >= 0 ? currentIndex : 0);
      setIsOpen(true);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
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

  // Handle window resize/scroll
  React.useEffect(() => {
    if (!isOpen) return;
    const handleEvents = () => updateDirection();
    window.addEventListener("resize", handleEvents);
    window.addEventListener("scroll", handleEvents, true);
    return () => {
      window.removeEventListener("resize", handleEvents);
      window.removeEventListener("scroll", handleEvents, true);
    };
  }, [isOpen, updateDirection]);

  const handleSelectOption = React.useCallback(
    (optValue: string) => {
      if (!isControlled) {
        setInternalValue(optValue);
      }
      onChange?.(optValue);
      setIsOpen(false);
      setSearchQuery("");
      triggerRef.current?.focus();
    },
    [isControlled, onChange]
  );

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled || isLoading) return;

    if (!isOpen) {
      if (["Enter", " ", "ArrowDown", "ArrowUp"].includes(e.key)) {
        e.preventDefault();
        toggleOpen();
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
        if (filteredOptions.length > 0) {
          setHighlightedIndex((prev) => (prev + 1) % filteredOptions.length);
        }
        break;

      case "ArrowUp":
        e.preventDefault();
        if (filteredOptions.length > 0) {
          setHighlightedIndex((prev) =>
            prev <= 0 ? filteredOptions.length - 1 : prev - 1
          );
        }
        break;

      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
          const targetOpt = filteredOptions[highlightedIndex];
          if (!targetOpt.disabled) {
            handleSelectOption(targetOpt.value);
          }
        }
        break;
    }
  };

  const currentSize = sizeStyles[size] || sizeStyles.md;

  return (
    <div
      ref={containerRef}
      className={cn("relative inline-block w-full text-left", className)}
      data-testid={dataTestId}
    >
      {/* Hidden input for HTML form integration */}
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
        aria-label={ariaLabel || id}
        aria-labelledby={ariaLabelledBy}
        disabled={disabled || isLoading}
        onClick={toggleOpen}
        onKeyDown={handleKeyDown}
        className={cn(
          "inline-flex w-full items-center justify-between border border-[#E5EAED] bg-white text-[#18282A] shadow-2xs hover:border-[#176779]/60 focus:border-[#176779] focus:outline-none focus:ring-1 focus:ring-[#176779] cursor-pointer transition-colors relative select-none disabled:opacity-40 disabled:cursor-not-allowed",
          currentSize.trigger,
          isOpen && "border-[#176779] ring-1 ring-[#176779]/30",
          errorMessage && "border-red-300 focus:border-red-500 focus:ring-red-500",
          triggerClassName
        )}
      >
        <span className={cn("truncate pr-4 flex items-center gap-2", currentSize.text)}>
          {isLoading ? (
            <span className="flex items-center gap-1.5 text-[#74818A]">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-[#176779]" />
              <span>Loading...</span>
            </span>
          ) : errorMessage ? (
            <span className="text-red-600 flex items-center gap-1.5 truncate">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>{errorMessage}</span>
            </span>
          ) : selectedOption ? (
            <span className="truncate flex items-center gap-1.5">
              {selectedOption.icon && <span className="shrink-0">{selectedOption.icon}</span>}
              <span className="truncate">{selectedOption.label}</span>
            </span>
          ) : (
            <span className="text-[#74818A]">{placeholder}</span>
          )}
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

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={cn(
            "absolute z-50 min-w-full w-full rounded-xl border border-[#E5EAED] bg-white p-2 shadow-lg shadow-slate-900/10 focus:outline-none",
            openUpwards ? "bottom-full mb-1.5" : "top-full mt-1.5",
            align === "right" ? "right-0" : "left-0",
            menuClassName
          )}
        >
          {/* Search / Filter Input */}
          <div className="relative mb-2">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#74818A]" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setHighlightedIndex(0);
              }}
              onKeyDown={handleKeyDown}
              placeholder={searchPlaceholder}
              className="w-full rounded-lg border border-[#E5EAED] bg-[#F8FAFB] py-1.5 pl-8 pr-7 text-xs text-[#18282A] placeholder-[#74818A] focus:border-[#176779] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#176779]"
              data-testid={`${id}-search-input`}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  searchInputRef.current?.focus();
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-[#74818A] hover:bg-slate-200 cursor-pointer"
                aria-label="Clear search"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Options List */}
          <ul
            ref={menuRef}
            id={`${id}-menu`}
            role="listbox"
            tabIndex={-1}
            aria-labelledby={ariaLabelledBy || id}
            className="max-h-52 overflow-y-auto space-y-0.5 scrollbar-thin"
          >
            {filteredOptions.length === 0 ? (
              <li className="px-3 py-3 text-center text-xs text-[#74818A]">
                {emptyMessage}
              </li>
            ) : (
              filteredOptions.map((opt, index) => {
                const isSelected = opt.value === currentValue;
                const isHighlighted = index === highlightedIndex;

                return (
                  <li
                    key={opt.value}
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
                    data-testid={`${id}-option-${opt.value}`}
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
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

