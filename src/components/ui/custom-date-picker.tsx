"use client";

import * as React from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface CustomDatePickerDateEntry {
  date: string; // YYYY-MM-DD
  isAvailable: boolean;
  capacity?: number;
}

export interface CustomDatePickerProps {
  id?: string;
  name?: string;
  value?: string; // YYYY-MM-DD
  onChange?: (date: string) => void;
  existingDates?: CustomDatePickerDateEntry[];
  minDate?: string; // YYYY-MM-DD
  disablePastDates?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
  popoverClassName?: string;
  "aria-label"?: string;
  "data-testid"?: string;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKDAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export function formatISODate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseISODate(str: string): Date | null {
  if (!str || !/^\d{4}-\d{2}-\d{2}$/.test(str)) return null;
  const [year, month, day] = str.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function CustomDatePicker({
  id = "custom-date-picker",
  name,
  value,
  onChange,
  existingDates = [],
  minDate,
  disablePastDates = true,
  disabled = false,
  placeholder = "Select date (YYYY-MM-DD)",
  className = "",
  triggerClassName = "",
  popoverClassName = "",
  "aria-label": ariaLabel,
  "data-testid": dataTestId,
}: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  // Today reference
  const today = React.useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  const todayISO = React.useMemo(() => formatISODate(today), [today]);

  // Threshold for past dates
  const effectiveMinDate = minDate ?? (disablePastDates ? todayISO : undefined);

  // Active viewing month and year
  const initialDate = value ? parseISODate(value) : null;
  const [viewDate, setViewDate] = React.useState<Date>(
    initialDate || today
  );
  const [prevValue, setPrevValue] = React.useState(value);

  // Sync viewing month if value changes externally
  if (value !== prevValue) {
    setPrevValue(value);
    if (value) {
      const parsed = parseISODate(value);
      if (parsed) {
        setViewDate(new Date(parsed.getFullYear(), parsed.getMonth(), 1));
      }
    }
  }

  const [openUpwards, setOpenUpwards] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  const updateDirection = React.useCallback(() => {
    if (triggerRef.current && typeof window !== "undefined") {
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const popoverHeight = 320;
      setOpenUpwards(spaceBelow < popoverHeight && rect.top > spaceBelow);
    }
  }, []);

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

    const handleWindowChange = () => {
      updateDirection();
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    window.addEventListener("resize", handleWindowChange);
    window.addEventListener("scroll", handleWindowChange, true);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      window.removeEventListener("resize", handleWindowChange);
      window.removeEventListener("scroll", handleWindowChange, true);
    };
  }, [isOpen, updateDirection]);

  // Calendar month math
  const viewYear = viewDate.getFullYear();
  const viewMonth = viewDate.getMonth();

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Sun, 6 = Sat

  // Days from previous month to pad the first row
  const prevMonthDaysCount = new Date(viewYear, viewMonth, 0).getDate();
  const leadingDays = Array.from({ length: firstDayOfWeek }, (_, i) => {
    const dayNum = prevMonthDaysCount - firstDayOfWeek + i + 1;
    return {
      date: new Date(viewYear, viewMonth - 1, dayNum),
      isCurrentMonth: false,
    };
  });

