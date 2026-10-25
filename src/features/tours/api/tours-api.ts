import { baseApi } from "@/lib/api/base-api";
import { TourFilterParams, ToursResponse, Tour } from "../types/tour";
import { mockTours, TOTAL_TOURS_CATALOG_COUNT } from "../data/tours-data";

export function filterAndSortToursLocally(
  tours: Tour[],
  params?: TourFilterParams
): { filtered: Tour[]; total: number } {
  let result = [...tours];

  if (!params) {
    return { filtered: result, total: TOTAL_TOURS_CATALOG_COUNT };
  }

  // 1. Search query (matches title, destination, subtitle, or description)
  if (params.search && params.search.trim() !== "") {
    const q = params.search.toLowerCase().trim();
    result = result.filter(
      (tour) =>
        tour.title.toLowerCase().includes(q) ||
        tour.destination.toLowerCase().includes(q) ||
        (tour.subtitle && tour.subtitle.toLowerCase().includes(q)) ||
        tour.description.toLowerCase().includes(q)
    );
  }

  // 2. Category tab
  if (params.category && params.category !== "all") {
    result = result.filter((tour) => {
      if (params.category === "island-tours") {
        return tour.categoryId === "island-tours" || tour.tourType === "island-tours";
      }
      if (params.category === "snorkeling-diving") {
        return tour.categoryId === "snorkeling-diving" || tour.tourType === "water-activities";
      }
      if (params.category === "adventure") {
        return tour.categoryId === "adventure" || tour.tourType === "adventure";
      }
      if (params.category === "shows-entertainment") {
        return tour.categoryId === "shows-entertainment" || tour.tourType === "shows-entertainment";
      }
      if (params.category === "cultural") {
        return tour.categoryId === "cultural" || tour.tourType === "cultural-sightseeing";
      }
      if (params.category === "transfers") {
        return tour.categoryId === "transfers" || tour.tourType === "transfers";
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
    result = result.filter((tour) => tour.price.amount >= (params.minPrice ?? 0));
  }
  if (params.maxPrice !== undefined && params.maxPrice < 500) {
    result = result.filter((tour) => tour.price.amount <= (params.maxPrice ?? 500));
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
        // Featured or review count
        result.sort(
          (a, b) => (b.reviews?.reviewCount ?? 0) - (a.reviews?.reviewCount ?? 0)
        );
        break;
    }
  }

  // Calculate total: if no filters applied, reflect total catalog count (462)
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

export const toursApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTours: builder.query<ToursResponse, TourFilterParams | void>({
      queryFn: async (params, _queryApi, _extraOptions, fetchWithBQ) => {
        try {
          const res = await fetchWithBQ({
            url: "/tours",
            params: params || {},
          });
          if (res.data) {
            return { data: res.data as ToursResponse };
          }
        } catch {
          // Graceful fallback to rich local dataset when offline / no server
        }

        const { filtered, total } = filterAndSortToursLocally(
          mockTours,
          params || {}
        );

        return {
          data: {
            data: filtered,
            total,
            page: params?.page ?? 1,
            limit: params?.limit ?? 12,
            totalPages: Math.ceil(filtered.length / (params?.limit ?? 12)) || 1,
          },
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: "Tour" as const, id })),
              { type: "Tour", id: "LIST" },
            ]
          : [{ type: "Tour", id: "LIST" }],
    }),
  }),
});

export const { useGetToursQuery } = toursApi;
