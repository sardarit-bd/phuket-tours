"use client";

import * as React from "react";
import {
  LayoutGrid,
  Palmtree,
  Waves,
  Compass,
  Sparkles,
  Landmark,
  Car,
} from "lucide-react";
import { tourCategories } from "../data/tours-data";
import { cn } from "@/lib/utils";

interface TourCategoryTabsProps {
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  className?: string;
}

export function TourCategoryTabs({
  selectedCategory,
  onSelectCategory,
  className = "",
}: TourCategoryTabsProps) {
  const getIcon = (iconName: string, isActive: boolean) => {
    const iconClass = cn(
      "h-4 w-4 shrink-0 transition-colors",
      isActive ? "text-primary" : "text-[#5C6C6E] group-hover:text-[#18282A]"
    );

    switch (iconName) {
      case "grid":
        return <LayoutGrid className={iconClass} />;
      case "island":
        return <Palmtree className={iconClass} />;
      case "diving":
        return <Waves className={iconClass} />;
      case "adventure":
        return <Compass className={iconClass} />;
      case "shows":
        return <Sparkles className={iconClass} />;
      case "cultural":
        return <Landmark className={iconClass} />;
      case "transfers":
        return <Car className={iconClass} />;
      default:
        return <LayoutGrid className={iconClass} />;
    }
  };

  return (
    <nav
      aria-label="Tour categories"
      className={cn(
        "flex items-center gap-2 overflow-x-auto py-1 scrollbar-none",
        className
      )}
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      {tourCategories.map((cat) => {
        const isActive = selectedCategory === cat.id;

        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelectCategory(cat.id)}
            className={cn(
              "group inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-medium transition-all shrink-0 cursor-pointer",
              isActive
                ? "bg-[#E6F5F6] text-primary font-semibold ring-1 ring-primary/30 shadow-2xs"
                : "bg-white text-[#5C6C6E] hover:bg-[#F5F8F9] hover:text-[#18282A] border border-[#E5EAEB]/60"
            )}
            aria-pressed={isActive}
          >
            {getIcon(cat.icon, isActive)}
            <span>{cat.name}</span>
          </button>
        );
      })}
    </nav>
  );
}
