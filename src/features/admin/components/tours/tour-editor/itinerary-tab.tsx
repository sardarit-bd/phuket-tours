"use client";

import * as React from "react";
import { Plus, Trash2, ArrowUp, ArrowDown, Clock, Compass } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { TourItineraryItem } from "../../../types/admin";

export interface ItineraryTabProps {
  itinerary: TourItineraryItem[];
  onChange: (itinerary: TourItineraryItem[]) => void;
}

const PRESET_STOPS = [
  {
    time: "07:30 - 08:30",
    title: "Hotel Pickup & Transfer",
    description: "Air-conditioned minivan collects travelers from hotel lobby and transfers to marina pier.",
  },
  {
    time: "09:00 - 09:30",
    title: "Pier Welcome & Safety Briefing",
    description: "Enjoy light morning refreshments, meet your certified guide, and receive safety & itinerary briefing.",
  },
  {
    time: "10:30 - 12:00",
    title: "Maya Bay & Pileh Lagoon Snorkeling",
    description: "Sightseeing at famous Maya Bay, followed by cliff jumping and snorkeling in emerald lagoon waters.",
  },
  {
    time: "12:30 - 13:30",
    title: "Beachside Buffet Lunch",
    description: "Relax on the beach and enjoy a delicious Thai & international buffet lunch with fresh tropical fruits.",
  },
  {
    time: "14:00 - 15:30",
    title: "Bamboo Island Beach Relaxation",
    description: "Free time for sunbathing, swimming, and exploring white sand beaches and coral reefs.",
  },
  {
    time: "16:30 - 17:30",
    title: "Return to Pier & Hotel Drop-off",
    description: "Speedboat returns to Phuket marina; transfer van safely drives guests back to their hotels.",
  },
];

