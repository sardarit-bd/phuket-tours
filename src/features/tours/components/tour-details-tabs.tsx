"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type TabId = "overview" | "included" | "details";

const TABS: { id: TabId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "included", label: "What's Included" },
  { id: "details", label: "Tour Details" },
];

/**
 * Clean tab navigation for the tour details content sections.
 * Controlled via activeTab / onTabChange so the parent owns which section
 * is rendered (avoiding rendering all sections simultaneously).
 */
export function TourDetailsTabs({
  activeTab,
  onTabChange,
}: {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Tour information"
      className="flex gap-1 overflow-x-auto border-b border-[#E5EAED] scrollbar-none"
    >
      {TABS.map((tab) => {
        const active = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "relative shrink-0 whitespace-nowrap px-4 py-3 text-sm font-semibold transition-colors",
              active
                ? "text-primary"
                : "text-[#74818A] hover:text-[#18282A]"
            )}
          >
            {tab.label}
            {active && (
              <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-primary" />
            )}
          </button>
        );
      })}
    </div>
  );
}
