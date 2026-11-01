"use client";

import * as React from "react";
import { Clock, Users, Plus, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CustomDatePicker } from "@/components/ui/custom-date-picker";
import { SelectedDateList } from "./selected-date-list";
import type { TourScheduleDetails } from "../../../types/admin";

export interface SpecificDateAvailability {
  date: string; // YYYY-MM-DD
  isAvailable: boolean;
  capacity?: number;
}

export interface AvailabilityFormData {
  scheduleDetails: TourScheduleDetails;
  capacity: number;
  specificDates: SpecificDateAvailability[];
  removedDates?: string[];
}

export interface AvailabilityTabProps {
  data: AvailabilityFormData;
  onChange: (updates: Partial<AvailabilityFormData>) => void;
}

const DAYS_OF_WEEK = [
  { day: 0, label: "Sunday", short: "Sun" },
  { day: 1, label: "Monday", short: "Mon" },
  { day: 2, label: "Tuesday", short: "Tue" },
  { day: 3, label: "Wednesday", short: "Wed" },
  { day: 4, label: "Thursday", short: "Thu" },
  { day: 5, label: "Friday", short: "Fri" },
  { day: 6, label: "Saturday", short: "Sat" },
];

export function AvailabilityTab({ data, onChange }: AvailabilityTabProps) {
  const [newTimeSlot, setNewTimeSlot] = React.useState("");
  const [newSpecificDate, setNewSpecificDate] = React.useState("");
  const [newDateCapacity, setNewDateCapacity] = React.useState<number | "">("");
  const [newDateStatus, setNewDateStatus] = React.useState<boolean>(true);

  const activeDays: number[] = data.scheduleDetails.daysOfWeek || [0, 1, 2, 3, 4, 5, 6];
  const timeSlots: string[] = data.scheduleDetails.timeSlots || ["08:00 AM"];

  // Check if selected date already exists in schedule
  const existingEntryForSelectedDate = React.useMemo(() => {
    if (!newSpecificDate) return undefined;
    return data.specificDates.find((d) => d.date === newSpecificDate);
  }, [data.specificDates, newSpecificDate]);

  const isEditingExistingDate = Boolean(existingEntryForSelectedDate);

  const handleDatePicked = (selectedDate: string) => {
    setNewSpecificDate(selectedDate);
    const existing = data.specificDates.find((d) => d.date === selectedDate);
    if (existing) {
      setNewDateStatus(existing.isAvailable);
      setNewDateCapacity(existing.capacity !== undefined ? existing.capacity : "");
    } else {
      setNewDateStatus(true);
      setNewDateCapacity("");
    }
  };

  const handleToggleDay = (day: number) => {
    let nextDays: number[];
    if (activeDays.includes(day)) {
      nextDays = activeDays.filter((d: number) => d !== day);
    } else {
      nextDays = [...activeDays, day].sort();
    }
    onChange({
      scheduleDetails: {
        ...data.scheduleDetails,
        daysOfWeek: nextDays,
        isDaily: nextDays.length === 7,
      },
    });
  };

  const handleToggleDaily = () => {
    const isNowDaily = !data.scheduleDetails.isDaily;
    onChange({
      scheduleDetails: {
        ...data.scheduleDetails,
        isDaily: isNowDaily,
        daysOfWeek: isNowDaily ? [0, 1, 2, 3, 4, 5, 6] : activeDays,
      },
    });
  };

  const handleAddTimeSlot = () => {
    const trimmed = newTimeSlot.trim();
    if (!trimmed || timeSlots.includes(trimmed)) return;
    onChange({
      scheduleDetails: {
        ...data.scheduleDetails,
        timeSlots: [...timeSlots, trimmed],
      },
    });
    setNewTimeSlot("");
  };

  const handleRemoveTimeSlot = (slotToRemove: string) => {
    onChange({
      scheduleDetails: {
        ...data.scheduleDetails,
        timeSlots: timeSlots.filter((slot) => slot !== slotToRemove),
      },
    });
  };

  const handleAddSpecificDate = () => {
    if (!newSpecificDate) return;
    const existingIdx = data.specificDates.findIndex((d) => d.date === newSpecificDate);
    const capacity = newDateCapacity !== "" ? Number(newDateCapacity) : data.capacity;
    const entry: SpecificDateAvailability = {
      date: newSpecificDate,
      isAvailable: newDateStatus,
      capacity,
    };

    // Clean up removedDates if this date was previously marked removed
    const nextRemovedDates = (data.removedDates || []).filter((d) => d !== newSpecificDate);

    if (existingIdx >= 0) {
      const updated = [...data.specificDates];
      updated[existingIdx] = entry;
      onChange({
        specificDates: updated,
        removedDates: nextRemovedDates,
      });
    } else {
      const updated = [...data.specificDates, entry].sort((a, b) =>
        a.date.localeCompare(b.date)
      );
      onChange({
        specificDates: updated,
        removedDates: nextRemovedDates,
      });
    }

    setNewSpecificDate("");
    setNewDateCapacity("");
    setNewDateStatus(true);
  };

  const handleUpdateEntry = (updatedEntry: SpecificDateAvailability) => {
    const nextRemovedDates = (data.removedDates || []).filter((d) => d !== updatedEntry.date);
    const existingIdx = data.specificDates.findIndex((d) => d.date === updatedEntry.date);
    if (existingIdx >= 0) {
      const updated = [...data.specificDates];
      updated[existingIdx] = updatedEntry;
      onChange({
        specificDates: updated,
        removedDates: nextRemovedDates,
      });
    } else {
      const updated = [...data.specificDates, updatedEntry].sort((a, b) =>
        a.date.localeCompare(b.date)
      );
      onChange({
        specificDates: updated,
        removedDates: nextRemovedDates,
      });
    }
  };

  const handleSelectDateForEdit = (entry: SpecificDateAvailability) => {
    setNewSpecificDate(entry.date);
    setNewDateStatus(entry.isAvailable);
    setNewDateCapacity(entry.capacity !== undefined ? entry.capacity : "");
  };

  const handleRemoveSpecificDate = (dateToRemove: string) => {
    const currentRemoved = data.removedDates || [];
    if (newSpecificDate === dateToRemove) {
      setNewSpecificDate("");
      setNewDateCapacity("");
    }
    onChange({
      specificDates: data.specificDates.filter((d) => d.date !== dateToRemove),
      removedDates: [...currentRemoved, dateToRemove],
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. Standard Schedule & Operating Days */}
      <div className="rounded-xl border border-[#E5EAED] bg-white p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#176779]">
              1. General Departure Schedule
            </h3>
            <p className="text-xs text-[#74818A] mt-0.5">
              Specify standard operating days and regular departure times.
            </p>
          </div>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={Boolean(data.scheduleDetails.isDaily)}
              onChange={handleToggleDaily}
              className="h-4 w-4 rounded accent-[#176779] cursor-pointer"
              data-testid="is-daily-toggle"
            />
            <span className="text-xs font-semibold text-[#18282A]">
              Operates Daily (7 Days/Week)
            </span>
          </label>
        </div>

        {/* Operating days pills */}
        <div>
          <label className="block text-xs font-semibold text-[#18282A] mb-2">
            Standard Operating Days
          </label>
          <div className="flex flex-wrap gap-2">
            {DAYS_OF_WEEK.map(({ day, label, short }) => {
              const isActive = activeDays.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleToggleDay(day)}
                  className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#176779] text-white shadow-2xs"
                      : "border border-[#E5EAED] bg-[#F8FAFB] text-[#74818A] hover:bg-[#E5EAED]"
                  }`}
                  data-testid={`day-toggle-${day}`}
                  aria-pressed={isActive}
                >
                  <span className="sm:hidden">{short}</span>
                  <span className="hidden sm:inline">{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Operating hours & Time slots */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2 border-t border-[#E5EAED]">
          <div>
            <label
              htmlFor="tour-form-operating-hours"
              className="block text-xs font-semibold text-[#18282A] mb-1.5"
            >
              Operating Hours Window
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#74818A]" />
              <Input
                id="tour-form-operating-hours"
                value={data.scheduleDetails.operatingHours || ""}
                onChange={(e) =>
                  onChange({
                    scheduleDetails: {
                      ...data.scheduleDetails,
                      operatingHours: e.target.value,
                    },
                  })
                }
                placeholder="e.g. 08:00 AM - 05:30 PM"
                className="pl-9 text-xs"
                data-testid="tour-operating-hours-input"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#18282A] mb-1.5">
              Scheduled Departure Times
            </label>
            <div className="flex gap-2">
              <Input
                value={newTimeSlot}
                onChange={(e) => setNewTimeSlot(e.target.value)}
                placeholder="e.g. 09:30 AM"
                className="text-xs"
                data-testid="new-timeslot-input"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddTimeSlot}
                className="text-xs font-semibold text-[#176779] border-[#176779]/30 hover:bg-[#E8F8F5] cursor-pointer"
                data-testid="add-timeslot-btn"
              >
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </div>
            {timeSlots.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {timeSlots.map((slot) => (
                  <span
                    key={slot}
                    className="inline-flex items-center gap-1 rounded-lg bg-[#E8F8F5] px-2.5 py-1 text-xs font-semibold text-[#176779]"
                  >
                    {slot}
                    <button
                      type="button"
                      onClick={() => handleRemoveTimeSlot(slot)}
                      className="ml-1 text-[#176779]/60 hover:text-red-500 cursor-pointer"
                      aria-label={`Remove time slot ${slot}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Group Capacity */}
      <div className="rounded-xl border border-[#E5EAED] bg-white p-5 shadow-2xs space-y-4">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#176779]">
            2. Standard Guest Capacity
          </h3>
          <p className="text-xs text-[#74818A] mt-0.5">
            Default guest capacity per departure (used when no specific date override is set).
          </p>
        </div>

        <div className="max-w-xs">
          <label
            htmlFor="tour-form-capacity"
            className="block text-xs font-semibold text-[#18282A] mb-1.5"
          >
            Guest Capacity (Seats)
          </label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#74818A]" />
            <Input
              id="tour-form-capacity"
              type="number"
              min="1"
              value={data.capacity}
              onChange={(e) =>
                onChange({
                  capacity: Math.max(1, Number(e.target.value) || 1),
                })
              }
              className="pl-9 text-xs"
              data-testid="tour-capacity-input"
            />
          </div>
        </div>
      </div>

      {/* 3. Specific Date Availability & Blackout Overrides */}
      <div className="rounded-xl border border-[#E5EAED] bg-white p-5 shadow-2xs space-y-4">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#176779]">
            3. Selected Dates & Availability
          </h3>
          <p className="text-xs text-[#74818A] mt-0.5">
            Select specific dates to configure guest capacity or mark dates as unavailable.
          </p>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-[#18282A] mb-2">
            Selected Dates ({data.specificDates.length})
          </h4>
          {/* Existing specific dates list */}
          <SelectedDateList
            dates={data.specificDates}
            defaultCapacity={data.capacity}
            onUpdateEntry={handleUpdateEntry}
            onSelectDateForEdit={handleSelectDateForEdit}
            onRemoveDate={handleRemoveSpecificDate}
          />
        </div>

        {/* Interactive Custom Date Entry Section */}
        <div className="pt-3 border-t border-[#E5EAED]">
          <h4 className="text-xs font-semibold text-[#18282A] mb-2">
            {isEditingExistingDate ? "Edit Selected Date" : "Add or Update Date"}
          </h4>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            <div>
              <label className="block text-[11px] font-semibold text-[#74818A] mb-1">
                Select Date
              </label>
              <CustomDatePicker
                id="new-specific-date-input"
                value={newSpecificDate}
                onChange={handleDatePicked}
                existingDates={data.specificDates}
                disablePastDates={false}
                placeholder="Select Date"
                data-testid="new-specific-date-input"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#74818A] mb-1">
                Status
              </label>
              <select
                value={newDateStatus ? "available" : "blocked"}
                onChange={(e) => setNewDateStatus(e.target.value === "available")}
                className="h-11 w-full rounded-xl border border-[#E5EAED] bg-white px-3 text-xs text-[#18282A] focus:border-[#176779] focus:outline-none"
                data-testid="new-date-status-select"
              >
                <option value="available">Available</option>
                <option value="blocked">Unavailable</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#74818A] mb-1">
                Guest Capacity
              </label>
              <Input
                type="number"
                min="0"
                value={newDateCapacity}
                onChange={(e) =>
                  setNewDateCapacity(e.target.value === "" ? "" : Number(e.target.value))
                }
                placeholder={`Default: ${data.capacity}`}
                className="text-xs bg-white h-11 rounded-xl"
                data-testid="new-date-capacity-input"
              />
            </div>

            <div className="flex items-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleAddSpecificDate}
                disabled={!newSpecificDate}
                className="w-full text-xs font-semibold text-[#176779] border-[#176779]/30 hover:bg-[#E8F8F5] cursor-pointer h-11 rounded-xl"
                data-testid="add-specific-date-btn"
              >
                {isEditingExistingDate ? (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    Update Date
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Date
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
