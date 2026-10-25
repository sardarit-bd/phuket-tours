"use client";

import * as React from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TourSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: () => void;
  placeholder?: string;
  className?: string;
}

export function TourSearchBar({
  value,
  onChange,
  onSearch,
  placeholder = "Search tours by name, destination or activity...",
  className = "",
}: TourSearchBarProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) onSearch();
  };

  const handleClear = () => {
    onChange("");
  };

  return (
    <form
      role="search"
      aria-label="Search tours"
      onSubmit={handleSubmit}
      className={`relative flex items-center w-full rounded-2xl sm:rounded-full border border-[#E5EAEB] bg-white p-1.5 sm:p-2 shadow-xs transition-shadow focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 ${className}`}
    >
      <div className="flex items-center flex-1 pl-3 sm:pl-4 gap-2.5">
        <Search
          className="h-5 w-5 text-[#8A9A9C] shrink-0"
          aria-hidden="true"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-label="Search tours input"
          className="w-full bg-transparent text-sm sm:text-[15px] text-[#18282A] placeholder:text-[#8A9A9C] focus:outline-none"
        />
        {value ? (
          <button
            type="button"
            onClick={handleClear}
            className="p-1 text-[#8A9A9C] hover:text-[#18282A] transition-colors rounded-full"
            aria-label="Clear search text"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <Button
        type="submit"
        className="rounded-full bg-primary hover:bg-primary-dark text-white font-medium px-6 sm:px-8 h-10 sm:h-11 text-sm shadow-xs transition-colors shrink-0 cursor-pointer"
      >
        Search
      </Button>
    </form>
  );
}
