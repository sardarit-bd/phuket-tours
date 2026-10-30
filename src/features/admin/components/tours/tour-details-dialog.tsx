import * as React from "react";
import {
  Calendar,
  Clock,
  DollarSign,
  MapPin,
  User,
} from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TourStatusBadge } from "./tour-status-badge";
import { formatDate } from "../../utils/format";
import type { AdminServiceRecord } from "../../types/admin";

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
  if (!tour) return null;

  // Extract destination from metadata safely
  const destination =
    (tour.metadata?.destination as string) ||
    ((tour.metadata?.location as { city?: string })?.city) ||
    (tour.metadata?.destinationCategory as string) ||
    "Not specified";

  const duration = (tour.metadata?.duration as string) || null;
  const provider = (tour as unknown as { provider?: { name?: string; email?: string } }).provider;
  const providerName = tour.providerName || provider?.name || "Unassigned Provider";

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={tour.name}
      description={`Tour ID: ${tour.id}`}
      size="lg"
    >
      <div className="space-y-6 text-[#18282A]">
        {/* Status and quick info bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E5EAED] bg-[#F8FAFB] p-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-[#74818A]">Status:</span>
            <TourStatusBadge status={tour.status} />
          </div>
          <div className="flex items-center gap-2 text-xs text-[#74818A]">
            <Clock className="h-3.5 w-3.5" />
            <span>Updated: {formatDate(tour.updatedAt)}</span>
          </div>
        </div>

        {/* Description */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#74818A]">
            Description
          </h4>
          <p className="mt-2 text-sm leading-relaxed text-[#18282A]">
            {tour.description || "No description provided for this tour package."}
          </p>
        </div>

        {/* Key Attributes Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Destination */}
          <div className="flex items-start gap-3 rounded-xl border border-[#E5EAED] p-3.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#E8F8F5] text-[#176779]">
              <MapPin className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs font-medium text-[#74818A]">Destination</div>
              <div className="mt-0.5 text-sm font-semibold text-[#18282A]">
                {destination}
              </div>
            </div>
          </div>

          {/* Provider */}
          <div className="flex items-start gap-3 rounded-xl border border-[#E5EAED] p-3.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F8FAFB] text-[#74818A]">
              <User className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs font-medium text-[#74818A]">Provider</div>
              <div className="mt-0.5 text-sm font-semibold text-[#18282A]">
                {providerName}
              </div>
              {provider?.email && (
                <div className="text-xs text-[#74818A]">{provider.email}</div>
              )}
            </div>
          </div>
        </div>

        {/* Optional Duration Metadata */}
        {duration && (
          <div className="rounded-xl border border-[#E5EAED] bg-[#F8FAFB] px-4 py-3 text-xs text-[#18282A]">
            <span className="font-semibold text-[#74818A]">Estimated Duration: </span>
            <span>{duration}</span>
          </div>
        )}

        {/* Pricing & Availability Sections */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Pricing */}
          <div className="rounded-xl border border-[#E5EAED] p-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#74818A]">
              <DollarSign className="h-4 w-4 text-[#176779]" />
              <span>Pricing Configuration</span>
            </div>
            {tour.pricingSummary ? (
              <div className="mt-3 space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-[#18282A]">
                    {tour.pricingSummary.currency}{" "}
                    {tour.pricingSummary.basePrice.toLocaleString()}
                  </span>
                  <span className="text-xs text-[#74818A]">Base Price</span>
                </div>
                {tour.pricingSummary.discountedPrice != null && (
                  <div className="text-xs font-medium text-[#0E7A67]">
                    Discounted: {tour.pricingSummary.currency}{" "}
                    {tour.pricingSummary.discountedPrice.toLocaleString()}
                  </div>
                )}
                {tour.pricingSummary.taxRate != null && (
                  <div className="text-xs text-[#74818A]">
                    Tax rate: {tour.pricingSummary.taxRate}%
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-3 rounded-lg border border-dashed border-[#E5EAED] bg-[#F8FAFB] p-3 text-center text-xs text-[#74818A]">
                No pricing configured yet
              </div>
            )}
          </div>

          {/* Availability */}
          <div className="rounded-xl border border-[#E5EAED] p-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#74818A]">
              <Calendar className="h-4 w-4 text-[#176779]" />
              <span>Availability Schedule</span>
            </div>
            {tour.availabilitySummary ? (
              <div className="mt-3 space-y-1.5 text-xs text-[#18282A]">
                {tour.availabilitySummary.availableDateCount != null && (
                  <div className="flex justify-between">
                    <span className="text-[#74818A]">Active dates:</span>
                    <span className="font-semibold text-[#0E7A67]">
                      {tour.availabilitySummary.availableDateCount} dates
                    </span>
                  </div>
                )}
                {tour.availabilitySummary.totalCapacity != null && (
                  <div className="flex justify-between">
                    <span className="text-[#74818A]">Capacity / Slot:</span>
                    <span className="font-semibold">
                      {tour.availabilitySummary.totalCapacity} travelers
                    </span>
                  </div>
                )}
                {tour.availabilitySummary.unavailableDateCount != null && (
                  <div className="flex justify-between">
                    <span className="text-[#74818A]">Blocked dates:</span>
                    <span className="font-semibold text-[#C0392B]">
                      {tour.availabilitySummary.unavailableDateCount} dates
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-3 rounded-lg border border-dashed border-[#E5EAED] bg-[#F8FAFB] p-3 text-center text-xs text-[#74818A]">
                No availability configured yet
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
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
                onEdit(tour);
              }}
              data-testid="edit-tour-from-modal-btn"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#176779] px-4 text-xs font-semibold text-white hover:bg-[#125261] transition-colors cursor-pointer"
            >
              <span>Edit Tour Details</span>
            </Button>
          )}
        </div>
      </div>
    </Dialog>
  );
}
