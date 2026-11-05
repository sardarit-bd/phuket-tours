"use client";

import * as React from "react";
import { Compass, Calendar } from "lucide-react";
import type { Tour, TourItineraryItem } from "@/features/tours/types/tour";

/**
 * Tour Details tab: itinerary timeline + availability & departure schedule.
 * Sections are hidden when no corresponding data exists.
 */
export function TourDetailsTabsContent({ tour }: { tour: Tour }) {
  const hasItinerary = tour.itinerary && tour.itinerary.length > 0;
  const hasSchedule = tour.scheduleDetails;

  if (!hasItinerary && !hasSchedule) {
    return (
      <p className="text-sm text-[#74818A]">
        Itinerary and schedule details for this tour will be shown here.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {hasItinerary && <ItineraryTimeline itinerary={tour.itinerary!} />}
      {hasSchedule && <AvailabilitySchedule tour={tour} />}
    </div>
  );
}

// ── Itinerary ──────────────────────────────────────────────────────────────

function ItineraryTimeline({
  itinerary,
}: {
  itinerary: TourItineraryItem[];
}) {
  // Group by day, preserving chronological order within each day.
  const days = new Map<number, TourItineraryItem[]>();
  for (const item of itinerary) {
    const day = item.day ?? 1;
    const list = days.get(day) || [];
    list.push(item);
    days.set(day, list);
  }
  const sortedDays = [...days.entries()].sort((a, b) => a[0] - b[0]);

  return (
    <section>
      <h2 className="flex items-center gap-2 font-outfit text-lg font-bold text-[#18282A]">
        <Compass className="h-4 w-4 text-[#176779]" />
        Tour itinerary
      </h2>
      <div className="mt-5 space-y-6">
        {sortedDays.map(([day, items]) => (
          <div key={day}>
            <div className="mb-3 flex items-center gap-2">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white">
                {day}
              </span>
              <span className="text-sm font-semibold text-[#18282A]">
                Day {day}
              </span>
            </div>
            <ol className="ml-3 space-y-4 border-l-2 border-[#E5EAED] pl-5">
              {items.map((item, idx) => (
                <li key={idx} className="relative">
                  {/* Timeline dot */}
                  <span className="absolute -left-[27px] top-1 h-2 w-2 rounded-full bg-[#2B9BA8] ring-4 ring-white" />
                  {item.time && (
                    <p className="text-[11px] font-semibold text-[#176779]">
                      {item.time}
                    </p>
                  )}
                  <p className="text-sm font-semibold text-[#18282A]">
                    {item.title}
                  </p>
                  {item.description && (
                    <p className="mt-0.5 text-xs leading-relaxed text-[#74818A]">
                      {item.description}
                    </p>
                  )}
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Availability & Departure Schedule ────────────────────────────────────

function AvailabilitySchedule({ tour }: { tour: Tour }) {
  const schedule = tour.scheduleDetails!;
  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const operatingDaysLabel = schedule.isDaily
    ? "Daily"
    : schedule.daysOfWeek
      ? schedule.daysOfWeek.map((d) => dayNames[d]).filter(Boolean).join(", ")
      : undefined;

  const rows: { label: string; value?: string }[] = [];
  if (operatingDaysLabel) {
    rows.push({ label: "Operating days", value: operatingDaysLabel });
  }
  if (schedule.operatingHours) {
    rows.push({ label: "Operating hours", value: schedule.operatingHours });
  }
  if (schedule.timeSlots && schedule.timeSlots.length > 0) {
    rows.push({ label: "Departure times", value: schedule.timeSlots.join("  ·  ") });
  }
  if (tour.groupSize) {
    rows.push({ label: "Guest capacity", value: `Up to ${tour.groupSize} guests` });
  }

  if (rows.length === 0) return null;

  return (
    <section>
      <h2 className="flex items-center gap-2 font-outfit text-lg font-bold text-[#18282A]">
        <Calendar className="h-4 w-4 text-[#176779]" />
        Availability &amp; departure schedule
      </h2>
      <dl className="mt-4 overflow-hidden rounded-2xl border border-[#E5EAED] bg-white">
        {rows.map((row, idx) => (
          <div
            key={idx}
            className={
              "flex items-center justify-between gap-4 px-4 py-3 " +
              (idx > 0 ? "border-t border-[#EEF2F3]" : "")
            }
          >
            <dt className="text-xs font-semibold text-[#74818A]">{row.label}</dt>
            <dd className="text-right text-sm font-semibold text-[#18282A]">
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
