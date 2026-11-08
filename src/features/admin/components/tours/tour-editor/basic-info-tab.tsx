"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { CustomSelect } from "@/components/ui/custom-select";

export interface BasicInfoFormData {
  name: string;
  slug: string;
  subtitle: string;
  description: string;
  destination: string;
  city: string;
  country: string;
  departurePoint: string;
  duration: string;
  durationCategory: "half-day" | "full-day" | "multi-day" | string;
  tourType: string;
  groupSize: string;
  languages: string[];
  providerName: string;
  providerId: string;
  badge: "" | "Popular" | "Bestseller" | "New";
}

export interface BasicInfoTabProps {
  data: BasicInfoFormData;
  onChange: (updates: Partial<BasicInfoFormData>) => void;
  errors: Record<string, string>;
  isEditMode: boolean;
}

export const DESTINATION_OPTIONS = [
  { value: "Phi Phi Islands", label: "Phi Phi Islands (Maya Bay, Bamboo Island)" },
  { value: "James Bond Island", label: "James Bond Island (Phang Nga Bay)" },
  { value: "Similan Islands", label: "Similan Islands (National Marine Park)" },
  { value: "Phuket", label: "Phuket Island (Old Town, Big Buddha, Chalong)" },
  { value: "Krabi", label: "Krabi & Hong Islands (Railay, 4 Islands)" },
  { value: "Racha & Coral Islands", label: "Racha & Coral Islands (Kahung Beach)" },
];

export const DURATION_CATEGORY_OPTIONS = [
  { value: "half-day", label: "Half Day (3–5 hours)" },
  { value: "full-day", label: "Full Day (6–9 hours)" },
  { value: "multi-day", label: "Multi-Day (Overnight / 2+ days)" },
];

export const TOUR_TYPE_OPTIONS = [
  { value: "island-tours", label: "Island Tours & Island Hopping" },
  { value: "adventure", label: "Adventure & Outdoor Activities" },
  { value: "water-activities", label: "Water Activities & Snorkeling" },
  { value: "cultural-sightseeing", label: "Cultural Sightseeing & Heritage" },
  { value: "shows-entertainment", label: "Shows & Evening Entertainment" },
];

export const BADGE_OPTIONS: {
  value: "" | "Popular" | "Bestseller" | "New";
  label: string;
}[] = [
  { value: "", label: "None / Standard" },
  { value: "Popular", label: "Popular" },
  { value: "Bestseller", label: "Bestseller" },
  { value: "New", label: "New Release" },
];

const COMMON_LANGUAGES = [
  "English",
  "Thai",
  "Chinese (Mandarin)",
  "Russian",
  "German",
  "French",
  "Spanish",
];

