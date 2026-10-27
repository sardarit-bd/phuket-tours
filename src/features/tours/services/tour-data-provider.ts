import { Tour, TourFilterParams, ToursResponse } from "../types/tour";
import { clientDummyTours, TOTAL_TOURS_CATALOG_COUNT } from "../data/tours-data";
import {
  buildTourSearchIndex,
  searchAndRankTours,
  TourSearchIndex,
} from "./tour-search";

export const DEFAULT_PAGE_SIZE = 12;

/**
 * Interface defining the Tour Data Source contract.
 * Both the temporary mock provider and the future production backend
 * provider adhere to this interface.
 */
export interface TourDataProvider {
  getTours(params?: TourFilterParams): Promise<ToursResponse>;
  getTourById(id: string): Promise<Tour | null>;
}

/**
 * High-performance In-Memory Tour Data Provider backed by the parsed
 * client tour dataset from `dummydata.txt`.
 */
export class MockTourDataProvider implements TourDataProvider {
  private tours: Tour[];
  private indices: TourSearchIndex[];

  constructor(tours: Tour[] = clientDummyTours) {
    this.tours = tours;
    this.indices = tours.map(buildTourSearchIndex);
  }

  /**
   * Retrieves paginated, filtered, and sorted tours.
   */
  async getTours(params?: TourFilterParams): Promise<ToursResponse> {
    const { filtered, total } = this.filterAndSort(this.tours, params);
    
    const limit = Math.max(1, params?.limit ?? DEFAULT_PAGE_SIZE);
    const totalPages = Math.max(1, Math.ceil(filtered.length / limit));
    const requestedPage = params?.page ?? 1;
    const page = Math.min(Math.max(1, requestedPage), totalPages);

    const startIndex = (page - 1) * limit;
    const paginatedData = filtered.slice(startIndex, startIndex + limit);

    return {
      data: paginatedData,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async getTourById(id: string): Promise<Tour | null> {
    const found = this.tours.find(
      (tour) => tour.id === id || tour.slug === id
    );
    return found || null;
  }

  /**
   * Pure filtering and sorting engine applied over the tour collection.
   * Returns all matching records and the catalog total.
   */
  public filterAndSort(
    tours: Tour[],
    params?: TourFilterParams
  ): { filtered: Tour[]; total: number } {
    if (!params) {
      return { filtered: [...tours], total: TOTAL_TOURS_CATALOG_COUNT };
    }

    const hasActiveSearch = Boolean(params.search && params.search.trim() !== "");
    let candidates: { tour: Tour; score: number }[];

    // 1. Search filter with relevance ranking and typo tolerance
    if (hasActiveSearch) {
      const searchIndices =
        tours === this.tours
          ? this.indices
          : tours.map(buildTourSearchIndex);

      candidates = searchAndRankTours(searchIndices, params.search!.trim());
    } else {
      candidates = tours.map((tour) => ({ tour, score: 0 }));
    }

    // 2. Category tab
    if (params.category && params.category !== "all") {
      candidates = candidates.filter(({ tour }) => {
        if (params.category === "island-tours") {
          return (
            tour.categoryId === "island-tours" ||
            tour.tourType === "island-tours" ||
            tour.tourType === "cruises"
          );
        }
        if (params.category === "snorkeling-diving") {
          return (
            tour.categoryId === "snorkeling-diving" ||
            tour.tourType === "water-activities"
          );
        }
        if (params.category === "adventure") {
          return (
            tour.categoryId === "adventure" || tour.tourType === "adventure"
          );
        }
        if (params.category === "shows-entertainment") {
          return (
            tour.categoryId === "shows-entertainment" ||
            tour.tourType === "shows-entertainment"
          );
        }
        if (params.category === "cultural") {
          return (
            tour.categoryId === "cultural" ||
            tour.tourType === "cultural-sightseeing"
          );
        }
        if (params.category === "transfers") {
          return (
            tour.categoryId === "transfers" || tour.tourType === "transfers"
          );
        }
        return tour.categoryId === params.category;
      });
    }

    // 3. Destinations checkbox filter
    if (params.destinations && params.destinations.length > 0) {
      candidates = candidates.filter(({ tour }) =>
        params.destinations?.includes(tour.destinationCategory)
      );
    }

    // 4. Tour Types checkbox filter
    if (params.tourTypes && params.tourTypes.length > 0) {
      candidates = candidates.filter(({ tour }) =>
        params.tourTypes?.includes(tour.tourType)
      );
    }

    // 5. Durations checkbox filter
    if (params.durations && params.durations.length > 0) {
      candidates = candidates.filter(({ tour }) =>
        params.durations?.includes(tour.durationCategory)
      );
    }

    // 6. Price range
    if (params.minPrice !== undefined && params.minPrice > 0) {
      candidates = candidates.filter(
        ({ tour }) => tour.price.amount >= (params.minPrice ?? 0)
      );
    }
    if (params.maxPrice !== undefined && params.maxPrice < 500) {
      candidates = candidates.filter(
        ({ tour }) => tour.price.amount <= (params.maxPrice ?? 500)
      );
    }

    // 7. Sorting
    if (params.sortBy && params.sortBy !== "most-popular") {
      switch (params.sortBy) {
        case "price-asc":
          candidates.sort((a, b) => a.tour.price.amount - b.tour.price.amount);
          break;
        case "price-desc":
          candidates.sort((a, b) => b.tour.price.amount - a.tour.price.amount);
          break;
        case "highest-rated":
          candidates.sort(
            (a, b) =>
              (b.tour.reviews?.rating ?? 0) - (a.tour.reviews?.rating ?? 0)
          );
          break;
        case "duration":
          candidates.sort((a, b) =>
            a.tour.duration.localeCompare(b.tour.duration)
          );
          break;
      }
    } else {
      // Default / most-popular sort:
      // If search is active, maintain search relevance score ranking!
      // If search is inactive, sort by reviews and ratings.
      if (hasActiveSearch) {
        candidates.sort((a, b) => {
          const scoreDiff = b.score - a.score;
          if (scoreDiff !== 0) return scoreDiff;
          return (
            (b.tour.reviews?.reviewCount ?? 0) -
            (a.tour.reviews?.reviewCount ?? 0)
          );
        });
      } else {
        candidates.sort((a, b) => {
          const countDiff =
            (b.tour.reviews?.reviewCount ?? 0) -
            (a.tour.reviews?.reviewCount ?? 0);
          if (countDiff !== 0) return countDiff;
          const ratingDiff =
            (b.tour.reviews?.rating ?? 0) - (a.tour.reviews?.rating ?? 0);
          if (ratingDiff !== 0) return ratingDiff;
          return a.tour.title.localeCompare(b.tour.title);
        });
      }
    }

    const filtered = candidates.map((c) => c.tour);

    // Calculate total: if no filters applied, reflect total catalog count
    const hasActiveFilters =
      hasActiveSearch ||
      (params.category && params.category !== "all") ||
      (params.destinations && params.destinations.length > 0) ||
      (params.tourTypes && params.tourTypes.length > 0) ||
      (params.durations && params.durations.length > 0) ||
      (params.minPrice !== undefined && params.minPrice > 0) ||
      (params.maxPrice !== undefined && params.maxPrice < 500);

    const total = hasActiveFilters ? filtered.length : TOTAL_TOURS_CATALOG_COUNT;

    return { filtered, total };
  }
}

export const mockTourDataProvider = new MockTourDataProvider();

export function filterAndSortToursLocally(
  tours: Tour[],
  params?: TourFilterParams
): { filtered: Tour[]; total: number } {
  return mockTourDataProvider.filterAndSort(tours, params);
}