  // Days in current month
  const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => {
    const dayNum = i + 1;
    return {
      date: new Date(viewYear, viewMonth, dayNum),
      isCurrentMonth: true,
    };
  });

  // Trailing days from next month to complete the 35 or 42 cell grid
  const totalDaysSoFar = leadingDays.length + currentMonthDays.length;
  const trailingCount = (7 - (totalDaysSoFar % 7)) % 7;
  const trailingDays = Array.from({ length: trailingCount }, (_, i) => {
    const dayNum = i + 1;
    return {
      date: new Date(viewYear, viewMonth + 1, dayNum),
      isCurrentMonth: false,
    };
  });

  const allCalendarDays = [...leadingDays, ...currentMonthDays, ...trailingDays];

  // Lookup map for existing availability overrides
  const existingMap = React.useMemo(() => {
    const map = new Map<string, CustomDatePickerDateEntry>();
    existingDates.forEach((d) => map.set(d.date, d));
    return map;
  }, [existingDates]);

  // Month navigation handlers
  const handlePrevMonth = () => {
    setViewDate(new Date(viewYear, viewMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewYear, viewMonth + 1, 1));
  };

  const handleGoToToday = () => {
    const now = new Date();
    setViewDate(new Date(now.getFullYear(), now.getMonth(), 1));
    const iso = formatISODate(now);
    onChange?.(iso);
  };

  const handleSelectDate = (d: Date) => {
    const iso = formatISODate(d);
    if (effectiveMinDate && iso < effectiveMinDate) return;
    onChange?.(iso);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      triggerRef.current?.focus();
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn("relative inline-block w-full text-left", className)}
      data-testid={dataTestId}
    >
      {name && <input type="hidden" name={name} value={value || ""} />}

      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        id={id}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={ariaLabel || placeholder}
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            if (!isOpen) updateDirection();
            setIsOpen(!isOpen);
          }
        }}
        className={cn(
          "inline-flex h-11 w-full items-center justify-between rounded-xl border border-[#E5EAED] bg-white px-3.5 text-xs text-[#18282A] shadow-2xs hover:border-[#176779]/60 focus:border-[#176779] focus:outline-none focus:ring-1 focus:ring-[#176779] cursor-pointer transition-colors relative select-none disabled:opacity-40 disabled:cursor-not-allowed",
          isOpen && "border-[#176779] ring-1 ring-[#176779]/30",
          triggerClassName
        )}
        data-testid={`${id}-trigger`}
      >
        <span className={cn("truncate font-medium", !value && "text-[#74818A]")}>
          {value || placeholder}
        </span>
        <CalendarIcon
          className="h-4 w-4 text-[#74818A] shrink-0 ml-2"
          aria-hidden="true"
        />
      </button>

      {/* Popover Calendar */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Calendar date picker"
          onKeyDown={handleKeyDown}
          className={cn(
            "absolute z-50 w-72 rounded-2xl border border-[#E5EAED] bg-white p-3.5 shadow-xl shadow-slate-900/10 focus:outline-none animate-in fade-in-0 zoom-in-95 duration-150",
            openUpwards ? "bottom-full mb-2" : "top-full mt-2",
            popoverClassName
          )}
          data-testid={`${id}-popover`}
        >
          {/* Header: Month / Year & Navigation */}
          <div className="flex items-center justify-between pb-3 border-b border-[#E5EAED]">
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-[#18282A]" data-testid={`${id}-month-year`}>
                {MONTH_NAMES[viewMonth]} {viewYear}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleGoToToday}
                title="Go to Today"
                className="rounded-lg p-1 text-[11px] font-semibold text-[#176779] hover:bg-[#E8F8F5] cursor-pointer inline-flex items-center gap-0.5 px-1.5"
                data-testid={`${id}-today-btn`}
              >
                <RotateCcw className="h-3 w-3" />
                Today
              </button>

              <button
                type="button"
                onClick={handlePrevMonth}
                aria-label="Previous month"
                className="rounded-lg p-1 text-[#5C6C6E] hover:bg-[#F8FAFB] hover:text-[#18282A] cursor-pointer transition-colors"
                data-testid={`${id}-prev-month-btn`}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={handleNextMonth}
                aria-label="Next month"
                className="rounded-lg p-1 text-[#5C6C6E] hover:bg-[#F8FAFB] hover:text-[#18282A] cursor-pointer transition-colors"
                data-testid={`${id}-next-month-btn`}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 pt-2 pb-1 text-center text-[10px] font-bold uppercase tracking-wider text-[#74818A]">
            {WEEKDAY_NAMES.map((day) => (
              <div key={day} className="py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {allCalendarDays.map(({ date: dayDate, isCurrentMonth }, idx) => {
              const iso = formatISODate(dayDate);
              const isSelected = iso === value;
              const isToday = iso === todayISO;
              const isPast = Boolean(effectiveMinDate && iso < effectiveMinDate);
              const isDisabled = isPast || !isCurrentMonth;
              const override = existingMap.get(iso);

              return (
                <button
                  key={`${iso}-${idx}`}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => handleSelectDate(dayDate)}
                  aria-label={`${iso}${isSelected ? " selected" : ""}${
                    override ? (override.isAvailable ? " available" : " blocked") : ""
                  }`}
                  aria-pressed={isSelected}
                  className={cn(
                    "relative flex flex-col items-center justify-center h-8 w-8 rounded-lg text-xs font-medium transition-all select-none mx-auto",
                    isDisabled && "opacity-30 cursor-not-allowed text-[#74818A]",
                    !isDisabled && !isSelected && "hover:bg-[#E8F8F5] text-[#18282A] cursor-pointer",
                    isToday && !isSelected && "border border-[#176779]/40 font-bold text-[#176779]",
                    isSelected && "bg-[#176779] text-white font-bold shadow-xs hover:bg-[#135463]"
                  )}
                  data-testid={`${id}-day-${iso}`}
                >
                  <span>{dayDate.getDate()}</span>

                  {/* Visual Status Indicator Dots */}
                  {override && (
                    <span
                      title={
                        override.isAvailable
                          ? `Available (${override.capacity ?? "default"} seats)`
                          : "Blocked / Blackout"
                      }
                      className={cn(
                        "absolute bottom-0.5 h-1 w-1 rounded-full",
                        isSelected ? "bg-white" : override.isAvailable ? "bg-[#0E7A67]" : "bg-red-500"
                      )}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-3 pt-2.5 border-t border-[#E5EAED] flex items-center justify-between text-[10px] text-[#74818A]">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#0E7A67]" />
              <span>Available</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
              <span>Blocked</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm border border-[#176779]/50" />
              <span>Today</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
