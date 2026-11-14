"use client";

import * as React from "react";
import { MapPin, CalendarCheck, Compass, Eye, Pencil } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { TourStatusBadge } from "./tour-status-badge";
import { resolveTourPricing } from "@/lib/pricing";
import type {
  AdminServiceRecord,
  AdminServiceStatus,
} from "../../types/admin";

export interface ToursCardGridProps {
  tours: AdminServiceRecord[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onViewDetails: (tour: AdminServiceRecord) => void;
  onEditTour?: (tour: AdminServiceRecord) => void;
  onStatusChange: (tourId: string, status: AdminServiceStatus) => void;
  isUpdatingStatusId: string | null;
  canEdit?: boolean;
}

export function ToursCardGrid({
  tours,
  selectedIds,
  onToggleSelect,
  onViewDetails,
  onEditTour,
  canEdit = true,
}: ToursCardGridProps) {
  return (
    <div
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      data-testid="tours-card-grid"
    >
      {tours.map((tour) => {
        const isSelected = selectedIds.includes(tour.id);
        const pricing = tour.pricingSummary
          ? resolveTourPricing(
              tour.pricingSummary.basePrice,
              tour.pricingSummary.discountedPrice
            )
          : null;
        const metadata = (tour.metadata ?? {}) as Record<string, unknown>;
        const images = Array.isArray(metadata.images)
          ? (metadata.images as string[])
          : [];
        const featuredImage =
          (typeof metadata.featuredImage === "string" && metadata.featuredImage) ||
          images[0] ||
          null;
        const destination =
          (typeof metadata.destination === "string" && metadata.destination) ||
          "Phuket";

        return (
          <article
            key={tour.id}
            data-testid={`tour-card-${tour.id}`}
            className={`group flex flex-col justify-between overflow-hidden rounded-xl border bg-white shadow-2xs transition-all hover:shadow-md ${
              isSelected
                ? "border-[#176779] ring-1 ring-[#176779]/20 bg-[#F4FBFB]/40"
                : "border-[#E5EAED]"
            }`}
          >
            {/* Card Image & Top Bar */}
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#EEF4F5]">
              {featuredImage ? (
                <img
                  src={featuredImage}
                  alt={tour.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[#8A9A9C]">
                  <Compass className="h-8 w-8 opacity-40" />
                </div>
              )}

              {/* Selection Checkbox */}
              {canEdit && (
                <div className="absolute left-3 top-3 z-10 rounded-md bg-white/90 p-1 shadow-xs backdrop-blur-xs">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => onToggleSelect(tour.id)}
                    aria-label={`Select ${tour.name}`}
                  />
                </div>
              )}

              {/* Status Badge */}
              <div className="absolute right-3 top-3 z-10">
                <TourStatusBadge status={tour.status} />
              </div>
            </div>

            {/* Card Body */}
            <div className="flex flex-1 flex-col justify-between p-4">
              <div>
                <button
                  type="button"
                  onClick={() => onViewDetails(tour)}
                  className="text-left font-outfit text-sm font-bold text-[#18282A] line-clamp-1 hover:text-[#176779] transition-colors cursor-pointer"
                  title={tour.name}
                >
                  {tour.name}
                </button>

                {tour.description && (
                  <p className="mt-1 text-xs text-[#74818A] line-clamp-2">
                    {tour.description}
                  </p>
                )}

                {/* Destination & Provider */}
                <div className="mt-3 space-y-1 text-xs text-[#5C6C6E]">
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-[#8A9A9C]" />
                    <span className="truncate">{destination}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="text-[11px] font-medium text-[#8A9A9C]">
                      Provider:
                    </span>
                    <span className="truncate font-medium text-[#18282A]">
                      {tour.providerName || "Unassigned"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer: Pricing, Availability & Actions */}
              <div className="mt-4 border-t border-[#EEF2F3] pt-3">
                <div className="flex items-end justify-between gap-2">
                  {/* Pricing */}
                  <div>
                    {tour.pricingSummary && pricing ? (
                      <div className="flex flex-wrap items-baseline gap-1.5">
                        {pricing.hasDiscount && pricing.originalPrice != null && (
                          <span className="text-xs text-[#8A9A9C] line-through">
                            {tour.pricingSummary.currency}{" "}
                            {pricing.originalPrice.toLocaleString()}
                          </span>
                        )}
                        <span className="text-sm font-bold text-[#176779]">
                          {tour.pricingSummary.currency}{" "}
                          {pricing.effectivePrice.toLocaleString()}
                        </span>
                      </div>
                    ) : (
                      <span className="inline-flex items-center rounded-md bg-[#F1F4F6] px-2 py-0.5 text-[10px] font-medium text-[#74818A]">
                        Not configured
                      </span>
                    )}

                    {/* Availability Summary */}
                    <div className="mt-1 flex items-center gap-1 text-[11px] text-[#74818A]">
                      <CalendarCheck className="h-3 w-3 shrink-0 text-[#8A9A9C]" />
                      <span>
                        {tour.availabilitySummary
                          ? `${tour.availabilitySummary.availableDateCount} available dates`
                          : "No availability"}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewDetails(tour)}
                      aria-label={`View details for ${tour.name}`}
                      className="h-8 w-8 p-0 text-[#74818A] hover:text-[#176779]"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {canEdit && onEditTour && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditTour(tour)}
                        aria-label={`Edit ${tour.name}`}
                        className="h-8 w-8 p-0 text-[#74818A] hover:text-[#176779]"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
