"use client";

import * as React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { FilterOption } from "../types/tour";
import { cn } from "@/lib/utils";

interface TourFilterGroupProps {
  title: string;
  options: FilterOption[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  defaultOpen?: boolean;
  initialVisibleCount?: number;
}

export function TourFilterGroup({
  title,
  options,
  selectedIds,
  onToggle,
  defaultOpen = true,
  initialVisibleCount = 5,
}: TourFilterGroupProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);
  const [isExpanded, setIsExpanded] = React.useState(false);

  const visibleOptions = isExpanded
    ? options
    : options.slice(0, initialVisibleCount);

  const hasMore = options.length > initialVisibleCount;

  return (
    <div className="border-b border-[#EEF2F3] pb-5 pt-1">
      {/* Accordion Header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-2 text-left text-sm font-semibold text-[#18282A] hover:text-primary transition-colors cursor-pointer"
        aria-expanded={isOpen}
      >
        <span>{title}</span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-[#8A9A9C]" />
        ) : (
          <ChevronDown className="h-4 w-4 text-[#8A9A9C]" />
        )}
      </button>

      {/* Accordion Content */}
      {isOpen && (
        <div className="mt-2.5 space-y-2.5 animate-in fade-in-0 duration-200">
          {visibleOptions.map((opt) => {
            const isChecked = selectedIds.includes(opt.id);

            return (
              <label
                key={opt.id}
                className="group flex items-center justify-between gap-2.5 text-xs sm:text-sm text-[#465457] hover:text-[#18282A] cursor-pointer select-none"
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => onToggle(opt.id)}
                    className="h-4 w-4 rounded-xs border-[#C9D6D8] text-primary focus:ring-primary/20 accent-[#2B9BA8] cursor-pointer"
                  />
                  <span className={cn(isChecked && "font-medium text-[#18282A]")}>
                    {opt.label}
                  </span>
                </div>
                <span className="text-xs text-[#8A9A9C] font-normal">
                  ({opt.count})
                </span>
              </label>
            );
          })}

          {hasMore && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-1 text-xs font-medium text-primary hover:text-primary-dark hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <span>{isExpanded ? "Show Less" : "Show More"}</span>
              <ChevronDown
                className={cn(
                  "h-3 w-3 transition-transform duration-200",
                  isExpanded && "rotate-180"
                )}
              />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
