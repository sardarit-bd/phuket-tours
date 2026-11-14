"use client";

import * as React from "react";
import { Plus, Trash2, CheckCircle2, XCircle, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CustomSelect } from "@/components/ui/custom-select";
import type { TourPricingTier } from "../../../types/admin";

export interface PricingFormData {
  currency: string;
  basePrice: number;
  discountedPrice: number | null;
  taxRate: number;
  pricingTiers: TourPricingTier[];
  highlights: string[];
  included: string[];
  excluded: string[];
}

export interface PricingTabProps {
  data: PricingFormData;
  onChange: (updates: Partial<PricingFormData>) => void;
  errors: Record<string, string>;
}

const CURRENCY_OPTIONS = [
  { value: "USD", label: "USD ($) — US Dollar" },
  { value: "THB", label: "THB (฿) — Thai Baht" },
  { value: "EUR", label: "EUR (€) — Euro" },
];

const PRESET_INCLUSIONS = [
  "Hotel round-trip transfers (Air-conditioned minivan)",
  "Snorkeling mask, snorkel, and life jacket",
  "Delicious buffet lunch & seasonal fresh fruits",
  "National Park entry fees included",
  "Licensed professional English-speaking guide",
  "Accident travel insurance coverage",
];

const PRESET_EXCLUSIONS = [
  "Alcoholic beverages and special cocktails",
  "Personal expenses & souvenir shopping",
  "Gratuities and crew tips (Optional)",
  "Beach towels and swimsuits",
];