export function ItineraryTab({ itinerary, onChange }: ItineraryTabProps) {
  const [newTime, setNewTime] = React.useState("");
  const [newTitle, setNewTitle] = React.useState("");
  const [newDesc, setNewDesc] = React.useState("");
  const [newDay, setNewDay] = React.useState<number>(1);

  const handleAddStop = (preset?: typeof PRESET_STOPS[0]) => {
    const time = preset ? preset.time : newTime.trim();
    const title = preset ? preset.title : newTitle.trim();
    const description = preset ? preset.description : newDesc.trim();

    if (!title) return;

    const newItem: TourItineraryItem = {
      day: newDay,
      time: time || undefined,
      title,
      description,
    };

    onChange([...itinerary, newItem]);

    if (!preset) {
      setNewTitle("");
      setNewDesc("");
      setNewTime("");
    }
  };

  const handleRemoveStop = (index: number) => {
    onChange(itinerary.filter((_, idx) => idx !== index));
  };

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    const items = [...itinerary];
    const temp = items[index - 1];
    items[index - 1] = items[index];
    items[index] = temp;
    onChange(items);
  };

  const handleMoveDown = (index: number) => {
    if (index >= itinerary.length - 1) return;
    const items = [...itinerary];
    const temp = items[index + 1];
    items[index + 1] = items[index];
    items[index] = temp;
    onChange(items);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Quick Templates */}
      <div className="rounded-xl border border-[#E5EAED] bg-white p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#176779]">
              Tour Itinerary Schedule
            </h3>
            <p className="text-xs text-[#74818A] mt-0.5">
              Add the activities and stops included in this tour in chronological order.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#18282A]">
              {itinerary.length} {itinerary.length === 1 ? "Activity" : "Activities"} Configured
            </span>
          </div>
        </div>

        {/* Preset Templates */}
        <div className="border-t border-[#E5EAED] pt-3">
          <span className="text-[11px] font-semibold text-[#74818A] block mb-1.5">
            Quick Presets:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_STOPS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleAddStop(preset)}
                className="rounded-full border border-[#E5EAED] bg-[#F8FAFB] px-2.5 py-1 text-[11px] font-medium text-[#18282A] hover:border-[#176779] hover:bg-[#E8F8F5] transition-colors cursor-pointer"
              >
                + {preset.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Interactive Timeline Stops List */}
      <div className="space-y-3">
        {itinerary.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#E5EAED] bg-white p-8 text-center text-xs text-[#74818A] shadow-2xs">
            <Compass className="h-8 w-8 text-[#176779] mx-auto mb-2 opacity-50" />
            <p className="font-semibold text-[#18282A]">No Itinerary Stops Added</p>
            <p className="mt-1">
              Use the builder below or click one of the quick presets to build your tour timeline.
            </p>
          </div>
        ) : (
          <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#E5EAED]">
            {itinerary.map((item, idx) => (
              <div
                key={idx}
                className="relative rounded-xl border border-[#E5EAED] bg-white p-4 shadow-2xs hover:border-[#176779]/40 transition-colors"
                data-testid={`itinerary-stop-${idx}`}
              >
                {/* Timeline node circle */}
                <div className="absolute -left-[27px] top-4.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-[#176779] bg-white">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#176779]" />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-[#F0F4F6] px-2 py-0.5 text-[10px] font-bold text-[#18282A]">
                        Day {item.day || 1}
                      </span>
                      {item.time && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#176779] bg-[#E8F8F5] px-2 py-0.5 rounded-md">
                          <Clock className="h-3 w-3" />
                          {item.time}
                        </span>
                      )}
                      <h4 className="text-xs sm:text-sm font-bold text-[#18282A]">
                        {item.title}
                      </h4>
                    </div>
                    <p className="text-xs text-[#5C6C6E] leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Reorder and Delete Actions */}
                  <div className="flex items-center gap-1 shrink-0 self-end sm:self-start">
                    <button
                      type="button"
                      onClick={() => handleMoveUp(idx)}
                      disabled={idx === 0}
                      className="rounded-lg p-1.5 text-[#74818A] hover:bg-[#F8FAFB] hover:text-[#18282A] disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                      title="Move Up"
                      aria-label="Move stop up"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveDown(idx)}
                      disabled={idx === itinerary.length - 1}
                      className="rounded-lg p-1.5 text-[#74818A] hover:bg-[#F8FAFB] hover:text-[#18282A] disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                      title="Move Down"
                      aria-label="Move stop down"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveStop(idx)}
                      className="rounded-lg p-1.5 text-[#C0392B] hover:bg-red-50 transition-colors cursor-pointer"
                      title="Remove Activity"
                      aria-label="Delete itinerary stop"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. New Stop Builder Form */}
      <div className="rounded-xl border border-[#E5EAED] bg-[#F8FAFB] p-4 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#18282A]">
          Add Itinerary Activity
        </h4>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
          <div>
            <label className="block text-[11px] font-semibold text-[#74818A] mb-1">
              Day
            </label>
            <Input
              type="number"
              min="1"
              value={newDay}
              onChange={(e) => setNewDay(Math.max(1, Number(e.target.value) || 1))}
              className="text-xs bg-white"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#74818A] mb-1">
              Time
            </label>
            <Input
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              placeholder="e.g. 09:30 AM"
              className="text-xs bg-white"
              data-testid="new-itinerary-time-input"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[11px] font-semibold text-[#74818A] mb-1">
              Activity <span className="text-red-500">*</span>
            </label>
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Snorkeling at Coral Garden"
              className="text-xs bg-white"
              data-testid="new-itinerary-title-input"
            />
          </div>

          <div className="sm:col-span-4">
            <label className="block text-[11px] font-semibold text-[#74818A] mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Describe what travelers will see, experience, or do at this stop..."
              className="w-full rounded-xl border border-[#E5EAED] bg-white px-3 py-2 text-xs text-[#18282A] placeholder:text-[#A0AEC0] focus:border-[#176779] focus:outline-none"
              data-testid="new-itinerary-desc-input"
            />
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <Button
            type="button"
            onClick={() => handleAddStop()}
            disabled={!newTitle.trim()}
            className="rounded-xl bg-[#176779] px-4 text-xs font-semibold text-white hover:bg-[#125261] transition-colors cursor-pointer"
            data-testid="add-itinerary-stop-btn"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Activity
          </Button>
        </div>
      </div>
    </div>
  );
}
