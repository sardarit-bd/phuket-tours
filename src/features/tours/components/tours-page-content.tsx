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
  TourPagination,
} from "./index";
import { ErrorAlert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useTourFilters } from "../hooks/use-tour-filters";
import { useGetToursQuery } from "../api/tours-api";
import { FilterGroup } from "../types/tour";

function useDestinationFilterGroup(
  tours: import("../types/tour").Tour[],
): FilterGroup | null {
  return React.useMemo(() => {
    if (tours.length === 0) return null;

    const destCounts: Record<string, { count: number; label: string }> = {};
    tours.forEach((tour) => {
      const key = tour.destinationCategory;
      if (!key || !tour.destination) return;
      if (!destCounts[key]) {
        destCounts[key] = { count: 0, label: tour.destination };
      }
      destCounts[key].count += 1;
    });

    const options = Object.entries(destCounts)
      .sort((a, b) => b[1].count - a[1].count)
      .map(([id, info]) => ({
        id,
        label: info.label,
        count: info.count,
      }));

    if (options.length === 0) return null;

    return {
      id: "destination",
      title: "Destination",
      options,
    };
  }, [tours]);
}

function useMaxPriceFromData(tours: import("../types/tour").Tour[]): number {
  return React.useMemo(() => {
    if (tours.length === 0) return 500;
    const maxPrice = Math.max(...tours.map((t) => t.price.amount));
    return Math.ceil(maxPrice / 50) * 50;
  }, [tours]);
}

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
    setPage,
    clearAllFilters,
    resetEverything,
    activeFilterCount,
    toggleFavorite,
    favorites,
  } = useTourFilters();
  const { data, isLoading, isError, refetch } = useGetToursQuery({
    search: filters.search,
    category: filters.category,
    destinations: filters.destinations,
    tourTypes: filters.tourTypes,
    durations: filters.durations,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    sortBy: filters.sortBy,
    page: filters.page,
    limit: filters.limit,
  });

  const tours = data?.data ?? [];
  const total = data?.total ?? 0;
  const currentPage = data?.page ?? filters.page;
  const totalPages = data?.totalPages ?? 1;
  const limit = data?.limit ?? filters.limit;
  const destinationGroup = useDestinationFilterGroup(tours);
  const dynamicMaxPrice = useMaxPriceFromData(tours);

  return (
    <div className="py-8 sm:py-10 lg:py-12 bg-white">
      <Container className="max-w-330 lg:px-0">
        <div className="flex flex-col lg:flex-row lg:items-start gap-8 xl:gap-10">
          <div className="hidden lg:block w-65 xl:w-70 shrink-0 sticky top-24">
            <TourFiltersSidebar
              filters={filters}
              toggleDestination={toggleDestination}
              toggleTourType={toggleTourType}
              toggleDuration={toggleDuration}
              setPriceRange={setPriceRange}
              clearAllFilters={clearAllFilters}
              destinationGroup={destinationGroup}
              dynamicMaxPrice={dynamicMaxPrice}
            />
          </div>
          <main
            id="tours-results-section"
            className="flex-1 min-w-0 space-y-5 sm:space-y-6"
          >
            <TourSearchBar value={filters.search} onChange={setSearch} />
            <TourCategoryTabs
              selectedCategory={filters.category}
              onSelectCategory={setCategory}
            />
            <TourResultsHeader
              count={total}
              page={currentPage}
              limit={limit}
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
                  destinationGroup={destinationGroup}
                  dynamicMaxPrice={dynamicMaxPrice}
                />
              }
            />
            {isError && (
              <ErrorAlert
                className="p-6"
                title="Unable to load tours"
                description="We couldn't reach the tours directory. Please check your internet connection and try again."
                action={
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => refetch()}
                    className="rounded-full bg-primary hover:bg-primary-dark text-white text-xs px-5 font-semibold"
                  >
                    Retry Loading
                  </Button>
                }
              />
            )}
            {!isError && (
              <TourGrid
                tours={tours}
                isLoading={isLoading}
                onResetFilters={resetEverything}
                favorites={favorites}
                onToggleFavorite={toggleFavorite}
              />
            )}
            {!isError && (
              <TourPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            )}
          </main>
        </div>
      </Container>
    </div>
  );
}
