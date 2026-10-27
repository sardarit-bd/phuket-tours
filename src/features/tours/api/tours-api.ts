import { baseApi } from "@/lib/api/base-api";
import { TourFilterParams, ToursResponse } from "../types/tour";
import {
  mockTourDataProvider,
  filterAndSortToursLocally,
} from "../services/tour-data-provider";

export { filterAndSortToursLocally };

/**
 * Tours RTK Query API Slice
 *
 * Current Data Source Boundary:
 * Uses `mockTourDataProvider` backed by the parsed client dataset (`dummydata.txt`).
 *
 * Future Backend Integration Path:
 * When verified backend API endpoints are available:
 * 1. Replace the `queryFn` implementation in `getTours` with a direct HTTP query:
 *    ```ts
 *    query: (params) => ({
 *      url: "/tours",
 *      params: params || {},
 *    }),
 *    ```
 * 2. Presentation components (`ToursPageContent`, `TourGrid`, `TourCard`, `TourFiltersSidebar`)
 *    and custom hooks (`useTourFilters`) consume the exact same `useGetToursQuery` contract
 *    and require zero code changes.
 */
export const toursApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTours: builder.query<ToursResponse, TourFilterParams | void>({
      queryFn: async (params) => {
        try {
          const response = await mockTourDataProvider.getTours(
            params || undefined
          );
          return { data: response };
        } catch (error) {
          return {
            error: {
              status: "CUSTOM_ERROR",
              error:
                error instanceof Error
                  ? error.message
                  : "Failed to load tours dataset",
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

export const { useGetToursQuery } = toursApi;
