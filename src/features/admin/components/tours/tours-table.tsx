import * as React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { TourStatusBadge } from "./tour-status-badge";
import { TourActionsMenu } from "./tour-actions-menu";
import { formatDate } from "../../utils/format";
import type { AdminServiceRecord, AdminServiceStatus } from "../../types/admin";
import { MapPin, Building2 } from "lucide-react";

export interface ToursTableProps {
  tours: AdminServiceRecord[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onViewDetails: (tour: AdminServiceRecord) => void;
  onEditTour: (tour: AdminServiceRecord) => void;
  onStatusChange: (id: string, status: AdminServiceStatus) => void;
  isStatusUpdating?: boolean;
}

export function ToursTable({
  tours,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onViewDetails,
  onEditTour,
  onStatusChange,
  isStatusUpdating = false,
}: ToursTableProps) {
  const allSelected = tours.length > 0 && tours.every((t) => selectedIds.includes(t.id));
  const someSelected =
    tours.some((t) => selectedIds.includes(t.id)) && !allSelected;

  return (
    <div className="overflow-x-auto">
      <table
        data-testid="admin-tours-table"
        className="w-full text-left border-collapse text-xs"
      >
        <thead>
          <tr className="border-b border-[#E5EAED] bg-[#F8FAFB] text-[#74818A]">
            <th scope="col" className="w-10 px-4 py-3.5">
              <span className="sr-only">Select All Rows</span>
              <Checkbox
                checked={allSelected}
                indeterminate={someSelected}
                onCheckedChange={onToggleSelectAll}
                aria-label="Select all tours on this page"
                data-testid="select-all-tours-checkbox"
              />
            </th>
            <th scope="col" className="min-w-[200px] px-4 py-3.5 font-semibold">
              Tour Name
            </th>
            <th scope="col" className="min-w-[130px] px-4 py-3.5 font-semibold">
              Destination
            </th>
            <th scope="col" className="min-w-[130px] px-4 py-3.5 font-semibold">
              Provider
            </th>
            <th scope="col" className="min-w-[120px] px-4 py-3.5 font-semibold">
              Pricing
            </th>
            <th scope="col" className="min-w-[120px] px-4 py-3.5 font-semibold">
              Availability
            </th>
            <th scope="col" className="min-w-[100px] px-4 py-3.5 font-semibold">
              Status
            </th>
            <th scope="col" className="min-w-[110px] px-4 py-3.5 font-semibold">
              Updated
            </th>
            <th scope="col" className="w-12 px-4 py-3.5 text-right font-semibold">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E5EAED] bg-white">
          {tours.map((tour) => {
            const isSelected = selectedIds.includes(tour.id);

            // Safe metadata extraction
            const destination =
              (tour.metadata?.destination as string) ||
              ((tour.metadata?.location as { city?: string })?.city) ||
              (tour.metadata?.destinationCategory as string) ||
              null;

            const provider = (tour as unknown as { provider?: { name?: string } }).provider;
            const providerName = tour.providerName || provider?.name || null;

            return (
              <tr
                key={tour.id}
                data-testid={`tour-row-${tour.id}`}
                className={`transition-colors hover:bg-[#F8FAFB]/80 ${
                  isSelected ? "bg-[#E8F8F5]/30" : ""
                }`}
              >
                {/* Row Checkbox */}
                <td className="px-4 py-3.5 align-middle">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => onToggleSelect(tour.id)}
                    aria-label={`Select ${tour.name}`}
                    data-testid={`select-tour-checkbox-${tour.id}`}
                  />
                </td>

                {/* Tour Name & Snippet */}
                <td className="px-4 py-3.5 align-middle">
                  <div className="max-w-xs">
                    <button
                      type="button"
                      onClick={() => onViewDetails(tour)}
                      className="text-left font-semibold text-[#18282A] hover:text-[#176779] transition-colors cursor-pointer line-clamp-1"
                      title={tour.name}
                    >
                      {tour.name}
                    </button>
                    {tour.description ? (
                      <p
                        className="mt-0.5 text-[11px] text-[#74818A] line-clamp-1"
                        title={tour.description}
                      >
                        {tour.description}
                      </p>
                    ) : (
                      <p className="mt-0.5 text-[11px] text-[#B0BCC2] italic">
                        No description
                      </p>
                    )}
                  </div>
                </td>

                {/* Destination */}
                <td className="px-4 py-3.5 align-middle text-[#18282A]">
                  {destination ? (
                    <div className="flex items-center gap-1.5 text-[#18282A]">
                      <MapPin className="h-3 w-3 text-[#176779] shrink-0" />
                      <span className="truncate max-w-[120px]" title={destination}>
                        {destination}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[#B0BCC2] italic">Not set</span>
                  )}
                </td>

                {/* Provider */}
                <td className="px-4 py-3.5 align-middle text-[#18282A]">
                  {providerName ? (
                    <div className="flex items-center gap-1.5 text-[#18282A]">
                      <Building2 className="h-3 w-3 text-[#74818A] shrink-0" />
                      <span className="truncate max-w-[120px]" title={providerName}>
                        {providerName}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[#B0BCC2] italic">Unassigned</span>
                  )}
                </td>

                {/* Pricing Summary */}
                <td className="px-4 py-3.5 align-middle">
                  {tour.pricingSummary ? (
                    <div className="space-y-0.5">
                      <div className="font-semibold text-[#18282A]">
                        {tour.pricingSummary.currency}{" "}
                        {tour.pricingSummary.basePrice.toLocaleString()}
                      </div>
                      {tour.pricingSummary.discountedPrice != null && (
                        <div className="text-[10px] font-medium text-[#0E7A67]">
                          Sale: {tour.pricingSummary.currency}{" "}
                          {tour.pricingSummary.discountedPrice.toLocaleString()}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="inline-flex items-center rounded-md bg-[#F1F4F6] px-2 py-0.5 text-[10px] font-medium text-[#74818A]">
                      Not configured
                    </span>
                  )}
                </td>

                {/* Availability Summary */}
                <td className="px-4 py-3.5 align-middle">
                  {tour.availabilitySummary ? (
                    <div className="space-y-0.5 text-[11px]">
                      {tour.availabilitySummary.availableDateCount != null && (
                        <div className="text-[#0E7A67] font-medium">
                          {tour.availabilitySummary.availableDateCount} dates open
                        </div>
                      )}
                      {tour.availabilitySummary.totalCapacity != null && (
                        <div className="text-[#74818A] text-[10px]">
                          Cap: {tour.availabilitySummary.totalCapacity}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="inline-flex items-center rounded-md bg-[#F1F4F6] px-2 py-0.5 text-[10px] font-medium text-[#74818A]">
                      Not configured
                    </span>
                  )}
                </td>

                {/* Status Badge */}
                <td className="px-4 py-3.5 align-middle">
                  <TourStatusBadge status={tour.status} />
                </td>

                {/* Updated Date */}
                <td className="px-4 py-3.5 align-middle text-[#74818A] whitespace-nowrap">
                  {formatDate(tour.updatedAt)}
                </td>

                {/* Actions Dropdown */}
                <td className="px-4 py-3.5 align-middle text-right">
                  <TourActionsMenu
                    tour={tour}
                    onViewDetails={onViewDetails}
                    onEditTour={onEditTour}
                    onStatusChange={(t, status) => onStatusChange(t.id, status)}
                    isUpdatingStatus={isStatusUpdating}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
