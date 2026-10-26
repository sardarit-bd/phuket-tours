"use client";

import * as React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface TourPriceFilterProps {
  minPrice: number;
  maxPrice: number;
  onChange: (min: number, max: number) => void;
  defaultOpen?: boolean;
}

export function TourPriceFilter({
  minPrice,
  maxPrice,
  onChange,
  defaultOpen = true,
}: TourPriceFilterProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = Number(e.target.value);
    onChange(minPrice, newMax);
  };

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = Number(e.target.value);
    if (newMin <= maxPrice) {
      onChange(newMin, maxPrice);
    }
  };

  // Percentage for track highlight
  const minPercent = Math.min(100, Math.max(0, (minPrice / 500) * 100));
  const maxPercent = Math.min(100, Math.max(0, (maxPrice / 500) * 100));

  return (
    <div className="pb-5 pt-1">
      {/* Accordion Header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-2 text-left text-sm font-semibold text-[#18282A] hover:text-primary transition-colors cursor-pointer"
        aria-expanded={isOpen}
      >
        <span>Price Range</span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-[#8A9A9C]" />
        ) : (
          <ChevronDown className="h-4 w-4 text-[#8A9A9C]" />
        )}
      </button>

      {isOpen && (
        <div className="mt-4 px-1 animate-in fade-in-0 duration-200">
          {/* Slider track container */}
          <div className="relative h-6 flex items-center">
            {/* Background Track */}
            <div className="absolute w-full h-1.5 bg-[#E5EAED] rounded-full" />

            {/* Active Highlight Track */}
            <div
              className="absolute h-1.5 bg-primary rounded-full"
              style={{
                left: `${minPercent}%`,
                width: `${maxPercent - minPercent}%`,
              }}
            />

            {/* Min Range Slider */}
            <input
              type="range"
              min={0}
              max={500}
              step={10}
              value={minPrice}
              onChange={handleMinChange}
              aria-label="Minimum price"
              className="pointer-events-none absolute w-full -top-1 h-6 appearance-none bg-transparent opacity-0 cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-xs"
            />

            {/* Max Range Slider */}
            <input
              type="range"
              min={0}
              max={500}
              step={10}
              value={maxPrice}
              onChange={handleMaxChange}
              aria-label="Maximum price"
              className="pointer-events-auto absolute w-full -top-1 h-6 appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-xs"
            />
          </div>

          {/* Price Label display matching screenshot ($0 - $500+) */}
          <div className="mt-2.5 flex items-center justify-between text-xs font-medium text-[#5C6C6E]">
            <span>
              ${minPrice} - ${maxPrice >= 500 ? "500+" : maxPrice}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
