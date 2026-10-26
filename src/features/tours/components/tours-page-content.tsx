"use client";

import * as React from "react";
import { Container } from "@/components/layout/container";
import {
  TourSearchBar,
  TourCategoryTabs,
  TourFiltersSidebar,
  TourMobileFilterDrawer,
  TourResultsHeader,
  TourGrid,
} from "./index";
import { useTourFilters } from "../hooks/use-tour-filters";
import { useGetToursQuery } from "../api/tours-api";

export function ToursPageContent() {
  const {
    filters,
    setSearch,
    setCategory,
    toggleDestination,
    toggleTourType,
    toggleDuration,
    setPriceRange,
    setSortBy,
    clearAllFilters,
    resetEverything,
    activeFilterCount,
    toggleFavorite,
    favorites,
  } = useTourFilters();

  // Query tours via RTK Query with local mock fallback
  const { data, isLoading } = useGetToursQuery({
    search: filters.search,
    category: filters.category,
    destinations: filters.destinations,
    tourTypes: filters.tourTypes,
    durations: filters.durations,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    sortBy: filters.sortBy,
  });

  const tours = data?.data ?? [];
  const total = data?.total ?? 0;

  return (
    <div className="py-8 sm:py-10 lg:py-12 bg-white">
      <Container className="max-w-[1320px] lg:px-0">
        <div className="flex flex-col lg:flex-row lg:items-start gap-8 xl:gap-10">
          {/* Desktop Left Sidebar: Filter Groups */}
          <div className="hidden lg:block w-[260px] xl:w-[280px] shrink-0 sticky top-24">
            <TourFiltersSidebar
              filters={filters}
              toggleDestination={toggleDestination}
              toggleTourType={toggleTourType}
              toggleDuration={toggleDuration}
              setPriceRange={setPriceRange}
              clearAllFilters={clearAllFilters}
            />
          </div>

          {/* Right Main Content Area */}
          <main className="flex-1 min-w-0 space-y-5 sm:space-y-6">
            {/* Search Bar */}
            <TourSearchBar
              value={filters.search}
              onChange={setSearch}
            />

            {/* Tour Category Navigation */}
            <TourCategoryTabs
              selectedCategory={filters.category}
              onSelectCategory={setCategory}
            />

            {/* Results Count & Sort Dropdown */}
            <TourResultsHeader
              count={total}
              sortBy={filters.sortBy}
              onSortChange={setSortBy}
              mobileFilterSlot={
                <TourMobileFilterDrawer
                  filters={filters}
                  activeFilterCount={activeFilterCount}
                  toggleDestination={toggleDestination}
                  toggleTourType={toggleTourType}
                  toggleDuration={toggleDuration}
                  setPriceRange={setPriceRange}
                  clearAllFilters={clearAllFilters}
                  totalFound={total}
                />
              }
            />

            {/* Tour Cards Grid */}
            <TourGrid
              tours={tours}
              isLoading={isLoading}
              onResetFilters={resetEverything}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
            />
          </main>
        </div>
      </Container>
    </div>
  );
}
