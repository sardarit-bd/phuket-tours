"use client";

import * as React from "react";
import {
  Clock,
  MapPin,
  Users,
  Languages,
  Building2,
  Sparkles,
} from "lucide-react";
import type { Tour } from "@/features/tours/types/tour";

/**
 * Overview tab: compact tour description, key facts, and highlights.
 * Only renders fields that have actual values — no placeholder cards.
 */
export function OverviewSection({ tour }: { tour: Tour }) {
  const facts: {
    icon: React.ReactNode;
    label: string;
    value?: string;
  }[] = [
    { icon: <Clock className="h-4 w-4" />, label: "Duration", value: tour.duration },
    {
      icon: <MapPin className="h-4 w-4" />,
      label: "Destination",
      value: tour.destination,
    },
  ];

  if (tour.location?.city) {
    facts.push({
      icon: <MapPin className="h-4 w-4" />,
      label: "City",
      value: tour.location.city,
    });
  }
  if (tour.location?.departurePoint) {
    facts.push({
      icon: <MapPin className="h-4 w-4" />,
      label: "Departure",
      value: tour.location.departurePoint,
    });
  }
  if (tour.groupSize) {
    facts.push({
      icon: <Users className="h-4 w-4" />,
      label: "Group size",
      value: tour.groupSize,
    });
  }
  if (tour.languages && tour.languages.length > 0) {
    facts.push({
      icon: <Languages className="h-4 w-4" />,
      label: "Languages",
      value: tour.languages.join(", "),
    });
  }
  if (tour.providerName) {
    facts.push({
      icon: <Building2 className="h-4 w-4" />,
      label: "Operator",
      value: tour.providerName,
    });
  }

  // Drop any facts that ended up empty.
  const visibleFacts = facts.filter((f) => f.value);

  return (
    <div className="space-y-8">
      {/* Description */}
      {tour.description && (
        <section>
          <h2 className="font-outfit text-lg font-bold text-[#18282A]">
            About this tour
          </h2>
          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-[#5C6C6E]">
            {tour.description}
          </p>
        </section>
      )}

      {/* Key facts */}
      {visibleFacts.length > 0 && (
        <section>
          <h2 className="font-outfit text-lg font-bold text-[#18282A]">
            Tour information
          </h2>
          <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
            {visibleFacts.map((fact, idx) => (
              <div
                key={idx}
                className="tour-detail-row"
              >
                <dt className="flex items-center gap-2 text-xs font-semibold text-[#74818A]">
                  <span className="text-[#8A9A9C]">{fact.icon}</span>
                  {fact.label}
                </dt>
                <dd className="text-sm font-medium text-[#18282A]">
                  {fact.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {/* Highlights */}
      {tour.highlights && tour.highlights.length > 0 && (
        <section>
          <h2 className="flex items-center gap-2 font-outfit text-lg font-bold text-[#18282A]">
            <Sparkles className="h-4 w-4 text-[#176779]" />
            Tour highlights
          </h2>
          <ul className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {tour.highlights.map((item, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 text-sm text-[#5C6C6E]"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#2B9BA8]" />
                {item}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
