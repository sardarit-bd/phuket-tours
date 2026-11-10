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
  debounceMs?: number;
}

export function TourSearchBar({
  value,
  onChange,
  onSearch,
  placeholder = "Search tours by name, destination or activity...",
  className = "",
  debounceMs = 250,
}: TourSearchBarProps) {
  const [localValue, setLocalValue] = React.useState(value);
  const [prevValue, setPrevValue] = React.useState(value);

  // Adjust local state during render when the external value prop changes (e.g. Clear All)
  // Recommended React 19 pattern to avoid cascading render effects
  if (value !== prevValue) {
    setPrevValue(value);
    setLocalValue(value);
  }

  // Debounced notification to parent to prevent expensive re-renders and queries on every key
  React.useEffect(() => {
    if (localValue === value) return;

    const timer = setTimeout(() => {
      onChange(localValue);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [localValue, value, onChange, debounceMs]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localValue !== value) {
      onChange(localValue);
    }
    if (onSearch) onSearch();
  };

  const handleClear = () => {
    setLocalValue("");
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
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          placeholder={placeholder}
          aria-label="Search tours input"
          className="w-full bg-transparent text-sm sm:text-[15px] text-[#18282A] placeholder:text-[#8A9A9C] focus:outline-none"
        />
        {localValue ? (
          <button
            type="button"
            onClick={handleClear}
            className="p-1 text-[#8A9A9C] hover:text-[#18282A] transition-colors rounded-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20"
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
