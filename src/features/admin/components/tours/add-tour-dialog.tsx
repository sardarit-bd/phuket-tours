import * as React from "react";
import { Sparkles, Calendar, DollarSign, Image as ImageIcon, MapPin } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export interface AddTourDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: "create" | "edit";
  tourName?: string;
}

export function AddTourDialog({
  isOpen,
  onClose,
  mode = "create",
  tourName,
}: AddTourDialogProps) {
  const isEdit = mode === "edit";

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? `Edit Tour: ${tourName || "Package"}` : "Create New Tour Package"}
      description={
        isEdit
          ? "Configure itinerary metadata, pricing structures, and departure availability."
          : "Add a new tour package to your inventory."
      }
      size="md"
    >
      <div className="space-y-4 text-[#18282A]">
        <div className="rounded-xl border border-[#A3E5D9] bg-[#E8F8F5] p-4 text-xs sm:text-sm text-[#0E7A67] leading-relaxed">
          <div className="flex items-center gap-2 font-bold text-[#176779]">
            <Sparkles className="h-4 w-4" />
            <span>Dedicated Tour Builder — Scheduled for Phase Admin-2D</span>
          </div>
          <p className="mt-1.5 text-xs text-[#176779]/90">
            The multi-step Tour Builder suite (including rich Markdown itinerary descriptions, high-resolution media galleries, multi-tier pricing matrices, and departure calendars) will be delivered in Phase Admin-2D.
          </p>
        </div>

        <div className="space-y-2.5">
          <div className="text-xs font-bold uppercase tracking-wider text-[#74818A]">
            Planned Editor Modules:
          </div>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 text-xs">
            <div className="flex items-center gap-2.5 rounded-lg border border-[#E5EAED] p-2.5 bg-[#F8FAFB]">
              <MapPin className="h-4 w-4 text-[#176779]" />
              <span className="font-medium text-[#18282A]">Location & Destinations</span>
            </div>
            <div className="flex items-center gap-2.5 rounded-lg border border-[#E5EAED] p-2.5 bg-[#F8FAFB]">
              <DollarSign className="h-4 w-4 text-[#176779]" />
              <span className="font-medium text-[#18282A]">Tiered Pricing Matrix</span>
            </div>
            <div className="flex items-center gap-2.5 rounded-lg border border-[#E5EAED] p-2.5 bg-[#F8FAFB]">
              <Calendar className="h-4 w-4 text-[#176779]" />
              <span className="font-medium text-[#18282A]">Departure Schedules</span>
            </div>
            <div className="flex items-center gap-2.5 rounded-lg border border-[#E5EAED] p-2.5 bg-[#F8FAFB]">
              <ImageIcon className="h-4 w-4 text-[#176779]" />
              <span className="font-medium text-[#18282A]">Media & Gallery Uploads</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end pt-3 border-t border-[#E5EAED]">
          <Button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-[#176779] px-4 text-xs font-semibold text-white hover:bg-[#125261] transition-colors cursor-pointer"
          >
            Understood
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
