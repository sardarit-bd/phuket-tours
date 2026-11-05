"use client";

import * as React from "react";
import { CheckCircle2, Ban, Edit2, Trash2, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CustomSelect } from "@/components/ui/custom-select";
import type { SpecificDateAvailability } from "./availability-tab";

export interface SelectedDateListProps {
  dates: SpecificDateAvailability[];
  defaultCapacity: number;
  onUpdateEntry: (updated: SpecificDateAvailability) => void;
  onRemoveDate: (date: string) => void;
  onSelectDateForEdit?: (entry: SpecificDateAvailability) => void;
  "data-testid"?: string;
}

export function SelectedDateList({
  dates,
  defaultCapacity,
  onUpdateEntry,
  onRemoveDate,
  onSelectDateForEdit,
  "data-testid": dataTestId = "selected-date-list",
}: SelectedDateListProps) {
  const [editingDate, setEditingDate] = React.useState<string | null>(null);
  const [editStatus, setEditStatus] = React.useState<boolean>(true);
  const [editCapacity, setEditCapacity] = React.useState<number | "">("");

  const startInlineEdit = (item: SpecificDateAvailability) => {
    setEditingDate(item.date);
    setEditStatus(item.isAvailable);
    setEditCapacity(item.capacity !== undefined ? item.capacity : defaultCapacity);
  };

  const cancelInlineEdit = () => {
    setEditingDate(null);
  };

  const saveInlineEdit = (date: string) => {
    const finalCap = editCapacity !== "" ? Number(editCapacity) : defaultCapacity;
    onUpdateEntry({
      date,
      isAvailable: editStatus,
      capacity: finalCap,
    });
    setEditingDate(null);
  };

  if (dates.length === 0) {
    return (
      <div
        className="rounded-xl border border-dashed border-[#E5EAED] p-4 text-center text-xs text-[#74818A]"
        data-testid={`${dataTestId}-empty`}
      >
        No specific date overrides added yet. General weekly schedule applies.
      </div>
    );
  }

  return (
    <div className="space-y-2.5" data-testid={dataTestId}>
      <div className="space-y-2">
        {dates.map((item) => {
          const isInlineEditing = editingDate === item.date;

          return (
            <div
              key={item.date}
              className="flex items-center justify-between rounded-xl border border-[#E5EAED] bg-[#F8FAFB] px-3.5 py-2.5 text-xs transition-colors hover:border-[#176779]/30 hover:bg-white"
              data-testid={`specific-date-row-${item.date}`}
            >
              {isInlineEditing ? (
                /* Inline Edit Controls */
                <div className="flex flex-1 items-center gap-2 mr-2">
                  <span className="font-bold text-[#18282A] min-w-[85px]">
                    {item.date}
                  </span>
                  <div className="w-[125px]">
                    <CustomSelect<string>
                      options={[
                        { value: "available", label: "Available" },
                        { value: "blocked", label: "Unavailable" },
                      ]}
                      value={editStatus ? "available" : "blocked"}
                      onChange={(val) => setEditStatus(val === "available")}
                      data-testid={`inline-edit-status-${item.date}`}
                      size="sm"
                      usePortal={true}
                    />
                  </div>
                  <Input
                    type="number"
                    min="0"
                    value={editCapacity}
                    onChange={(e) =>
                      setEditCapacity(e.target.value === "" ? "" : Number(e.target.value))
                    }
                    placeholder={String(defaultCapacity)}
                    className="h-8 w-24 text-xs bg-white"
                    data-testid={`inline-edit-capacity-${item.date}`}
                  />
                  <button
                    type="button"
                    onClick={() => saveInlineEdit(item.date)}
                    className="rounded-lg p-1 text-[#0E7A67] hover:bg-[#E8F8F5] cursor-pointer"
                    title="Save Changes"
                    data-testid={`inline-save-${item.date}`}
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={cancelInlineEdit}
                    className="rounded-lg p-1 text-[#74818A] hover:bg-slate-200 cursor-pointer"
                    title="Cancel"
                    data-testid={`inline-cancel-${item.date}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                /* Static Display */
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-[#18282A] tracking-tight">
                    {item.date}
                  </span>
                  {item.isAvailable ? (
                    <span className="inline-flex items-center gap-1 rounded-md bg-[#E8F8F5] px-2 py-0.5 text-[11px] font-semibold text-[#0E7A67]">
                      <CheckCircle2 className="h-3 w-3" />
                      Available ({item.capacity ?? defaultCapacity} seats)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-md bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-700">
                      <Ban className="h-3 w-3" />
                      Unavailable
                    </span>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              {!isInlineEditing && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (onSelectDateForEdit) {
                        onSelectDateForEdit(item);
                      } else {
                        startInlineEdit(item);
                      }
                    }}
                    className="rounded-lg p-1.5 text-[#5C6C6E] hover:bg-[#E8F8F5] hover:text-[#176779] cursor-pointer transition-colors"
                    title={`Edit ${item.date}`}
                    aria-label={`Edit date ${item.date}`}
                    data-testid={`edit-date-${item.date}`}
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemoveDate(item.date)}
                    className="rounded-lg p-1.5 text-[#C0392B] hover:bg-red-50 cursor-pointer transition-colors"
                    title={`Remove ${item.date}`}
                    aria-label={`Remove date ${item.date}`}
                    data-testid={`remove-date-${item.date}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-[11px] text-[#74818A]">
        Note: Removing a configured date sets its status to unavailable on that day.
      </p>
    </div>
  );
}
