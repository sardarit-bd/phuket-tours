"use client";

import * as React from "react";
import {
  Calendar,
  Clock,
  DollarSign,
  MapPin,
  User,
  Users,
  Languages,
  CheckCircle2,
  XCircle,
  Sparkles,
  Compass,
  ImageIcon,
  Edit,
} from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TourStatusBadge } from "./tour-status-badge";
import { formatDate } from "../../utils/format";
import { useGetAdminServiceByIdQuery } from "../../api/admin-api";
import type {
  AdminServiceRecord,
  TourMetadata,
  TourItineraryItem,
  TourPricingTier,
} from "../../types/admin";

export interface TourDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tour: AdminServiceRecord | null;
  onEdit?: (tour: AdminServiceRecord) => void;
}

export function TourDetailsDialog({
  isOpen,
  onClose,
  tour,
  onEdit,
}: TourDetailsDialogProps) {
  const tourId = tour?.id || "";
  // Query full detail record from server when dialog is open
  const { data: detailResponse } = useGetAdminServiceByIdQuery(tourId, {
    skip: !isOpen || !tourId,
  });

  if (!tour) return null;

  const detail = detailResponse?.data;
  const currentRecord = detail || tour;
  const metadata = (currentRecord.metadata || {}) as TourMetadata;

  // Attributes
  const destination =
    metadata.destination ||
    metadata.location?.city ||
    (tour.metadata?.destination as string) ||
    "Phuket & Andaman Sea";

  const duration = metadata.duration || (tour.metadata?.duration as string) || null;
  const tourType = metadata.tourType || (tour.metadata?.tourType as string) || "Island Tours";
  const groupSize = metadata.groupSize || (tour.metadata?.groupSize as string) || "Standard Group";
  const languages = metadata.languages || (tour.metadata?.languages as string[]) || ["English", "Thai"];
  const providerName = currentRecord.providerName || "Unassigned Provider";

  const coverImage = metadata.featuredImage || currentRecord.pricingSummary ? (metadata.images?.[0] || detail?.media?.[0]?.secureUrl) : undefined;
  const galleryImages = metadata.images || (detail?.media?.map((m) => m.secureUrl) || []);

  const pricingTiers: TourPricingTier[] = metadata.pricingTiers || [];
  const itinerary: TourItineraryItem[] = metadata.itinerary || [];
  const highlights: string[] = metadata.highlights || [];
  const included: string[] = metadata.included || [];
  const excluded: string[] = metadata.excluded || [];
  const scheduleDetails = metadata.scheduleDetails;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={currentRecord.name}
      description={`Tour ID: ${currentRecord.id}`}
      size="xl"
    >
      <div className="space-y-6 text-[#18282A] max-h-[75vh] overflow-y-auto pr-1">
        {/* Cover Photo Banner (if available) */}
        {coverImage && (
          <div className="relative aspect-video max-h-64 w-full rounded-2xl overflow-hidden border border-[#E5EAED] shadow-xs">
            <img
              src={coverImage}
              alt={currentRecord.name}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute top-3 left-3">
              <TourStatusBadge status={currentRecord.status} />
            </div>
            {metadata.badge && (
              <div className="absolute top-3 right-3 rounded-md bg-[#176779] px-2 py-0.5 text-xs font-bold text-white shadow-xs">
                ★ {metadata.badge}
              </div>
            )}
            <div className="absolute bottom-3 left-4 right-4 text-white">
              <h3 className="text-base sm:text-lg font-bold drop-shadow-sm">
                {currentRecord.name}
              </h3>
              {metadata.subtitle && (
                <p className="text-xs text-white/90 drop-shadow-xs mt-0.5 line-clamp-1">
                  {metadata.subtitle}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Status & Timing Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E5EAED] bg-[#F8FAFB] p-4 text-xs text-[#74818A]">
          <div className="flex items-center gap-3">
            {!coverImage && <TourStatusBadge status={currentRecord.status} />}
            <span className="font-semibold text-[#18282A]">Type: {currentRecord.type}</span>
            {metadata.slug && (
              <span className="font-mono text-[#74818A] bg-white px-2 py-0.5 rounded border border-[#E5EAED]">
                /tours/{metadata.slug}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              <span>Updated: {formatDate(currentRecord.updatedAt)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              <span>Created: {formatDate(currentRecord.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#74818A]">
            Tour Description
          </h4>
          <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[#18282A]">
            {currentRecord.description || "No description provided for this tour package."}
          </p>
        </div>

        {/* Key Attributes Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Destination */}
          <div className="rounded-xl border border-[#E5EAED] p-3 bg-white">
            <div className="flex items-center gap-2 text-xs text-[#74818A]">
              <MapPin className="h-3.5 w-3.5 text-[#176779]" />
              <span>Destination ({tourType})</span>
            </div>
            <div className="mt-1 text-xs sm:text-sm font-bold text-[#18282A]">
              {destination}
            </div>
          </div>

          {/* Duration */}
          <div className="rounded-xl border border-[#E5EAED] p-3 bg-white">
            <div className="flex items-center gap-2 text-xs text-[#74818A]">
              <Clock className="h-3.5 w-3.5 text-[#176779]" />
              <span>Duration</span>
            </div>
            <div className="mt-1 text-xs sm:text-sm font-bold text-[#18282A]">
              {duration || "Full Day"}
            </div>
          </div>

          {/* Group Size */}
          <div className="rounded-xl border border-[#E5EAED] p-3 bg-white">
            <div className="flex items-center gap-2 text-xs text-[#74818A]">
              <Users className="h-3.5 w-3.5 text-[#176779]" />
              <span>Group Size</span>
            </div>
            <div className="mt-1 text-xs sm:text-sm font-bold text-[#18282A]">
              {groupSize}
            </div>
          </div>

          {/* Provider */}
          <div className="rounded-xl border border-[#E5EAED] p-3 bg-white">
            <div className="flex items-center gap-2 text-xs text-[#74818A]">
              <User className="h-3.5 w-3.5 text-[#176779]" />
              <span>Operator</span>
            </div>
            <div className="mt-1 text-xs sm:text-sm font-bold text-[#18282A] truncate">
              {providerName}
            </div>
          </div>
        </div>

        {/* Guided Languages */}
        {languages.length > 0 && (
          <div className="flex items-center gap-2 text-xs">
            <Languages className="h-4 w-4 text-[#176779] shrink-0" />
            <span className="font-semibold text-[#74818A]">Supported Languages:</span>
            <div className="flex flex-wrap gap-1.5">
              {languages.map((l) => (
                <span
                  key={l}
                  className="rounded-full bg-[#E8F8F5] border border-[#A3E5D9] px-2.5 py-0.5 text-[11px] font-semibold text-[#176779]"
                >
                  {l}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Gallery Image Strip (if photos exist) */}
        {galleryImages.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#74818A]">
              <ImageIcon className="h-4 w-4 text-[#176779]" />
              <span>High-Resolution Gallery ({galleryImages.length} Photos)</span>
            </div>
            <div className="flex gap-2.5 overflow-x-auto pb-2 no-scrollbar">
              {galleryImages.map((img, i) => (
                <div
                  key={i}
                  className="relative h-24 w-24 shrink-0 rounded-xl overflow-hidden border border-[#E5EAED] shadow-2xs hover:border-[#176779] transition-all"
                >
                  <img
                    src={img}
                    alt={`Gallery ${i + 1}`}
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute bottom-1 right-1 rounded bg-black/60 px-1 text-[9px] font-bold text-white">
                    #{i + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Highlights */}
        {highlights.length > 0 && (
          <div className="rounded-xl border border-[#E5EAED] bg-[#F8FAFB] p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#176779]">
              <Sparkles className="h-4 w-4 text-[#176779]" />
              <span>Tour Highlights</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#18282A]">
              {highlights.map((h, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-[#176779] font-bold mt-0.5">★</span>
                  <span>{h}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Inclusions & Exclusions */}
        {(included.length > 0 || excluded.length > 0) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {included.length > 0 && (
              <div className="rounded-xl border border-[#E5EAED] p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0E7A67]">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Included Services</span>
                </div>
                <ul className="space-y-1.5 text-xs text-[#18282A]">
                  {included.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-[#0E7A67] font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {excluded.length > 0 && (
              <div className="rounded-xl border border-[#E5EAED] p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C0392B]">
                  <XCircle className="h-4 w-4" />
                  <span>Excluded Items</span>
                </div>
                <ul className="space-y-1.5 text-xs text-[#18282A]">
                  {excluded.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-[#C0392B] font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Pricing & Packages */}
        <div className="rounded-xl border border-[#E5EAED] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#176779]">
              <DollarSign className="h-4 w-4 text-[#176779]" />
              <span>Pricing & Package Variations</span>
            </div>
            {currentRecord.pricingSummary && (
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-[#18282A]">
                  {currentRecord.pricingSummary.currency} {currentRecord.pricingSummary.basePrice.toLocaleString()}
                </span>
                {currentRecord.pricingSummary.discountedPrice != null && (
                  <span className="text-xs font-semibold text-[#0E7A67] bg-[#E8F8F5] px-2 py-0.5 rounded">
                    Promo: {currentRecord.pricingSummary.currency} {currentRecord.pricingSummary.discountedPrice.toLocaleString()}
                  </span>
                )}
              </div>
            )}
          </div>

          {pricingTiers.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              {pricingTiers.map((tier, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-[#E5EAED] bg-[#F8FAFB] p-2.5 text-xs"
                >
                  <div className="flex items-center justify-between font-bold text-[#18282A]">
                    <span>{tier.tierName}</span>
                    <span className="text-[#176779]">
                      {currentRecord.pricingSummary?.currency || "USD"} {tier.price.toLocaleString()}
                    </span>
                  </div>
                  {tier.description && (
                    <p className="text-[11px] text-[#74818A] mt-1">
                      {tier.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Itinerary Timeline */}
        {itinerary.length > 0 && (
          <div className="rounded-xl border border-[#E5EAED] p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#176779]">
              <Compass className="h-4 w-4 text-[#176779]" />
              <span>Itinerary Schedule ({itinerary.length} Stops)</span>
            </div>

            <div className="relative pl-5 space-y-3 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E5EAED]">
              {itinerary.map((stop, idx) => (
                <div key={idx} className="relative text-xs">
                  <div className="absolute -left-[19px] top-1 h-3 w-3 rounded-full border-2 border-[#176779] bg-white" />
                  <div className="flex items-baseline gap-2">
                    {stop.time && (
                      <span className="font-semibold text-[#176779] whitespace-nowrap">
                        {stop.time}
                      </span>
                    )}
                    <span className="font-bold text-[#18282A]">{stop.title}</span>
                  </div>
                  {stop.description && (
                    <p className="text-[#5C6C6E] mt-0.5 leading-relaxed">
                      {stop.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Availability Schedule */}
        <div className="rounded-xl border border-[#E5EAED] p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#176779]">
            <Calendar className="h-4 w-4 text-[#176779]" />
            <span>Availability & Departure Schedule</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-[#18282A]">
            <div className="rounded-lg bg-[#F8FAFB] p-2.5">
              <span className="text-[#74818A] block text-[11px]">Frequency:</span>
              <span className="font-bold">
                {scheduleDetails?.isDaily ? "Daily (7 Days/Week)" : "Specific Days"}
              </span>
            </div>

            <div className="rounded-lg bg-[#F8FAFB] p-2.5">
              <span className="text-[#74818A] block text-[11px]">Capacity / Slot:</span>
              <span className="font-bold">
                {currentRecord.availabilitySummary?.totalCapacity || 25} travelers
              </span>
            </div>

            <div className="rounded-lg bg-[#F8FAFB] p-2.5">
              <span className="text-[#74818A] block text-[11px]">Time Slots:</span>
              <span className="font-bold">
                {scheduleDetails?.timeSlots?.join(", ") || "08:00 AM"}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E5EAED]">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="rounded-xl text-xs font-semibold text-[#74818A] hover:bg-[#F8FAFB] cursor-pointer"
          >
            Close
          </Button>
          {onEdit && (
            <Button
              type="button"
              onClick={() => {
                onClose();
                onEdit(currentRecord);
              }}
              data-testid="edit-tour-from-modal-btn"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#176779] px-4 text-xs font-semibold text-white hover:bg-[#125261] transition-colors cursor-pointer"
            >
              <Edit className="h-3.5 w-3.5" />
              <span>Edit Tour Details</span>
            </Button>
          )}
        </div>
      </div>
    </Dialog>
  );
}