export function PricingTab({ data, onChange, errors }: PricingTabProps) {
  // New input states for builders
  const [newTierName, setNewTierName] = React.useState("");
  const [newTierPrice, setNewTierPrice] = React.useState<number | "">("");
  const [newTierDesc, setNewTierDesc] = React.useState("");

  const [newHighlight, setNewHighlight] = React.useState("");
  const [newIncluded, setNewIncluded] = React.useState("");
  const [newExcluded, setNewExcluded] = React.useState("");

  // Tier Matrix Handlers
  const handleAddTier = () => {
    if (!newTierName.trim() || newTierPrice === "" || Number(newTierPrice) < 0) return;
    const tier: TourPricingTier = {
      tierName: newTierName.trim(),
      price: Number(newTierPrice),
      description: newTierDesc.trim() || undefined,
    };
    onChange({ pricingTiers: [...data.pricingTiers, tier] });
    setNewTierName("");
    setNewTierPrice("");
    setNewTierDesc("");
  };

  const handleRemoveTier = (index: number) => {
    const updated = data.pricingTiers.filter((_, idx) => idx !== index);
    onChange({ pricingTiers: updated });
  };

  // Highlights Handlers
  const handleAddHighlight = () => {
    if (!newHighlight.trim()) return;
    onChange({ highlights: [...data.highlights, newHighlight.trim()] });
    setNewHighlight("");
  };

  const handleRemoveHighlight = (index: number) => {
    onChange({ highlights: data.highlights.filter((_, idx) => idx !== index) });
  };

  // Inclusions Handlers
  const handleAddIncluded = (textToAdd?: string) => {
    const val = (textToAdd || newIncluded).trim();
    if (!val || data.included.includes(val)) return;
    onChange({ included: [...data.included, val] });
    if (!textToAdd) setNewIncluded("");
  };

  const handleRemoveIncluded = (index: number) => {
    onChange({ included: data.included.filter((_, idx) => idx !== index) });
  };

  // Exclusions Handlers
  const handleAddExcluded = (textToAdd?: string) => {
    const val = (textToAdd || newExcluded).trim();
    if (!val || data.excluded.includes(val)) return;
    onChange({ excluded: [...data.excluded, val] });
    if (!textToAdd) setNewExcluded("");
  };

  const handleRemoveExcluded = (index: number) => {
    onChange({ excluded: data.excluded.filter((_, idx) => idx !== index) });
  };

  return (
    <div className="space-y-6">
      {/* 1. Base Rates & Currency */}
      <div className="rounded-xl border border-[#E5EAED] bg-white p-5 shadow-2xs space-y-4">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#176779]">
            1. Tour Base Pricing
          </h3>
          <p className="text-xs text-[#74818A] mt-0.5">
            Set the standard adult price, optional discount price, and currency for this tour.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          {/* Currency */}
          <div>
            <label
              htmlFor="pricing-currency"
              className="block text-xs font-semibold text-[#18282A] mb-1.5"
            >
              Currency
            </label>
            <CustomSelect<string>
              id="pricing-currency"
              value={data.currency}
              onChange={(val) => onChange({ currency: val })}
              options={CURRENCY_OPTIONS}
              size="md"
              data-testid="pricing-currency-select"
            />
            <p className="mt-1 text-[11px] text-[#74818A]">
              Billing currency for customer bookings.
            </p>
          </div>

          {/* Adult Price */}
          <div>
            <label
              htmlFor="pricing-base-price"
              className="block text-xs font-semibold text-[#18282A] mb-1.5"
            >
              Adult Price <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#8A9A9C]">
                {data.currency === "THB" ? "฿" : "$"}
              </span>
              <Input
                id="pricing-base-price"
                type="number"
                min="0"
                step="any"
                value={data.basePrice === 0 ? "" : data.basePrice}
                onChange={(e) =>
                  onChange({ basePrice: Math.max(0, Number(e.target.value) || 0) })
                }
                placeholder="120.00"
                className={`pl-8 ${
                  errors.basePrice ? "border-red-400 focus-visible:ring-red-300" : ""
                }`}
                data-testid="pricing-base-price-input"
              />
            </div>
            {errors.basePrice ? (
              <p className="mt-1 text-xs text-red-500">{errors.basePrice}</p>
            ) : (
              <p className="mt-1 text-[11px] text-[#74818A]">
                Standard base price per adult traveler.
              </p>
            )}
          </div>

          {/* Discount Price */}
          <div>
            <label
              htmlFor="pricing-discount-price"
              className="block text-xs font-semibold text-[#18282A] mb-1.5"
            >
              Discount Price
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#8A9A9C]">
                {data.currency === "THB" ? "฿" : "$"}
              </span>
              <Input
                id="pricing-discount-price"
                type="number"
                min="0"
                step="any"
                value={data.discountedPrice ?? ""}
                onChange={(e) => {
                  const val = e.target.value;
                  onChange({
                    discountedPrice: val === "" ? null : Math.max(0, Number(val)),
                  });
                }}
                placeholder="99.00"
                className={`pl-8 ${
                  errors.discountedPrice ? "border-red-400 focus-visible:ring-red-300" : ""
                }`}
                data-testid="pricing-discount-price-input"
              />
            </div>
            {errors.discountedPrice ? (
              <p className="mt-1 text-xs text-red-500">{errors.discountedPrice}</p>
            ) : (
              <p className="mt-1 text-[11px] text-[#74818A]">
                Optional final sale price (must be greater than 0 and lower than adult price).
              </p>
            )}
          </div>

          {/* Tax Rate */}
          <div>
            <label
              htmlFor="pricing-tax-rate"
              className="block text-xs font-semibold text-[#18282A] mb-1.5"
            >
              Tax Rate (%)
            </label>
            <Input
              id="pricing-tax-rate"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={data.taxRate}
              onChange={(e) =>
                onChange({ taxRate: Math.max(0, Number(e.target.value) || 0) })
              }
              placeholder="7.0"
              className={errors.taxRate ? "border-red-400 focus-visible:ring-red-300" : ""}
              data-testid="pricing-tax-rate-input"
            />
            {errors.taxRate ? (
              <p className="mt-1 text-xs text-red-500">{errors.taxRate}</p>
            ) : (
              <p className="mt-1 text-[11px] text-[#74818A]">
                Applicable sales tax or VAT percentage.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 2. Package Options & Passenger Pricing */}
      <div className="rounded-xl border border-[#E5EAED] bg-white p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#176779]">
              2. Package Options & Passenger Pricing
            </h3>
            <p className="text-xs text-[#74818A] mt-0.5">
              Add rates for different passenger types (such as Child Price, Infant Price) or special package options.
            </p>
          </div>
        </div>

        {/* Existing Tiers List */}
        {data.pricingTiers.length > 0 ? (
          <div className="divide-y divide-[#E5EAED] border border-[#E5EAED] rounded-xl overflow-hidden">
            {data.pricingTiers.map((tier, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3.5 bg-white hover:bg-[#F8FAFB] transition-colors"
                data-testid={`pricing-tier-row-${idx}`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#18282A]">
                      {tier.tierName}
                    </span>
                    <span className="rounded-md bg-[#E8F8F5] px-2 py-0.5 text-[11px] font-semibold text-[#176779]">
                      {data.currency} {tier.price.toLocaleString()}
                    </span>
                  </div>
                  {tier.description && (
                    <p className="text-xs text-[#74818A] mt-0.5">
                      {tier.description}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveTier(idx)}
                  className="rounded-lg p-1.5 text-[#C0392B] hover:bg-red-50 transition-colors cursor-pointer"
                  aria-label={`Remove option ${tier.tierName}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-[#E5EAED] p-4 text-center text-xs text-[#74818A]">
            No package options added yet. Standard Adult Price applies.
          </div>
        )}

        {/* Add Tier Builder */}
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-4 pt-2">
          <Input
            value={newTierName}
            onChange={(e) => setNewTierName(e.target.value)}
            placeholder="Option name (e.g. Child Price)"
            className="text-xs"
            data-testid="new-tier-name-input"
          />
          <Input
            type="number"
            min="0"
            value={newTierPrice}
            onChange={(e) =>
              setNewTierPrice(e.target.value === "" ? "" : Number(e.target.value))
            }
            placeholder={`Price (${data.currency})`}
            className="text-xs"
            data-testid="new-tier-price-input"
          />
          <Input
            value={newTierDesc}
            onChange={(e) => setNewTierDesc(e.target.value)}
            placeholder="Description (e.g. Ages 4–11)"
            className="text-xs"
            data-testid="new-tier-desc-input"
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleAddTier}
            disabled={!newTierName.trim() || newTierPrice === ""}
            className="text-xs font-semibold text-[#176779] border-[#176779]/30 hover:bg-[#E8F8F5] cursor-pointer"
            data-testid="add-tier-btn"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add Option
          </Button>
        </div>
      </div>

      {/* 3. Inclusions & Exclusions */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Inclusions */}
        <div className="rounded-xl border border-[#E5EAED] bg-white p-5 shadow-2xs space-y-3">
          <div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#0E7A67]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#18282A]">
                What&apos;s Included
              </h3>
            </div>
            <p className="text-[11px] text-[#74818A] mt-0.5">
              List features, equipment, and services included in the tour price.
            </p>
          </div>

          <div className="space-y-2">
            {data.included.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-lg border border-[#E5EAED] bg-[#F8FAFB] px-3 py-2 text-xs"
              >
                <span className="text-[#18282A]">• {item}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveIncluded(idx)}
                  className="text-red-500 hover:text-red-700 ml-2 cursor-pointer"
                  aria-label="Remove inclusion"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Input
              value={newIncluded}
              onChange={(e) => setNewIncluded(e.target.value)}
              placeholder="e.g. Snorkeling equipment"
              className="text-xs"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddIncluded();
                }
              }}
              data-testid="new-included-input"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleAddIncluded()}
              className="text-xs text-[#176779] cursor-pointer"
            >
              Add
            </Button>
          </div>

          {/* Quick Preset Badges */}
          <div className="pt-2">
            <span className="text-[11px] font-semibold text-[#74818A] block mb-1.5">
              Quick Presets:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_INCLUSIONS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleAddIncluded(preset)}
                  disabled={data.included.includes(preset)}
                  className="rounded-full border border-[#A3E5D9] bg-[#E8F8F5] px-2.5 py-0.5 text-[10px] font-medium text-[#0E7A67] hover:bg-[#A3E5D9]/40 disabled:opacity-40 cursor-pointer"
                >
                  + {preset.slice(0, 24)}…
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Exclusions */}
        <div className="rounded-xl border border-[#E5EAED] bg-white p-5 shadow-2xs space-y-3">
          <div>
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-[#C0392B]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#18282A]">
                What&apos;s Not Included
              </h3>
            </div>
            <p className="text-[11px] text-[#74818A] mt-0.5">
              List items guests need to pay for separately or bring themselves.
            </p>
          </div>

          <div className="space-y-2">
            {data.excluded.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-lg border border-[#E5EAED] bg-[#F8FAFB] px-3 py-2 text-xs"
              >
                <span className="text-[#18282A]">• {item}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveExcluded(idx)}
                  className="text-red-500 hover:text-red-700 ml-2 cursor-pointer"
                  aria-label="Remove exclusion"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Input
              value={newExcluded}
              onChange={(e) => setNewExcluded(e.target.value)}
              placeholder="e.g. Gratuities & tips"
              className="text-xs"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddExcluded();
                }
              }}
              data-testid="new-excluded-input"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleAddExcluded()}
              className="text-xs text-[#176779] cursor-pointer"
            >
              Add
            </Button>
          </div>

          {/* Quick Preset Badges */}
          <div className="pt-2">
            <span className="text-[11px] font-semibold text-[#74818A] block mb-1.5">
              Quick Presets:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_EXCLUSIONS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleAddExcluded(preset)}
                  disabled={data.excluded.includes(preset)}
                  className="rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-[10px] font-medium text-red-700 hover:bg-red-100 disabled:opacity-40 cursor-pointer"
                >
                  + {preset.slice(0, 24)}…
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Highlights / Key Selling Points */}
      <div className="rounded-xl border border-[#E5EAED] bg-white p-5 shadow-2xs space-y-3">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#176779]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#176779]">
              4. Key Tour Highlights
            </h3>
          </div>
          <p className="text-[11px] text-[#74818A] mt-0.5">
            Key selling points that highlight the best parts of this tour experience.
          </p>
        </div>

        <div className="space-y-2">
          {data.highlights.map((h, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded-lg border border-[#E5EAED] bg-[#F8FAFB] px-3.5 py-2 text-xs"
            >
              <span className="text-[#18282A] font-medium">★ {h}</span>
              <button
                type="button"
                onClick={() => handleRemoveHighlight(idx)}
                className="text-red-500 hover:text-red-700 ml-2 cursor-pointer"
                aria-label="Remove highlight"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 pt-1">
          <Input
            value={newHighlight}
            onChange={(e) => setNewHighlight(e.target.value)}
            placeholder="e.g. Swim in crystal-clear emerald water at Pileh Lagoon"
            className="text-xs"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddHighlight();
              }
            }}
            data-testid="new-highlight-input"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddHighlight}
            className="text-xs text-[#176779] cursor-pointer"
            data-testid="add-highlight-btn"
          >
            Add Highlight
          </Button>
        </div>
      </div>
    </div>
  );
}
