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
  ChevronLeft,
  ChevronRight,
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
  const navRef = React.useRef<HTMLElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(false);

  const checkScroll = React.useCallback(() => {
    const el = navRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 2);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 2);
  }, []);

  const scrollByOffset = (direction: "left" | "right") => {
    const el = navRef.current;
    if (!el) return;
    const scrollAmount = 260;
    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  // Check scroll on mount, resize, and DOM changes
  React.useEffect(() => {
    const el = navRef.current;
    if (!el) return;

    checkScroll();

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        checkScroll();
      });
      resizeObserver.observe(el);
      if (el.firstElementChild) {
        resizeObserver.observe(el.firstElementChild);
      }
    }

    window.addEventListener("resize", checkScroll);
    return () => {
      if (resizeObserver) resizeObserver.disconnect();
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll]);

  // Translate vertical mouse wheel to horizontal scroll on desktop
  React.useEffect(() => {
    const el = navRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0 && el.scrollWidth > el.clientWidth) {
        if (Math.abs(e.deltaY) >= Math.abs(e.deltaX)) {
          const canScroll =
            (e.deltaY > 0 && el.scrollLeft < el.scrollWidth - el.clientWidth - 1) ||
            (e.deltaY < 0 && el.scrollLeft > 0);
          if (canScroll) {
            e.preventDefault();
            el.scrollLeft += e.deltaY;
            checkScroll();
          }
        }
      }
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", handleWheel);
    };
  }, [checkScroll]);

  // Smoothly scroll active category into view when changed or loaded
  React.useEffect(() => {
    const el = navRef.current;
    if (!el) return;

    const activeButton = el.querySelector<HTMLButtonElement>(
      `button[data-category-id="${selectedCategory}"]`
    );
    if (activeButton) {
      const navRect = el.getBoundingClientRect();
      const btnRect = activeButton.getBoundingClientRect();
      if (btnRect.left < navRect.left || btnRect.right > navRect.right) {
        activeButton.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "nearest",
        });
      }
    }
    checkScroll();
  }, [selectedCategory, checkScroll]);

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
    <div className={cn("relative w-full max-w-full group/cat-tabs", className)}>
      {/* Subtle Left Scroll Button / Gradient Fade */}
      {canScrollLeft && (
        <div className="absolute left-0 top-0 bottom-0 z-10 flex items-center pr-4 pl-0.5 bg-gradient-to-r from-white via-white/95 to-transparent pointer-events-none">
          <button
            type="button"
            onClick={() => scrollByOffset("left")}
            className="hidden sm:flex h-8 w-8 rounded-full border border-[#E5EAEB] bg-white shadow-xs hover:bg-[#F5F8F9] hover:border-primary/40 text-[#5C6C6E] hover:text-[#18282A] items-center justify-center transition-all cursor-pointer pointer-events-auto focus:outline-none focus:ring-2 focus:ring-primary/40"
            aria-label="Scroll categories left"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Category Tabs Scroll Row */}
      <nav
        ref={navRef}
        aria-label="Tour categories"
        onScroll={checkScroll}
        className="w-full max-w-full flex items-center gap-2 overflow-x-auto overflow-y-hidden flex-nowrap scrollbar-none py-1 px-0.5 scroll-smooth touch-pan-x"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {tourCategories.map((cat) => {
          const isActive = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              id={`tour-category-tab-${cat.id}`}
              data-category-id={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className={cn(
                "group inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-medium transition-all shrink-0 flex-shrink-0 whitespace-nowrap select-none cursor-pointer",
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

      {/* Subtle Right Scroll Button / Gradient Fade */}
      {canScrollRight && (
        <div className="absolute right-0 top-0 bottom-0 z-10 flex items-center pl-4 pr-0.5 bg-gradient-to-l from-white via-white/95 to-transparent pointer-events-none">
          <button
            type="button"
            onClick={() => scrollByOffset("right")}
            className="hidden sm:flex h-8 w-8 rounded-full border border-[#E5EAEB] bg-white shadow-xs hover:bg-[#F5F8F9] hover:border-primary/40 text-[#5C6C6E] hover:text-[#18282A] items-center justify-center transition-all cursor-pointer pointer-events-auto focus:outline-none focus:ring-2 focus:ring-primary/40"
            aria-label="Scroll categories right"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
