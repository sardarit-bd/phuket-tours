"use client";

import * as React from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DropdownOption<T extends string = string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
}

export interface CustomDropdownProps<T extends string = string> {
  id?: string;
  name?: string;
  options: DropdownOption<T>[];
  value: T;
  onChange: (value: T) => void;
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
  menuClassName?: string;
  align?: "left" | "right";
  disabled?: boolean;
  "aria-label"?: string;
  "aria-labelledby"?: string;
}

export function CustomDropdown<T extends string = string>({
  id = "custom-dropdown",
  options,
  value,
  onChange,
  placeholder = "Select an option",
  className = "",
  triggerClassName = "",
  menuClassName = "",
  align = "right",
  disabled = false,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
}: CustomDropdownProps<T>) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [highlightedIndex, setHighlightedIndex] = React.useState(-1);
  const [openUpwards, setOpenUpwards] = React.useState(false);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const menuRef = React.useRef<HTMLUListElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Calculate opening direction based on available viewport space
  const updateDirection = React.useCallback(() => {
    if (triggerRef.current && typeof window !== "undefined") {
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const estimatedMenuHeight = Math.min(options.length * 44 + 16, 260);
      setOpenUpwards(spaceBelow < estimatedMenuHeight && rect.top > spaceBelow);
    }
  }, [options.length]);

  // Open/close helper with direction check
  const toggleOpen = () => {
    if (disabled) return;
    if (!isOpen) {
      updateDirection();
      const currentIndex = options.findIndex((opt) => opt.value === value);
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

  // Close on Escape or window blur / resize
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

  // Keyboard navigation
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
        const currentIndex = options.findIndex((opt) => opt.value === value);
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
        setHighlightedIndex((prev) => (prev + 1) % options.length);
        break;

      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev - 1 + options.length) % options.length);
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
          onChange(opt.value);
          setIsOpen(false);
          triggerRef.current?.focus();
        }
        break;
    }
  };

  const handleSelectOption = (optValue: T) => {
    onChange(optValue);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <div
      ref={containerRef}
      className={cn("relative inline-block text-left", className)}
    >
      {/* Closed State Trigger Button */}
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
          "inline-flex items-center justify-between gap-2.5 rounded-xl border border-[#E5EAEB] bg-white py-1.5 pl-3.5 pr-8 text-xs sm:text-sm font-semibold text-[#18282A] shadow-2xs hover:border-primary/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer transition-colors relative select-none disabled:opacity-50 disabled:cursor-not-allowed",
          isOpen && "border-primary ring-1 ring-primary/30",
          triggerClassName
        )}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={cn(
            "pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-[#5C6C6E] transition-transform duration-200",
            isOpen && "rotate-180 text-primary"
          )}
          aria-hidden="true"
        />
      </button>

      {/* Opened State Dropdown Menu */}
      {isOpen && (
        <ul
          ref={menuRef}
          id={`${id}-menu`}
          role="listbox"
          tabIndex={-1}
          aria-labelledby={ariaLabelledBy || id}
          className={cn(
            "absolute z-50 min-w-[200px] w-max max-w-[280px] rounded-xl border border-[#E5EAEB] bg-white p-1.5 shadow-xl shadow-slate-900/10 focus:outline-none",
            openUpwards ? "bottom-full mb-1.5" : "top-full mt-1.5",
            align === "right" ? "right-0" : "left-0",
            menuClassName
          )}
        >
          {options.map((opt, index) => {
            const isSelected = opt.value === value;
            const isHighlighted = index === highlightedIndex;

            return (
              <li
                key={opt.value}
                id={`${id}-option-${index}`}
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelectOption(opt.value)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={cn(
                  "group flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium transition-colors cursor-pointer select-none outline-none",
                  isSelected
                    ? "bg-[#E6F5F6] text-primary font-semibold"
                    : isHighlighted
                    ? "bg-[#F5F8F9] text-[#18282A]"
                    : "text-[#5C6C6E] hover:bg-[#F5F8F9] hover:text-[#18282A]"
                )}
              >
                <div className="flex items-center gap-2 truncate">
                  {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                  <span className="truncate">{opt.label}</span>
                </div>
                {isSelected && (
                  <Check
                    className="h-4 w-4 text-primary shrink-0 ml-1.5"
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
