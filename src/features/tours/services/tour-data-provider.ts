import { Tour, TourFilterParams, ToursResponse } from "../types/tour";
import { clientDummyTours, TOTAL_TOURS_CATALOG_COUNT } from "../data/tours-data";

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
 * In-memory Mock Data Provider backed by the parsed client tour dataset
 * from `dummydata.txt`.
 */
export class MockTourDataProvider implements TourDataProvider {
  private tours: Tour[];

  constructor(tours: Tour[] = clientDummyTours) {
    this.tours = tours;
  }

  async getTours(params?: TourFilterParams): Promise<ToursResponse> {
    const { filtered, total } = this.filterAndSort(this.tours, params);
    const limit = params?.limit ?? filtered.length;
    const page = params?.page ?? 1;

    return {
      data: filtered,
      total,
      page,
      limit,
      totalPages: Math.ceil(filtered.length / limit) || 1,
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
   */
  public filterAndSort(
    tours: Tour[],
    params?: TourFilterParams
  ): { filtered: Tour[]; total: number } {
    let result = [...tours];

    if (!params) {
      return { filtered: result, total: TOTAL_TOURS_CATALOG_COUNT };
    }

    // 1. Search query (matches title, destination, id, subtitle, or description)
    if (params.search && params.search.trim() !== "") {
      const q = params.search.toLowerCase().trim();
      result = result.filter(
        (tour) =>
          tour.title.toLowerCase().includes(q) ||
          tour.destination.toLowerCase().includes(q) ||
          tour.id.includes(q) ||
          (tour.subtitle && tour.subtitle.toLowerCase().includes(q)) ||
          tour.description.toLowerCase().includes(q)
      );
    }

    // 2. Category tab
    if (params.category && params.category !== "all") {
      result = result.filter((tour) => {
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
      result = result.filter((tour) =>
        params.destinations?.includes(tour.destinationCategory)
      );
    }

    // 4. Tour Types checkbox filter
    if (params.tourTypes && params.tourTypes.length > 0) {
      result = result.filter((tour) =>
        params.tourTypes?.includes(tour.tourType)
      );
    }

    // 5. Durations checkbox filter
    if (params.durations && params.durations.length > 0) {
      result = result.filter((tour) =>
        params.durations?.includes(tour.durationCategory)
      );
    }

    // 6. Price range
    if (params.minPrice !== undefined) {
      result = result.filter(
        (tour) => tour.price.amount >= (params.minPrice ?? 0)
      );
    }
    if (params.maxPrice !== undefined && params.maxPrice < 500) {
      result = result.filter(
        (tour) => tour.price.amount <= (params.maxPrice ?? 500)
      );
    }

    // 7. Sorting
    if (params.sortBy) {
      switch (params.sortBy) {
        case "price-asc":
          result.sort((a, b) => a.price.amount - b.price.amount);
          break;
        case "price-desc":
          result.sort((a, b) => b.price.amount - a.price.amount);
          break;
        case "highest-rated":
          result.sort(
            (a, b) => (b.reviews?.rating ?? 0) - (a.reviews?.rating ?? 0)
          );
          break;
        case "duration":
          result.sort((a, b) => a.duration.localeCompare(b.duration));
          break;
        case "most-popular":
        default:
          result.sort((a, b) => {
            const countDiff =
              (b.reviews?.reviewCount ?? 0) - (a.reviews?.reviewCount ?? 0);
            if (countDiff !== 0) return countDiff;
            const ratingDiff =
              (b.reviews?.rating ?? 0) - (a.reviews?.rating ?? 0);
            if (ratingDiff !== 0) return ratingDiff;
            return a.title.localeCompare(b.title);
          });
          break;
      }
    }

    // Calculate total: if no filters applied, reflect total catalog count
    const hasActiveFilters =
      Boolean(params.search?.trim()) ||
      (params.category && params.category !== "all") ||
      (params.destinations && params.destinations.length > 0) ||
      (params.tourTypes && params.tourTypes.length > 0) ||
      (params.durations && params.durations.length > 0) ||
      (params.minPrice !== undefined && params.minPrice > 0) ||
      (params.maxPrice !== undefined && params.maxPrice < 500);

    const total = hasActiveFilters ? result.length : TOTAL_TOURS_CATALOG_COUNT;

    return { filtered: result, total };
  }
}

/**
 * Singleton instance of the mock tour data provider.
 */
export const mockTourDataProvider = new MockTourDataProvider();

/**
 * Standalone helper for local filtering and sorting.
 */
export function filterAndSortToursLocally(
  tours: Tour[],
  params?: TourFilterParams
): { filtered: Tour[]; total: number } {
  return mockTourDataProvider.filterAndSort(tours, params);
}
