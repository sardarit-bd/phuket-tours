"use client";

import * as React from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Tour } from "@/features/tours/types/tour";

/**
 * What's Included tab: actual included and excluded services from the
 * backend. Sections are hidden when no corresponding data exists.
 */
export function IncludedExcludedSection({ tour }: { tour: Tour }) {
  const hasIncluded = tour.included && tour.included.length > 0;
  const hasExcluded = tour.excluded && tour.excluded.length > 0;

  if (!hasIncluded && !hasExcluded) {
    return (
      <p className="text-sm text-[#74818A]">
        Service details for this tour will be shown here.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {hasIncluded && (
        <ListPanel
          title="What's included"
          items={tour.included!}
          variant="included"
        />
      )}
      {hasExcluded && (
        <ListPanel
          title="What's not included"
          items={tour.excluded!}
          variant="excluded"
        />
      )}
    </div>
  );
}

function ListPanel({
  title,
  items,
  variant,
}: {
  title: string;
  items: string[];
  variant: "included" | "excluded";
}) {
  const isIncluded = variant === "included";
  return (
    <div className="rounded-2xl border border-[#E5EAED] bg-white p-5">
      <div className="mb-4 flex items-center gap-2">
        {isIncluded ? (
          <CheckCircle2 className="h-4 w-4 text-[#0E7A67]" />
        ) : (
          <XCircle className="h-4 w-4 text-[#C0392B]" />
        )}
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#18282A]">
          {title}
        </h3>
      </div>
      <ul className="space-y-2">
        {items.map((item, idx) => (
          <li
            key={idx}
            className="flex items-start gap-2 text-sm text-[#5C6C6E]"
          >
            <span
              className={cn(
                "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full",
                isIncluded ? "bg-[#0E7A67]" : "bg-[#C0392B]"
              )}
            />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
