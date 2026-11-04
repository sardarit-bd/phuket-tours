import { baseApi } from "@/lib/api/base-api";
import {
  GetServicesParams,
  ServicesApiResponse,
  TourFilterParams,
  ToursResponse,
} from "../types/tour";
import {
  mockTourDataProvider,
  filterAndSortToursLocally,
} from "../services/tour-data-provider";

export { filterAndSortToursLocally };

/**
 * Tours RTK Query API Slice
 *
 * Data Source:
 * Uses the backend GET /services endpoint (public, no auth required).
 * The endpoint returns only PUBLISHED TOUR services.
 *
 * The queryFn maps backend `ServiceRecord[]` → frontend `Tour[]`
 * so that presentation components (`TourCard`, `TourGrid`, etc.)
 * continue to consume the same `useGetToursQuery` contract.
 *
 * For search, price range, and sorting that the backend does not
 * support, the results are filtered/sorted client-side over the
 * current page. This is a progressive enhancement; when the
 * backend adds those query params, this local filtering becomes
 * a no-op.
 */
export const toursApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTours: builder.query<
      ToursResponse,
      TourFilterParams | void
    >({
      queryFn: async (params, _api, _extraOptions, baseQuery) => {
        try {
          // Build backend query params
          const backendParams: GetServicesParams = {
            page: params?.page ?? 1,
            limit: params?.limit ?? 12,
          };

          if (params?.search && params.search.trim()) {
            backendParams.search = params.search.trim();
          }

          // Execute the HTTP request
          const response = await baseQuery({
            url: "/services",
            method: "GET",
            params: backendParams,
          });

          if (response.error) {
            return { error: response.error };
          }

          const apiResponse = response.data as unknown as ServicesApiResponse;
          const items = apiResponse.data?.items ?? [];
          const pagination = apiResponse.data?.pagination;

          // Map backend ServiceRecord[] → frontend Tour[]
          const mappedTours = items.map(mapServiceToTour);

          // Apply client-side price filter and sort if the backend
          // didn't handle them (progressive enhancement).
          let filteredTours = mappedTours;

          if (params?.minPrice !== undefined && params.minPrice > 0) {
            filteredTours = filteredTours.filter(
              (tour) => tour.price.amount >= params.minPrice!
            );
          }
          if (
            params?.maxPrice !== undefined &&
            params.maxPrice > 0 &&
            params.maxPrice < 500
          ) {
            filteredTours = filteredTours.filter(
              (tour) => tour.price.amount <= params.maxPrice!
            );
          }

          // Client-side sort (backend only supports createdAt/updatedAt/name)
          if (params?.sortBy) {
            switch (params.sortBy) {
              case "price-asc":
                filteredTours = [...filteredTours].sort(
                  (a, b) => a.price.amount - b.price.amount
                );
                break;
              case "price-desc":
                filteredTours = [...filteredTours].sort(
                  (a, b) => b.price.amount - a.price.amount
                );
                break;
              case "highest-rated":
                filteredTours = [...filteredTours].sort(
                  (a, b) =>
                    (b.reviews?.rating ?? 0) - (a.reviews?.rating ?? 0)
                );
                break;
              case "duration":
                filteredTours = [...filteredTours].sort((a, b) =>
                  a.duration.localeCompare(b.duration)
                );
                break;
              case "most-popular":
              default:
                // Default: sort by review count desc, then rating desc
                filteredTours = [...filteredTours].sort((a, b) => {
                  const countDiff =
                    (b.reviews?.reviewCount ?? 0) -
                    (a.reviews?.reviewCount ?? 0);
                  if (countDiff !== 0) return countDiff;
                  const ratingDiff =
                    (b.reviews?.rating ?? 0) - (a.reviews?.rating ?? 0);
                  if (ratingDiff !== 0) return ratingDiff;
                  return a.title.localeCompare(b.title);
                });
                break;
            }
          }

          // If no active filters, total = backend total.
          // If price filters are active, total = filtered count (approximate).
          const hasActivePriceFilter =
            (params?.minPrice !== undefined && params.minPrice > 0) ||
            (params?.maxPrice !== undefined &&
              params.maxPrice > 0 &&
              params.maxPrice < 500);

          const total = hasActivePriceFilter
            ? filteredTours.length
            : (pagination?.total ?? filteredTours.length);
          const totalPages = hasActivePriceFilter
            ? Math.max(1, Math.ceil(total / (params?.limit ?? 12)))
            : (pagination?.totalPages ?? 1);

          return {
            data: {
              data: filteredTours,
              total,
              page: pagination?.page ?? params?.page ?? 1,
              limit: pagination?.limit ?? params?.limit ?? 12,
              totalPages,
            },
          };
        } catch (error) {
          return {
            error: {
              status: "CUSTOM_ERROR",
              error:
                error instanceof Error
                  ? error.message
                  : "Failed to load tours",
            },
          };
        }
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

/**
 * Maps a backend ServiceRecord to the frontend Tour type.
 * Handles missing optional fields gracefully.
 */
function mapServiceToTour(
  record: import("../types/tour").ServiceRecord
): import("../types/tour").Tour {
  const metadata = record.metadata || {};

  // Extract destination info from metadata
  const destination =
    (metadata.destination as string) ||
    (metadata.destinationCategory as string) ||
    record.providerName ||
    "Phuket";
  const destinationCategory =
    (metadata.destinationCategory as string) ||
    (metadata.destination as string) ||
    "phuket";

  // Extract tour type from metadata
  const tourType =
    (metadata.tourType as string) ||
    (metadata.type as string) ||
    "island-tours";

  // Extract duration from metadata
  const duration =
    (metadata.duration as string) ||
    (metadata.durationCategory as string) ||
    "Full Day";
  const durationCategory =
    (metadata.durationCategory as string) ||
    (metadata.duration as string) ||
    "full-day";

  // Extract category from metadata
  const categoryId =
    (metadata.categoryId as string) ||
    (metadata.category as string) ||
    "island-tours";
  const categoryName =
    (metadata.categoryName as string) ||
    (metadata.category as string) ||
    undefined;

  // Extract images from metadata
  const images: string[] =
    (metadata.images as string[]) ||
    (metadata.image as string ? [metadata.image as string] : []) ||
    (metadata.featuredImage
      ? [metadata.featuredImage as string]
      : []);
  const featuredImage =
    (metadata.featuredImage as string) ||
    (metadata.images as string[] | undefined)?.[0] ||
    (metadata.image as string) ||
    undefined;

  // Extract price from pricingSummary
  const price = record.pricingSummary
    ? {
        amount: record.pricingSummary.basePrice,
        currency: record.pricingSummary.currency || "USD",
        originalAmount: record.pricingSummary.discountedPrice
          ? record.pricingSummary.basePrice
          : undefined,
        discountPercentage:
          record.pricingSummary.discountedPrice &&
          record.pricingSummary.discountedPrice > 0
            ? Math.round(
                ((record.pricingSummary.basePrice -
                  record.pricingSummary.discountedPrice) /
                  record.pricingSummary.basePrice) *
                  100
              )
            : undefined,
      }
    : { amount: 0, currency: "USD" };

  // Extract reviews from metadata
  const reviews =
    metadata.rating !== undefined || metadata.reviewCount !== undefined
      ? {
          rating: (metadata.rating as number) || 0,
          reviewCount: (metadata.reviewCount as number) || 0,
        }
      : undefined;

  // Extract badge from metadata
  const badge = metadata.badge as
    | "Popular"
    | "Bestseller"
    | "New"
    | undefined;
  const badgeVariant = metadata.badgeVariant as
    | "popular"
    | "bestseller"
    | "new"
    | undefined;

  // Build a slug from the name (or use metadata.slug if provided)
  const slug =
    (metadata.slug as string) ||
    record.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  return {
    id: record.id,
    slug,
    title: record.name,
    subtitle: metadata.subtitle as string | undefined,
    description: record.description || "",
    categoryId,
    categoryName,
    images,
    featuredImage,
    duration,
    durationCategory: durationCategory as
      | "half-day"
      | "full-day"
      | "multi-day",
    destination,
    destinationCategory,
    tourType,
    groupSize: metadata.groupSize as string | undefined,
    languages: metadata.languages as string[] | undefined,
    badge,
    badgeVariant,
    isFeatured: metadata.isFeatured as boolean | undefined,
    price,
    reviews,
    highlights: metadata.highlights as string[] | undefined,
  };
}

export const { useGetToursQuery } = toursApi;