// Helper to slugify titles safely
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function BasicInfoTab({
  data,
  onChange,
  errors,
  isEditMode,
}: BasicInfoTabProps) {
  const [customLanguage, setCustomLanguage] = React.useState("");

  // Preserve existing destination if not in predefined list (e.g. legacy/custom saved tours)
  const destinationOptions = React.useMemo(() => {
    if (data.destination && !DESTINATION_OPTIONS.some((o) => o.value === data.destination)) {
      return [{ value: data.destination, label: data.destination }, ...DESTINATION_OPTIONS];
    }
    return DESTINATION_OPTIONS;
  }, [data.destination]);

  // Preserve existing tour category if not in predefined list
  const tourCategoryOptions = React.useMemo(() => {
    if (data.tourType && !TOUR_TYPE_OPTIONS.some((o) => o.value === data.tourType)) {
      return [{ value: data.tourType, label: data.tourType }, ...TOUR_TYPE_OPTIONS];
    }
    return TOUR_TYPE_OPTIONS;
  }, [data.tourType]);

  // Preserve existing duration category if not in predefined list
  const durationOptions = React.useMemo(() => {
    if (
      data.durationCategory &&
      !DURATION_CATEGORY_OPTIONS.some((o) => o.value === data.durationCategory)
    ) {
      return [
        ...DURATION_CATEGORY_OPTIONS,
        { value: data.durationCategory, label: data.durationCategory },
      ];
    }
    return DURATION_CATEGORY_OPTIONS;
  }, [data.durationCategory]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    const updates: Partial<BasicInfoFormData> = { name: newTitle };
    // Automatically generate slug from Tour Name in create mode
    if (!isEditMode) {
      updates.slug = slugify(newTitle);
    }
    onChange(updates);
  };

  const handleToggleLanguage = (lang: string) => {
    const current = new Set(data.languages);
    if (current.has(lang)) {
      current.delete(lang);
    } else {
      current.add(lang);
    }
    onChange({ languages: Array.from(current) });
  };

  const handleAddCustomLanguage = () => {
    const trimmed = customLanguage.trim();
    if (!trimmed) return;
    if (!data.languages.includes(trimmed)) {
      onChange({ languages: [...data.languages, trimmed] });
    }
    setCustomLanguage("");
  };

  return (
    <div className="space-y-6">
      {/* 1. Tour Information */}
      <div className="rounded-xl border border-[#E5EAED] bg-white p-5 shadow-2xs space-y-4">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#176779]">
            1. Tour Information
          </h3>
          <p className="text-xs text-[#74818A] mt-0.5">
            Basic details and descriptions of the tour experience.
          </p>
        </div>

        <div className="space-y-4">
          {/* Tour Name */}
          <div>
            <label
              htmlFor="tour-form-name"
              className="block text-xs font-semibold text-[#18282A] mb-1.5"
            >
              Tour Name <span className="text-red-500">*</span>
            </label>
            <Input
              id="tour-form-name"
              value={data.name}
              onChange={handleTitleChange}
              placeholder="e.g. Phi Phi Island Speedboat & Snorkeling Adventure"
              className={errors.name ? "border-red-400 focus-visible:ring-red-300" : ""}
              data-testid="tour-form-name-input"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Short Description */}
          <div>
            <label
              htmlFor="tour-form-subtitle"
              className="block text-xs font-semibold text-[#18282A] mb-1"
            >
              Short Description
            </label>
            <p className="text-[11px] text-[#74818A] mb-1.5">
              Write a short introduction that helps customers understand this tour at a glance.
            </p>
            <Input
              id="tour-form-subtitle"
              value={data.subtitle}
              onChange={(e) => onChange({ subtitle: e.target.value })}
              placeholder="e.g. Explore Maya Bay, Pileh Lagoon, and Bamboo Island with crystal-clear waters"
              data-testid="tour-form-subtitle-input"
            />
          </div>

          {/* Tour Description */}
          <div>
            <label
              htmlFor="tour-form-description"
              className="block text-xs font-semibold text-[#18282A] mb-1"
            >
              Tour Description
            </label>
            <p className="text-[11px] text-[#74818A] mb-1.5">
              Describe the tour experience, highlights and what guests can expect.
            </p>
            <textarea
              id="tour-form-description"
              rows={4}
              value={data.description}
              onChange={(e) => onChange({ description: e.target.value })}
              placeholder="Describe the tour experience, highlights and what guests can expect..."
              className="w-full rounded-xl border border-[#E5EAED] bg-white px-3.5 py-2.5 text-xs text-[#18282A] placeholder:text-[#A0AEC0] focus:border-[#176779] focus:outline-none focus:ring-1 focus:ring-[#176779] transition-all resize-y"
              data-testid="tour-form-description-input"
            />
          </div>
        </div>
      </div>

      {/* 2. Destination & Location */}
      <div className="rounded-xl border border-[#E5EAED] bg-white p-5 shadow-2xs space-y-4">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#176779]">
            2. Destination & Location
          </h3>
          <p className="text-xs text-[#74818A] mt-0.5">
            Where the tour takes place and where guests will meet.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Destination */}
          <div>
            <label
              htmlFor="tour-form-destination"
              className="block text-xs font-semibold text-[#18282A] mb-1.5"
            >
              Destination <span className="text-red-500">*</span>
            </label>
            <CustomSelect<string>
              id="tour-form-destination"
              value={data.destination || destinationOptions[0].value}
              onChange={(val) => onChange({ destination: val })}
              options={destinationOptions}
              size="md"
              data-testid="tour-form-destination-select"
            />
            {errors.destination && (
              <p className="mt-1 text-xs text-red-500">{errors.destination}</p>
            )}
          </div>

          {/* Departure Point / Meeting Location */}
          <div>
            <label
              htmlFor="tour-form-departure-point"
              className="block text-xs font-semibold text-[#18282A] mb-1.5"
            >
              Departure Point / Meeting Location
            </label>
            <Input
              id="tour-form-departure-point"
              value={data.departurePoint}
              onChange={(e) => onChange({ departurePoint: e.target.value })}
              placeholder="e.g. Royal Phuket Marina, Pier 3"
              data-testid="tour-form-departure-point-input"
            />
          </div>

          {/* City */}
          <div>
            <label
              htmlFor="tour-form-city"
              className="block text-xs font-semibold text-[#18282A] mb-1.5"
            >
              City
            </label>
            <Input
              id="tour-form-city"
              value={data.city}
              onChange={(e) => onChange({ city: e.target.value })}
              placeholder="e.g. Phuket"
              data-testid="tour-form-city-input"
            />
          </div>

          {/* Country */}
          <div>
            <label
              htmlFor="tour-form-country"
              className="block text-xs font-semibold text-[#18282A] mb-1.5"
            >
              Country
            </label>
            <Input
              id="tour-form-country"
              value={data.country}
              onChange={(e) => onChange({ country: e.target.value })}
              placeholder="Thailand"
              data-testid="tour-form-country-input"
            />
          </div>
        </div>
      </div>

      {/* 3. Tour Details */}
      <div className="rounded-xl border border-[#E5EAED] bg-white p-5 shadow-2xs space-y-4">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#176779]">
            3. Tour Details
          </h3>
          <p className="text-xs text-[#74818A] mt-0.5">
            Duration, tour category, and group capacity.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Tour Duration */}
          <div>
            <label
              htmlFor="tour-form-duration"
              className="block text-xs font-semibold text-[#18282A] mb-1.5"
            >
              Tour Duration <span className="text-red-500">*</span>
            </label>
            <Input
              id="tour-form-duration"
              value={data.duration}
              onChange={(e) => onChange({ duration: e.target.value })}
              placeholder="e.g. Full Day (8 Hours)"
              data-testid="tour-form-duration-input"
            />
            {errors.duration && (
              <p className="mt-1 text-xs text-red-500">{errors.duration}</p>
            )}
          </div>

          {/* Duration Type */}
          <div>
            <label
              htmlFor="tour-form-duration-cat"
              className="block text-xs font-semibold text-[#18282A] mb-1.5"
            >
              Duration Type
            </label>
            <CustomSelect<string>
              id="tour-form-duration-cat"
              value={data.durationCategory}
              onChange={(val) => onChange({ durationCategory: val })}
              options={durationOptions}
              size="md"
              data-testid="tour-form-duration-cat-select"
            />
          </div>

          {/* Tour Category */}
          <div>
            <label
              htmlFor="tour-form-type"
              className="block text-xs font-semibold text-[#18282A] mb-1.5"
            >
              Tour Category
            </label>
            <CustomSelect<string>
              id="tour-form-type"
              value={data.tourType || tourCategoryOptions[0].value}
              onChange={(val) => onChange({ tourType: val })}
              options={tourCategoryOptions}
              size="md"
              data-testid="tour-form-type-select"
            />
          </div>

          {/* Maximum Group Size */}
          <div>
            <label
              htmlFor="tour-form-group-size"
              className="block text-xs font-semibold text-[#18282A] mb-1.5"
            >
              Maximum Group Size
            </label>
            <Input
              id="tour-form-group-size"
              value={data.groupSize}
              onChange={(e) => onChange({ groupSize: e.target.value })}
              placeholder="e.g. Max 25 travelers / Private"
              data-testid="tour-form-group-size-input"
            />
          </div>

          {/* Tour Operator */}
          <div>
            <label
              htmlFor="tour-form-provider"
              className="block text-xs font-semibold text-[#18282A] mb-1.5"
            >
              Tour Operator
            </label>
            <Input
              id="tour-form-provider"
              value={data.providerName}
              onChange={(e) => onChange({ providerName: e.target.value })}
              placeholder="e.g. Phuket Island Travels"
              data-testid="tour-form-provider-input"
            />
          </div>

          {/* Highlight */}
          <div>
            <label
              htmlFor="tour-form-badge"
              className="block text-xs font-semibold text-[#18282A] mb-1.5"
            >
              Highlight
            </label>
            <CustomSelect<"" | "Popular" | "Bestseller" | "New">
              id="tour-form-badge"
              value={data.badge}
              onChange={(val) => onChange({ badge: val })}
              options={BADGE_OPTIONS}
              size="md"
              data-testid="tour-form-badge-select"
            />
          </div>
        </div>
      </div>

      {/* 4. Additional Information */}
      <div className="rounded-xl border border-[#E5EAED] bg-white p-5 shadow-2xs space-y-4">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#176779]">
            4. Additional Information
          </h3>
          <p className="text-xs text-[#74818A] mt-0.5">
            Guided tour languages offered to customers.
          </p>
        </div>

        {/* Guided Languages */}
        <div>
          <label className="block text-xs font-semibold text-[#18282A] mb-2">
            Tour Languages
          </label>
          <div className="flex flex-wrap items-center gap-2">
            {COMMON_LANGUAGES.map((lang) => {
              const isSelected = data.languages.includes(lang);
              return (
                <button
                  key={lang}
                  type="button"
                  onClick={() => handleToggleLanguage(lang)}
                  data-testid={`lang-chip-${lang}`}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors cursor-pointer border ${
                    isSelected
                      ? "border-[#176779] bg-[#E8F8F5] text-[#176779] font-semibold"
                      : "border-[#E5EAED] bg-white text-[#5C6C6E] hover:border-[#176779]/40 hover:bg-[#F8FAFB]"
                  }`}
                >
                  {isSelected ? `✓ ${lang}` : `+ ${lang}`}
                </button>
              );
            })}
          </div>

          {/* Custom language input */}
          <div className="mt-3 flex items-center gap-2 max-w-xs">
            <Input
              value={customLanguage}
              onChange={(e) => setCustomLanguage(e.target.value)}
              placeholder="Other language..."
              className="h-8 text-xs"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddCustomLanguage();
                }
              }}
            />
            <button
              type="button"
              onClick={handleAddCustomLanguage}
              className="rounded-lg bg-[#F8FAFB] border border-[#E5EAED] px-3 py-1.5 text-xs font-semibold text-[#18282A] hover:bg-[#E5EAED] cursor-pointer"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
